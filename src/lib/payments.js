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

// 결제가 실제로 설정됐는지 (실서비스 키가 들어와 있는지) — Premium 화면에서 분기용
export const TOSS_READY = Boolean(import.meta.env.VITE_TOSS_CLIENT_KEY)

// 앱 복귀 URL (GitHub Pages base + HashRouter)
const appBase = () => window.location.origin + window.location.pathname

function makeOrderId() {
  // 영문/숫자 6~64자 규칙 충족
  return 'soomgil_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36)
}

/**
 * 구독 결제창 호출.
 * @param {{planKey:string, orderName:string, amount:number, customerEmail?:string, customerName?:string}} p
 */
export async function requestSubscription({ planKey, orderName, amount, customerEmail, customerName }) {
  const toss = await loadTossPayments(CLIENT_KEY)
  const payment = toss.payment({ customerKey: ANONYMOUS })

  const orderId = makeOrderId()
  // 승인 후 프리미엄 부여에 쓸 정보를 successUrl 쿼리에 실어 보낸다.
  const success = `${appBase()}#/pay/success?plan=${encodeURIComponent(planKey)}`
  const fail = `${appBase()}#/pay/fail`

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
