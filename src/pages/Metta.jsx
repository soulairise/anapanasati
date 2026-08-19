import { Link, useNavigate } from 'react-router-dom'
import { METTA_INTRO, PRACTICES, TARGETS } from '../data/metta'
import './Metta.css'

export default function Metta() {
  const navigate = useNavigate()
  const intro = METTA_INTRO

  return (
    <div className="page metta-theme">
      <div className="container">
        <header className="page-head">
          {/* 1층은 결과 언어, 전통 용어는 작은 글씨로 */}
          <p className="eyebrow">{intro.pali} · 자애</p>
          <h1>마음 나누기</h1>
          <p>나와 남이 편안하기를 바라는 마음을 의도적으로 키우는 수행입니다.</p>
        </header>

        <section className="mt-concept card">
          <p className="eyebrow">{intro.meaning}</p>
          <h2>{intro.title}</h2>
          <p className="mt-concept__body">{intro.summary}</p>

          <p className="eyebrow" style={{ marginTop: '1.5rem' }}>관찰 수행과 무엇이 다른가</p>
          <div className="mt-vs">
            <div className="mt-vs__item">
              <span className="mt-vs__label">{intro.vsObserve.observe.label}</span>
              <span className="mt-vs__pali">{intro.vsObserve.observe.pali}</span>
              <p>{intro.vsObserve.observe.desc}</p>
            </div>
            <div className="mt-vs__item mt-vs__item--accent">
              <span className="mt-vs__label">{intro.vsObserve.metta.label}</span>
              <span className="mt-vs__pali">{intro.vsObserve.metta.pali}</span>
              <p>{intro.vsObserve.metta.desc}</p>
            </div>
          </div>
          <p className="mt-vs__note">{intro.vsObserve.note}</p>

          <p className="eyebrow" style={{ marginTop: '1.5rem' }}>마음을 넓히는 순서</p>
          <div className="mt-targets">
            {TARGETS.map((t, i) => (
              <div key={t.key} className="mt-target">
                <span className="mt-target__num">{i + 1}</span>
                <div>
                  <b>{t.label}</b>
                  <span className="muted">{t.hint}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="eyebrow" style={{ marginTop: '1.5rem' }}>네 가지 헤아릴 수 없는 마음</p>
          <div className="mt-four">
            {intro.fourImmeasurables.map((f) => (
              <div key={f.pali} className="mt-four__item">
                <b>{f.label}</b>
                <span className="faint">{f.pali}</span>
                <span className="muted">{f.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 경전이 말하는 이익 — 수면이 첫머리다 */}
        <section className="mt-benefits card">
          <p className="eyebrow">오래전부터 전해오는 이익</p>
          <ul>
            {intro.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="faint" style={{ fontSize: '0.82rem', marginTop: '0.7rem', lineHeight: 1.7 }}>
            경전에 전하는 내용이며, 의학적 효과를 약속하는 것은 아닙니다.
          </p>
        </section>

        <section className="mt-safety">
          <p className="mt-safety__title">💛 {intro.safety.title}</p>
          <ul>
            {intro.safety.items.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>

        <div className="tetrad-head">
          <h2>실습</h2>
          <span className="hint">앉아서, 또는 누워서</span>
        </div>
        <div className="stage-grid">
          {PRACTICES.map((p) => (
            <div key={p.id} className="card stage-card" onClick={() => navigate(`/metta/${p.id}`)}>
              <div className="stage-card__body">
                <h3>{p.title}</h3>
                <div className="mt-card-meta">
                  <span className="mt-badge">{p.difficulty}</span>
                  <span>{p.context}</span>
                </div>
                <p className="muted" style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>{p.summary}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center" style={{ marginTop: 'var(--sp-4)' }}>
          <Link to="/vipassana" className="faint">← 관찰 수행 보기</Link>
        </div>
      </div>
    </div>
  )
}
