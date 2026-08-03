# Claude 작업 로그 — 위빠사나 실습 기능

최종 업데이트: 2026-08-03

## 담당 목표

기존 아나빠나사띠 16단계 학습·호흡 기능은 그대로 보존하고, 그와 별개의 **위빠사나 호흡·몸·감각 관찰 실습법**을 추가한다. 기존 기능을 위빠사나로 이름만 바꾸거나 덮어쓰지 않는다.

## 권장 구현 경계

- 새 콘텐츠 데이터: `src/data/vipassana.js` 또는 `src/data/vipassana/`
- 새 실습 페이지: `src/pages/Vipassana.jsx` 및 필요 시 하위 컴포넌트
- 새 전용 스타일: `src/pages/Vipassana.css`
- 기존 `src/data/stages.js`의 아나빠나사띠 16단계는 보존
- 결제·인증·Supabase 함수는 수정하지 않음

라우팅·Navbar·홈 화면 연결을 위해 공용 파일을 수정해야 하면 먼저 이 로그에 변경 목적과 파일을 `IN_PROGRESS`로 기록하고, 기존 Codex 변경을 병합한다.

## 콘텐츠 방향

- 위빠사나를 단순한 호흡 조절법으로 오해하지 않도록, 자연스러운 호흡과 몸·감각·마음 현상의 관찰을 중심으로 구성한다.
- 의료 효과를 단정하지 않고, 불편감이 심하면 중단하도록 안전 안내를 포함한다.
- 아나빠나사띠와 위빠사나의 관계·차이를 입문자가 이해할 수 있게 설명한다.
- 짧은 입문 실습부터 단계적으로 확장할 수 있게 설계한다.

## 시작 전 확인

1. `HANDOFF.md`와 `docs/HANDOFF_CODEX.md` 읽기
2. `git status` 확인
3. 기존 아나빠나사띠 화면·데이터 구조 확인
4. 새 파일 중심의 구현 계획을 이 로그에 `IN_PROGRESS`로 기록
5. 공용 파일 충돌 여부 확인 후 구현

## 현재 상태

- 담당 범위 확장: **요가 호흡법(프라나야마)을 먼저 추가**, 위빠사나는 그 다음. (사용자 지시 2026-08-03)
- `요가 호흡법`: **READY_FOR_DEPLOY** — ✅데이터 ✅페이지 ✅타이머 ✅사운드·색감·요가디자인 고도화 완료(미배포). 기획: `docs/PRANAYAMA_PLAN.md`.
  - 장르 차별화: `.yoga-theme`(따뜻한 테라코타) + 연꽃 만다라 배경 + 오브 색 그라데이션 + 숨결 사운드(`yogaSound.js`). 아나빠나사띠(세이지)와 대비.
  - 3단계: `YogaPractice.jsx`를 실제 타이머로 교체 — paced(복식/박스/웃자이/브라마리/시탈리/완전요가), alternate(나디쇼다나 좌우 콧구멍 안내), pulsed(카팔라바티/바스트리카 라운드·펄스 + 금기 동의 모달). Yoga.css에 오브/실습 스타일 추가.
  - dev 검증: 세 모드 모두 실동작 확인(복식=들이쉬기 카운트, 나디쇼다나=왼쪽콧구멍 안내, 카팔라바티=1라운드 16/20회), 콘솔 에러 0.
  - 데이터: `src/data/ashtanga.js`(8단계), `src/data/pranayama.js`(개념+5단계+9기법+타이머설정).
  - 페이지(신규): `src/pages/YogaBreathing.jsx`(허브), `YogaAshtanga.jsx`(8단계), `YogaTechnique.jsx`(기법 상세), `YogaPractice.jsx`(**임시 placeholder** — 3단계에서 실제 타이머로 교체), `Yoga.css`.
  - ⚠️ **공용 파일 병합함(추가만)**: `src/App.jsx`(라우트 `/yoga`,`/yoga/ashtanga`,`/yoga/:id`,`/yoga/:id/practice` 추가), `src/components/Navbar.jsx`(“요가 호흡” 링크 추가). Codex 변경 덮어쓰지 않음.
  - 검증: dev에서 /yoga(5단계·9기법·⚠️금기표시), /yoga/ashtanga(8단계·야마니야마 세부) 렌더 확인, 콘솔 에러 0. `YogaPractice`는 placeholder.

### 2026-08-04 — PLAN (아키텍처: 4개 앱 분리 + 재사용 스킬)
- 요청: 하나의 코드에서 통합앱 + 아나빠나사띠·요가·위빠사나 단독앱 4개를 뽑을 수 있게 폴더 모듈화. 결제·소셜로그인 등을 "스킬"로 재사용(토큰 절약).
- 설계: `docs/ARCHITECTURE.md` — features/skills/ui/apps 구조, 스킬 계약(auth/payment/premium/journal/breath-engine), 4앱 구성, 빌드전략, **점진 이관 순서**(big-bang 금지).
- 소유: Claude=features·breath-engine·journal·ui / Codex=auth·payment·premium·배포.
- 남은 일: 합의 후 (2)홈·네비 재편+아나빠나사띠 허브화 → (3)features/ 이동 → (4)breath-engine 추출. skills/auth·payment는 Codex와 합의.

