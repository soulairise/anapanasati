# 프로젝트 인계 노트 (HANDOFF) — 숨결의 길 (Ānāpānasati Path)

> 이 문서 하나로 다른 AI(ChatGPT 등)나 개발자가 작업을 이어받을 수 있도록 정리한 자체 완결형 인계서입니다.
> 최종 업데이트: 2026-08-03. 작성자: 김민영(소울매트/소울라이즈) + Claude + Codex.

---

## 0. 이 문서 사용법 (Claude Code / Codex)
프로젝트 루트는 `/Users/soulmat/Desktop/my-first-web/anapanasati`입니다. 먼저 이 문서와 `docs/SOCIAL_LOGIN_SETUP.md`, `docs/TOSS_SETUP.md`, `git status`를 확인하고 이어서 작업하세요.

현재 작업 트리에는 아직 커밋되지 않은 소셜 로그인·토스 결제 변경이 있습니다. 사용자 변경을 보존하고 `git reset --hard`나 파일 되돌리기를 하지 마세요. GitHub Pages 배포는 완료됐지만 소스 브랜치 커밋·푸시는 별도 확인이 필요합니다.

### 0-1. Codex·Claude 병렬 작업 규칙

- 이 `HANDOFF.md`가 프로젝트 전체의 단일 기준 문서다.
- Codex 작업 로그: `docs/HANDOFF_CODEX.md`
- Claude 작업 로그: `docs/HANDOFF_CLAUDE.md`
- **Codex 담당:** 토스 결제창, 결제 승인·프리미엄 상태, 인증·환경설정, 기존 구성 업데이트, 빌드·최종 배포 검증.
- **Claude 담당:** 기존 아나빠나사띠 기능을 삭제하거나 대체하지 않고, 별도의 위빠사나 호흡·관찰 실습 기능과 콘텐츠 추가.
- 작업 시작 전 반드시 `git status`와 두 작업 로그의 최신 항목을 읽는다.
- 상대 작업과 겹치는 파일을 발견하면 덮어쓰지 말고 현재 변경을 먼저 읽어서 병합한다.
- 공용 충돌 가능 파일은 `src/App.jsx`, `src/components/Navbar.jsx`, 공통 CSS, 라우팅·홈 화면 파일이다. 수정 전 자기 작업 로그에 목적과 변경 예정 파일을 남긴다.
- 결제·인증 파일은 Claude가 수정하지 않고, 위빠사나 전용 콘텐츠 파일은 Codex가 임의로 수정하지 않는다.
- 완료할 때 자기 작업 로그와 이 문서의 완료 현황·다음 작업을 함께 갱신한다.
- 배포는 기본적으로 Codex가 담당한다. Claude는 기능을 `READY_FOR_DEPLOY`로 기록하고, 사용자가 Claude에게 직접 배포를 요청한 경우에만 빌드·배포한다.
- 배포 전에는 상대 작업 로그에 `IN_PROGRESS`가 있는지 확인하고, 미완성 코드가 포함되지 않는지 검토한다.

---

## 1. 프로젝트 개요
- **무엇:** 부처가 가르친 호흡명상 **아나빠나사띠 16단계**를 배우고(Learn) → 호흡 가이드로 수행하고(Breathe) → 수행일지에 기록(Journal)하는 웹앱.
- **디자인 톤:** 고요한 Zen (미색 배경, 세이지/클레이 포인트, 넉넉한 여백).
- **타겟:** 명상 입문자 + 요가·명상 수련생 (한국어).
- **수익모델:** 구독제(프리미엄), 광고 없음. 오픈기념 가격 진행.

## 2. 기술 스택 & 구조
- **프론트:** React 18 + Vite 5, React Router(**HashRouter** — GitHub Pages SPA 대응).
- **백엔드/DB:** Supabase (Auth + PostgreSQL `sessions` 테이블 + RLS).
- **배포:** GitHub Pages (`npm run deploy`, gh-pages 브랜치).
- **오디오:** 싱잉볼·파도 = Web Audio 실시간 합성 / 나레이션(inhale·hold·exhale) = ElevenLabs로 생성한 mp3 파일.

