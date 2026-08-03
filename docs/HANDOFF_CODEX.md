# Codex 작업 로그 — 결제·설정·배포

최종 업데이트: 2026-08-03

## 담당 범위

- 토스페이먼츠 결제창과 결제 UX
- `confirm-payment` Edge Function과 프리미엄 상태 반영
- Supabase 인증·환경설정·소셜 로그인 유지보수
- 기존 화면 구성 업데이트
- 최종 빌드, GitHub Pages 배포, 실제 배포 검증

## 수정 우선권 파일

- `src/pages/Premium.jsx`
- `src/lib/payments.js`
- `src/pages/PaySuccess.jsx`
- `src/pages/PayFail.jsx`
- `supabase/functions/confirm-payment/index.ts`
- `supabase/schema-profiles.sql`
- `docs/TOSS_SETUP.md`
- 인증·배포 관련 설정 파일

공용 파일(`src/App.jsx`, Navbar, 공통 CSS)을 수정할 때는 Claude 로그를 먼저 확인한다.

## 현재 완료 상태

- Google, Kakao(`custom:kakao`), Naver(`custom:naver`) OAuth 동의 화면 진입 확인.
- Apple 로그인 UI 제거 완료.
- Apple 제거 및 캐시 방지 최종 GitHub Pages 배포 완료: `bb66f86`.
- 실제 배포 버튼 수 확인: Google/Kakao/Naver/Apple = `1/1/1/0`.
- 토스 테스트 클라이언트 키, `profiles`, `TOSS_SECRET_KEY`, `confirm-payment` 함수 배포 완료.

## 다음 작업

- 사용자가 요청하는 결제창 디자인·구성 업데이트.
- 로그인 후 토스 테스트 결제 전체 왕복 확인.
- 결제 성공 후 `profiles.is_premium=true`와 화면 프리미엄 상태 확인.
- 라이브 결제로 전환할 때 토스 계약·심사 후 라이브 키 교체.

## 작업 기록 형식

작업할 때 아래 형식으로 가장 위에 추가한다.

```md
### YYYY-MM-DD HH:mm — STATUS
- 요청:
- 수정 파일:
- 검증:
- 배포 커밋:
- 남은 일:
```

상태 값: `IN_PROGRESS`, `READY_FOR_DEPLOY`, `DEPLOYED`, `BLOCKED`.
