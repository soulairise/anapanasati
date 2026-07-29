import { useSearchParams, useNavigate } from 'react-router-dom'

// 결제 실패/취소 복귀 페이지.
export default function PayFail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const message = params.get('message') || '결제가 취소되었거나 완료되지 않았어요.'

  return (
    <div className="page">
      <div className="container container--narrow text-center">
        <div style={{ fontSize: '2.5rem' }}>🕯️</div>
        <h1 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>결제가 완료되지 않았어요</h1>
        <p className="muted">{message}</p>
        <div className="stack" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn--primary" onClick={() => navigate('/premium')}>
            다시 시도하기
          </button>
          <button className="btn btn--ghost" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/')}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  )
}
