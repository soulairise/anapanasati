import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { usePremium } from '../context/PremiumContext'
import { readPending, clearPending, planFromOrderId } from '../lib/payments'

// 결제 성공 복귀 페이지.
// 토스가 successUrl 뒤에 paymentKey/orderId/amount 를 붙여 리다이렉트한다.
// 이 값을 서버(Edge Function)로 보내 "승인"을 완료해야 실제 결제가 확정된다.
export default function PaySuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { refresh } = usePremium()
  const [status, setStatus] = useState('confirming') // confirming | done | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const paymentKey = params.get('paymentKey')
    const orderId = params.get('orderId')
    const amount = Number(params.get('amount'))

    // 플랜은 주소로 받지 않는다. 토스가 쿼리를 '?' 로 덧붙이면
    // 물음표가 두 개가 되어 값이 통째로 뭉개지기 때문이다.
    // 저장소를 먼저 보고, 비어 있으면 주문번호에서 되찾는다.
    const pending = readPending()
    const plan =
      (pending && pending.orderId === orderId ? pending.planKey : null) ||
      planFromOrderId(orderId) ||
      (pending && pending.planKey) ||
      null

    if (!paymentKey || !orderId || !amount || !plan) {
      setStatus('error')
      // 무엇이 없는지 구분해 준다. "정보가 올바르지 않다" 만으로는
      // 사용자도 우리도 어디가 문제인지 알 수 없다.
      setMessage(
        !paymentKey || !orderId || !amount
          ? '결제 정보를 받지 못했습니다. 결제가 진행됐다면 메일로 알려 주세요.'
          : '어떤 요금제인지 확인하지 못했습니다. 메일로 알려 주시면 바로 처리해 드립니다.',
      )
      return
    }

    // 서버에서 최종 승인 (시크릿 키는 Edge Function에만 있음)
    supabase.functions
      .invoke('confirm-payment', { body: { paymentKey, orderId, amount, plan } })
      .then(({ data, error }) => {
        if (error || data?.error) {
          setStatus('error')
          setMessage(data?.message || '결제 승인 중 문제가 발생했습니다.')
          return
        }
        clearPending() // 같은 결제가 두 번 처리되지 않게 흔적을 지운다
        refresh() // 서버가 이미 기간을 적었다. 다시 읽어 화면에 반영한다.
        setStatus('done')
      })
      .catch(() => {
        setStatus('error')
        setMessage('네트워크 문제로 승인을 완료하지 못했습니다.')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page">
      <div className="container container--narrow text-center">
        {status === 'confirming' && (
          <>
            <div style={{ fontSize: '2rem' }}>⏳</div>
            <h1 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>결제를 확인하고 있어요…</h1>
            <p className="muted">잠시만 기다려 주세요.</p>
          </>
        )}
        {status === 'done' && (
          <>
            <div style={{ fontSize: '2.5rem' }}>🌿</div>
            <p className="eyebrow" style={{ marginTop: '0.5rem' }}>PREMIUM</p>
            <h1 style={{ fontSize: '1.6rem', margin: '0.5rem 0' }}>프리미엄이 시작됐어요!</h1>
            <p className="muted">이제 모든 기능이 열렸습니다. 고요한 수행을 이어가세요.</p>
            <button className="btn btn--primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/breathe')}>
              호흡하러 가기
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '2.5rem' }}>😔</div>
            <h1 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>결제 확인 실패</h1>
            <p className="muted">{message}</p>
            <button className="btn btn--ghost" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/premium')}>
              다시 시도하기
            </button>
          </>
        )}
      </div>
    </div>
  )
}
