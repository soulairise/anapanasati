# 아키텍처 설계 — 하나의 코드베이스 → 단독앱 분리 + 재사용 스킬

> 목표: **① 통합앱 + ② 아나빠나사띠 단독 + ③ 요가호흡 단독 + ④ 위빠사나 단독** 을 같은 코드에서 뽑아낸다.
> 결제·소셜로그인 등은 **"스킬(재사용 모듈)"** 로 만들어, 어느 앱에든 `import + 설정`만으로 꽂는다.
> 최종 업데이트: 2026-08-07. 상태: **설계(합의 후 점진 이관)**.
> **v2 변경:** MBSR·자애 추가 계획에 따라 `대상 × 태도` 2축 모델과 `core / practices / traditions / paths` 레이어 도입. (v1의 `features/` 단일 축은 범주 오류였음 — 아래 1장 참조)

---

## 1. 왜 v1의 `features/` 단일 축을 버렸는가

v1은 아나빠나사띠·요가·위빠사나를 `features/` 아래 **형제**로 놓았다. MBSR과 자애를 추가하려는 순간 이 구조가 깨진다.

### 1-1. 네 전통은 층위가 다르다 (범주 오류)

| 전통 | 실제로 무엇인가 |
|---|---|
| **프라나야마** | 『요가수트라』 2.49–53. 아쉬탕가 8지 중 **4번째 가지**. 목적이 아니라 다라나(집중)를 준비하는 **수단** |
| **아나빠나사띠** | 『아나빠나사띠 숫따』(MN 118). 호흡 하나로 사념처→칠각지→해탈을 관통하는 **커리큘럼** |
| **위빠사나** | 기법이 아니라 **인식의 질(質)**. 사마타와 짝을 이루는 지혜의 작동 방식. 대상을 가리지 않음 |
| **MBSR** | 1979년 카밧진이 불교 수행을 세속화·의학화한 **전달 형식**. 8주 커리큘럼 |

하나는 가지, 하나는 커리큘럼, 하나는 인식의 질, 하나는 전달 형식이다. 나란히 놓을 수 없다.

### 1-2. MBSR은 형제가 아니라 조합이다

| MBSR 실습 | 출처 | 우리 프로젝트에선 |
|---|---|---|
| 바디스캔 | 고엔카 위빠사나 | 위빠사나에 있음 |
| 정좌명상(호흡→몸→소리→생각) | 사념처 위빠사나 | 위빠사나에 있음 |
| 걷기명상 | 경행 | 위빠사나에 있음 |
| 마음챙김 요가 | 하타 요가 | 요가에 있음 |
| 호흡 관찰 | 아나빠나사띠 | 아나빠나사띠에 있음 |
| **7가지 태도 · 건포도 명상 · 3분 호흡공간 · 8주 커리큘럼** | **MBSR 고유** | 신규 |

MBSR의 80%가 기존 실습이다. `features/mbsr/`를 형제로 만들면 **바디스캔·경행·열린알아차림을 세 번 중복 구현**하게 된다. v1이 breath-engine 중복을 지적하며 피하려 했던 바로 그 실수다.

---

## 2. 핵심 모델 — 대상 × 태도

전통들이 스스로 말하는 방식을 따라가면 축이 드러난다.

- **사념처**가 대상을 넷으로 나눈다 — 몸·느낌·마음·법
- **청정도론**이 태도를 둘로 나눈다 — 사마타(집중) ↔ 위빠사나(관찰)
- **요가수트라**가 조절(프라나야마)을 집중(다라나)과 **별개 단계**로 둔다
- **MBSR**의 7가지 태도 중 핵심이 비판단(non-judging) — 또 하나의 태도
- **사무량심**은 없던 마음을 키우는 것 — 관찰도 조절도 아닌 **계발**

|  | **조절**<br>regulate | **집중**<br>concentrate | **관찰**<br>observe | **계발**<br>cultivate | **수용**<br>accept |
|---|---|---|---|---|---|
| **호흡** | 프라나야마 | 아나빠나 1–2테트라드 | 아나빠나 3–4 · 위빠사나 노팅 | — | MBSR 호흡 알아차림 |
| **몸 감각** | — | — | 위빠사나 바디스캔 | — | MBSR 바디스캔 |
| **느낌** | — | — | 수념처 | — | MBSR |
| **마음** | — | — | 심념처 | 자애·연민 | MBCT |
| **걷기** | — | — | 경행 | — | MBSR 걷기 |
| **열림** | — | — | 법념처 · 족첸 | — | MBSR 정좌 |

**같은 대상이라도 태도가 바뀌면 다른 수행이 된다.** 아나빠나사띠 16단계가 사마타에서 위빠사나로 넘어가는 것도, 대상은 그대로 두고 태도만 바뀌는 것이다.

> **다섯 태도가 명상의 거의 전 영역을 덮는다.** 사용자가 "이 앱에서 명상을 다 경험했다"고 느끼려면 다섯이 다 있어야 한다.

