// 소셜 로그인 제공자 설정
// VITE_AUTH_PROVIDERS에는 화면에서 실제 OAuth를 시작할 제공자만 적는다.
// 예: google,kakao,naver

export const AUTH_PROVIDERS = {
  google: 'google',
  kakao: 'custom:kakao',
  naver: 'custom:naver',
}

const enabledProviderKeys = new Set(
  (import.meta.env.VITE_AUTH_PROVIDERS || 'google')
    .split(',')
    .map((provider) => provider.trim().toLowerCase())
    .filter(Boolean),
)

export function isAuthProviderEnabled(providerKey) {
  return enabledProviderKeys.has(providerKey)
}

export function getAuthProviderId(providerKey) {
  return AUTH_PROVIDERS[providerKey]
}
