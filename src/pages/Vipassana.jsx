import { Link, useNavigate } from 'react-router-dom'
import { VIPASSANA_INTRO, LEVELS, getPracticesByLevel } from '../data/vipassana'
import './Vipassana.css'

export default function Vipassana() {
  const navigate = useNavigate()
  const intro = VIPASSANA_INTRO

  return (
    <div className="page vipassana-theme">
      <div className="container">
        <header className="page-head">
          {/* 1층은 결과 언어, 전통 용어는 작은 글씨로 (docs/PRODUCT_STRATEGY.md 2-5) */}
          <p className="eyebrow">{intro.pali} · 위빠사나</p>
          <h1>관찰 수행</h1>
          <p>고치려 하지 않고, 지금 일어나는 것을 있는 그대로 지켜보는 훈련입니다.</p>
        </header>

        {/* 사념처 안내 */}
        <Link to="/vipassana/satipatthana" className="card vp-satipatthana-card">
          <div>
            <p className="eyebrow">먼저 큰 그림부터</p>
            <h3>무엇을 관찰하는가 — 네 가지 자리</h3>
            <p className="muted">
              몸 · 느낌 · 마음 · 열어 두기. 아나빠나사띠 16단계의 네 갈래와 같은 뼈대입니다.
            </p>
          </div>
          <span className="vp-arrow">→</span>
        </Link>

        {/* 개념 */}
        <section className="vp-concept card">
          <p className="eyebrow">{intro.meaning}</p>
          <h2>{intro.title}</h2>
          <p className="vp-concept__body">{intro.summary}</p>

          <div className="vp-myth">
            <b>숨을 조절하는 수행이 아닙니다.</b>{' '}
            {intro.notBreathControl.replace('숨을 조절하는 수행이 아닙니다. ', '')}
          </div>

          <p className="eyebrow" style={{ marginTop: '1.5rem' }}>고요히 하기와 무엇이 다른가</p>
          <div className="vp-vs">
            <div className="vp-vs__item">
              <span className="vp-vs__label">{intro.vsSamatha.samatha.label}</span>
              <span className="vp-vs__pali">{intro.vsSamatha.samatha.pali}</span>
              <p>{intro.vsSamatha.samatha.desc}</p>
            </div>
            <div className="vp-vs__item vp-vs__item--accent">
              <span className="vp-vs__label">{intro.vsSamatha.vipassana.label}</span>
              <span className="vp-vs__pali">{intro.vsSamatha.vipassana.pali}</span>
              <p>{intro.vsSamatha.vipassana.desc}</p>
            </div>
          </div>
          <p className="vp-vs__note">{intro.vsSamatha.note}</p>

          <p className="eyebrow" style={{ marginTop: '1.5rem' }}>16단계와의 관계</p>
          <p className="vp-concept__body">{intro.vsAnapanasati}</p>

          <p className="eyebrow" style={{ marginTop: '1.5rem' }}>관찰이 향하는 곳</p>
          <div className="vp-marks">
            {intro.threeMarks.map((m) => (
              <div key={m.pali} className="vp-mark">
                <b>{m.label}</b>
                <span className="vp-mark__pali">{m.pali}</span>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>

          <p className="eyebrow" style={{ marginTop: '1.5rem' }}>{intro.noting.title}</p>
          <p className="vp-concept__body">{intro.noting.desc}</p>
          <div className="vp-labels">
            {intro.noting.labels.map((l) => (
              <span key={l} className="vp-label-chip">{l}</span>
            ))}
          </div>
        </section>

        {/* 안전 안내 */}
        <section className="vp-safety">
          <p className="vp-safety__title">⚠️ {intro.safety.title}</p>
          <ul>
            {intro.safety.items.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>

        {/* 단계별 실습 */}
        {[1, 2, 3, 4, 5].map((lv) => {
          const level = LEVELS[lv]
          const practices = getPracticesByLevel(lv)
          return (
            <section key={lv} className="vp-level">
              <div className="tetrad-head">
                <h2>{lv}단계 · {level.name}</h2>
                <span className="hint">{level.subtitle}</span>
              </div>

              {lv === 1 ? (
                <div className="tip-box">
                  <p className="eyebrow">개념 익히기</p>
                  <p>
                    무엇을 하는 수행인지, 자세와 안전은 위 개념 카드에서 확인하세요.
                    2단계부터 직접 앉아봅니다.
                  </p>
                </div>
              ) : (
                <div className="stage-grid">
                  {practices.map((p) => (
                    <div
                      key={p.id}
                      className="card stage-card"
                      onClick={() => navigate(`/vipassana/${p.id}`)}
                    >
                      <div className="stage-card__body">
                        <h3>
                          {p.title}
                          {p.requireConsent && <span title="시작 전 확인 필요"> ⚠️</span>}
                        </h3>
                        <div className="vp-card-meta">
                          <span className="vp-badge">{p.difficulty}</span>
                          <span>{p.context}</span>
                        </div>
                        <p className="muted" style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                          {p.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
