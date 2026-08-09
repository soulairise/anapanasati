import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPractice, getAttitude, VIPASSANA_INTRO } from '../data/vipassana'
import './Vipassana.css'

const ENGINE_LABEL = {
  guided: '안내를 따라 앉기',
  scan: '몸을 훑으며',
  walking: '걸으며',
  open: '대상 없이 열어 두고',
}

export default function VipassanaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = getPractice(id)

  if (!p) {
    return (
      <div className="page container container--narrow text-center">
        <p>실습을 찾을 수 없습니다.</p>
        <Link to="/vipassana" className="btn btn--ghost">관찰 수행으로</Link>
      </div>
    )
  }

  const attitude = getAttitude(p, 'observe')

  return (
    <div className="page vipassana-theme">
      <div className="container container--narrow">
        <header className="page-head">
          <p className="eyebrow">{p.context}</p>
          <h1>{p.title}</h1>
          <p>{p.summary}</p>
          <div className="vp-card-meta" style={{ justifyContent: 'flex-start' }}>
            <span className="vp-badge">{p.difficulty}</span>
            <span className="vp-badge">{ENGINE_LABEL[p.engine]}</span>
          </div>
        </header>

        <section className="vp-detail-section">
          <p className="eyebrow">이렇게 합니다</p>
          <ol className="vp-steps">
            {p.how_steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>

        <section className="vp-detail-section">
          <p className="eyebrow">이름 붙이기</p>
          <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.8 }}>
            마음이 끌려갔을 때 속으로 조용히 한 단어만 붙이고 놓습니다.
          </p>
          <div className="vp-labels">
            {p.noting.map((n) => (
              <span key={n} className="vp-label-chip">{n}</span>
            ))}
          </div>
        </section>

        <section className="vp-detail-section">
          <p className="eyebrow">도움이 되는 점</p>
          <div className="vp-labels vp-benefits">
            {p.benefits.map((b) => (
              <span key={b} className="vp-label-chip">{b}</span>
            ))}
          </div>
        </section>

        {p.cautions.length > 0 && (
          <section className="vp-detail-section">
            <div className="vp-safety">
              <p className="vp-safety__title">주의할 점</p>
              <ul>
                {p.cautions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 2층 — 사용자가 스스로 열게 한다 */}
        <details className="vp-origin">
          <summary>이 수행의 유래</summary>
          <div className="vp-origin__body">
            <p>
              <b>{p.context}</b> — {attitude.cue}
            </p>
            <p style={{ marginTop: '0.7rem' }}>
              관찰 수행(위빠사나, <i>vipassanā</i>)은 <i>vi</i>(꿰뚫어)와 <i>passanā</i>(봄)가 합쳐진 말로,
              있는 그대로 꿰뚫어 본다는 뜻입니다. 관찰이 향하는 곳은 세 가지입니다 —
              {VIPASSANA_INTRO.threeMarks.map((m) => ` ${m.pali}`).join(' ·')}.
            </p>
            <p style={{ marginTop: '0.7rem' }}>
              마무리 문구는 이렇게 씁니다 — <b>"{attitude.closing}"</b>
            </p>
          </div>
        </details>

        <div className="breathe-controls" style={{ marginTop: 'var(--sp-4)', justifyContent: 'center' }}>
          <button className="btn btn--primary" onClick={() => navigate(`/vipassana/${p.id}/practice`)}>
            시작하기
          </button>
        </div>

        <div className="text-center" style={{ marginTop: 'var(--sp-3)' }}>
          <Link to="/vipassana" className="faint">← 관찰 수행으로</Link>
        </div>
      </div>
    </div>
  )
}
