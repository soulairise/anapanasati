// 카카오 사용자정보 응답을 Supabase Custom OAuth2가 읽을 수 있는
// 표준 형태로 변환한다. Supabase Auth가 전달한 Bearer 토큰만 사용한다.

const KAKAO_USERINFO_URL = 'https://kapi.kakao.com/v2/user/me'

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
    const kakaoResponse = await fetch(KAKAO_USERINFO_URL, {
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
    })
    const profile = await kakaoResponse.json()

    if (!kakaoResponse.ok || !profile?.id) {
      return json({ error: 'kakao_userinfo_failed' }, 401)
    }

    const account = profile.kakao_account || {}
    const kakaoProfile = account.profile || {}
    const displayName = kakaoProfile.nickname || '카카오 사용자'

    return json({
      sub: String(profile.id),
      id: String(profile.id),
      email: account.email || undefined,
      email_verified: Boolean(account.email && account.is_email_verified),
      name: displayName,
      nickname: displayName,
      preferred_username: displayName,
      picture: kakaoProfile.profile_image_url || undefined,
    })
  } catch {
    return json({ error: 'kakao_userinfo_unavailable' }, 502)
  }
})