### 2-1. 결정적 설계 — framing의 키는 "전통"이 아니라 "태도"

```js
// ❌ 전통을 키로 — 전통이 늘 때마다 모든 실습에 키 추가. 무한 증식
framings: { vipassana: {...}, mbsr: {...}, mbct: {...}, zen: {...} }

// ✅ 태도를 키로 — 태도는 유한하다
attitudes: {
  observe: { cue: '감각이 일어나고 사라지는 것을 봅니다', closing: '무상(anicca)' },
  accept:  { cue: '좋다 나쁘다 판단하지 않고 그대로 둡니다', closing: '지금 이 순간' },
}
```

전통은 무한히 늘지만 **태도는 다섯이면 사실상 다 덮인다.** MBCT = `accept` + 생각 대상. ACT = `accept`. 족첸 = `observe`의 극단. 새 전통이 들어와도 기존 태도를 조합하면 끝난다.

→ **MBSR 추가 = 파일 하나.** 바디스캔·경행·열린알아차림은 이미 있고, 태도를 `accept`로 지정하면 안내문이 자동으로 바뀐다. 고유 실습은 건포도 명상·3분 호흡공간 둘뿐이다.

### 2-2. 한계 (정직하게)

- **태도 5분류는 이 프로젝트의 종합**이다. 어느 경전에 이 목록이 그대로 나오지는 않는다. 청정도론의 사마타/위빠사나 이분법 + 요가의 조식 + MBSR의 비판단 + 사무량심의 계발을 합친 것이다.
- 실제 수행에서는 태도가 섞이고 전환된다. 이 모델은 단순화다.
- 전통이 셋뿐이었다면 이 추상화는 과했다. **MBSR·자애를 넣기로 한 시점에 정당화된다.**

---

## 3. 폴더 구조

```
src/
├─ core/
│  ├─ objects.js       대상: 호흡·몸·느낌·마음·소리·걷기·먹기·열림
│  ├─ attitudes.js     태도: regulate·concentrate·observe·cultivate·accept
│  │                   ★ 안내문 톤(cue/closing)의 원천
│  └─ engine/          대상×태도를 실제로 돌리는 타이머·오브·사운드
│     ├─ paced         들숨/멈춤/날숨 순환        (regulate·concentrate)
│     ├─ alternate     콧구멍 교대(나디쇼다나)     (regulate)
│     ├─ pulsed        강한 반복(카팔라바티)       (regulate)
│     ├─ guided        구간별 안내문 전환          (observe·accept·cultivate)
│     ├─ scan          신체 부위 순차 이동          (observe·accept)
│     ├─ walking       들림·나아감·놓음 3박자      (observe·accept)
│     └─ open          대상 없음, 종소리 간격       (observe·accept)
│
├─ practices/          대상 하나 + 지원 태도 목록 + 세그먼트 (전통 중립)
│  ├─ breath.js           supports: [regulate, concentrate, observe, accept]
│  ├─ body-scan.js        supports: [observe, accept]
│  ├─ walking.js          supports: [observe, accept]
│  ├─ open-awareness.js   supports: [observe, accept]
│  ├─ feeling.js          supports: [observe, accept]
│  ├─ mind.js             supports: [observe, accept, cultivate]
│  └─ metta.js            supports: [cultivate]
│
├─ traditions/         얇은 메타 + 기본 태도 + 실습 참조 + 안전고지
│  ├─ anapanasati.js   ├─ yoga.js   ├─ vipassana.js
│  ├─ metta.js         └─ mbsr.js (추후)
│
├─ paths/              커리큘럼(시간축)
│  ├─ anapanasati-16.js   아나빠나 16단계
│  ├─ ashtanga-8.js       아쉬탕가 8지
│  ├─ satipatthana-4.js   사념처 4
│  └─ mbsr-8weeks.js      MBSR 8주 (추후)
│
├─ goals/              ★ 목적 축 (전통과 직교) — 태그만으로 구현
│                      수면 · 불안 · 집중 · 스트레스 · 아침 · 요가 전후
│
├─ skills/             재사용 모듈 (v1과 동일)
│  ├─ auth/        [Codex 소유]
│  ├─ payment/     [Codex 소유]
│  ├─ premium/     [Codex 소유]
│  └─ journal/     [공용]
│
├─ ui/                 디자인토큰·테마·Navbar·Footer·Home
└─ apps/               조합 진입점
```

### 3-1. 실습 정의 예시

```js
// practices/body-scan.js — 전통 중립
export default {
  id: 'body-scan',
  object: 'body',
  engine: 'scan',
  goals: ['sleep', 'stress'],           // 목적 축 태그
  segments: ['정수리','이마','눈·얼굴','턱','목','어깨', /* … */ ,'발바닥'],
  supports: ['observe', 'accept'],

  attitudes: {
    observe: {                          // 위빠사나가 쓸 때
      title: '몸 훑기',  context: '신념처(kāya)',
      cue: '감각이 일어나고 사라지는 것을 봅니다',
      closing: '모든 감각은 머물지 않습니다 — 무상(anicca)',
    },
    accept: {                           // MBSR이 쓸 때
      title: '바디스캔',  context: '1–2주차 · 매일 45분',
      cue: '좋다 나쁘다 판단하지 말고, 있는 그대로 알아차립니다',
      closing: '지금 이 순간으로 돌아옵니다',
    },
  },
}
```

