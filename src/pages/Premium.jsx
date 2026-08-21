import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { requestSubscription, TOSS_READY } from '../lib/payments'
import './Premium.css'

// 무료로 여는 것과 파는 것의 경계 (docs/PRODUCT_STRATEGY.md 6-2)
// 수행 시간·기록 열람·기본 패턴은 무료다. 콘텐츠를 파는 게 아니라 편의를 판다.
const FREE = [
  '16단계 전체 학습 · 관찰 수행 · 요가 호흡법',
  '수행 시간 제한 없음 (3~20분)',
  '기본 호흡 패턴 전부 · 속도 조절 · 파도 배경음',
  '가이드 나레이션 음성',
  '수행일지 기록·열람 제한 없음',
  '이번 달 히트맵 · 세어보기 정확도 추이',
]

// ⚠️ 이 목록은 감사(docs/PREMIUM_AUDIT.md)를 거쳤다. 여기 적힌 것은 전부
//    실제로 잠겨 있거나 무료로는 못 하는 것이다. 없는 것은 적지 않는다.
//    빠진 것들과 그 이유:
//      · 가이드 음성 — 원래 무료다(나레이션 토글). 판다고 쓰면 거짓이다.
//      · 광고 없는 공간 — 애초에 광고가 없다.
//    AI 수행 코칭은 만들었으므로 다시 넣었다(수치만 보고 쓴다 — 소감은 안 보낸다).
const BENEFITS = [
  { icon: '🎚️', text: '나만의 호흡 패턴 — 들숨·멈춤·날숨을 초 단위로 직접' },
  { icon: '🌧️', text: '배경음 고르기 — 빗소리·숲·모닥불 (파도는 무료)' },
  { icon: '📊', text: '긴 기간 되돌아보기 — 3개월·6개월·전체를 갈래별로' },
  { icon: '🔎', text: '남긴 소감에서 찾기 — 지난 기록을 말로 검색' },
  { icon: '💌', text: '수행 코칭 — 쌓인 기록을 읽고 주에 한 통, 짧은 편지' },
  { icon: '🌱', text: '이 서비스가 계속 만들어지도록 돕는 일' },
]

// 국내 경쟁가: 마보 5,900/47,000 · 코끼리 6,900/45,000.
// 마보식 중간 구간(3개월)을 둬 연간이 부담스러운 입문자에게 다리를 놓는다.
// ⚠️ Edge Function(confirm-payment)의 PRICE와 반드시 같은 값을 유지할 것.
//    어긋나면 서버 금액 검증에서 결제가 조용히 거부된다. npm run check:launch 가 잡는다.
const PLANS = [
  { key: 'yearly', name: '1년', price: 39000, original: 49000, per: '월 3,250원 꼴', badge: '가장 인기', highlight: true },
  { key: 'quarterly', name: '3개월', price: 12900, original: 17900, per: '월 4,300원 꼴', badge: null, highlight: false },
  { key: 'monthly', name: '1개월', price: 4900, original: 6900, per: '한 달만', badge: null, highlight: false },
]

const COUPON_MESSAGE = {
  not_found: '그런 코드는 없어요. 다시 확인해 주세요.',
  already_used: '이미 사용하신 쿠폰이에요.',
  expired: '사용 기간이 지난 쿠폰이에요.',
  exhausted: '준비된 수량이 모두 사용됐어요.',
  inactive: '지금은 쓸 수 없는 쿠폰이에요.',
  not_signed_in: '먼저 로그인해 주세요.',
  error: '잠시 문제가 생겼어요. 다시 시도해 주세요.',
}

const fmtDate = (d) =>
  d ? `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일` : ''

