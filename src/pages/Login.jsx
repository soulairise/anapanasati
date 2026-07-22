import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // 로그인 성공 후 이동 (호흡 완료 저장 흐름이면 완료 화면으로 복귀)
  const goAfterAuth = () => {
    if (state?.redirectTo === '/complete' && state.session) {
      navigate('/complete', { state: state.session })
    } else {
      navigate('/journal')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!email.includes('@')) {
      setError('올바른 이메일 형식을 입력해 주세요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signup') {
        const { needsConfirm } = await signUp(email, password)
        if (needsConfirm) {
          setInfo(
            '확인 메일을 보냈어요. 메일의 링크를 클릭해 인증한 뒤, 다시 로그인해 주세요.',
          )
          setMode('signin')
          setBusy(false)
          return
        }
        // 이메일 확인이 꺼져 있으면 즉시 로그인 상태 → 바로 이동
        goAfterAuth()
      } else {
        await signIn(email, password)
        goAfterAuth()
      }
    } catch (err) {
      setError(translateError(err?.message))
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="card auth-card">
          <div className="text-center" style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2rem' }}>🌬️</div>
            <h1 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
              {mode === 'signup' ? '숨결의 길에 함께하기' : '숨결의 길에 들어가기'}
            </h1>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              이메일로 {mode === 'signup' ? '가입' : '로그인'}하여 수행일지를 기록하세요.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>이메일</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label>비밀번호 (6자 이상)</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p style={{ color: '#c0674f', marginBottom: '1rem' }}>{error}</p>}
            {info && <div className="banner" style={{ marginBottom: '1rem' }}>✉️ {info}</div>}

            <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
              {busy ? '처리 중…' : mode === 'signup' ? '가입하고 시작하기' : '로그인'}
            </button>
          </form>

          <hr className="divider" />
          <p className="text-center muted" style={{ fontSize: '0.9rem' }}>
            {mode === 'signup' ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup')
                setError('')
                setInfo('')
              }}
              style={{ color: 'var(--sage-deep)', fontWeight: 500 }}
            >
              {mode === 'signup' ? '로그인' : '회원가입'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// Supabase 에러 메시지 → 한국어 안내
function translateError(msg = '') {
  if (msg.includes('Invalid login credentials'))
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return '이미 가입된 이메일입니다. 로그인해 주세요.'
  if (msg.includes('Email not confirmed'))
    return '이메일 인증이 필요합니다. 받은 메일의 링크를 클릭해 주세요.'
  return msg || '문제가 발생했습니다. 다시 시도해 주세요.'
}
