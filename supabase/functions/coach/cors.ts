// ============================================================
// CORS 헤더 — 브라우저에서 부르는 Edge Function 은 전부 이걸 쓴다
//
// ⚠️ 이 파일은 함수 폴더마다 같은 내용의 사본으로 존재한다.
//    배포 도구가 ../_shared/ 같은 상위 폴더 참조를 해석하지 못하기 때문이다.
//    사본이 어긋나면 npm run check:launch 가 잡는다. 손으로 한쪽만 고치지 말 것.
//
// ⚠️ 왜 따로 뺐는가:
//    허용 헤더 목록을 함수마다 손으로 적어 뒀더니, supabase-js 가 보내는
//    X-Supabase-Api-Version 이 빠져 있었다. 브라우저는 프리플라이트 응답의
//    허용 목록에 없는 헤더를 보내려 하면 요청 자체를 막는다.
//    서버는 멀쩡한데 요청이 아예 도착하지 않아서, 로그에 아무것도 안 남고
//    화면에서도 조용히 실패한다. 원인을 찾기 아주 어려운 종류의 버그다.
//
//    coach 뿐 아니라 confirm-payment 도 같은 함정에 걸려 있었다.
//    실결제를 열었다면 승인 단계에서 전부 실패했을 것이다.
//
// ⚠️ SDK 를 올릴 때 헤더가 늘어날 수 있다. 목록을 손으로 관리하지 않고
//    프리플라이트가 요청한 헤더를 그대로 되비춘다(reflect).
//    자격증명(쿠키)을 쓰지 않으므로 안전하다 — Authorization 은 명시적으로
//    실어 보내는 값이지 브라우저가 자동으로 붙이는 자격증명이 아니다.
// ============================================================

const BASE = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  // 프리플라이트 결과를 캐시해 매 호출마다 왕복하지 않게 한다
  'Access-Control-Max-Age': '86400',
}

// 목록을 고정하지 않는 대신, 최소한 이것들은 항상 허용한다.
// (요청이 Access-Control-Request-Headers 를 안 보내는 경우 대비)
const FALLBACK =
  'authorization, x-client-info, apikey, content-type, x-supabase-api-version'

export function corsHeaders(req: Request): Record<string, string> {
  const asked = req.headers.get('access-control-request-headers')
  return {
    ...BASE,
    'Access-Control-Allow-Headers': asked && asked.trim() ? asked : FALLBACK,
  }
}

/** OPTIONS 프리플라이트면 응답을 돌려주고, 아니면 null. */
export function preflight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null
  return new Response('ok', { headers: corsHeaders(req) })
}

export function jsonWith(req: Request) {
  const headers = { ...corsHeaders(req), 'Content-Type': 'application/json' }
  return (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers })
}
