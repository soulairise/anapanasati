# 아키텍처 설계 — 하나의 코드베이스 → 4개 앱 + 재사용 스킬

> 목표: **① 통합앱(3호흡법 전부) + ② 아나빠나사띠 단독 + ③ 요가호흡 단독 + ④ 위빠사나 단독** 을 같은 코드에서 뽑아낸다.
> 결제·소셜로그인 등은 **"스킬(재사용 모듈)"** 로 만들어, 어느 앱에든 `import + 설정`만으로 꽂는다. (한 번 만들고 계속 재사용 → 토큰 절약)
> 최종 업데이트: 2026-08-04. 상태: **설계(합의 후 점진 이관)**.

---

## 1. 핵심 개념 — features · skills · ui · apps
- **features/** : 명상 "장르" 자체. 각 폴더가 독립적이어서 통째로 떼어내 단독 앱이 될 수 있다.
- **skills/** : 앱에 꽂아 쓰는 재사용 기능(결제·로그인·프리미엄·일지·호흡엔진). 명확한 인터페이스만 지키면 어느 앱에서든 동일하게 동작.
- **ui/** : 디자인 시스템·테마·공통 레이아웃(Navbar/Footer).
- **apps/** : "무엇을 조합할지" 정하는 진입점. 통합앱은 3 features 다, 단독앱은 1 feature만.

```
src/
├─ skills/                         # 재사용 모듈(스킬)
│  ├─ auth/        # 이메일·소셜 로그인            [Codex 소유]
│  ├─ payment/     # 토스 결제(결제창+승인 호출)    [Codex 소유]
│  ├─ premium/     # 프리미엄 상태·게이팅          [Codex 소유]
│  ├─ journal/     # 수행일지(기록·통계)          [공용]
│  └─ breath-engine/  # 호흡 타이머 엔진 + 오브·물결·사운드  [공용/Claude]
├─ features/
│  ├─ anapanasati/ # 데이터(stages)·학습·호흡·상세    [Claude]
│  ├─ yoga/        # 데이터(pranayama,ashtanga)·허브·상세·실습 [Claude]
│  └─ vipassana/   # (예정)                       [Claude]
├─ ui/             # 디자인토큰(index.css)·테마·Navbar·Footer·Home
└─ apps/           # 조합 진입점 (아래 4개)
   ├─ full/        # 3 features 전부 + 모든 skills
   ├─ anapanasati/ # anapanasati feature + (선택)skills
   ├─ yoga/        # yoga feature + (선택)skills
   └─ vipassana/   # vipassana feature + (선택)skills
```

> 원칙: **feature는 skill을 "인터페이스로만" 사용**(직접 결제 코드에 의존 X). 그래야 단독앱에서 결제를 빼거나 다른 결제로 바꿔도 feature는 그대로.

---

## 2. 스킬(재사용 모듈) 계약 — "이 모양만 지키면 어디든 꽂힘"
각 스킬은 **Provider + 훅/컴포넌트**를 export하고, 앱은 그걸 감싸기만 하면 된다.

| 스킬 | export(예) | 앱에서 쓰는 법 |
|------|-----------|----------------|
| **auth** | `<AuthProvider>`, `useAuth()`, `<SocialLoginButtons providers=[...]/>` | `.env`의 `VITE_AUTH_PROVIDERS`로 제공자 on/off |
| **payment** | `usePayment()`, `<SubscribeButton plan/>`, Edge Function `confirm-payment` | `.env`의 `VITE_TOSS_CLIENT_KEY`만 넣으면 실결제 |
| **premium** | `<PremiumProvider>`, `usePremium()`, `<Locked feature/>` | feature가 `usePremium().isPremium`으로 게이팅 |
| **journal** | `useJournal()`, `<JournalList/>`, `recordSession(payload)` | 어느 호흡법이든 세션 payload만 넘기면 기록 |
| **breath-engine** | `<BreathTimer config theme onFinish/>` | pattern(paced/alternate/pulsed)+테마+사운드 config만 주입 |

### breath-engine 스킬 상세 (가장 재사용성 높음)
지금 아나빠나사띠 `Breathe.jsx`와 요가 `YogaPractice.jsx`가 **각자 타이머·오브·물결·사운드를 중복 구현** 중.
→ 공통 엔진 `skills/breath-engine`으로 추출:
- 입력 config: `{ mode, phases|steps|pulseConfig, phaseColors, sound, minutes }`
- 렌더: 오브(색 그라데이션 전환)·물결·배경·컨트롤
- 콜백: `onPhase`, `onFinish(session)` → journal 스킬로 기록
- 테마는 주입(아나빠나=세이지, 요가=테라코타, 위빠사나=인디고)
> 이관하면 위빠사나·향후 호흡법은 **config만 작성**하면 타이머 완성 (토큰 대폭 절약).

---

## 3. 4개 앱 구성(composition)
각 app 진입점은 "어떤 feature/route를 포함하는가"만 다르다.

| 앱 | 포함 feature | Navbar | 홈 |
|----|-------------|--------|----|
| **full(통합)** | 아나빠나·요가·위빠사나 | 3호흡법+일지+프리미엄 | 앱 소개 + 3호흡법 카드 |
| **anapanasati 단독** | 아나빠나사띠 | 배우기·호흡·일지·프리미엄 | 아나빠나사띠 소개 |
| **yoga 단독** | 요가 | 아쉬탕가·기법·일지·프리미엄 | 요가 소개 |
| **vipassana 단독** | 위빠사나 | … | 위빠사나 소개 |

- 각 app은 자기 `routes.jsx`(포함할 라우트) + `nav.js`(메뉴 항목) + `main.jsx`(마운트)만 가진다.
- skills(결제/로그인/일지/프리미엄)는 4개 앱 **공통으로 동일 코드** 사용.

---

## 4. 빌드 전략 (단독앱을 실제로 뽑는 법)
- **1단계(지금 권장): 폴더만 모듈화** — 한 앱(full) 그대로 두고 내부를 features/skills/ui/apps로 정리. 단독앱은 아직 "논리적으로만" 분리.
- **2단계: Vite 멀티 엔트리** — `apps/*/main.jsx`별로 별도 빌드(각기 다른 `base`·배포 타깃). 하나의 repo에서 4개 산출물.
- **3단계(대규모 시): pnpm 모노레포** — `packages/skills-*`, `packages/feature-*`를 npm 패키지로, `apps/*`가 의존. 완전한 재사용·버전관리.
> 지금은 **1단계**만. 2·3단계는 실제로 단독 출시가 필요해질 때.

---

## 5. 점진 이관 순서 (토큰 절약 · Codex 충돌 회피)
big-bang 이동 금지. 아래처럼 조금씩:
1. `docs/ARCHITECTURE.md`(이 문서) 합의 ← 지금
2. **홈·네비 재편 + 아나빠나사띠 허브화** (사용자 요청). `ui/Home`, `ui/Navbar`, `features/anapanasati/`
3. 기존 파일을 features/로 **이동(경로만 변경, 로직 보존)** — feature 단위로 하나씩, 이동 즉시 빌드 검증
4. `skills/breath-engine` 추출 → 아나빠나·요가가 공유 (중복 제거)
5. skills/auth·payment·premium 폴더로 정리 ← **Codex와 합의 후**(Codex 소유)
6. 위빠사나 feature 추가 (breath-engine config만)
7. 필요 시 apps/ 멀티 엔트리(빌드 2단계)

## 6. 역할·소유 (병렬 규칙 연동)
- **Claude**: features/(anapanasati·yoga·vipassana), skills/breath-engine, skills/journal, ui/.
- **Codex**: skills/auth·payment·premium, 배포.
- 공용 파일(App/Navbar/Home/라우팅) 수정 시 서로 로그 남기고 병합. 결제·인증 파일은 Claude가 임의 이동/수정하지 않음.
- 이동은 "경로 변경 + import 갱신"만, 로직 변경 금지(리팩터링과 이동을 분리).
