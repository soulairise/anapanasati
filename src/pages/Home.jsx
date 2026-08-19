import { Link, useNavigate } from 'react-router-dom'
import './Home.css'

/*
  홈은 3레이어 정보구조의 첫 층이다 (docs/PRODUCT_STRATEGY.md 5).
    1층(유입) = 목적   "오늘 어떤 마음이세요?"
    2층(전환) = 여정   16일 여정
    3층(잔존) = 전통   맨 아래 조용히

  1층 언어 규칙: 표면에는 전통 용어를 쓰지 않는다.
  일반 사용자는 "아나빠나사띠"가 아니라 "잠이 안 와요"로 들어온다.
*/

// 목적 → 실습 직결. 목록을 거치지 않고 바로 수행 화면으로 보낸다.
// pranayama.js에 goals 태그가 아직 없어 지금은 여기에 직접 매핑한다.
// 태그 시스템은 실습이 더 늘어난 뒤에 도입해도 늦지 않다.
const GOALS = [
  { icon: '😴', label: '잠이 안 와요', to: '/vipassana/body-scan/practice', hint: '몸 훑기 · 10분' },
  { icon: '😰', label: '불안해요', to: '/vipassana/breath-noting/practice', hint: '숨의 일어남과 사라짐 · 5분' },
  { icon: '🎯', label: '집중이 안 돼요', to: '/breathe', hint: '기본 호흡 · 5분' },
  { icon: '😮‍💨', label: '스트레스가 쌓였어요', to: '/vipassana/walking/practice', hint: '걸으며 알아차리기 · 5분' },
  { icon: '🌅', label: '아침을 열고 싶어요', to: '/yoga', hint: '요가 호흡법' },
]

// 수련 3갈래 — 이제 앱에 무엇이 있는지 홈에서 바로 보여준다
const PATHS = [
  { icon: '🫧', name: '호흡하기', sub: '숨을 지켜보기', count: '16단계', to: '/breathe' },
  { icon: '🌀', name: '요가 호흡', sub: '숨을 다스리기', count: '9가지 기법', to: '/yoga' },
  { icon: '💧', name: '관찰 수행', sub: '있는 그대로 보기', count: '6가지 실습', to: '/vipassana' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="container">
        <section className="hero">
          <p className="eyebrow">하루 3분, 숨을 지켜보는 훈련</p>
          <h1 className="hero__title">
            들숨과 날숨,<br />그 사이에 머무르다
          </h1>
          <p className="hero__sub">
            잠들기 어려운 밤, 불안하고 산만한 마음을 위한 호흡 훈련.
            2,500년 된 순서를 한국어로, 하루 한 걸음씩.
          </p>
          <div className="hero__cta">
            <Link to="/breathe" className="btn btn--primary">지금 3분 호흡하기</Link>
            <Link to="/learn" className="btn btn--ghost">16일 여정 보기</Link>
          </div>
        </section>

        {/* 1층 — 목적으로 들어오기 */}
        <section className="goals">
          <h2 className="goals__title">오늘 어떤 마음이세요?</h2>
          <div className="goals__list">
            {GOALS.map((g) => (
              <button key={g.label} className="goal" onClick={() => navigate(g.to)}>
                <span className="goal__icon">{g.icon}</span>
                <span className="goal__label">{g.label}</span>
                <span className="goal__hint">{g.hint}</span>
                <span className="goal__arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* 2층 — 수련의 세 갈래 */}
        <section className="paths">
          <h2 className="paths__title">수련의 세 갈래</h2>
          <div className="flow-grid">
            {PATHS.map((p) => (
              <Link key={p.name} to={p.to} className="card flow-card path-card">
                <div className="flow-card__icon">{p.icon}</div>
                <h3>{p.name}</h3>
                <p>{p.sub}</p>
                <span className="path-card__count">{p.count}</span>
              </Link>
            ))}
          </div>
          <p className="paths__more">
            수행을 마친 뒤엔 <Link to="/journal">수행일지</Link>에 오늘의 마음을 남겨보세요.
          </p>
        </section>

        {/* 3층 — 전통을 숨기지 않고, 조용히 */}
        <footer className="roots">
          <p>이 앱이 안내하는 순서는 2,500년 전 경전이 말한 열여섯 걸음을 따릅니다.</p>
          <p>특정 종교를 권하지 않습니다.</p>
        </footer>
      </div>
    </div>
  )
}
