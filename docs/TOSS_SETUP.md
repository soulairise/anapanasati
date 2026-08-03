# 토스페이먼츠 결제 연동 — 마무리 가이드

> 결제 **코드는 이미 다 작성돼 있습니다.** 아래 5단계(님/AI가 할 계정·배포 작업)만 하면 실제 결제가 켜집니다.
> 지금 상태: 토스 키가 없으면 `/premium`의 "구독 시작"은 **데모(즉시 프리미엄)** 로 동작. 키를 넣으면 자동으로 실제 결제창으로 전환됩니다.

> **2026-07-29 진행 상태:** 테스트 클라이언트 키 연결, `profiles` 테이블 생성,
> `TOSS_SECRET_KEY` 등록, `confirm-payment` Edge Function 배포, 프로덕션 빌드까지 완료.
> 다음 단계는 5단계의 테스트 결제와 결과 확인입니다.

## 이미 작성된 코드 (참고)
- `src/lib/payments.js` — 토스 SDK로 결제창 호출 (`requestSubscription`), `TOSS_READY` 분기
- `src/pages/Premium.jsx` — "구독 시작" → `TOSS_READY`면 결제창, 아니면 데모
- `src/pages/PaySuccess.jsx` / `PayFail.jsx` — 결제 복귀 페이지 (`/pay/success`, `/pay/fail`)
- `supabase/functions/confirm-payment/index.ts` — **서버 승인 + is_premium 갱신** (핵심)
- `supabase/schema-profiles.sql` — `profiles` 테이블(+is_premium, RLS, 가입 트리거)
- `src/context/PremiumContext.jsx` — profiles.is_premium 조회(폴백 localStorage)

---

## 1단계 · 토스페이먼츠 가입 & 테스트 키 발급
1. https://www.tosspayments.com → 가입 (사업자등록증 보유 ✅ → 나중에 실키/정산에 사용)
2. 개발자센터 → **API 키**에서 **테스트 키** 복사 (심사 전에도 sandbox 사용 가능)
   - **클라이언트 키**: `test_ck_...`
   - **시크릿 키**: `test_sk_...`

## 2단계 · 프론트 환경변수
`anapanasati/.env` 에 추가 (클라이언트 키만 — 공개돼도 되는 값):
```
VITE_TOSS_CLIENT_KEY=test_ck_여기에
```
> 시크릿 키(`test_sk_...`)는 **프론트에 넣지 말 것.** 3단계 Edge Function 시크릿으로만.

## 3단계 · DB: profiles 테이블 만들기
Supabase → SQL Editor 에 `supabase/schema-profiles.sql` 전체 붙여넣고 **Run**.

## 4단계 · Edge Function 배포 (결제 승인)
**방법 A — Supabase CLI (권장)**
```bash
# 1) CLI 설치 (한 번만): https://supabase.com/docs/guides/cli
brew install supabase/tap/supabase        # mac
# 2) 로그인 & 프로젝트 연결
supabase login
supabase link --project-ref ianhttigznynatbnfrkw
# 3) 시크릿 등록 (토스 시크릿 키)
supabase secrets set TOSS_SECRET_KEY=test_sk_여기에
# 4) 함수 배포
supabase functions deploy confirm-payment
```
**방법 B — 대시보드**: Edge Functions → Create function → 이름 `confirm-payment` → `index.ts` 내용 붙여넣기 → Deploy → Settings에서 시크릿 `TOSS_SECRET_KEY` 추가.

> `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 는 함수에 자동 주입됩니다(별도 설정 불필요).

## 5단계 · 테스트
1. `npm run dev` → 로그인 → `/premium` → 플랜 선택 → **7일 무료로 시작하기**
2. 토스 **테스트 결제창**이 뜸 → 테스트 카드로 결제 (토스 문서의 테스트 카드번호 사용)
3. 성공 → `/pay/success` → 서버 승인 → `profiles.is_premium = true` → 프리미엄 잠금 해제 확인
4. 실패/취소 → `/pay/fail`

---

## 실서비스 전환 (나중에)
- 토스 **가맹 심사 완료** 후 **실키**(`live_ck_...`, `live_sk_...`)로 교체 (2·4단계 값만 변경 후 재배포)
- **통신판매업 신고번호** 준비 (정기결제/전자상거래)
- 배포 빌드에 실 클라이언트 키가 들어가야 하므로 `.env` 갱신 후 `npm run build && npm run deploy`

## ⚠️ 현재 한계 & 다음 개선
- 지금은 **1회성 결제**(연/월 요금을 한 번 결제 → 그 기간 프리미엄). **자동 갱신(정기결제)은 미구현**.
- 자동 갱신하려면 토스 **빌링키(정기결제)** 플로우로 확장: 빌링키 발급 → 서버에 저장 → 갱신일에 `billing/{billingKey}` 승인. (별도 작업)
- 보안: 금액 검증은 서버(`PRICE` 상수)에서 하고 있음. 웹훅(멱등/중복승인 방지)도 추가하면 더 견고.

## HashRouter 주의
- successUrl이 `#/pay/success` 형태라, 토스가 쿼리를 `#/pay/success?...&paymentKey=...`로 붙임 → `useSearchParams`로 읽음. 테스트 시 파라미터가 정상 파싱되는지 꼭 확인. 안 되면 successUrl을 해시 없는 별도 경로로 바꾸고 라우팅 조정 필요.
