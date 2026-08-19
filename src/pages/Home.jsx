import { Link, useNavigate } from 'react-router-dom'
import { useFace } from '../context/FaceContext'
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

// 첫 화면의 두 얼굴. 구조는 같고 온도만 다르다.
//
// 들숨은 시작이다 — 아기가 세상에 나와 처음 한 일은 우는 것이 아니라
// 숨을 들이는 것이다(폐가 양수로 차 있어 강한 흡기로 열어야 한다).
// 날숨은 놓음이다 — 우리 기본 패턴이 4-0-6-0으로 날숨을 길게 두는 이유이기도 하다.
//
// ⚠️ "사람은 들숨으로 태어나 날숨으로 죽는다"고 쓰지 않는다.
//    앞쪽은 사실이지만 뒤쪽은 단정할 수 없다(임종기에는 들이쉬는 헐떡임이 먼저 온다).
//    사별을 겪은 분이 읽는다.
const FACE_COPY = {
  sun: {
    eyebrow: '하루 3분, 숨을 지켜보는 훈련',
    title: (
      <>
        들숨과 날숨,
        <br />그 사이에 머무르다
      </>
    ),
    sub: '잠들기 어려운 밤, 불안하고 산만한 마음을 위한 호흡 훈련. 2,500년 된 순서를 한국어로, 하루 한 걸음씩.',
    note: '생은 들이쉬는 것으로 시작합니다. 세상에 나와 처음 한 일은 우는 것이 아니라, 숨을 들이는 것이었습니다.',
    cta: '지금 3분 호흡하기',
  },
  moon: {
    eyebrow: '오늘을 내려놓는 시간',
    title: (
      <>
        길게 내쉬면,
        <br />몸이 먼저 알아차립니다
      </>
    ),
    sub: '잠들기 어려운 밤을 위한 호흡. 들이쉬는 것보다 길게 내쉬면 몸이 쉬는 쪽으로 기웁니다. 3분이면 됩니다.',
    note: '하루 종일 쥐고 있던 것을, 한 번의 긴 날숨에 놓아 봅니다.',
    cta: '지금 3분 내쉬기',
  },
}

export default function Home() {
  const navigate = useNavigate()
  const { face, toggleFace } = useFace()
  const copy = FACE_COPY[face]

  return (
    <div className="page">
      <div className="container">
        <section className="hero">
          <button
            type="button"
            className="face-toggle"
            onClick={toggleFace}
            aria-pressed={face === 'moon'}
            title={face === 'moon' ? '해의 얼굴로 보기' : '달의 얼굴로 보기'}
          >
            <span aria-hidden="true">{face === 'moon' ? '🌙' : '☀️'}</span>
            <span className="face-toggle__text">
              {face === 'moon' ? '달' : '해'}
            </span>
          </button>

          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="hero__title">{copy.title}</h1>
          <p className="hero__sub">{copy.sub}</p>
          <p className="hero__note">{copy.note}</p>
          <div className="hero__cta">
            <Link to="/breathe" className="btn btn--primary">{copy.cta}</Link>
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