// 쿠폰 입력칸 — 프리미엄이든 아니든 쓸 수 있다. 기간은 뒤에 이어 붙는다.
function CouponBox() {
  const { redeemCoupon } = usePremium()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!code.trim() || busy) return
    if (!user) {
      navigate('/login', { state: { redirectTo: '/premium' } })
      return
    }
    setBusy(true)
    setResult(null)
    const r = await redeemCoupon(code)
    setBusy(false)
    setResult(
      r?.ok
        ? { ok: true, text: `${r.label} 쿠폰이 적용됐어요. ${r.days}일이 더해졌습니다.` }
        : { ok: false, text: COUPON_MESSAGE[r?.reason] || COUPON_MESSAGE.error },
    )
    if (r?.ok) setCode('')
  }

  return (
    <form className="coupon" onSubmit={submit}>
      <label className="coupon__label" htmlFor="coupon-code">
        쿠폰이 있으신가요?
      </label>
      <div className="coupon__row">
        <input
          id="coupon-code"
          className="coupon__input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="쿠폰 코드"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck="false"
          maxLength={32}
        />
        <button type="submit" className="btn btn--ghost coupon__btn" disabled={busy}>
          {busy ? '확인 중…' : '적용'}
        </button>
      </div>
      {result && (
        <p className={`coupon__msg ${result.ok ? 'is-ok' : 'is-no'}`} role="status">
          {result.text}
        </p>
      )}
    </form>
  )
}

