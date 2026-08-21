// ============================================================
// AI 수행 코칭 (서버 전용)
//
// 사용자의 수행 "수치"만 보고 짧은 편지를 쓴다.
//
// ⚠️⚠️ 소감(note) 텍스트는 절대 밖으로 나가지 않는다.
//    아래 select 에 note 를 넣지 말 것. 소감은 "오늘 아버지 생각이 나서 울었다"
//    같은 게 적히는 칸이고, 이걸 외부로 보내려면 처리방침 개정과 별도 동의가
//    필요하다(민감정보 해당 여부도 미결). 대표 결정: 1단계는 수치만.
//
// 비용을 아끼려고 주 1회로 막는다. 매번 부르면 돈도 새고 글도 흔해진다.
//
// 필요한 시크릿: ANTHROPIC_API_KEY
// 배포: supabase functions deploy coach
// ============================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'
import Anthropic from 'npm:@anthropic-ai/sdk@0.71.0'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const MODEL = 'claude-opus-5'
const COOLDOWN_DAYS = 7
const LOOKBACK_DAYS = 56 // 8주 — 추세가 보이기 시작하는 최소 길이
const MIN_SESSIONS = 3 // 이보다 적으면 할 말이 없다

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

const TRACK_KO: Record<string, string> = {
  anapanasati: '호흡하기',
  yoga: '요가 호흡',
  vipassana: '관찰 수행',
  metta: '마음 나누기',
  mbsr: '8주 마음챙김',
}

// 시각을 네 구간으로. 사람은 "14시"보다 "낮"으로 자기 습관을 인식한다.
const slotOf = (d: Date) => {
  const h = d.getHours()
  if (h < 6) return '새벽'
  if (h < 12) return '아침'
  if (h < 18) return '낮'
  return '저녁'
}

type Row = {
  created_at: string
  duration_sec: number | null
  track: string | null
  focus_score: number | null
  metrics: Record<string, unknown> | null
}

/** 원본 기록을 사람이 읽을 수 있는 요약표로 접는다.
 *  기록 수십 개를 그대로 보내면 토큰만 쓰고 모델이 오히려 헤맨다. */
function summarize(rows: Row[]) {
  const now = Date.now()
  const weeks: { label: string; n: number; min: number; focus: number[] }[] = []
  for (let w = 7; w >= 0; w--) {
    weeks.push({ label: w === 0 ? '이번 주' : `${w}주 전`, n: 0, min: 0, focus: [] })
  }

  const byTrack = new Map<string, { n: number; sec: number }>()
  const bySlot = new Map<string, number>()
  const counting: { date: string; acc: number }[] = []

  for (const r of rows) {
    const d = new Date(r.created_at)
    const wAgo = Math.floor((now - d.getTime()) / 604800000)
    if (wAgo >= 0 && wAgo <= 7) {
      const bucket = weeks[7 - wAgo]
      bucket.n += 1
      bucket.min += Math.round((r.duration_sec ?? 0) / 60)
      if (typeof r.focus_score === 'number') bucket.focus.push(r.focus_score)
    }

    const t = r.track ?? 'anapanasati'
    const cur = byTrack.get(t) ?? { n: 0, sec: 0 }
    cur.n += 1
    cur.sec += r.duration_sec ?? 0
    byTrack.set(t, cur)

    const s = slotOf(d)
    bySlot.set(s, (bySlot.get(s) ?? 0) + 1)

    // 세어보기 정확도가 있으면 추세에 넣는다
    const m = r.metrics ?? {}
    const acc = typeof m.accuracy === 'number' ? m.accuracy : null
    if (acc !== null) counting.push({ date: d.toISOString().slice(0, 10), acc })
  }

  const avg = (a: number[]) => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '—')

  const lines: string[] = []
  lines.push('[주별 수행]')
  for (const w of weeks) {
    lines.push(`${w.label}: ${w.n}회, ${w.min}분, 평균 집중도 ${avg(w.focus)}`)
  }

  lines.push('', '[갈래별]')
  for (const [k, v] of [...byTrack.entries()].sort((a, b) => b[1].sec - a[1].sec)) {
    lines.push(`${TRACK_KO[k] ?? k}: ${v.n}회, ${Math.round(v.sec / 60)}분`)
  }

  lines.push('', '[주로 앉는 때]')
  for (const [k, v] of [...bySlot.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`${k}: ${v}회`)
  }

  if (counting.length >= 3) {
    const first = counting.slice(-6, -3)
    const last = counting.slice(-3)
    const m = (a: { acc: number }[]) =>
      a.length ? Math.round((a.reduce((s, x) => s + x.acc, 0) / a.length) * 100) : null
    lines.push('', '[숨 세어보기 정확도]')
    if (m(first) !== null) lines.push(`이전 3회 평균 ${m(first)}%`)
    lines.push(`최근 3회 평균 ${m(last)}%`)
  }

  return lines.join('\n')
}

