import { Link, useNavigate } from 'react-router-dom'
import BreathRule from '../components/BreathRule'
import './HomeV2.css'

/*
  홈 v2 — frontend-design 스킬을 따라 다시 잡은 첫 화면.

  기존 홈이 "AI가 만든 것" 처럼 보인 이유는 스킬이 첫 번째로 금지한
  조합을 그대로 갖고 있었기 때문이다:
    따뜻한 크림 배경(#f6f4ef) + 대비 강한 명조 + 테라코타 포인트(#bfa38a)

  주제에서 길어 올린 것 (스킬: "주제가 가진 세계 — 재료·도구·산물·말씨")
    · 숨은 길이로 잰다 (4초·6초·분당 6회)  → 호흡 눈금, 등폭 숫자
    · 16단계는 순서가 곧 내용이다          → 여기서만 번호를 쓴다
    · 새벽과 밤에 앉는다                   → 크림이 아니라 차가운 회백

  첫인상 (스킬: "가장 특징적인 것으로 열어라, 큰 숫자+작은 라벨로 도망가지 마라")
    글을 읽기 전에 원이 먼저 분당 6회로 숨을 쉰다.
    들어온 사람이 설명 없이 호흡을 맞추게 된다. 그게 이 서비스가 파는 것이다.
*/

// 목적 → 실습 직결. 카드가 아니라 목록 행으로 둔다.
// 카드로 감싸면 다섯 개가 다 똑같은 무게가 되어 고를 수가 없다.
const GOALS = [
  { label: '잠이 안 와요', hint: '몸 훑기', min: 10, to: '/vipassana/body-scan/practice' },
  { label: '불안해요', hint: '숨의 일어남과 사라짐', min: 5, to: '/vipassana/breath-noting/practice' },
  { label: '집중이 안 돼요', hint: '기본 호흡', min: 5, to: '/breathe' },
  { label: '스트레스가 쌓였어요', hint: '걸으며 알아차리기', min: 5, to: '/vipassana/walking/practice' },
  { label: '아침을 열고 싶어요', hint: '요가 호흡법', min: null, to: '/yoga' },
]

// 세 갈래는 순서가 없다. 그래서 번호를 붙이지 않는다.
// 대신 이들을 실제로 가르는 것 — 숨을 대하는 태도 — 를 앞에 낸다.
const PATHS = [
  { verb: '지켜보기', name: '호흡하기', detail: '숨을 있는 그대로 따라간다', count: '16단계', to: '/breathe' },
  { verb: '다스리기', name: '요가 호흡', detail: '숨의 길이와 통로를 바꾼다', count: '9가지 기법', to: '/yoga' },
  { verb: '보기', name: '관찰 수행', detail: '숨을 창으로 삼아 몸과 마음을 본다', count: '6가지 실습', to: '/vipassana' },
]

export default function HomeV2() {
  const navigate = useNavigate()

  return (
    <div className="v2">
      <div className="v2__wrap">
        {/* ── 첫인상: 화면이 먼저 숨을 쉰다 ─────────────────── */}
        <section className="v2-hero">
          <div className="v2-hero__breath" aria-hidden="true">
            <span className="v2-hero__orb" />
          </div>

          <p className="v2-eyebrow">아나빠나사띠 · 들숨날숨에 대한 알아차림</p>
          <h1 className="v2-hero__title">
            들숨과 날숨,
            <br />
            그 사이에 머무르다
          </h1>
          <p className="v2-hero__sub">
            잠들기 어려운 밤, 불안하고 산만한 마음을 위한 호흡 훈련.
            2,500년 된 순서를 한국어로, 하루 한 걸음씩.
          </p>

          <div className="v2-hero__cta">
            <Link to="/breathe" className="v2-btn v2-btn--solid">지금 3분 앉기</Link>
            <Link to="/learn" className="v2-btn v2-btn--plain">16일 여정 보기 →</Link>
          </div>

          {/* 서명 요소. 기본 패턴이 그대로 눈금이 된다 */}
          <div className="v2-hero__rule">
            <BreathRule phases={[4, 0, 6, 0]} labels />
          </div>
        </section>

        {/* ── 목적으로 들어오기 ─────────────────────────────── */}
        <section className="v2-sec">
          <h2 className="v2-sec__title">오늘 어떤 마음이신가요</h2>
          <ul className="v2-goals">
            {GOALS.map((g) => (
              <li key={g.label}>
                <button className="v2-goal" onClick={() => navigate(g.to)}>
                  <span className="v2-goal__label">{g.label}</span>
                  <span className="v2-goal__hint">{g.hint}</span>
                  <span className="v2-goal__min">{g.min ? `${g.min}분` : ''}</span>
                  <span className="v2-goal__arrow" aria-hidden="true">→</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <BreathRule phases={[4, 0, 6, 0]} />

        {/* ── 수련의 세 갈래 ────────────────────────────────── */}
        <section className="v2-sec">
          <h2 className="v2-sec__title">숨을 대하는 세 가지 태도</h2>
          <div className="v2-paths">
            {PATHS.map((p) => (
              <Link key={p.name} to={p.to} className="v2-path">
                <span className="v2-path__verb">{p.verb}</span>
                <span className="v2-path__name">{p.name}</span>
                <span className="v2-path__detail">{p.detail}</span>
                <span className="v2-path__count">{p.count}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="v2-tail">
          <p>
            수행을 마친 뒤엔 <Link to="/journal">수행일지</Link>에 오늘의 마음을 남겨보세요.
          </p>
          <p className="v2-tail__note">
            이 앱이 안내하는 순서는 2,500년 전 경전이 말한 열여섯 걸음을 따릅니다.
            특정 종교를 권하지 않습니다.
          </p>
        </section>
      </div>
    </div>
  )
}