```
src/
├─ main.jsx                 # 진입점: HashRouter > AuthProvider > PremiumProvider > App
├─ App.jsx                  # 라우팅 (/, /learn, /learn/:id, /breathe, /complete, /journal, /journal/:id, /login, /premium)
├─ index.css / App.css      # 디자인 시스템 + 앱 레벨 스타일
├─ context/
│  ├─ AuthContext.jsx        # Supabase Auth 상태 (user, signIn, signUp, signOut, onChange)
│  └─ PremiumContext.jsx     # 프리미엄 구독 상태 (isPremium, setPremium) — 현재 localStorage 데모
├─ lib/
│  ├─ supabase.js            # Supabase 클라이언트 (env에서 URL/key)
│  ├─ store.js               # auth + sessionsApi(CRUD) + computeStats  ★백엔드 인터페이스
│  ├─ bowl.js                # 싱잉볼 사운드 합성 (들숨 264Hz / 날숨 176Hz)
│  ├─ ambient.js             # 파도 배경음 합성
│  ├─ narration.js           # inhale/hold/exhale mp3 재생 (assets/audio/*.mp3)
│  └─ format.js
├─ data/stages.js           # 16단계 콘텐츠 (정적)
├─ assets/audio/            # inhale.mp3, hold.mp3, exhale.mp3 (ElevenLabs "Lily" 음성)
├─ components/Navbar.jsx
└─ pages/
   ├─ Home / Learn / StageDetail / Breathe / SessionComplete / Journal / JournalDetail / Login / Premium
```

## 3. 현재 상태 (완료 ✅)
- ✅ PRD([PRD.md](./PRD.md)), 16단계 학습, 단계 상세
- ✅ 호흡 가이드: 원 애니메이션(작게 시작→들숨에 커짐→멈춤 유지→날숨에 작아짐), **2.5초 준비 후 시작**, 중앙에서 퍼지는 물결(리플), 페이즈별 색 그라데이션
- ✅ 사운드 3종 토글: 🔔 싱잉볼 / 🌊 파도 / 🎙️ 나레이션(inhale·hold·exhale, ElevenLabs Lily 음성)
- ✅ Supabase 연동: 이메일 회원가입·로그인(자동확인 ON), 수행일지 CRUD, RLS, 영속성
- ✅ 수익화 1단계: 페이월 `/premium`(오픈기념 가격), 기능 잠금(프리미엄 전용 패턴/시간, 일지 7일 제한), `is_premium` 플래그
- ✅ 모바일 반응형(네비 한 줄 정렬 등)
- ✅ 배포됨: **https://soulairise.github.io/anapanasati/**

## 4. 소셜 로그인 — 구글·카카오·네이버 연결 완료 ✅
로그인 화면에 **구글·카카오·네이버** 버튼 구현 완료. Apple 로그인은 유료 Apple Developer Program이 필요해 버튼을 제거했다.
- Supabase 기본 Provider: 구글 ✅
- 카카오·네이버: Supabase Custom OAuth2 Provider와 사용자정보 변환 Edge Function으로 연결 완료.

**완료된 것:**
- `src/lib/store.js` → `auth.signInWithProvider(provider)` (supabase.auth.signInWithOAuth, redirectTo=origin+pathname)
- `src/context/AuthContext.jsx` → `signInWithProvider` 노출
- `src/pages/Login.jsx` → 소셜 버튼 4개 + `handleSocial`
- `src/lib/authProviders.js` → `VITE_AUTH_PROVIDERS` 활성화 목록과 카카오·네이버 Custom OAuth 매핑
- `src/components/SocialIcons.jsx` (인라인 SVG 로고), `src/pages/Login.css` (브랜드 색)
- OAuth 로그인 전 이동 목적지를 보관하고 로그인 후 수행일지/프리미엄 화면으로 복귀하도록 개선.
- `supabase/functions/naver-userinfo/index.ts` 생성 및 Supabase 배포 완료(Verify JWT OFF).
- `supabase/functions/kakao-userinfo/index.ts` 생성 및 Supabase 배포 완료(Verify JWT OFF).

**현재 활성 제공자:**
1. Google: Supabase 기본 Provider
2. Kakao: 전용 카카오 앱 + Supabase Custom OAuth2 Provider(`custom:kakao`)
3. Naver: 전용 네이버 앱 + Supabase Custom OAuth2 Provider(`custom:naver`)

프론트 활성 목록은 `.env.local`의 `VITE_AUTH_PROVIDERS=google,kakao,naver`로 관리한다.

**Supabase 제공자 설정 방법:**
   - Authentication → Sign In / Providers → 각 제공자 ON + 키 입력
   - Google: Google Cloud Console에서 OAuth 클라이언트 ID/시크릿 발급
   - Kakao: 카카오 개발자센터 앱 생성 → REST API 키 + Client Secret
   - Naver: 네이버 개발자센터 앱 생성 → Supabase Custom OAuth2 Provider 설정
   - Apple: 미사용(유료 Apple Developer Program이 필요해 로그인 버튼 제거)
   - Redirect URL(Supabase가 주는 콜백)과, 앱 복귀 URL(`https://soulairise.github.io/anapanasati/`)을 각 콘솔의 허용 목록에 등록
   - ⚠️ HashRouter + OAuth 토큰 프래그먼트 충돌 가능 → 콜백 후 세션 감지 동작 확인 필요(안 되면 detectSessionInUrl 처리 점검).

