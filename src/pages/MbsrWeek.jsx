import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getWeek, WEEKS, SEVEN_ATTITUDES, readProgress, toggleWeekDone, setCurrentWeek } from '../data/mbsr'
import './Mbsr.css'

export default function MbsrWeek() {
  const { n } = useParams()
  const navigate = useNavigate()
  const w = getWeek(n)
  const [progress, setProgress] = useState(readProgress)

  if (!w) {
    return (
      <div className="page container container--narrow text-center">
        <p>해당 주차를 찾을 수 없습니다.</p>
        <Link to="/mbsr" className="btn btn--ghost">8주 마음챙김으로</Link>
      </div>
    )
  }

  const attitude = SEVEN_ATTITUDES[w.attitude]
  const done = progress.doneWeeks.includes(w.n)

  const markDone = () => {
    const next = toggleWeekDone(w.n)
    setProgress(next)
  }

  const goPractice = (to) => {
    setCurrentWeek(w.n) // 실습으로 나가기 전에 현재 주를 고정한다
    navigate(to)
  }

  return (
    <div className="page mbsr-theme">
      <div className="container container--narrow">
        <Link to="/mbsr" className="eyebrow" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← 8주 마음챙김
        </Link>

        <header className="page-head">
          <p className="eyebrow">{w.n}주차</p>
          <h1>{w.theme}</h1>
          <p>{w.focus}</p>
        </header>

        {/* 이번 주의 마음가짐 */}
        <section className="mb-week-attitude">
          <p className="eyebrow">이번 주의 마음가짐</p>
          <b>{attitude.ko}</b>
          <span className="faint">{attitude.en}</span>
          <p>{attitude.desc}</p>
        </section>

        {/* 실습 — 기존 실습을 accept 태도로 연다 */}
        <section className="mb-section">
          <p className="eyebrow">이번 주 실습</p>
          <div className="mb-practices">
            {w.practices.map((p) => (
              <button key={p.id + p.label} className="mb-practice" onClick={() => goPractice(p.to)}>
                <div>
                  <b>{p.label}</b>
                  <span className="muted">{p.mins}분</span>
                </div>
                <span className="mb-practice__go">시작 →</span>
              </button>
            ))}
          </div>
        </section>

        {/* 이번 주 할 일 */}
        <section className="mb-section">
          <p className="eyebrow">이번 주 해볼 것</p>
          <ul className="mb-homework">
            {w.homework.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </section>

        {w.note && (
          <div className="mb-note">
            <p>{w.note}</p>
          </div>
        )}

        {w.closing && (
          <div className="mb-closing">
            <p>{w.closing}</p>
          </div>
        )}

        <div className="breathe-controls" style={{ marginTop: 'var(--sp-4)', justifyContent: 'center' }}>
          <button className={`btn ${done ? 'btn--ghost' : 'btn--primary'}`} onClick={markDone}>
            {done ? '✓ 마친 주차 (되돌리기)' : '이번 주 마쳤어요'}
          </button>
        </div>

        {/* 주차 이동 */}
        <div className="mb-nav">
          {w.n > 1 ? (
            <Link to={`/mbsr/week/${w.n - 1}`} className="faint">← {w.n - 1}주차</Link>
          ) : <span />}
          {w.n < WEEKS.length ? (
            <Link to={`/mbsr/week/${w.n + 1}`} className="faint">{w.n + 1}주차 →</Link>
          ) : <span />}
        </div>
      </div>
    </div>
  )
}
