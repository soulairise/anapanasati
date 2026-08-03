import { Link, useNavigate } from 'react-router-dom'
import { PRANAYAMA_INTRO, LEVELS, getTechniquesByLevel } from '../data/pranayama'
import { ASHTANGA_INTRO } from '../data/ashtanga'
import './Yoga.css'

export default function YogaBreathing() {
  const navigate = useNavigate()
  const intro = PRANAYAMA_INTRO

  return (
    <div className="page yoga-theme">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">Yoga · Prāṇāyāma</p>
          <h1>요가 호흡법</h1>
          <p>호흡을 다스려 몸과 마음을 고르는 요가의 길. 초보자도 개념부터 차근차근.</p>
        </header>

        {/* 아쉬탕가 안내 카드 */}
        <Link to="/yoga/ashtanga" className="card yoga-ashtanga-card">
          <div>
            <p className="eyebrow">먼저 큰 그림부터</p>
            <h3>{ASHTANGA_INTRO.title}</h3>
            <p className="muted">{ASHTANGA_INTRO.summary}</p>
          </div>
          <span className="yoga-arrow">→</span>
        </Link>

        {/* 프라나야마 개념 */}
        <section className="yoga-concept card">
          <p className="eyebrow">{intro.sanskrit} · {intro.meaning}</p>
          <h2>{intro.title}</h2>
          <p className="yoga-concept__body">{intro.summary}</p>

          <div className="yoga-vs">
            <div>
              <div className="yoga-vs__tag">아나빠나사띠</div>
              <p>{intro.vsAnapanasati.anapanasati}</p>
            </div>
            <div className="yoga-vs__mid">vs</div>
            <div>
              <div className="yoga-vs__tag yoga-vs__tag--accent">요가 호흡법</div>
              <p>{intro.vsAnapanasati.pranayama}</p>
            </div>
          </div>

          <p className="eyebrow" style={{ marginTop: '1.25rem' }}>호흡의 4요소</p>
          <div className="yoga-elements">
            {intro.elements.map((e) => (
              <div key={e.sanskrit} className="yoga-element">
                <b>{e.name}</b>
                <span className="faint">{e.sanskrit}</span>
                <span className="muted">{e.meaning}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 단계별 기법 */}
        {[1, 2, 3, 4, 5].map((lv) => {
          const level = LEVELS[lv]
          const techs = getTechniquesByLevel(lv)
          return (
            <section key={lv} className="yoga-level">
              <div className="tetrad-head">
                <h2>{lv}단계 · {level.name}</h2>
                <span className="hint">{level.subtitle}</span>
              </div>

              {lv === 1 ? (
                <div className="tip-box">
                  <p className="eyebrow">개념 익히기</p>
                  <p>프라나야마의 뜻·호흡 4요소·바른 자세와 안전은 위 개념 카드에서 확인하세요. 아래 단계부터 직접 실습합니다.</p>
                </div>
              ) : (
                <div className="stage-grid">
                  {techs.map((t) => (
                    <div key={t.id} className="card stage-card" onClick={() => navigate(`/yoga/${t.id}`)}>
                      <div className="stage-card__body">
                        <h3>{t.name_ko} {t.contraindications.length > 0 && <span className="warn-dot" title="주의/금기 있음">⚠️</span>}</h3>
                        <p>{t.name_sanskrit} · {t.difficulty}</p>
                        <p className="muted" style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>{t.summary}</p>
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
