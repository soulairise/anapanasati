import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MBSR_INTRO, SEVEN_ATTITUDES, WEEKS, readProgress } from '../data/mbsr'
import './Mbsr.css'

export default function Mbsr() {
  const navigate = useNavigate()
  const [progress] = useState(readProgress)
  const intro = MBSR_INTRO

  return (
    <div className="page mbsr-theme">
      <div className="container">
        <header className="page-head">
          {/* 1층은 결과 언어. MBSR이라는 이름은 작은 글씨로. */}
          <p className="eyebrow">{intro.en}</p>
          <h1>{intro.title}</h1>
          <p>{intro.summary}</p>
        </header>

        {/* 가장 먼저 밝힐 것 — 정식 과정이 아니다 */}
        <div className="mb-disclaimer">
          <p className="mb-disclaimer__title">⚠️ 먼저 알려드립니다</p>
          <p>
            {intro.disclaimer.split(intro.disclaimerHighlight).map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <b>{intro.disclaimerHighlight}</b>}
              </span>
            ))}
          </p>
        </div>

        {/* 진도 */}
        <section className="mb-progress card">
          <div className="mb-progress__head">
            <div>
              <p className="eyebrow">지금 걷고 있는 주</p>
              <h2>{progress.current}주차</h2>
            </div>
            <button className="btn btn--primary" onClick={() => navigate(`/mbsr/week/${progress.current}`)}>
              이어서 하기
            </button>
          </div>
          <div className="mb-weeks-bar">
            {WEEKS.map((w) => (
              <span
                key={w.n}
                className={`mb-week-dot ${progress.doneWeeks.includes(w.n) ? 'is-done' : ''} ${
                  progress.current === w.n ? 'is-now' : ''
                }`}
                title={`${w.n}주차 · ${w.theme}`}
              />
            ))}
          </div>
          <p className="mb-progress__note">
            {progress.doneWeeks.length}주 마침 · 한 주를 다 못 채워도 다음으로 넘어가도 됩니다.
          </p>
        </section>

        {/* 다른 갈래와의 관계 — 실습이 겹쳐 보이는 이유 */}
        <section className="mb-relation card">
          <p className="eyebrow">관찰 수행과 뭐가 다른가요?</p>
          <p>{intro.relation}</p>
        </section>

        {/* 8주 목록 */}
        <div className="tetrad-head">
          <h2>8주의 길</h2>
          <span className="hint">{intro.origin}</span>
        </div>
        <div className="mb-week-list">
          {WEEKS.map((w) => {
            const done = progress.doneWeeks.includes(w.n)
            const now = progress.current === w.n
            return (
              <Link key={w.n} to={`/mbsr/week/${w.n}`} className={`mb-week ${now ? 'is-now' : ''}`}>
                <span className={`mb-week__n ${done ? 'is-done' : ''}`}>{done ? '✓' : w.n}</span>
                <div className="mb-week__body">
                  <b>{w.theme}</b>
                  <span className="muted">{w.practices.map((p) => p.label).join(' · ')}</span>
                </div>
                <span className="mb-week__arrow">→</span>
              </Link>
            )
          })}
        </div>

        {/* 7가지 태도 — MBSR 고유 */}
        <div className="tetrad-head" style={{ marginTop: 'var(--sp-5)' }}>
          <h2>일곱 가지 마음가짐</h2>
          <span className="hint">8주 내내 바탕에 깔리는 것</span>
        </div>
        <div className="mb-attitudes">
          {SEVEN_ATTITUDES.map((a) => (
            <div key={a.en} className="mb-attitude">
              <b>{a.ko}</b>
              <span className="faint">{a.en}</span>
              <p>{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center" style={{ marginTop: 'var(--sp-5)' }}>
          <Link to="/vipassana" className="faint">← 관찰 수행 보기</Link>
        </div>
      </div>
    </div>
  )
}
