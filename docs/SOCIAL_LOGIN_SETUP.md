# 카카오·네이버 소셜 로그인 설정

업데이트: 2026-08-03

## 현재 상태

- Google: 실제 로그인 활성화 완료
- Kakao: 전용 앱, `custom:kakao` Provider, 사용자정보 변환 함수 배포 완료
- Naver: 전용 앱 생성, `custom:naver` Provider 활성화, 사용자정보 변환 함수 배포 완료
- Apple: 유료 Apple Developer Program이 필요해 로그인 버튼 제거

공통 주소:

- 서비스 주소: `https://soulairise.github.io/anapanasati/`
- OAuth Callback URL: `https://ianhttigznynatbnfrkw.supabase.co/auth/v1/callback`
- Supabase Auth Providers: <https://supabase.com/dashboard/project/ianhttigznynatbnfrkw/auth/providers>

## 1. 카카오 로그인

1. [숨결의 길 카카오 앱](https://developers.kakao.com/console/app/1531835)에 접속한다.
2. 애플리케이션을 만들고 이름을 `숨결의 길`로 설정한다.
3. **앱 → 플랫폼 키 → REST API 키**를 확인한다. 이 값이 Supabase의 Kakao Client ID다.
4. REST API 키 설정의 Redirect URI에 다음 주소를 등록한다.

   `https://ianhttigznynatbnfrkw.supabase.co/auth/v1/callback`

5. **제품 설정 → 카카오 로그인 → 일반**에서 카카오 로그인을 ON으로 변경한다.
6. **동의항목**에서 닉네임을 설정한다. 현재 앱은 개인정보 최소 수집을 위해 닉네임만 사용한다.
7. REST API 키의 **Client Secret**을 발급하고 활성화한다.
8. [Supabase Auth Providers](https://supabase.com/dashboard/project/ianhttigznynatbnfrkw/auth/providers)에서 Custom OAuth2 `custom:kakao`를 사용한다.
9. 비즈 앱 전환 전에는 기본 Kakao Provider가 이메일 scope를 강제로 요청하므로 사용하지 않는다. 현재 설정은 다음과 같다.

   - Identifier: `custom:kakao`
   - Authorization URL: `https://kauth.kakao.com/oauth/authorize`
   - Token URL: `https://kauth.kakao.com/oauth/token`
   - UserInfo URL: `https://ianhttigznynatbnfrkw.supabase.co/functions/v1/kakao-userinfo`
   - Scopes: `profile_nickname`
   - Allow users without email: ON

공식 문서:

- [Supabase Kakao 로그인 설정](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
- [카카오 로그인 준비사항](https://developers.kakao.com/docs/en/kakaologin/prerequisite)

현재 카카오 앱은 비즈 앱 전환 전이므로 `custom:kakao`가 `profile_nickname` scope만 요청한다.

## 2. 네이버 로그인

네이버는 Supabase 기본 제공자 목록에는 없지만, Supabase Custom OAuth2 Provider로 연결할 수 있다.

1. [숨결의 길 네이버 앱](https://developers.naver.com/apps/#/myapps/xdia0IPHq0iNwR39VvuS/overview)에 접속한다.
2. 사용 API로 **네이버 로그인**을 선택하고, 서비스 환경은 **PC 웹**을 선택한다.
3. 서비스 URL과 Callback URL을 입력한다.

   - 서비스 URL: `https://soulairise.github.io/anapanasati/`
   - Callback URL: `https://ianhttigznynatbnfrkw.supabase.co/auth/v1/callback`

4. 회원정보 권한에서 이메일과 별명을 선택한다.
5. 발급된 Client ID와 Client Secret을 확인한다.
6. [Supabase Auth Providers](https://supabase.com/dashboard/project/ianhttigznynatbnfrkw/auth/providers) 하단의 **Custom OAuth Providers → New Provider**를 선택한다.
7. **Manual configuration (OAuth2)** 방식으로 다음 값을 입력한다.

   - Identifier: `custom:naver`
   - Name: `Naver`
   - Client ID: 네이버 Client ID
   - Client Secret: 네이버 Client Secret
   - Issuer URL: `https://nid.naver.com`
   - Authorization URL: `https://nid.naver.com/oauth2.0/authorize`
   - Token URL: `https://nid.naver.com/oauth2.0/token`
   - UserInfo URL: `https://ianhttigznynatbnfrkw.supabase.co/functions/v1/naver-userinfo`
   - Scopes: 비움
   - Allow users without email: ON

8. Provider를 생성하고 Enabled 상태인지 확인한다.

네이버 사용자정보는 응답이 `response` 객체 안에 들어오기 때문에, 배포된 `naver-userinfo` Edge Function이 Supabase가 읽을 수 있는 표준 형태로 바꿔준다.

공식 문서:

- [Supabase Custom OAuth/OIDC Providers](https://supabase.com/docs/guides/auth/custom-oauth-providers)
- [네이버 개발자센터 로그인 API](https://developers.naver.com/docs/login/api/)
- [네이버 Open API 주소 목록](https://naver.github.io/naver-openapi-guide/apilist.html)

## 3. 제공자 활성화 및 배포

카카오와 네이버의 Supabase 설정이 완료되어 로컬 `.env.local`에 다음 항목을 사용한다.

```env
VITE_AUTH_PROVIDERS=google,kakao,naver
```

그 후 빌드 및 배포한다.

```bash
npm run build
npm run deploy
```

앱 키와 Client Secret은 `.env` 또는 프론트 코드에 넣지 않는다. 해당 값은 카카오·네이버 개발자센터와 Supabase Provider 설정 화면에만 저장한다.

## 4. 테스트 순서

1. 시크릿 브라우저 또는 로그아웃 상태에서 로그인 페이지를 연다.
2. 카카오 버튼을 눌러 닉네임 동의 화면이 표시되는지 확인한다.
3. 네이버 버튼을 눌러 이메일·별명 동의 화면이 표시되는지 확인한다.
4. Supabase Authentication → Users에서 각 사용자가 생성됐는지 확인한다.
5. 로그인 후 수행일지 페이지로 이동하는지 확인한다.

- 배포 로그인 페이지: <https://soulairise.github.io/anapanasati/#/login>
- Supabase 사용자 목록: <https://supabase.com/dashboard/project/ianhttigznynatbnfrkw/auth/users>
