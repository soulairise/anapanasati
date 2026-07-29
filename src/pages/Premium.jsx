import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import './Premium.css'

const BENEFITS = [
  { icon: '🫧', text: '모든 호흡 패턴 + 무제한 수행 시간' },
  { icon: '🎙️', text: '가이드 음성 명상 (마음을 이끄는 목소리)' },
  { icon: '🌿', text: '앰비언트 사운드 라이브러리 (빗소리·숲·파도…)' },
  { icon: '📊', text: '무제한 수행일지 + 통계·연속기록 챌린지' },
  { icon: '🤖', text: 'AI 수행 코칭 — 일지에 격려와 조언' },
  { icon: '🕊️', text: '광고 없는 온전히 고요한 공간' },
]

const PLANS = [
  {
    key: 'yearly',
    name: '연간',
    price: 39000,
    original: 98000,
    per: '월 3,250원 꼴',
    badge: '약 60% 할인 · 가장 인기',
    highlight: true,
  },
  {
    key: 'monthly',
    name: '월간',
    price: 4900,
    original: 9800,
    per: '매월 결제',
    badge: '50% 할인',
    highlight: false,
  },
]

export default function Premium() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium, setPremium } = usePremium()
  const [selected, setSelected] = useState('yearly')
  const [done, setDone] = useState(false)

  // 실제 결제(토스페이먼츠)는 출시 시 이 자리에서 결제창을 띄우게 된다.
  // 지금은 데모로 프리미엄을 즉시 활성화한다.
  const handleSubscribe = () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: '/premium' } })
      return
    }
    setPremium(true)
    setDone(true)
  }

  if (isPremium) {
    return (
      <div className="page">
        <div className="container container--narrow text-center">
          <div style={{ fontSize: '2.5rem' }}>🌿</div>
          <p className="eyebrow" style={{ marginTop: '0.5rem' }}>PREMIUM</p>
          <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>프리미엄 이용 중입니다</h1>
          <p className="muted">모든 기능이 열려 있어요. 고요한 수행을 이어가세요.</p>
          <div className="stack" style={{ marginTop: '2rem' }}>
            <button className="btn btn--primary" onClick={() => navigate('/breathe')}>
              호흡하러 가기
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => setPremium(false)}
              style={{ marginTop: '0.75rem' }}
            >
              (데모) 프리미엄 해제
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container container--narrow">
        <header className="text-center" style={{ marginBottom: '2rem' }}>
          <p className="eyebrow">PREMIUM · 오픈기념</p>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.4rem)', margin: '0.5rem 0' }}>
            수행을 더 깊이,<br />숨결의 길 프리미엄
          </h1>
          <p className="muted">지금 오픈기념 특별 가격으로 시작하세요.</p>
        </header>

        {/* 혜택 */}
        <div className="card benefits">
          {BENEFITS.map((b) => (
            <div key={b.text} className="benefit">
              <span className="benefit__icon">{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        {/* 요금제 */}
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

        <p className="trial-note text-center">✨ 7일 무료 체험 후 자동 결제 · 언제든 해지 가능</p>

        <button className="btn btn--primary btn--block subscribe-btn" onClick={handleSubscribe}>
          7일 무료로 시작하기
        </button>
        <p className="faint text-center" style={{ fontSize: '0.8rem', marginTop: '0.75rem' }}>
          결제는 토스페이먼츠로 안전하게 진행됩니다 · 출시 예정
        </p>

        {done && (
          <div className="banner" style={{ marginTop: '1.5rem' }}>
            🎉 (데모) 프리미엄이 활성화됐습니다! 이제 모든 기능이 열렸어요.
          </div>
        )}
      </div>
    </div>
  )
}
