import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { sessionsApi, computeStats } from '../lib/store'
import { describeSession } from '../lib/tracks'
import JournalTrend from '../components/JournalTrend'
import JournalInsight from '../components/JournalInsight'
import CoachNote from '../components/CoachNote'
import { formatDuration, formatDate } from '../lib/format'

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

  // 기록은 전부 열람 무료.
  // 자기 기록을 잃는 느낌은 강한 불만으로 이어지고, 리텐션 장치를 유료화하면
  // 무료 사용자가 습관을 못 만들어 전환 대상 자체가 사라진다.
  // 히트맵·이번 달 추이도 무료로 연다. 리텐션 장치를 유료화하면 무료 사용자가
  // 습관을 못 만들어 전환 대상 자체가 사라진다. 프리미엄은 더 긴 기간의 분석·검색.
  const visible = sessions

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

        {/* 추이 — 기록이 있을 때만 */}
        {!loading && sessions.length > 0 && <JournalTrend sessions={sessions} />}

        {/* 긴 기간 되돌아보기 — 프리미엄. 아래 목록과 위 히트맵은 그대로 무료다. */}
        {!loading && sessions.length > 0 && (
          <JournalInsight sessions={sessions} isPremium={isPremium} />
        )}

        {/* 수행 코칭 — 프리미엄. 수치만 보고 쓴다(소감 글은 보내지 않는다). */}
        {!loading && <CoachNote isPremium={isPremium} sessionCount={sessions.length} />}

        {loading ? (
          <p className="muted text-center">불러오는 중…</p>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🕯️</div>
            <p>아직 기록이 없습니다.<br />첫 수행을 시작해 보세요.</p>
            <Link to="/" className="btn btn--primary" style={{ marginTop: '1rem' }}>
              수련 고르러 가기
            </Link>
          </div>
        ) : (
          <div>
            {visible.map((s) => {
              const info = describeSession(s)
              return (
                <div
                  key={s.id}
                  className="card session-item"
                  onClick={() => navigate(`/journal/${s.id}`)}
                >
                  <div>
                    <div className="session-item__stage">
                      <span className="track-tag" title={info.track.label}>
                        {info.track.icon} {info.track.label}
                      </span>
                      {info.title}
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

          </div>
        )}
      </div>
    </div>
  )
}
