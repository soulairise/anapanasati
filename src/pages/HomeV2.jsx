import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './HomeV2.css'

/*
  홈 v3 — 어둠 속의 한 점 빛

  v2(밝은 회색 + 얇은 선 + 목록)는 미니멀을 더 밀어붙인 것이라
  "정돈됨"이 아니라 "미완성"으로 읽혔다. 필요한 건 절제가 아니라 밀도였다.

  방향을 바꾼 근거 (frontend-design 스킬: "주제가 가진 세계에서 길어 올려라")
    · 사람들은 이 앱을 밤에, 불 끄고, 침대에서 연다.
      밝은 화면은 그 순간 눈을 깨운다. 어둠이 실제 사용 맥락이다.
    · 숨은 보이지 않는다. 보이는 것은 숨이 만드는 "변화" 뿐이다.
      그래서 형태가 아니라 빛의 세기가 호흡한다.
    · 아나빠나사띠는 부드럽지만 정밀하다. 4초·6초·16단계.
      그래서 부드러운 빛 위에 정밀한 눈금을 겹친다. 그 긴장이 이 화면의 성격이다.

  첫인상 (스킬: "큰 숫자에 작은 라벨로 도망가지 마라")
    화면 전체가 분당 6회로 밝아졌다 어두워진다.
    글을 읽기 전에 호흡이 먼저 맞는다.
*/

const GOALS = [
  { label: '잠이 안 와요', hint: '몸 훑기', min: 10, to: '/vipassana/body-scan/practice' },
  { label: '불안해요', hint: '숨의 일어남과 사라짐', min: 5, to: '/vipassana/breath-noting/practice' },
  { label: '집중이 안 돼요', hint: '기본 호흡', min: 5, to: '/breathe' },
  { label: '스트레스가 쌓였어요', hint: '걸으며 알아차리기', min: 5, to: '/vipassana/walking/practice' },
  { label: '아침을 열고 싶어요', hint: '요가 호흡법', min: null, to: '/yoga' },
]

const PATHS = [
  { verb: '지켜보기', name: '호흡하기', detail: '숨을 있는 그대로 따라간다', count: '16단계', to: '/breathe' },
  { verb: '다스리기', name: '요가 호흡', detail: '숨의 길이와 통로를 바꾼다', count: '9가지 기법', to: '/yoga' },
  { verb: '보기', name: '관찰 수행', detail: '숨을 창으로 삼아 몸과 마음을 본다', count: '6가지 실습', to: '/vipassana' },
]

// 들숨 4초 · 날숨 6초. 화면의 모든 리듬이 이 숫자에서 나온다.
const IN = 4
const OUT = 6

export default function HomeV2() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('in')
  const timer = useRef(null)

  // 빛과 같은 리듬으로 글자도 바뀐다. 화면이 숨을 쉰다는 걸 말로도 알려 준다.
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let inhale = true
    const step = () => {
      setPhase(inhale ? 'in' : 'out')
      timer.current = setTimeout(() => {
        inhale = !inhale
        step()
      }, (inhale ? IN : OUT) * 1000)
    }
    step()
    return () => clearTimeout(timer.current)
  }, [])

  return (
    <div className="v3">
      {/* 화면 전체가 호흡한다 — 형태가 아니라 빛이 */}
      <div className="v3-field" aria-hidden="true">
        <span className="v3-field__glow" />
        <span className="v3-field__grain" />
      </div>

      <div className="v3-wrap">
        <section className="v3-hero">
          <p className="v3-kicker">
            <span className="v3-kicker__sans">ĀNĀPĀNASATI</span>
            <span className="v3-kicker__rule" />
            <span>들숨날숨에 대한 알아차림</span>
          </p>

          <h1 className="v3-title">
            숨은 늘 여기 있었다.
            <br />
            <em>바라보기 전까지는</em>
            <br />
            없는 것과 같았을 뿐이다.
          </h1>

          <div className="v3-hero__foot">
            <div className="v3-hero__cta">
              <Link to="/breathe" className="v3-btn">지금 3분 앉기</Link>
              <Link to="/learn" className="v3-link">열여섯 걸음 보기</Link>
            </div>

            {/* 정밀한 계기 — 부드러운 빛 위에 겹치는 긴장 */}
            <div className="v3-meter">
              <div className="v3-meter__bar">
                <span className={`v3-meter__fill ${phase === 'in' ? 'is-in' : 'is-out'}`} />
              </div>
              <div className="v3-meter__read">
                <span className={phase === 'in' ? 'on' : ''}>들숨 {IN}초</span>
                <span className={phase === 'out' ? 'on' : ''}>날숨 {OUT}초</span>
                <span className="v3-meter__rate">분당 {(60 / (IN + OUT)).toFixed(0)}회</span>
              </div>
            </div>
          </div>
        </section>

        <section className="v3-sec">
          <h2 className="v3-sec__title">
            <span className="v3-sec__num">01</span> 오늘 어떤 마음이신가요
          </h2>
          <ul className="v3-goals">
            {GOALS.map((g) => (
              <li key={g.label}>
                <button className="v3-goal" onClick={() => navigate(g.to)}>
                  <span className="v3-goal__label">{g.label}</span>
                  <span className="v3-goal__hint">{g.hint}</span>
                  <span className="v3-goal__min">{g.min ? `${g.min}분` : '—'}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="v3-sec">
          <h2 className="v3-sec__title">
            <span className="v3-sec__num">02</span> 숨을 대하는 세 가지 태도
          </h2>
          <div className="v3-paths">
            {PATHS.map((p) => (
              <Link key={p.name} to={p.to} className="v3-path">
                <span className="v3-path__verb">{p.verb}</span>
                <span className="v3-path__name">{p.name}</span>
                <span className="v3-path__detail">{p.detail}</span>
                <span className="v3-path__count">{p.count}</span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="v3-tail">
          <p>
            수행을 마친 뒤엔 <Link to="/journal">수행일지</Link>에 오늘의 마음을 남겨보세요.
          </p>
          <p className="v3-tail__note">
            이 앱이 안내하는 순서는 2,500년 전 경전이 말한 열여섯 걸음을 따릅니다.
            특정 종교를 권하지 않습니다.
          </p>
        </footer>
      </div>
    </div>
  )
}