### 2026-08-04 — READY_FOR_DEPLOY (요가 사운드·색감·디자인 고도화)
- 요청: 요가 실습에 어울리는 사운드, 오브 색 그라데이션 전환, **장르별 색/디자인 차별화**(아나빠나사띠 vs 요가), 요가풍 배경/오브제.
- 구현:
  - `src/lib/yogaSound.js`(신규): 따뜻한 "숨결 패드음"(들숨 차오름/날숨 잦아듦/멈춤 은은) + 펄스용 짧은 톤. bowl.js AudioContext 공유(수정 안 함).
  - `src/pages/YogaPractice.jsx`: 페이즈 색(들숨 앰버 #e0a15c / 멈춤 로즈 #d38aa0 / 날숨 인디고 #7f86c2) 그라데이션 전환, 전체화면 숨결 배경(`.yoga-breath-bg`), 연꽃 만다라 회전 모티프(인라인 SVG), 중앙 물결 리플, 숨결 사운드 토글.
  - `src/pages/Yoga.css`: **`.yoga-theme` 지역 변수 재정의**(따뜻한 테라코타 --sage/--sage-deep/배경) → 요가 전 페이지가 아나빠나사띠(세이지)와 다른 장르 색감. 오브/배경/리플/만다라/사운드토글 스타일 추가.
  - `YogaBreathing/YogaAshtanga/YogaTechnique/YogaPractice` 루트에 `yoga-theme` 클래스 적용.
- 검증: dev에서 오브 색전환·만다라·리플·배경·라벨 확인, 콘솔 에러 0. 미배포.
- Codex와 겹치는 파일: 없음(모두 요가 전용 파일). 결제·인증·아나빠나사띠 미변경.
- 남은 일: (선택) 위빠사나 / 요가 실습 수행일지 기록. 배포는 Codex 또는 사용자 요청 시.

### 2026-08-03 — READY_FOR_DEPLOY (요가 3단계 타이머)
- 요청: 요가 3단계(실제 호흡 타이머) 구현 + 웹 확인.
- 구현: `src/pages/YogaPractice.jsx` placeholder → 실제 타이머. 3모드:
  - paced: `timer.phases` 1초 순환, 오브 확대/축소, 단계 라벨·cue, 수행시간 선택(2/3/5분).
  - alternate(나디쇼다나): `timer.steps` 순환, 콧구멍(왼/오/양쪽) 안내 표시.
  - pulsed(카팔라바티/바스트리카): 금기 동의 모달 → 라운드×펄스(setTimeout 재귀), 라운드 사이 휴식 카운트, 완료 처리.
- 수정 파일: `src/pages/YogaPractice.jsx`(교체), `src/pages/Yoga.css`(오브/실습 스타일 추가). 공용 파일 추가 없음(라우트는 2단계에서 이미 추가됨).
- 검증: dev에서 3모드 실동작 확인, 콘솔 에러 0. 미배포.
- Codex와 겹치는 파일: 없음(이번 단계).
- 남은 일: (선택) 실습 완료 기록을 수행일지에 남기기, 사운드/나레이션, 위빠사나. 배포는 Codex 또는 사용자 요청 시.

### 2026-08-03 — READY_FOR_REVIEW (요가 2단계 페이지)
- 요청: 요가 호흡법 2단계(페이지) 구현 + 웹 확인.
- 결정/구현: 허브(아쉬탕가 개요→프라나야마 개념(4요소·아나빠나사띠 대비)→5단계 기법 목록), 아쉬탕가 8단계 학습, 기법 상세(효과·방법·비율·주의·금기경고+실습버튼). 초보자 친화 카피.
- 수정 파일: 신규 4페이지+Yoga.css / 공용 App.jsx·Navbar.jsx(추가 병합).
- 검증: dev 렌더 확인, node/브라우저 콘솔 에러 0.
- Codex와 겹치는 파일: App.jsx, Navbar.jsx (추가만, 결제/인증 코드 미변경).
- 남은 일: 3단계 실제 호흡 타이머(YogaPractice 교체). 배포는 Codex 또는 사용자 요청 시.
- `위빠사나`: `PLANNED`(기획 전).
- Codex의 결제·인증·배포 변경(작업 트리 미커밋)은 보존해야 함. reset/revert 금지.

## 작업 기록

### 2026-08-03 — PLAN (요가 호흡법 기획)
- 요청: 요가 호흡법 기능 추가. 전체 5단계 기법 다 + 학습목록/상세 + 호흡 타이머. **아쉬탕가 8단계 학습 필수**. 초보자 친화(개념 쉽게 + 바로 실습).
- 설계/콘텐츠 결정: `docs/PRANAYAMA_PLAN.md` 작성 — 개념(프라나야마 vs 아나빠나사띠), 아쉬탕가 8단계, 5단계 기법(복식·완전요가·박스·나디쇼다나·웃자이·브라마리·시탈리·카팔라바티·바스트리카), 타이머 3모드(paced/alternate/pulsed), 화면·데이터 구조.
- 수정 파일: `docs/PRANAYAMA_PLAN.md`(신규), `docs/HANDOFF_CLAUDE.md`.
- 검증: 문서 기획만, 코드 변경 없음.
- Codex와 겹치는 파일: 없음. (구현 시 `src/App.jsx`, `src/components/Navbar.jsx` 수정 예정 → 착수 전 이 로그에 IN_PROGRESS 기록 후 병합)
- 남은 일: 데이터(`ashtanga.js`,`pranayama.js`) → 페이지 → 타이머 → 라우트·네비 순으로 구현. 사용자 승인 후 착수.

## 작업 기록 형식

```md
### YYYY-MM-DD HH:mm — STATUS
- 요청:
- 설계/콘텐츠 결정:
- 수정 파일:
- 검증:
- Codex와 겹치는 파일:
- 남은 일:
```

상태 값: `IN_PROGRESS`, `READY_FOR_REVIEW`, `READY_FOR_DEPLOY`, `DEPLOYED`, `BLOCKED`.
