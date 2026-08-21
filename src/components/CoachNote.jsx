import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './CoachNote.css'

// ============================================================
// AI 수행 코칭 — 주에 한 통 받는 편지
//
// 자동으로 매번 생성하지 않는다. 눌러야 나온다.
//   ① 매번 부르면 비용이 샌다
//   ② 늘 있으면 흔해진다. 주에 한 번이라 읽게 된다
//
// ⚠️ 서버는 수치만 본다. 소감 글은 외부로 나가지 않는다.
//    화면에서도 그 사실을 말해 준다 — 사용자가 무엇이 오갔는지 알아야 한다.
// ============================================================

const fmt = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function CoachNote({ isPremium, sessionCount }) {
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [nextIn, setNextIn] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  // 이미 받아 둔 편지가 있으면 먼저 보여준다. 서버를 부르지 않는다.
  const loadExisting = useCallback(async () => {
    if (!isPremium) {
      setLoaded(true)
      return
    }
    const { data } = await supabase
      .from('coach_notes')
      .select('text, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) {
      setNote(data)
      const days = (Date.now() - new Date(data.created_at).getTime()) / 86400000
      setNextIn(Math.max(0, Math.ceil(7 - days)))
    }
    setLoaded(true)
  }, [isPremium])

  useEffect(() => {
    loadExisting()
  }, [loadExisting])

  const ask = async () => {
    setBusy(true)
    setError('')
    const { data, error: fnError } = await supabase.functions.invoke('coach')
    setBusy(false)
    if (fnError || data?.error) {
      setError(data?.message || '지금은 받을 수 없습니다. 잠시 뒤 다시 시도해 주세요.')
      return
    }
    setNote({ text: data.text, created_at: data.created_at })
    setNextIn(data.next_in_days ?? 7)
  }

  if (!loaded) return null

  if (!isPremium) {
    return (
      <div className="coach coach--locked" onClick={() => navigate('/premium')}>
        <p className="coach__title">🔒 수행 코칭</p>
        <p className="coach__lead">
          쌓인 기록을 읽고 주에 한 통, 짧은 편지를 보내드립니다.
        </p>
      </div>
    )
  }

  return (
    <div className="coach">
      <div className="coach__head">
        <p className="coach__title">수행 코칭</p>
        {note && nextIn > 0 && (
          <span className="coach__next">다음 편지까지 {nextIn}일</span>
        )}
      </div>

      {note ? (
        <>
          <p className="coach__date">{fmt(note.created_at)}</p>
          <div className="coach__body">
            {note.text.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {nextIn === 0 && (
            <button className="btn btn--ghost btn--block" onClick={ask} disabled={busy}>
              {busy ? '읽는 중…' : '새 편지 받기'}
            </button>
          )}
        </>
      ) : (
        <>
          <p className="coach__lead">
            지금까지의 기록을 읽고 짧은 편지를 써 드립니다. 주에 한 통까지 받으실 수 있습니다.
          </p>
          <button
            className="btn btn--primary btn--block"
            onClick={ask}
            disabled={busy || sessionCount < 3}
          >
            {busy ? '기록을 읽는 중…' : sessionCount < 3 ? '기록이 3회 쌓이면 열립니다' : '편지 받기'}
          </button>
        </>
      )}

      {error && (
        <p className="coach__error" role="status">
          {error}
        </p>
      )}

      {/* 무엇이 오가는지 밝힌다. 이런 기능은 몰래 쓰면 신뢰를 잃는다. */}
      <p className="coach__privacy">
        수행한 날짜·시간·갈래·집중도만 사용합니다. <b>남기신 소감 글은 보내지 않습니다.</b>
      </p>
    </div>
  )
}
