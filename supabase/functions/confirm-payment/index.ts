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
import { preflight, jsonWith } from './cors.ts'

// 플랜별 정가(원) — 결제 금액 위변조 방지용 서버 검증
// ⚠️ Premium.jsx의 PLANS와 반드시 같은 값을 유지할 것. 어긋나면 결제가 거부된다.
const PRICE: Record<string, number> = { yearly: 39000, quarterly: 12900, monthly: 4900 }

// 플랜별 이용 기간(개월)
const MONTHS: Record<string, number> = { yearly: 12, quarterly: 3, monthly: 1 }

Deno.serve(async (req) => {
  const pre = preflight(req)
  if (pre) return pre
  const json = jsonWith(req)

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
    // 남은 기간이 있으면 그 뒤에 이어 붙인다.
    // 지금부터 다시 세면, 체험이나 쿠폰 기간이 남은 사람이 결제하는 순간
    // 남은 날을 뺏기게 된다. 돈을 낸 사람이 손해를 보는 구조는 안 된다.
    const { data: prev } = await admin
      .from('profiles')
      .select('premium_until')
      .eq('id', user.id)
      .maybeSingle()

    const now = new Date()
    const prevUntil = prev?.premium_until ? new Date(prev.premium_until) : null
    const until = prevUntil && prevUntil > now ? new Date(prevUntil) : new Date(now)
    until.setMonth(until.getMonth() + (MONTHS[plan] ?? 1))

    const { error: profileError } = await admin.from('profiles').upsert({
      id: user.id,
      is_premium: true,
      premium_until: until.toISOString(),
      premium_source: 'payment',
      updated_at: now.toISOString(),
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
