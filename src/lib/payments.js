// ============================================================
// 토스페이먼츠 결제 (프론트)
// - 결제창을 띄워 결제를 요청하고, 성공 시 successUrl로 리다이렉트된다.
// - 실제 "승인"은 반드시 서버(Edge Function)에서 처리한다(시크릿 키).
//
// 환경변수: VITE_TOSS_CLIENT_KEY (없으면 토스 공개 테스트 키 사용 → sandbox)
// ============================================================

import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'

// 토스 문서용 공개 테스트 클라이언트 키 (sandbox). 실제 서비스는 .env로 교체.
const TEST_CLIENT_KEY = 'test_ck_docs_Ovk5rk1EwkEbP0W43n07xxx'
const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || TEST_CLIENT_KEY

// ── 판매 방식 선언 ────────────────────────────────────────
// 화면 문구가 실제 동작과 어긋나는 사고를 한 번 냈다("7일 무료 체험"이라 써 뒀는데
// 체험 로직이 없었다). 말로만 맞추지 말고 여기에 선언해 두고,
// npm run check:launch 가 이 선언과 실제 구현을 대조한다.
//
//   one_time  = 고른 기간만큼 한 번 결제. 자동 갱신 없음. 결제수단을 보관하지 않는다.
//   recurring = 빌링키를 발급해 주기적으로 재청구. 도입하려면 갱신 스케줄러와
//               갱신 전 고지·해지 실동작까지 함께 만들어야 한다(2025.2 구독 규제).
export const BILLING_MODEL = 'one_time'

// 가입 시 주는 무료 체험. 실제 부여는 DB 트리거(handle_new_user)가 한다.
// ⚠️ 여기 숫자를 고쳐도 트리거는 안 바뀐다. 바꿀 때 마이그레이션도 같이 고칠 것.
export const TRIAL_DAYS = 3
export const TRIAL_REQUIRES_CARD = false

// 결제가 실제로 설정됐는지 (실서비스 키가 들어와 있는지) — Premium 화면에서 분기용
export const TOSS_READY = Boolean(import.meta.env.VITE_TOSS_CLIENT_KEY)

// 앱 복귀 URL (GitHub Pages base + HashRouter)
// 앱의 뿌리 주소. 끝에 슬래시를 보장한다 — 뒤에 경로를 붙이기 때문이다.
// window.location.pathname 을 쓰면 지금 보고 있는 화면 경로가 섞인다.
const appBase = () => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/*$/, '/')
  return window.location.origin + base
}

// 주문번호에 플랜을 심어 둔다.
// 저장소가 비어 있어도(다른 탭으로 복귀, 시크릿 창 등) 여기서 되찾을 수 있다.
// 토스 규칙: 영문/숫자/-/_ 6~64자
function makeOrderId(planKey = '') {
  const rand = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  return `soomgil-${planKey || 'x'}-${rand}`
}

export function planFromOrderId(orderId = '') {
  const m = /^soomgil-([a-z]+)-/.exec(orderId)
  return m && m[1] !== 'x' ? m[1] : null
}

// 결제 직전 상태를 남긴다. 승인 단계에서 플랜과 금액을 되찾는 데 쓴다.
const PENDING_KEY = 'soomgil_pending_payment'

function rememberPending(info) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ ...info, at: Date.now() }))
  } catch {
    /* 저장 못 해도 orderId 로 복구할 수 있다 */
  }
}

export function readPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    // 하루가 지난 것은 무시한다. 옛 결제의 흔적으로 엉뚱한 플랜이 열리면 안 된다.
    if (!v || Date.now() - (v.at || 0) > 86400000) return null
    return v
  } catch {
    return null
  }
}

export function clearPending() {
  try {
    localStorage.removeItem(PENDING_KEY)
  } catch {
    /* noop */
  }
}

/**
 * 구독 결제창 호출.
 * @param {{planKey:string, orderName:string, amount:number, customerEmail?:string, customerName?:string}} p
 */
export async function requestSubscription({ planKey, orderName, amount, customerEmail, customerName }) {
  const toss = await loadTossPayments(CLIENT_KEY)
  const payment = toss.payment({ customerKey: ANONYMOUS })

  // ⚠️ successUrl 에 쿼리를 붙이지 않는다.
  //
  //    예전엔 `...#/pay/success?plan=monthly` 처럼 플랜을 실어 보냈다.
  //    토스는 이 주소 뒤에 paymentKey·orderId·amount 를 덧붙이는데,
  //    '?' 로 덧붙이면 물음표가 두 개가 되어 파싱이 깨진다:
  //      #/pay/success?plan=monthly?paymentKey=...
  //      → plan 은 "monthly?paymentKey=..." 가 되고 paymentKey 는 null 이 된다.
  //      → 화면은 "결제 정보가 올바르지 않습니다" 를 띄우고, 승인은 영영 일어나지 않는다.
  //        돈은 나갔는데 프리미엄이 안 열리는 최악의 형태다.
  //
  //    '&' 로 붙이면 괜찮지만, 그건 토스 쪽 구현에 기대는 것이다.
  //    기대지 않는 쪽으로 바꾼다 — 플랜은 주소가 아니라 저장소로 넘긴다.
  const orderId = makeOrderId(planKey)
  rememberPending({ planKey, orderId, amount })

  // 해시가 없으므로 토스가 ?paymentKey=... 를 깔끔하게 붙인다
  const success = `${appBase()}pay/success`
  const fail = `${appBase()}pay/fail`

  await payment.requestPayment({
    method: 'CARD',
    amount: { currency: 'KRW', value: amount },
    orderId,
    orderName,
    successUrl: success,
    failUrl: fail,
    customerEmail: customerEmail || undefined,
    customerName: customerName || undefined,
  })
}
