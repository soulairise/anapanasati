// ============================================================
// 백엔드 데이터 계층 (Supabase 연동)
// - auth: Supabase Auth (이메일 회원가입/로그인)
// - sessionsApi: sessions 테이블 CRUD (RLS로 본인 데이터만 접근)
// 화면 코드는 이 모듈의 인터페이스만 사용한다.
// ============================================================

import { supabase } from './supabase'

// Supabase user 객체 → 앱 내부 표현으로 정규화
function toUser(u) {
  if (!u) return null
  return {
    id: u.id,
    email: u.email,
    display_name:
      u.user_metadata?.display_name ||
      u.user_metadata?.full_name ||
      u.user_metadata?.name ||
      u.user_metadata?.nickname ||
      u.user_metadata?.preferred_username ||
      u.email?.split('@')[0] ||
      '수행자',
  }
}

const OAUTH_RETURN_TO_KEY = 'soomgil_oauth_return_to'

// ---------- Auth ----------
export const auth = {
  async getUser() {
    const { data } = await supabase.auth.getSession()
    return toUser(data?.session?.user)
  },

  // 회원가입 — 이메일 확인이 켜져 있으면 needsConfirm=true 반환
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const needsConfirm = !data.session // 세션이 없으면 이메일 확인 필요
    return { user: toUser(data.user), needsConfirm }
  },

  // 로그인
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return toUser(data.user)
  },

  // 소셜 로그인 (google / custom:kakao / custom:naver)
  async signInWithProvider(provider, returnTo = '/journal') {
    // OAuth 왕복 과정에서 React Router의 location.state는 사라지므로 별도 보관한다.
    sessionStorage.setItem(OAUTH_RETURN_TO_KEY, returnTo)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // 로그인 후 앱으로 복귀 (GitHub Pages base 경로 포함)
        redirectTo: window.location.origin + window.location.pathname,
      },
    })
    if (error) throw error
    return data
  },

  finishOAuthRedirect() {
    const returnTo = sessionStorage.getItem(OAUTH_RETURN_TO_KEY)
    if (!returnTo) return
    sessionStorage.removeItem(OAUTH_RETURN_TO_KEY)

    const nextHash = `#${returnTo.startsWith('/') ? returnTo : `/${returnTo}`}`
    if (window.location.hash !== nextHash) window.location.hash = nextHash
  },

  async signOut() {
    await supabase.auth.signOut()
  },

  // 로그인 상태 변화 구독 (AuthContext에서 사용)
  onChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(toUser(session?.user), event)
    })
    return () => data.subscription.unsubscribe()
  },
}

// ---------- Sessions CRUD ----------
// RLS 덕분에 select/update/delete는 자동으로 본인 데이터로 제한된다.
export const sessionsApi = {
  // R — 목록 (최신순)
  async list() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  // R — 단건
  async get(id) {
    const { data, error } = await supabase.from('sessions').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data
  },

  // C — 생성 (user_id는 insert 정책 검사를 위해 명시)
  async create(userId, d) {
    const row = {
      user_id: userId,
      duration_sec: d.duration_sec ?? 0,
      // 갈래 구분. 기본은 아나빠나사띠 — 기존 기록과 호환된다.
      track: d.track ?? 'anapanasati',
      practice: d.practice ?? '',
      // stage는 아나빠나사띠 전용. 다른 갈래는 0으로 둔다.
      stage: d.stage ?? (d.track && d.track !== 'anapanasati' ? 0 : 1),
      breath_pattern: d.breath_pattern ?? '',
      focus_score: d.focus_score ?? 3,
      note: d.note ?? '',
      ai_feedback: d.ai_feedback ?? null,
    }
    const { data, error } = await supabase.from('sessions').insert(row).select().single()
    if (error) throw error
    return data
  },

  // U — 수정
  async update(id, patch) {
    const { data, error } = await supabase
      .from('sessions')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // D — 삭제
  async remove(id) {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) throw error
    return true
  },
}

// ---------- 통계 헬퍼 (순수 함수) ----------
export function computeStats(sessions) {
  const totalSec = sessions.reduce((sum, s) => sum + (s.duration_sec || 0), 0)
  const count = sessions.length
  const avgFocus = count
    ? (sessions.reduce((sum, s) => sum + (s.focus_score || 0), 0) / count).toFixed(1)
    : '0.0'

  const days = new Set(
    sessions.map((s) => new Date(s.created_at).toISOString().slice(0, 10)),
  )
  let streak = 0
  const d = new Date()
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }

  return { totalSec, count, avgFocus, streak }
}
