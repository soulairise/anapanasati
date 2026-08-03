// 네이버 로그인 사용자정보 응답을 Supabase Custom OAuth2가 읽을 수 있는
// 표준 형태로 변환한다. 이 함수에는 Supabase JWT 검증을 적용하지 않는다.
// Supabase Auth 서버가 전달한 네이버 Bearer 토큰만 네이버 API로 전달한다.

const NAVER_USERINFO_URL = 'https://openapi.naver.com/v1/nid/me'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

Deno.serve(async (req) => {
  if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)

  const authorization = req.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'missing_bearer_token' }, 401)
  }

  try {
    const naverResponse = await fetch(NAVER_USERINFO_URL, {
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
    })
    const naverBody = await naverResponse.json()

    if (!naverResponse.ok || naverBody?.resultcode !== '00' || !naverBody?.response?.id) {
      return json({ error: 'naver_userinfo_failed' }, 401)
    }

    const profile = naverBody.response
    const displayName = profile.nickname || profile.name || '네이버 사용자'

    return json({
      sub: String(profile.id),
      id: String(profile.id),
      email: profile.email || undefined,
      email_verified: Boolean(profile.email),
      name: profile.name || displayName,
      nickname: displayName,
      preferred_username: displayName,
      picture: profile.profile_image || undefined,
    })
  } catch {
    return json({ error: 'naver_userinfo_unavailable' }, 502)
  }
})
