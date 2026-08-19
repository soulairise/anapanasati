import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRACKS, getTrack } from '../lib/tracks'
import './JournalInsight.css'

// ============================================================
// 긴 기간 되돌아보기 — 프리미엄
//
// ⚠️ 기록 목록과 이번 달 히트맵은 건드리지 않는다. 원래 무료였고 그대로 둔다.
//    쓰던 것을 잠그면 뺏는 것이 된다. 프리미엄은 "위에 얹는" 것이어야 한다.
//    그래서 여기서만 3개월·6개월·전체 비교와 소감 검색을 제공한다.
// ============================================================

const RANGES = [
  { key: 90, label: '3개월' },
  { key: 180, label: '6개월' },
  { key: 0, label: '전체' },
]

const DAY = 86400000

export default function JournalInsight({ sessions, isPremium }) {
  const navigate = useNavigate()
  const [range, setRange] = useState(90)
  const [query, setQuery] = useState('')

  const { rows, total, found } = useMemo(() => {
    const from = range ? Date.now() - range * DAY : 0
    const inRange = sessions.filter((s) => new Date(s.created_at).getTime() >= from)

    // 갈래별로 묶는다. 기록이 없는 갈래는 보여주지 않는다 —
    // 빈 줄이 늘어서면 "안 한 것"이 강조돼 죄책감을 준다.
    const by = new Map()
    for (const s of inRange) {
      const key = getTrack(s.track).key
      const cur = by.get(key) || { key, count: 0, sec: 0, focusSum: 0, focusN: 0 }
      cur.count += 1
      cur.sec += s.duration_sec || 0
      if (Number.isFinite(s.focus)) {
        cur.focusSum += s.focus
        cur.focusN += 1
      }
      by.set(key, cur)
    }

    const q = query.trim().toLowerCase()
    const hits = q
      ? inRange.filter((s) => (s.note || '').toLowerCase().includes(q))
      : []

    return {
      rows: [...by.values()].sort((a, b) => b.sec - a.sec),
      total: inRange.length,
      found: hits,
    }
  }, [sessions, range, query])

  // 무료 사용자에게는 무엇이 있는지만 보여준다. 목록은 위에 그대로 다 있다.
  if (!isPremium) {
    return (
      <div className="insight insight--locked" onClick={() => navigate('/premium')}>
        <p className="insight__title">🔒 긴 기간으로 되돌아보기</p>
        <p className="insight__lead">
          3개월·6개월·전체 기간을 골라 갈래별로 견주어 보고, 남긴 소감을 검색합니다.
        </p>
        <p className="faint" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          기록 목록과 이번 달 히트맵은 원래대로 전부 무료입니다.
        </p>
      </div>
    )
  }

  const maxSec = Math.max(1, ...rows.map((r) => r.sec))

  return (
    <div className="insight">
      <div className="insight__head">
        <p className="insight__title">긴 기간으로 되돌아보기</p>
        <div className="insight__ranges">
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={`insight__range ${range === r.key ? 'active' : ''}`}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <p className="muted" style={{ margin: '0.75rem 0 0' }}>
          이 기간에는 기록이 없습니다.
        </p>
      ) : (
        <>
          <div className="insight__bars">
            {rows.map((r) => {
              const t = TRACKS[r.key]
              return (
                <div className="insight__bar" key={r.key}>
                  <span className="insight__bar-label">
                    {t.icon} {t.label}
                  </span>
                  <span className="insight__bar-track">
                    <span
                      className="insight__bar-fill"
                      style={{ width: `${Math.round((r.sec / maxSec) * 100)}%` }}
                    />
                  </span>
                  <span className="insight__bar-val">
                    {Math.round(r.sec / 60)}분
                    <span className="insight__bar-sub">
                      {r.count}회
                      {r.focusN ? ` · 집중 ${Math.round(r.focusSum / r.focusN)}` : ''}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>

          <label className="insight__search">
            <span className="insight__search-label">남긴 소감에서 찾기</span>
            <input
              className="insight__search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 잠, 불안, 어깨"
            />
          </label>

          {query.trim() && (
            <div className="insight__hits">
              {found.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  찾은 기록이 없습니다.
                </p>
              ) : (
                <>
                  <p className="faint" style={{ margin: '0 0 0.5rem' }}>
                    {found.length}개를 찾았습니다
                  </p>
                  {found.slice(0, 20).map((s) => (
                    <div className="insight__hit" key={s.id}>
                      <span className="insight__hit-date">
                        {new Date(s.created_at).toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="insight__hit-note">{s.note}</span>
                    </div>
                  ))}
                  {found.length > 20 && (
                    <p className="faint" style={{ margin: '0.5rem 0 0' }}>
                      앞의 20개만 보여드립니다. 검색어를 좁혀 보세요.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
