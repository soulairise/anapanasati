// ============================================================
// 토스페이먼츠 결제 "승인" Edge Function (서버 전용)
// 프론트에서 결제 후 { paymentKey, orderId, amount, plan }을 보내면,
// 시크릿 키로 토스 승인 API를 호출하고, 성공 시 profiles.is_premium 를 갱신한다.
//
// 필요한 시크릿(Supabase → Edge Functions → Secrets):
//   TOSS_SECRET_KEY            토스 시크릿 키 (test_sk_... / live_sk_...)
//   SUPABASE_URL               (자동 제공됨)
//   SUPABASE_ANON_KEY          (자동 제공됨)
//   SUPABASE_SERVICE_ROLE_KEY  (자동 제공됨)
// 배포: supabase functions deploy confirm-payment  (또는 대시보드에서 붙여넣기)
// ============================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// 플랜별 정가(원) — 결제 금액 위변조 방지용 서버 검증
const PRICE: Record<string, number> = { yearly: 39000, monthly: 4900 }

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { paymentKey, orderId, amount, plan } = await req.json()

    // 1) 요청한 사용자 확인 (invoke가 보낸 JWT)
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    )
    const {
      data: { user },
    } = await userClient.auth.getUser()
    if (!user) return json({ error: true, message: '로그인이 필요합니다.' }, 401)

    // 2) 금액 검증 (프론트에서 온 금액을 신뢰하지 않음)
    if (!plan || PRICE[plan] !== Number(amount)) {
      return json({ error: true, message: '결제 금액이 플랜과 일치하지 않습니다.' }, 400)
    }

    // 3) 토스 승인
    const secret = Deno.env.get('TOSS_SECRET_KEY')!
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(secret + ':'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
    const payment = await tossRes.json()
    if (!tossRes.ok) {
      return json({ error: true, message: payment?.message || '결제 승인 실패' }, 400)
    }

    // 4) 프리미엄 부여 (service role — RLS 우회, is_premium은 서버만 변경 가능)
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const until = new Date()
    if (plan === 'yearly') until.setFullYear(until.getFullYear() + 1)
    else until.setMonth(until.getMonth() + 1)

    const { error: profileError } = await admin.from('profiles').upsert({
      id: user.id,
      is_premium: true,
      premium_until: until.toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (profileError) {
      return json(
        { error: true, message: '결제는 승인됐지만 프리미엄 상태를 저장하지 못했습니다.' },
        500,
      )
    }

    return json({ ok: true, premium_until: until.toISOString() })
  } catch (e) {
    return json({ error: true, message: String(e) }, 500)
  }
})
