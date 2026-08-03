import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTechnique, LEVELS } from '../data/pranayama'
import './Yoga.css'

export default function YogaTechnique() {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = getTechnique(id)

  if (!t) {
    return (
      <div className="page container container--narrow text-center">
        <p>기법을 찾을 수 없습니다.</p>
        <Link to="/yoga" className="btn btn--ghost">요가 호흡법으로</Link>
      </div>
    )
  }

  const level = LEVELS[t.level]
  const hasContra = t.contraindications && t.contraindications.length > 0

  return (
    <div className="page yoga-theme">
      <div className="container container--narrow">
        <Link to="/yoga" className="eyebrow" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← 요가 호흡법
        </Link>

        <p className="eyebrow">{t.level}단계 · {level.name}</p>
        <h1 style={{ fontSize: '2rem', margin: '0.3rem 0' }}>{t.name_ko}</h1>
        <p className="yoga-detail__sanskrit">{t.name_sanskrit} · {t.difficulty}</p>

        {/* 금기 경고 (5단계·시탈리 등) */}
        {hasContra && (
          <div className="warn-box">
            <p className="warn-box__title">⚠️ 이런 분은 피하거나 전문가와 상담하세요</p>
            <p>{t.contraindications.join(' · ')}</p>
          </div>
        )}

        <p className="yoga-detail__summary">{t.summary}</p>

        {/* 효과 */}
        <p className="eyebrow" style={{ marginTop: '1.5rem' }}>효과</p>
        <div className="yoga-benefits">
          {t.benefits.map((b) => (
            <span key={b} className="yoga-benefit-chip">{b}</span>
          ))}
        </div>

        {/* 방법 */}
        <p className="eyebrow" style={{ marginTop: '1.5rem' }}>방법</p>
        <ol className="steps-list">
          {t.how_steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>

        {/* 비율 */}
        <div className="tip-box" style={{ marginTop: '1.25rem' }}>
          <p className="eyebrow">호흡 비율</p>
          <p>{t.ratio}</p>
        </div>

        {/* 주의 */}
        {t.cautions && t.cautions.length > 0 && (
          <>
            <p className="eyebrow" style={{ marginTop: '1.25rem' }}>주의</p>
            <ul className="caution-list">
              {t.cautions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </>
        )}

        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <button className="btn btn--primary" onClick={() => navigate(`/yoga/${t.id}/practice`)}>
            이 호흡 실습하기 🫁
          </button>
        </div>
      </div>
    </div>
  )
}
