import { Link } from 'react-router-dom'
import { ASHTANGA_INTRO, ASHTANGA } from '../data/ashtanga'
import './Yoga.css'

export default function YogaAshtanga() {
  return (
    <div className="page yoga-theme">
      <div className="container container--narrow">
        <Link to="/yoga" className="eyebrow" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← 요가 호흡법
        </Link>

        <header className="page-head">
          <p className="eyebrow">Aṣṭāṅga · 여덟 개의 가지</p>
          <h1>{ASHTANGA_INTRO.title}</h1>
          <p>{ASHTANGA_INTRO.summary}</p>
        </header>

        <div className="limb-list">
          {ASHTANGA.map((limb) => (
            <div key={limb.id} className={`card limb-card ${limb.highlight ? 'limb-card--hi' : ''}`}>
              <div className="limb-card__head">
                <span className="limb-num">{limb.id}</span>
                <div>
                  <h3>
                    {limb.name_ko} <span className="faint">{limb.name_sanskrit}</span>
                  </h3>
                  <p className="limb-short">{limb.short}</p>
                </div>
              </div>
              <p className="limb-desc">{limb.desc}</p>
              {limb.items.length > 0 && (
                <ul className="limb-items">
                  {limb.items.map((it) => (
                    <li key={it.sanskrit}>
                      <b>{it.name}</b> <span className="faint">({it.sanskrit})</span> — {it.meaning}
                    </li>
                  ))}
                </ul>
              )}
              {limb.highlight && (
                <Link to="/yoga" className="btn btn--primary" style={{ marginTop: '1rem' }}>
                  프라나야마 호흡 배우러 가기 →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