export default function Premium() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium, isTrial, source, premiumUntil, daysLeft, loading } = usePremium()
  const [selected, setSelected] = useState('yearly')
  const selectedPlan = PLANS.find((p) => p.key === selected)

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: '/premium' } })
      return
    }
    const plan = PLANS.find((p) => p.key === selected)
    if (!TOSS_READY) return
    try {
      await requestSubscription({
        planKey: plan.key,
        orderName: `숨결의 길 프리미엄 (${plan.name})`,
        amount: plan.price,
        customerEmail: user.email,
        customerName: user.display_name,
      })
    } catch {
      /* 사용자가 결제창을 닫음 등 — 별도 처리 없음 */
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container container--narrow text-center">
          <p className="muted">불러오는 중…</p>
        </div>
      </div>
    )
  }

  // ── 이용 중인 상태 ──────────────────────────────────────────
  if (isPremium) {
    const label = { trial: '체험 중', coupon: '쿠폰으로 이용 중', payment: '이용 중' }[source] || '이용 중'
    return (
      <div className="page">
        <div className="container container--narrow text-center">
          <div style={{ fontSize: '2.5rem' }}>{isTrial ? '🌱' : '🌿'}</div>
          <p className="eyebrow" style={{ marginTop: '0.5rem' }}>PREMIUM · {label}</p>
          <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
            {daysLeft}일 남았습니다
          </h1>
          <p className="muted">{fmtDate(premiumUntil)}까지 모든 기능이 열려 있어요.</p>

          {isTrial && (
            <div className="trial-note">
              <p>
                <b>체험이 끝나도 자동으로 결제되지 않습니다.</b> 카드를 받지 않았으니
                아무 일도 일어나지 않아요. 기간이 지나면 무료 기능으로 조용히 돌아갑니다.
              </p>
              <p className="faint">
                수행·학습·일지는 원래 무료입니다. 체험이 끝나도 그대로 쓰실 수 있어요.
              </p>
            </div>
          )}

          <div className="stack" style={{ marginTop: '1.75rem' }}>
            <button className="btn btn--primary" onClick={() => navigate('/breathe')}>
              호흡하러 가기
            </button>
            {isTrial && (
              <button
                className="btn btn--ghost btn--block"
                onClick={() => navigate('/premium?buy=1', { replace: true })}
                style={{ marginTop: '0.75rem' }}
                // 체험 중에도 미리 결제해 두면 기간이 뒤에 이어 붙는다.
                // (Edge Function이 남은 기간 뒤에 더한다)
              >
                이어서 쓰려면 — 요금제 보기
              </button>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            <CouponBox />
          </div>
        </div>
      </div>
    )
  }

  // ── 판매 화면 ────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="container container--narrow">
        <header className="text-center" style={{ marginBottom: '2rem' }}>
          <p className="eyebrow">PREMIUM · 오픈기념</p>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.4rem)', margin: '0.5rem 0' }}>
            수행을 더 깊이,<br />숨결의 길 프리미엄
          </h1>
          {!user ? (
            <p className="muted">
              가입하시면 <b>3일 동안 무료</b>로 열립니다. 카드는 받지 않습니다.
            </p>
          ) : (
            <p className="muted">지금 오픈기념 특별 가격으로 시작하세요.</p>
          )}
        </header>

        {/* 무료로 열려 있는 것 — 무엇을 사는지 알고 사게 한다 */}
        <div className="free-box">
          <p className="free-box__title">이건 원래 무료입니다</p>
          <ul>
            {FREE.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <p className="eyebrow" style={{ marginTop: '1.5rem' }}>프리미엄으로 더해지는 것</p>
        <div className="card benefits">
          {BENEFITS.map((b) => (
            <div key={b.text} className="benefit">
              <span className="benefit__icon">{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        <div className="plans">
          {PLANS.map((p) => (
            <button
              key={p.key}
              className={`plan ${selected === p.key ? 'plan--active' : ''} ${p.highlight ? 'plan--best' : ''}`}
              onClick={() => setSelected(p.key)}
            >
              {p.badge && <span className="plan__badge">{p.badge}</span>}
              <div className="plan__name">{p.name}</div>
              <div className="plan__price">
                ₩{p.price.toLocaleString()}
                <span className="plan__original">₩{p.original.toLocaleString()}</span>
              </div>
              <div className="plan__per">{p.per}</div>
            </button>
          ))}
        </div>

        <button className="btn btn--primary btn--block subscribe-btn" onClick={handleSubscribe}>
          {user
            ? `${selectedPlan.name} ₩${selectedPlan.price.toLocaleString()} 결제하기`
            : '가입하고 3일 무료로 써보기'}
        </button>

        {/*
          2025.2.14 시행 구독 규제 대응 — 다크패턴 6종 금지.
          자동 갱신을 하지 않으므로 갱신 전 고지·해지 실동작 의무는 애초에 걸리지 않는다.
          대신 "자동 갱신이 없다"는 사실을 결제 버튼 바로 옆에서 분명히 말한다.
          모르고 다시 결제되는 일이 없어야 한다는 취지는 똑같이 지킨다.
        */}
        <div className="terms-box">
          <p>
            <b>자동으로 다시 결제되지 않습니다.</b> 결제하신 기간이 끝나면 무료 기능으로
            돌아갑니다. 이어서 쓰고 싶으실 때 직접 다시 결제하시면 됩니다.
          </p>
          <p>
            표시된 금액은 <b>부가세가 포함된 가격</b>이며, 그 밖에 청구되는 비용은 없습니다.
            남은 기간이 있는 상태에서 결제하시면 그 뒤에 이어 붙습니다.
          </p>
          <p className="terms-box__cancel">
            결제일부터 7일 이내이고 유료 기능을 쓰지 않으셨다면 전액 환불해 드립니다.
            그 뒤에도 쓰신 기간만 빼고 돌려드리며, <b>위약금은 없습니다.</b>{' '}
            문의는 <a href="mailto:mykim97@gmail.com">mykim97@gmail.com</a>
          </p>
          {/*
            강사는 수련생에게 앱을 전하는 통로다. 자격 확인이라는 문턱을 낮추고
            대신 기간을 3개월로 넉넉히 줘서, 실제로 수업에 써보고 판단하게 한다.
            쿠폰은 요청 한 건마다 1인용 코드를 새로 발행한다(공용 코드는 유출되면 끝이다).
          */}
          <p className="terms-box__aid">
            <b>요가 강사님께는 3개월 무료 쿠폰</b>을 드립니다.{' '}
            <a href="mailto:mykim97@gmail.com?subject=%5B%EC%88%A8%EA%B2%B0%EC%9D%98%20%EA%B8%B8%5D%20%EC%9A%94%EA%B0%80%20%EA%B0%95%EC%82%AC%20%EC%BF%A0%ED%8F%B0%20%EC%9A%94%EC%B2%AD">
              메일로 요청
            </a>
            해 주시면 코드를 보내드립니다.
          </p>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <CouponBox />
        </div>
      </div>
    </div>
  )
}