const SYSTEM = `당신은 호흡·명상 수행을 오래 해 온 안내자입니다.
사용자의 수행 기록 "수치"만 보고, 짧은 편지 한 통을 한국어로 씁니다.

지켜야 할 것:
- 4~6문장. 짧을수록 좋습니다.
- 수치에서 실제로 읽히는 것만 말합니다. 없는 일을 지어내지 마십시오.
- 좋아진 점을 먼저, 그다음 눈에 띄는 패턴 하나를 짚습니다.
- 다음 한 주에 해 볼 만한 것을 딱 하나만 제안합니다. 여러 개를 주면 아무것도 안 합니다.
- 끊긴 날, 줄어든 횟수를 나무라지 않습니다. 떠났으면 알아차리고 돌아오면 됩니다.
- 숫자를 나열하지 말고, 그 숫자가 무슨 뜻인지 말합니다.
- 의학적 효과를 단정하지 않습니다("불면증이 낫습니다" 같은 말은 하지 않습니다).
- 존댓말. 담담하고 따뜻하게. 감탄사와 이모지는 쓰지 않습니다.

당신은 소감 글을 보지 못합니다. 사용자가 무엇을 느꼈는지 아는 척하지 마십시오.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const key = Deno.env.get('ANTHROPIC_API_KEY')
    if (!key) {
      return json({ error: true, message: '코칭이 아직 준비되지 않았습니다.' }, 503)
    }

    // 1) 사용자 확인
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    )
    const {
      data: { user },
    } = await userClient.auth.getUser()
    if (!user) return json({ error: true, message: '로그인이 필요합니다.' }, 401)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 2) 프리미엄인지 (기간이 지났으면 열지 않는다)
    const { data: profile } = await admin
      .from('profiles')
      .select('is_premium, premium_until')
      .eq('id', user.id)
      .maybeSingle()
    const alive =
      profile?.is_premium &&
      profile.premium_until &&
      new Date(profile.premium_until) > new Date()
    if (!alive) return json({ error: true, message: '프리미엄 이용 중에만 받으실 수 있습니다.' }, 403)

    // 3) 주 1회 — 최근 것이 있으면 그것을 돌려준다
    const { data: last } = await admin
      .from('coach_notes')
      .select('id, text, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (last) {
      const days = (Date.now() - new Date(last.created_at).getTime()) / 86400000
      if (days < COOLDOWN_DAYS) {
        return json({
          ok: true,
          cached: true,
          text: last.text,
          created_at: last.created_at,
          next_in_days: Math.ceil(COOLDOWN_DAYS - days),
        })
      }
    }

    // 4) 수치만 읽는다 — note 는 select 하지 않는다
    const from = new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString()
    const { data: rows, error: rowsError } = await admin
      .from('sessions')
      .select('created_at, duration_sec, track, focus_score, metrics')
      .eq('user_id', user.id)
      .gte('created_at', from)
      .order('created_at', { ascending: true })

    if (rowsError) return json({ error: true, message: '기록을 읽지 못했습니다.' }, 500)
    if (!rows || rows.length < MIN_SESSIONS) {
      return json({
        error: true,
        message: `기록이 ${MIN_SESSIONS}회 이상 쌓이면 받으실 수 있습니다.`,
      }, 400)
    }

    // 5) 편지를 쓴다
    const anthropic = new Anthropic({ apiKey: key })
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM,
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: summarize(rows as Row[]) }],
    })

    if (response.stop_reason === 'refusal') {
      return json({ error: true, message: '이번에는 편지를 쓰지 못했습니다. 다음에 다시 시도해 주세요.' }, 502)
    }

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('\n')
      .trim()

    if (!text) return json({ error: true, message: '편지가 비어 있습니다.' }, 502)

    const { data: saved } = await admin
      .from('coach_notes')
      .insert({
        user_id: user.id,
        text,
        model: MODEL,
        period_from: from,
        period_to: new Date().toISOString(),
        session_n: rows.length,
      })
      .select('created_at')
      .maybeSingle()

    return json({
      ok: true,
      cached: false,
      text,
      created_at: saved?.created_at ?? new Date().toISOString(),
      next_in_days: COOLDOWN_DAYS,
    })
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return json({ error: true, message: '지금 요청이 몰려 있습니다. 잠시 뒤 다시 시도해 주세요.' }, 429)
    }
    if (e instanceof Anthropic.AuthenticationError) {
      return json({ error: true, message: '코칭 설정에 문제가 있습니다. 관리자에게 알려 주세요.' }, 500)
    }
    return json({ error: true, message: String(e) }, 500)
  }
})