## 5. 결제(토스) & 소셜로그인 현황
- **구글 소셜 로그인: 실제 활성화 완료 ✅** (Supabase 구글 provider ON, 리다이렉트 확인·배포됨).
- **카카오: 전용 앱, `kakao-userinfo` 함수, Supabase `custom:kakao` Provider 활성화 완료 ✅**
- **네이버: 전용 앱, `naver-userinfo` 함수, Supabase `custom:naver` Provider 활성화 완료 ✅**
- 상세 절차: `docs/SOCIAL_LOGIN_SETUP.md`
- **토스페이먼츠 결제: 테스트 환경 연결·서버 배포 완료 ✅, 결제 테스트만 남음.**
  - 프론트: `src/lib/payments.js`, `Premium.jsx`(TOSS_READY 분기), `PaySuccess/PayFail.jsx`, 라우트 `/pay/success` `/pay/fail`
  - 백엔드: `supabase/functions/confirm-payment/index.ts`(승인+is_premium), `supabase/schema-profiles.sql`(profiles)
  - 테스트 클라이언트 키 `.env` 연결, `profiles` SQL 실행, `TOSS_SECRET_KEY` 등록, `confirm-payment` Edge Function 배포 완료(2026-07-29).
  - **남은 일:** 로그인 → `/premium` → 토스 테스트 결제 → 성공 화면 및 `profiles.is_premium=true` 확인.
  - 현재는 1회성 결제이며 자동갱신(빌링키)은 미구현. 실제 매출은 토스 전자결제 계약·심사 후 라이브 키로 교체해야 함.

## 5-1. 2026-08-03 최종 배포·OAuth 검증 기록

- `npm run build` 성공: Vite 108개 모듈 빌드 완료.
- `npm run deploy` 성공: GitHub Pages `Published` 확인.
- 배포 주소: https://soulairise.github.io/anapanasati/
- 로그인 주소: https://soulairise.github.io/anapanasati/#/login
- GitHub Pages 빌드 상태: `built`, 최종 배포 커밋 `bb66f86`.
- 배포에서 확인한 파일: `assets/index-Cv_3HVFx.js`, `assets/index-D4Sb7Jus.css`.
- 최종 로그인 버튼 수(Google/Kakao/Naver/Apple): `1/1/1/0`. Apple 버튼 제거가 실제 배포에 반영됨.
- 이전 로그인 화면이 남는 브라우저 캐시 문제를 줄이기 위해 `index.html`에 no-cache 메타 설정을 추가함.
- Google: 버튼 클릭 후 Google 계정 선택 화면까지 정상 진입. 요청 scope는 `email profile`.
- Kakao: 버튼 클릭 후 `숨결의 길` 닉네임 동의 화면까지 정상 진입. `KOE205` 해결 완료, `custom:kakao`와 `profile_nickname`만 사용.
- Naver: 버튼 클릭 후 `숨결의 길` 개인정보 동의 화면까지 정상 진입. 이용자 식별자·이메일 주소·별명 항목 확인.
- 개인정보 제공 동의 및 계정 선택은 자동으로 진행하지 않았다. 사용자가 각 동의 화면에서 직접 승인한 뒤 앱 복귀, Supabase 사용자 생성, `/journal` 이동을 최종 확인해야 한다.
- 네이버 앱은 현재 `개발 중` 상태다. 소유자 테스트 후 일반 사용자 공개를 위해 네이버 로그인 검수가 필요하다.

관리 링크:

- Supabase Auth Providers: https://supabase.com/dashboard/project/ianhttigznynatbnfrkw/auth/providers
- Supabase Users: https://supabase.com/dashboard/project/ianhttigznynatbnfrkw/auth/users
- Supabase Edge Functions: https://supabase.com/dashboard/project/ianhttigznynatbnfrkw/functions
- Kakao 앱: https://developers.kakao.com/console/app/1531835
- Naver 앱: https://developers.naver.com/apps/#/myapps/xdia0IPHq0iNwR39VvuS/overview
- Naver 검수: https://developers.naver.com/apps/#/myapps/xdia0IPHq0iNwR39VvuS/verify

