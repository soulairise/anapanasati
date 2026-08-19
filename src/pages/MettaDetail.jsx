import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPractice, getTarget, PHRASES, METTA_INTRO } from '../data/metta'
import './Metta.css'

export default function MettaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = getPractice(id)

  if (!p) {
    return (
      <div className="page container container--narrow text-center">
        <p>실습을 찾을 수 없습니다.</p>
        <Link to="/metta" className="btn btn--ghost">마음 나누기로</Link>
      </div>
    )
  }

  const targets = p.targets.map(getTarget).filter(Boolean)

  return (
    <div className="page metta-theme">
      <div className="container container--narrow">
        <header className="page-head">
          <p className="eyebrow">{p.context}</p>
          <h1>{p.title}</h1>
          <p>{p.summary}</p>
        </header>

        <section className="mt-detail-section">
          <p className="eyebrow">이렇게 합니다</p>
          <ol className="mt-steps">
            {p.how_steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>

        <section className="mt-detail-section">
          <p className="eyebrow">되뇌는 문구</p>
          <div className="mt-phrase-list">
            {PHRASES.map((ph) => (
              <span key={ph} className="mt-phrase-chip">{ph}</span>
            ))}
          </div>
          <p className="muted" style={{ fontSize: '0.9rem', marginTop: '0.6rem', lineHeight: 1.8 }}>
            주어만 바뀌고 뒤는 같습니다. 리듬이 생겨야 마음이 얹힙니다.
          </p>
        </section>

        <section className="mt-detail-section">
          <p className="eyebrow">오늘 떠올릴 대상</p>
          <div className="mt-targets">
            {targets.map((t, i) => (
              <div key={t.key} className="mt-target">
                <span className="mt-target__num">{i + 1}</span>
                <div>
                  <b>{t.label}</b>
                  <span className="muted">{t.hint}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-detail-section">
          <div className="mt-safety">
            <p className="mt-safety__title">기억해 주세요</p>
            <ul>
              {METTA_INTRO.safety.items.slice(0, 3).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </section>

        <details className="mt-origin">
          <summary>이 수행의 유래</summary>
          <div className="mt-origin__body">
            <p>
              자애(<i>mettā</i>)는 사무량심(四無量心)의 첫째로, 조건 없이 잘되기를 바라는 마음을 가리킵니다.
              나 자신에서 시작해 고마운 사람, 무심한 사람, 불편한 사람, 그리고 모든 존재로 경계를 넓혀가는
              순서가 전통적으로 전해집니다.
            </p>
            <p style={{ marginTop: '0.7rem' }}>
              태도의 축에서 보면 자애는 <b>계발</b>입니다 — 관찰(위빠사나)이 손대지 않는 수행이라면,
              자애는 없던 마음을 일부러 심는 수행이라 방향이 반대입니다.
            </p>
          </div>
        </details>

        <div className="breathe-controls" style={{ marginTop: 'var(--sp-4)', justifyContent: 'center' }}>
          <button className="btn btn--primary" onClick={() => navigate(`/metta/${p.id}/practice`)}>
            시작하기
          </button>
        </div>

        <div className="text-center" style={{ marginTop: 'var(--sp-3)' }}>
          <Link to="/metta" className="faint">← 마음 나누기로</Link>
        </div>
      </div>
    </div>
  )
}