억지 재사용이 아니다. 위빠사나 바디스캔은 **무상 통찰**이, MBSR 바디스캔은 **비판단적 수용**이 목적이라 안내문이 실제로 달라야 한다. 구조가 그 차이를 정확히 표현한다.

---

## 4. 스킬(재사용 모듈) 계약 — v1 유지

| 스킬 | export(예) | 앱에서 쓰는 법 |
|------|-----------|----------------|
| **auth** | `<AuthProvider>`, `useAuth()`, `<SocialLoginButtons providers=[...]/>` | `.env`의 `VITE_AUTH_PROVIDERS`로 제공자 on/off |
| **payment** | `usePayment()`, `<SubscribeButton plan/>`, Edge Function `confirm-payment` | `.env`의 `VITE_TOSS_CLIENT_KEY` |
| **premium** | `<PremiumProvider>`, `usePremium()`, `<Locked feature/>` | feature가 `usePremium().isPremium`으로 게이팅 |
| **journal** | `useJournal()`, `<JournalList/>`, `recordSession(payload)` | 어느 수행이든 세션 payload만 넘기면 기록 |

> 원칙: **practices/traditions는 skill을 "인터페이스로만" 사용.** 그래야 단독앱에서 결제를 빼도 콘텐츠는 그대로.

### 4-1. core/engine — 가장 재사용성 높음

지금 `Breathe.jsx`와 `YogaPractice.jsx`가 **각자 타이머·오브·물결·사운드를 중복 구현** 중이다. 공통 엔진으로 추출하면 위빠사나·자애·MBSR은 **config만 작성**하면 타이머가 완성된다.

- 입력: `{ engine, segments|phases|steps, attitude, theme, sound, minutes }`
- 렌더: 오브·물결·배경·컨트롤
- 콜백: `onPhase`, `onFinish(session)` → journal 스킬로 기록
- 테마 주입: 아나빠나=세이지 `#8a9a82` / 요가=테라코타 `#c0844a` / 위빠사나=슬레이트 인디고 `#6b7b94` / 자애=미정

---

## 5. 점진 이관 순서

**big-bang 이동 금지.** 각 단계마다 빌드·화면 검증.

| 단계 | 내용 | 위험 |
|---|---|---|
| 1 | 이 문서 합의 | 없음 |
| 2 | `core/attitudes.js`·`core/objects.js` 신설, `practices/breath.js`에 **기존 요가·아나빠나 config를 데이터로만 이전** | 낮음 |
| 3 | `core/engine/` 추출 — `Breathe.jsx` + `YogaPractice.jsx` 중복 타이머 통합 | **높음** ⚠️ |
| 4 | 관찰 4모드(guided·scan·walking·open) 엔진에 추가 | 중간 |
| 5 | 위빠사나 전통 + 실습 올림 | 낮음 |
| 6 | 자애 전통 추가 | 낮음 |
| 7 | (추후) MBSR = 파일 하나 | 낮음 |
| 8 | 필요 시 apps/ 멀티 엔트리 | — |

> ⚠️ **3단계가 진짜 위험.** 아나빠나사띠 호흡 화면은 **이미 배포돼 사용자가 쓰는 기능**이고 요가는 배포 대기 중이다. 둘 다 건드리는 리팩터링이라 회귀가 나면 티가 난다. **이전/이후 동작을 화면으로 대조 검증**하며 진행할 것.

---

## 6. 역할·소유 (병렬 규칙 연동)

- **Claude**: `core/`, `practices/`, `traditions/`, `paths/`, `goals/`, `skills/journal`, `ui/`
- **Codex**: `skills/auth`·`payment`·`premium`, 배포
- 공용 파일(App/Navbar/Home/라우팅) 수정 시 서로 로그 남기고 병합. 결제·인증 파일은 Claude가 임의 이동/수정하지 않음.
- 이동은 "경로 변경 + import 갱신"만. **로직 변경 금지**(리팩터링과 이동을 분리).

---

## 7. 관련 문서

- `docs/PRODUCT_STRATEGY.md` — 포지셔닝·수익화·벤치마킹 (시장 조사 반영)
- `docs/VIPASSANA_PLAN.md` — 위빠사나 상세 기획
- `docs/PRANAYAMA_PLAN.md` — 요가 호흡법 기획
- `docs/MONETIZATION.md` — 수익화 (PRODUCT_STRATEGY의 재조정 반영 필요)
- `docs/global-meditation-apps-research-2026.md` — 글로벌 앱 조사 원본
