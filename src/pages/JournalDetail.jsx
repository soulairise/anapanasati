import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { sessionsApi } from '../lib/store'
import { describeSession } from '../lib/tracks'
import { formatDuration, formatDate } from '../lib/format'

export default function JournalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState('')
  const [focus, setFocus] = useState(3)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    sessionsApi.get(id).then((s) => {
      setSession(s)
      if (s) {
        setNote(s.note || '')
        setFocus(s.focus_score || 3)
      }
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="page container">불러오는 중…</div>
  if (!session) {
    return (
      <div className="page container container--narrow text-center">
        <div className="empty-state">
          <p>기록을 찾을 수 없습니다.</p>
          <Link to="/journal" className="btn btn--ghost">일지 목록으로</Link>
        </div>
      </div>
    )
  }

  const info = describeSession(session)

  const handleUpdate = async () => {
    setBusy(true)
    const updated = await sessionsApi.update(id, { note: note.trim(), focus_score: focus })
    setSession(updated)
    setEditing(false)
    setBusy(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('이 기록을 삭제할까요? 되돌릴 수 없습니다.')) return
    setBusy(true)
    await sessionsApi.remove(id)
    navigate('/journal')
  }

  return (
    <div className="page">
      <div className="container container--narrow">
        <Link to="/journal" className="eyebrow" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← 수행일지 목록
        </Link>

        <div className="card" style={{ padding: '2rem' }}>
          <p className="eyebrow">{formatDate(session.created_at)}</p>
          <h1 style={{ fontSize: '1.6rem', margin: '0.5rem 0' }}>
            <span className="track-tag">{info.track.icon} {info.track.label}</span>
            {info.title}
          </h1>
          <p className="muted">
            {formatDuration(session.duration_sec)}
            {info.detail ? ` · ${info.detail}` : ''}
          </p>

          <hr className="divider" />

          {!editing ? (
            <>
              <div className="field">
                <label>집중도</label>
                <div className="focus-dots" style={{ fontSize: '1.2rem' }}>
                  {'●'.repeat(session.focus_score)}{'○'.repeat(5 - session.focus_score)}
                </div>
              </div>
              <div className="field">
                <label>수행 소감</label>
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {session.note || <span className="faint">기록된 소감이 없습니다.</span>}
                </p>
              </div>

              <div className="stage-nav">
                <button className="btn btn--ghost" onClick={() => setEditing(true)}>수정하기</button>
                <button
                  className="btn btn--ghost"
                  style={{ color: '#c0674f', borderColor: '#e0c3b8' }}
                  onClick={handleDelete}
                  disabled={busy}
                >
                  삭제하기
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="field">
                <label>집중도</label>
                <div className="setting-row" style={{ justifyContent: 'flex-start' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      className={`pattern-chip ${focus === n ? 'active' : ''}`}
                      onClick={() => setFocus(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>수행 소감</label>
                <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              <div className="stage-nav">
                <button className="btn btn--ghost" onClick={() => setEditing(false)} disabled={busy}>
                  취소
                </button>
                <button className="btn btn--primary" onClick={handleUpdate} disabled={busy}>
                  {busy ? '저장 중…' : '저장하기'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
