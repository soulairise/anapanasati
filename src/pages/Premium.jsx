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
  '기본 호흡 패턴 전부',
  '수행일지 기록·열람 제한 없음',
  '이번 달 히트맵 · 세어보기 정확도 추이',
]

const BENEFITS = [
  { icon: '🎙️', text: '가이드 음성 명상 (마음을 이끄는 목소리)' },
  { icon: '🎚️', text: '나만의 호흡 패턴 만들기 (초 단위로 직접 설정)' },
  { icon: '🌿', text: '앰비언트 사운드 라이브러리 (빗소리·숲·파도…)' },
  { icon: '📊', text: '긴 기간 분석 · 기록 검색 · 갈래별 비교' },
  { icon: '🤖', text: 'AI 수행 코칭 — 일지에 격려와 조언' },
  { icon: '🕊️', text: '광고 없는 온전히 고요한 공간' },
]

// 국내 경쟁가: 마보 5,900/47,000 · 코끼리 6,900/45,000.
// 이전 정가(9,800/98,000)는 콘텐츠 양이 1/100인데 월 40~66% 비쌌다.
// 마보식 중간 구간(3개월)을 둬 연간이 부담스러운 입문자에게 다리를 놓는다.
const PLANS = [
  {
    key: 'yearly',
    name: '연간',
    price: 39000,
    original: 49000,
    per: '월 3,250원 꼴',
    badge: '가장 인기',
    highlight: true,
  },
  {
    key: 'quarterly',
    name: '3개월',
    price: 12900,
    original: 17900,
    per: '월 4,300원 꼴',
    badge: null,
    highlight: false,
  },
  {
    key: 'monthly',
    name: '월간',
    price: 4900,
    original: 6900,
    per: '매월 결제',
    badge: null,
    highlight: false,
  },
]

export default function Premium() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium, setPremium } = usePremium()
  const [selected, setSelected] = useState('yearly')
  const [done, setDone] = useState(false)
  const selectedPlan = PLANS.find((p) => p.key === selected)

  // 토스 키가 설정돼 있으면 실제 결제창을 띄우고, 아니면 데모로 즉시 활성화한다.
  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: '/premium' } })
      return
    }
    const plan = PLANS.find((p) => p.key === selected)
    if (TOSS_READY) {
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
    } else {
      // 데모(테스트 키/미설정): 즉시 프리미엄 부여
      setPremium(true)
      setDone(true)
    }
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
            {/* 규제 요구: 해지 경로가 구매 경로보다 번거로워선 안 된다.
                숨기지 않고 같은 화면·같은 크기로 둔다. */}
            <button
              className="btn btn--ghost btn--block"
              onClick={() => setPremium(false)}
              style={{ marginTop: '0.75rem' }}
            >
              구독 해지
            </button>
            <p className="faint" style={{ fontSize: '0.82rem', marginTop: '0.75rem', lineHeight: 1.7 }}>
              해지해도 남은 기간은 그대로 쓰실 수 있고, 기록은 사라지지 않습니다.
            </p>
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

        {/* 무료로 열려 있는 것 — 무엇을 사는지 알고 사게 한다 */}
        <div className="free-box">
          <p className="free-box__title">이건 원래 무료입니다</p>
          <ul>
            {FREE.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        {/* 혜택 */}
        <p className="eyebrow" style={{ marginTop: '1.5rem' }}>프리미엄으로 더해지는 것</p>
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

        <button className="btn btn--primary btn--block subscribe-btn" onClick={handleSubscribe}>
          7일 무료로 시작하기
        </button>

        {/*
          2025.2.14 시행 구독 규제 대응 — 다크패턴 6종 금지, 위반 시 최대 500만원.
          ① 자동갱신·금액·주기를 결제 버튼 옆에 숨김 없이 ② 해지 경로를 구매만큼 눈에 띄게
          ③ 강압 팝업 없음. 이건 규제 준수이자 브랜드 자산이다.
        */}
        <div className="terms-box">
          <p>
            7일 무료 체험이 끝나면 <b>{selectedPlan.name} ₩{selectedPlan.price.toLocaleString()}</b>이
            자동으로 결제되고, 이후 {selectedPlan.name} 단위로 갱신됩니다.
          </p>
          <p>
            <b>해지는 언제든 한 번에 됩니다.</b> 체험 기간에 해지하면 요금이 청구되지 않고,
            해지해도 남은 기간은 그대로 쓰실 수 있습니다.
          </p>
          <p className="terms-box__cancel">
            해지 방법: 로그인 후 <b>프리미엄 → 구독 해지</b> 버튼 한 번.
            문의는 <a href="mailto:mykim97@gmail.com">mykim97@gmail.com</a>
          </p>
          {/*
            원래는 "이유를 묻지 않고" 열어드리는 정책이었으나, 문의가 감당할 수 없이
            몰릴 수 있어 대상을 강사로 좁혔다. 자격증 확인이라는 문턱이 생기지만,
            요가·명상 강사는 수련생에게 앱을 전하는 통로이기도 해서 대상으로는 맞다.
          */}
          <p className="terms-box__aid">
            형편이 어려운 <b>요가 강사님</b>은 강사 자격증을 첨부해 주시면
            확인하고 무료로 열어드립니다.
          </p>
        </div>

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
