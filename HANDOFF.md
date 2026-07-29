# 프로젝트 인계 노트 (HANDOFF) — 숨결의 길 (Ānāpānasati Path)

> 이 문서 하나로 다른 AI(ChatGPT 등)나 개발자가 작업을 이어받을 수 있도록 정리한 자체 완결형 인계서입니다.
> 최종 업데이트: 2026-07 기준. 작성자: 김민영(소울매트/소울라이즈) + Claude.

---

## 0. 이 문서 사용법 (ChatGPT에게)
아래 내용을 통째로 붙여넣고 이렇게 요청하면 됩니다:
> "나는 '숨결의 길'이라는 React+Vite 명상 웹앱을 만들고 있어. 아래는 프로젝트 인계 노트야. 현재 상태를 파악하고, '4. 진행 중(미완성)' 항목부터 이어서 도와줘."

⚠️ ChatGPT는 내 로컬 파일에 직접 접근할 수 없으니, 코드 수정은 (a) 내가 파일 내용을 붙여넣어 주거나 (b) GitHub 저장소를 참고하게 하는 방식으로 진행하세요.

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

## 4. 소셜 로그인 — UI 완료 ✅, 제공자 설정만 남음
로그인 화면에 **구글·카카오·네이버·애플** 버튼 구현 완료.
- Supabase 기본 지원: 구글 ✅, 카카오 ✅, 애플 ✅ / **네이버는 미지원**(커스텀 OIDC 필요).

**완료된 것:**
- `src/lib/store.js` → `auth.signInWithProvider(provider)` (supabase.auth.signInWithOAuth, redirectTo=origin+pathname)
- `src/context/AuthContext.jsx` → `signInWithProvider` 노출
- `src/pages/Login.jsx` → 소셜 버튼 4개 + `handleSocial` + `ENABLED_PROVIDERS` 게이트
- `src/components/SocialIcons.jsx` (인라인 SVG 로고), `src/pages/Login.css` (브랜드 색)
- **현재 동작:** `ENABLED_PROVIDERS`가 비어 있어, 클릭하면 "곧 지원 예정" 안내만 표시(에러 페이지 방지).

**실제 로그인으로 켜려면 (남은 일):**
1. **Supabase 대시보드에서 제공자 활성화** + 키 입력 (아래 참고)
2. `src/pages/Login.jsx`의 `const ENABLED_PROVIDERS = new Set([])` 에 켠 제공자 추가 (예: `new Set(['google','kakao'])`)

**Supabase 제공자 설정 방법:**
   - Authentication → Sign In / Providers → 각 제공자 ON + 키 입력
   - Google: Google Cloud Console에서 OAuth 클라이언트 ID/시크릿 발급
   - Kakao: 카카오 개발자센터 앱 생성 → REST API 키
   - Apple: Apple Developer($99/년) → Service ID + Key
   - Redirect URL(Supabase가 주는 콜백)과, 앱 복귀 URL(`https://soulairise.github.io/anapanasati/`)을 각 콘솔의 허용 목록에 등록
   - ⚠️ HashRouter + OAuth 토큰 프래그먼트 충돌 가능 → 콜백 후 세션 감지 동작 확인 필요(안 되면 detectSessionInUrl 처리 점검).

## 5. 결제(토스) & 소셜로그인 현황
- **구글 소셜 로그인: 실제 활성화 완료 ✅** (Supabase 구글 provider ON, 코드 `ENABLED_PROVIDERS=['google']`, accounts.google.com 리다이렉트 확인·배포됨). 카카오/애플/네이버는 미설정 → 클릭 시 "곧 지원" 안내.
- **토스페이먼츠 결제: 코드 전부 작성 완료, 계정/배포만 남음.**
  - 프론트: `src/lib/payments.js`, `Premium.jsx`(TOSS_READY 분기), `PaySuccess/PayFail.jsx`, 라우트 `/pay/success` `/pay/fail`
  - 백엔드: `supabase/functions/confirm-payment/index.ts`(승인+is_premium), `supabase/schema-profiles.sql`(profiles)
  - **남은 일 = [docs/TOSS_SETUP.md](./docs/TOSS_SETUP.md) 5단계** (토스 키 발급 → .env `VITE_TOSS_CLIENT_KEY` → profiles SQL 실행 → Edge Function 배포+`TOSS_SECRET_KEY` → 테스트)
  - 키 없으면 `/premium` "구독 시작"은 데모(즉시 프리미엄)로 동작. 현재는 1회성 결제, 자동갱신(빌링키)은 미구현.

## 다음 로드맵
- 카카오 소셜 로그인 추가(카카오 개발자센터 → Supabase provider → `ENABLED_PROVIDERS`에 'kakao')
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
