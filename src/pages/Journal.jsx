import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { sessionsApi, computeStats } from '../lib/store'
import { getStage } from '../data/stages'
import { formatDuration, formatDate } from '../lib/format'

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

export default function Journal() {
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    sessionsApi.list(user.id).then((rows) => {
      setSessions(rows)
      setLoading(false)
    })
  }, [user])

  const stats = computeStats(sessions)

  // 무료: 최근 7일 기록만 열람 (프리미엄은 전체)
  const now = Date.now()
  const visible = isPremium
    ? sessions
    : sessions.filter((s) => now - new Date(s.created_at).getTime() <= SEVEN_DAYS)
  const hiddenCount = sessions.length - visible.length

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">Journal · 수행일지</p>
          <h1>나의 호흡 기록</h1>
          <p>지금까지의 수행을 되돌아보세요.</p>
        </header>

        {/* 통계 */}
        <div className="stats-row">
          <div className="card stat-card">
            <div className="num">{stats.count}</div>
            <div className="label">총 수행 횟수</div>
          </div>
          <div className="card stat-card">
            <div className="num">{Math.round(stats.totalSec / 60)}</div>
            <div className="label">총 수행 분</div>
          </div>
          <div className="card stat-card">
            <div className="num">{stats.streak}</div>
            <div className="label">연속 수행일</div>
          </div>
          <div className="card stat-card">
            <div className="num">{stats.avgFocus}</div>
            <div className="label">평균 집중도</div>
          </div>
        </div>

        {loading ? (
          <p className="muted text-center">불러오는 중…</p>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🕯️</div>
            <p>아직 기록이 없습니다.<br />첫 호흡 수행을 시작해 보세요.</p>
            <Link to="/breathe" className="btn btn--primary" style={{ marginTop: '1rem' }}>
              호흡하러 가기
            </Link>
          </div>
        ) : (
          <div>
            {visible.map((s) => {
              const stage = getStage(s.stage)
              return (
                <div
                  key={s.id}
                  className="card session-item"
                  onClick={() => navigate(`/journal/${s.id}`)}
                >
                  <div>
                    <div className="session-item__stage">
                      {s.stage}. {stage?.title_ko}
                    </div>
                    <div className="session-item__date">{formatDate(s.created_at)}</div>
                    {s.note && (
                      <div className="muted" style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
                        {s.note.length > 40 ? s.note.slice(0, 40) + '…' : s.note}
                      </div>
                    )}
                  </div>
                  <div className="session-item__meta">
                    <div>{formatDuration(s.duration_sec)}</div>
                    <div className="focus-dots">{'●'.repeat(s.focus_score)}{'○'.repeat(5 - s.focus_score)}</div>
                  </div>
                </div>
              )
            })}

            {hiddenCount > 0 && (
              <div
                className="card"
                style={{ padding: '1.25rem', textAlign: 'center', cursor: 'pointer', marginTop: '0.5rem' }}
                onClick={() => navigate('/premium')}
              >
                🔒 지난 <b>{hiddenCount}개</b>의 기록이 더 있어요 —{' '}
                <span style={{ color: 'var(--clay-deep)', fontWeight: 500 }}>
                  프리미엄에서 전체 보기
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
