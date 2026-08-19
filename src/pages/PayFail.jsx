import { useSearchParams, useNavigate } from 'react-router-dom'

// 결제 실패/취소 복귀 페이지.
//
// ⚠️ 예전에는 URL의 message 값을 그대로 찍었다. 토스가 보내는 값이라고 믿었는데,
//    이 주소는 누구나 만들 수 있다. #/pay/fail?message=... 로 링크를 뿌리면
//    우리 도메인 화면에 아무 문구나 띄울 수 있다("아래 계좌로 입금하세요" 같은).
//    React가 HTML은 막아 주지만 문구 자체는 그대로 나간다.
//    그래서 code 만 보고 우리가 쓴 문장을 고른다. 모르는 code면 일반 문구를 쓴다.
const REASONS = {
  PAY_PROCESS_CANCELED: '결제를 취소하셨어요.',
  PAY_PROCESS_ABORTED: '결제가 중단됐어요. 다시 시도해 주세요.',
  REJECT_CARD_COMPANY: '카드사에서 승인을 거절했어요. 카드사에 문의하시거나 다른 카드로 시도해 주세요.',
  INVALID_CARD_EXPIRATION: '카드 유효기간이 올바르지 않아요.',
  INVALID_STOPPED_CARD: '정지된 카드예요.',
  EXCEED_MAX_DAILY_PAYMENT_COUNT: '하루 결제 가능 횟수를 넘었어요.',
  EXCEED_MAX_PAYMENT_AMOUNT: '결제 한도를 넘었어요.',
  NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT: '이 카드는 할부를 지원하지 않아요.',
  CARD_NOT_SUPPORTED: '지원하지 않는 카드예요.',
  EXCEED_MAX_AUTH_COUNT: '인증을 여러 번 실패했어요. 잠시 뒤 다시 시도해 주세요.',
}

const GENERIC = '결제가 취소되었거나 완료되지 않았어요.'

export default function PayFail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const code = params.get('code') || ''
  const reason = REASONS[code] || GENERIC

  return (
    <div className="page">
      <div className="container container--narrow text-center">
        <div style={{ fontSize: '2.5rem' }}>🕯️</div>
        <h1 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>결제가 완료되지 않았어요</h1>
        <p className="muted">{reason}</p>
        <p className="faint" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
          결제되지 않았으니 요금은 청구되지 않습니다.
        </p>
        <div className="stack" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn--primary" onClick={() => navigate('/premium')}>
            다시 시도하기
          </button>
          <button className="btn btn--ghost" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/')}>
            홈으로
          </button>
        </div>
        <p className="faint" style={{ fontSize: '0.82rem', marginTop: '1.5rem', lineHeight: 1.7 }}>
          계속 안 되시면 <a href="mailto:mykim97@gmail.com">mykim97@gmail.com</a> 으로
          알려 주세요. 도와드리겠습니다.
        </p>
      </div>
    </div>
  )
}
