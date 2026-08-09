import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { STAGES, TETRADS, getStagesByTetrad } from '../data/stages'
import { useAuth } from '../context/AuthContext'
import { sessionsApi } from '../lib/store'
import './Learn.css'

export default function Learn() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doneStages, setDoneStages] = useState(new Set())

  // 수행 기록에서 "이미 걸어본 단계"를 모은다 (sessions.stage)
  useEffect(() => {
    if (!user) {
      setDoneStages(new Set())
      return
    }
    let alive = true
    sessionsApi
      .list()
      .then((rows) => {
        if (alive) setDoneStages(new Set(rows.map((r) => r.stage).filter(Boolean)))
      })
      .catch(() => {
        /* 조회 실패는 진도 표시만 생략 — 학습 콘텐츠는 그대로 보여준다 */
      })
    return () => {
      alive = false
    }
  }, [user])

  const doneCount = doneStages.size
  const percent = Math.round((doneCount / STAGES.length) * 100)

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">16일 여정</p>
          <h1>하루에 한 걸음씩, 열여섯 걸음</h1>
          <p>
            호흡을 지켜보는 훈련을 몸·느낌·마음·법 네 갈래로 나눠 열여섯 걸음에 담았습니다.
            순서대로 하루에 하나씩 걸어보세요.
          </p>
        </header>

        {/* 진도 */}
        <section className="journey">
          {user ? (
            <>
              <div className="journey__head">
                <strong>
                  열여섯 걸음 중 <span className="journey__num">{doneCount}</span>걸음
                </strong>
                <span className="faint">{percent}%</span>
              </div>
              <div className="journey__bar">
                <div className="journey__fill" style={{ width: `${percent}%` }} />
              </div>
              <p className="journey__msg">
                {doneCount === 0
                  ? '아직 첫 걸음 전이에요. 1단계부터 편하게 시작해보세요.'
                  : doneCount >= STAGES.length
                    ? '열여섯 걸음을 모두 걸으셨습니다. 처음으로 돌아가 다시 걸어도 좋습니다.'
                    : '건너뛴 걸음이 있어도 괜찮습니다. 오늘 앉는 것이 여정입니다.'}
              </p>
            </>
          ) : (
            <p className="journey__msg">
              <Link to="/login" className="journey__link">로그인</Link>하면 어디까지 걸었는지 여정이 기록됩니다.
            </p>
          )}
        </section>

        {[1, 2, 3, 4].map((t) => {
          const tetrad = TETRADS[t]
          return (
            <section key={t} className="tetrad-block">
              <div className="tetrad-head">
                <h2>제{t} · {tetrad.name}</h2>
                <span className="pali">{tetrad.pali}</span>
                <span className="hint">{tetrad.hint}</span>
              </div>
              <div className="stage-grid">
                {getStagesByTetrad(t).map((s) => {
                  const done = doneStages.has(s.id)
                  return (
                    <div
                      key={s.id}
                      className={`card stage-card ${done ? 'is-done' : ''}`}
                      onClick={() => navigate(`/learn/${s.id}`)}
                    >
                      <div className="stage-card__num">{done ? '✓' : s.id}</div>
                      <div className="stage-card__body">
                        <h3>{s.title_ko}</h3>
                        <p>{s.title_pali}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        <p className="faint text-center" style={{ marginTop: '2rem' }}>
          전체 {STAGES.length}단계 · 아나빠나사띠 숫따(MN 118)에 기초함
        </p>
      </div>
    </div>
  )
}
