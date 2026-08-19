import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sessionsApi } from '../lib/store'
import { describeSession } from '../lib/tracks'
import { formatDuration } from '../lib/format'

export default function SessionComplete() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [focus, setFocus] = useState(3)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 호흡 화면을 거치지 않고 직접 들어온 경우
  if (!state) {
    return (
      <div className="page container container--narrow text-center">
        <div className="empty-state">
          <div className="icon">🫧</div>
          <p>먼저 수행을 진행해 주세요.</p>
          <Link to="/" className="btn btn--primary" style={{ marginTop: '1rem' }}>
            수련 고르러 가기
          </Link>
        </div>
      </div>
    )
  }

  // 갈래마다 제목·부제가 다르다. 해석은 lib/tracks.js 한 곳에서.
  const info = describeSession(state)

  const handleSave = async () => {
    if (!user) {
      // 로그인 후 저장하도록 유도 — 현재 세션 데이터를 로그인 화면으로 넘김
      navigate('/login', { state: { redirectTo: '/complete', session: state } })
      return
    }
    setSaving(true)
    setError('')
    try {
      await sessionsApi.create(user.id, {
        ...state,
        focus_score: focus,
        note: note.trim(),
      })
      navigate('/journal')
    } catch (e) {
      setError(e.message || '저장 중 문제가 발생했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="container container--narrow">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🙏</div>
          <p className="eyebrow" style={{ marginTop: '0.5rem' }}>수행을 마쳤습니다</p>
          <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
            {formatDuration(state.duration_sec)}의 고요함
          </h1>
          <p className="muted">
            {info.track.icon} {info.track.label} · {info.title}
            {info.detail ? ` · ${info.detail}` : ''}
          </p>
        </div>

        {!user && (
          <div className="banner">
            💡 기록을 저장하려면 로그인이 필요합니다. 저장 버튼을 누르면 로그인 화면으로 이동합니다.
          </div>
        )}

        <div className="card" style={{ padding: '2rem' }}>
          <div className="field">
            <label>오늘의 집중도</label>
            <div className="setting-row" style={{ justifyContent: 'flex-start' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`pattern-chip ${focus === n ? 'active' : ''}`}
                  onClick={() => setFocus(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>수행 소감 (선택)</label>
            <textarea
              className="textarea"
              placeholder="무엇을 알아차렸나요? 몸과 마음은 어땠나요?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && <p style={{ color: '#c0674f', marginBottom: '1rem' }}>{error}</p>}

          <button className="btn btn--primary btn--block" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중…' : '일지에 기록하기'}
          </button>
          <button
            className="btn btn--ghost btn--block"
            style={{ marginTop: '0.75rem' }}
            onClick={() => navigate(info.backTo)}
            disabled={saving}
          >
            기록하지 않고 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