## 5-2. Claude 작업 — 요가 호흡법(프라나야마) 추가 (2026-08-03)
> 상세 로그: `docs/HANDOFF_CLAUDE.md` / 기획: `docs/PRANAYAMA_PLAN.md`
- 아나빠나사띠는 **보존**, 별도 **요가 호흡법** 섹션 신설. 위빠사나는 다음 차례.
- ✅ 데이터: `src/data/ashtanga.js`(아쉬탕가 8단계), `src/data/pranayama.js`(개념+5단계+9기법+타이머설정)
- ✅ 페이지: `src/pages/YogaBreathing.jsx`(허브 `/yoga`), `YogaAshtanga.jsx`(`/yoga/ashtanga`), `YogaTechnique.jsx`(`/yoga/:id`), `YogaPractice.jsx`(**실제 타이머 완료** — /yoga/:id/practice), `Yoga.css`
- ✅ 타이머 3모드: paced(복식·박스·웃자이 등) / alternate(나디쇼다나 콧구멍 교대) / pulsed(카팔라바티·바스트리카, 금기 동의 모달). dev 실동작 검증 완료.
- ✅ 장르 차별화·연출(2026-08-04): `.yoga-theme`(따뜻한 테라코타, 세이지와 대비) + 연꽃 만다라 배경 + 오브 색 그라데이션 전환 + 숨결 사운드(`src/lib/yogaSound.js`, bowl.js AudioContext 공유·미변경). 요가 전용 파일만 수정.
- ⚠️ **공용 파일 병합(추가만)**: `src/App.jsx`(요가 라우트 4개 추가), `src/components/Navbar.jsx`("요가 호흡" 링크 추가). **Codex는 이 두 파일 수정 시 덮어쓰지 말고 병합**할 것. 결제·인증 파일은 Claude가 미변경.
- 상태: **READY_FOR_DEPLOY** (미배포). 배포는 Codex 담당 또는 사용자가 Claude에게 요청 시.

## 다음 로드맵
- 요가 호흡법: (선택) 실습 완료를 수행일지에 기록 / 사운드·나레이션 추가 (Claude)
- 위빠사나 실습 추가 (Claude)
- 사용자가 구글·카카오·네이버 동의 완료 → Supabase Users 생성 및 `/journal` 복귀 확인
- 네이버 공개 서비스 검수 신청
- Capacitor로 iOS/Android 앱 패키징
- 가이드 음성 명상(프리미엄) 확장, AI 수행 코칭(Claude API, sessions.ai_feedback 컬럼 예약됨)

## 6. 실행 / 빌드 / 배포
```bash
cd anapanasati
npm install
npm run dev        # http://localhost:5173 (또는 지정 포트)
npm run build      # dist/ 생성
npm run deploy     # gh-pages 브랜치로 GitHub Pages 배포
```
- Pages 배포 후 반영 확인: https://soulairise.github.io/anapanasati/

## 7. 중요 정보
- **GitHub:** github.com/soulairise/anapanasati (계정 soulairise, git email mykim97@gmail.com)
- **배포 URL:** https://soulairise.github.io/anapanasati/
- **Supabase 프로젝트:** ref `ianhttigznynatbnfrkw` / URL `https://ianhttigznynatbnfrkw.supabase.co` (리전 Mumbai)
- **환경변수(.env — gitignore, 새 환경에서 필요):**
  ```
  VITE_SUPABASE_URL=https://ianhttigznynatbnfrkw.supabase.co
  VITE_SUPABASE_ANON_KEY=<Supabase Publishable key (sb_publishable_...) — 브라우저 공개 안전, 대시보드 API Keys에서 복사>
  ```
  (publishable 키는 공개돼도 안전 — RLS가 데이터 보호. secret 키는 절대 프론트/커밋 금지.)
- **가격(오픈기념):** 월 ₩4,900(정가 9,800) / 연 ₩39,000(정가 98,000) / 7일 무료체험.
- **나레이션 음성:** ElevenLabs "Lily"(voice_id `pFZP5JQG7iQjIQuC4Bku`), 무료 API 가능 음성(Sarah/Lily/Matilda/Alice). mp3는 이미 커밋돼 있어 재생성 없이 실행 가능. 재생성 시에만 ElevenLabs API 키 필요(로컬 `~/.elevenlabs_key`, 커밋 안 함).

## 8. 주의사항 (gotchas)
- **HashRouter 사용** — 링크는 `/#/breathe` 형태. GitHub Pages SPA 404 회피 목적.
- **vite base = `/anapanasati/`** — 저장소 이름과 일치해야 자원 경로 안 깨짐.
- **DB 스키마:** `sessions` 테이블 + RLS(본인 데이터만). SQL은 [supabase/schema.sql](./supabase/schema.sql).
- **is_premium은 현재 localStorage 데모** — 실제 결제 연동 시 Supabase `profiles.is_premium`으로 이관 예정.
- 오디오/음성은 사용자 제스처(시작 버튼) 이후에만 재생됨(브라우저 자동재생 정책).

## 9. 핵심 파일 요약
| 파일 | 역할 |
|------|------|
| `src/lib/store.js` | 백엔드 인터페이스(auth/sessions). 여기만 바꾸면 백엔드 교체 가능 |
| `src/pages/Breathe.jsx` | 호흡 가이드(애니메이션·사운드·나레이션·게이팅) |
| `src/pages/Premium.jsx` | 페이월 |
| `src/context/PremiumContext.jsx` | 구독 상태 |
| `docs/MONETIZATION.md` | 수익화 기획(가격·무료/유료·로드맵) |
| `PRD.md` | 제품 요구사항 |
