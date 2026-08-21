// ============================================================
// AI 제공자 — 갈아끼울 수 있게 분리해 둔다
//
// 환경변수 AI_PROVIDER 로 고른다. 기본은 gemini.
//   gemini    → GEMINI_API_KEY    (기본, 가장 쌈)
//   anthropic → ANTHROPIC_API_KEY
//
// ⚠️ Gemini 는 반드시 "유료 등급"이어야 한다.
//    무료 등급은 구글이 보낸 내용을 제품 개선·모델 학습에 쓰고 사람 검토자가
//    볼 수 있다. 구글 스스로 "민감·기밀·개인정보를 제출하지 말라"고 안내한다.
//    결제수단을 등록하면 유료 약관이 적용돼 학습에서 빠진다
//    (무료 할당량은 그대로 받으므로 실제 청구는 한동안 0원일 수 있다).
//    EU·스위스·영국은 무료도 유료 약관이지만 한국은 해당 없다.
// ============================================================

export type Provider = 'gemini' | 'anthropic'

export type Generated = { text: string; model: string }

/** 어느 쪽으로 갈지와 키를 정한다. 키가 없으면 null. */
export function resolveProvider(): { provider: Provider; key: string; model: string } | null {
  const want = (Deno.env.get('AI_PROVIDER') ?? 'gemini').toLowerCase() as Provider

  if (want === 'anthropic') {
    const key = Deno.env.get('ANTHROPIC_API_KEY')
    if (!key) return null
    return { provider: 'anthropic', key, model: Deno.env.get('AI_MODEL') ?? 'claude-opus-5' }
  }

  const key = Deno.env.get('GEMINI_API_KEY')
  if (!key) return null
  // 모델을 환경변수로 뺀다 — 구글이 모델을 자주 갈아치운다.
  // (예: gemini-2.5-flash 는 2026-10-16 지원 종료 예정이었다)
  return { provider: 'gemini', key, model: Deno.env.get('AI_MODEL') ?? 'gemini-3.1-flash-lite' }
}

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly userMessage: string,
  ) {
    super(message)
  }
}

async function generateGemini(
  key: string,
  model: string,
  system: string,
  user: string,
): Promise<Generated> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 키를 쿼리스트링(?key=)에 넣지 않는다. 프록시·서버 로그에 그대로 남는다.
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1000 },
      }),
    },
  )

  if (!res.ok) {
    const body = await res.text()
    if (res.status === 429) {
      throw new ProviderError(body, 429, '지금 요청이 몰려 있습니다. 잠시 뒤 다시 시도해 주세요.')
    }
    if (res.status === 401 || res.status === 403) {
      throw new ProviderError(body, 500, '코칭 설정에 문제가 있습니다. 관리자에게 알려 주세요.')
    }
    throw new ProviderError(body, 502, '이번에는 편지를 쓰지 못했습니다. 다음에 다시 시도해 주세요.')
  }

  const data = await res.json()
  const cand = data?.candidates?.[0]

  // 안전 필터에 걸리면 candidates 가 비거나 finishReason 이 SAFETY 로 온다.
  // 200 으로 오기 때문에 status 만 보면 놓친다.
  if (!cand || cand.finishReason === 'SAFETY' || cand.finishReason === 'PROHIBITED_CONTENT') {
    throw new ProviderError(
      JSON.stringify(data).slice(0, 400),
      502,
      '이번에는 편지를 쓰지 못했습니다. 다음에 다시 시도해 주세요.',
    )
  }

  const text = (cand.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim()

  return { text, model }
}

async function generateAnthropic(
  key: string,
  model: string,
  system: string,
  user: string,
): Promise<Generated> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system,
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    if (res.status === 429) {
      throw new ProviderError(body, 429, '지금 요청이 몰려 있습니다. 잠시 뒤 다시 시도해 주세요.')
    }
    if (res.status === 401 || res.status === 403) {
      throw new ProviderError(body, 500, '코칭 설정에 문제가 있습니다. 관리자에게 알려 주세요.')
    }
    throw new ProviderError(body, 502, '이번에는 편지를 쓰지 못했습니다. 다음에 다시 시도해 주세요.')
  }

  const data = await res.json()
  if (data?.stop_reason === 'refusal') {
    throw new ProviderError('refusal', 502, '이번에는 편지를 쓰지 못했습니다. 다음에 다시 시도해 주세요.')
  }

  const text = (data?.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('\n')
    .trim()

  return { text, model }
}

export function generate(
  cfg: { provider: Provider; key: string; model: string },
  system: string,
  user: string,
): Promise<Generated> {
  return cfg.provider === 'anthropic'
    ? generateAnthropic(cfg.key, cfg.model, system, user)
    : generateGemini(cfg.key, cfg.model, system, user)
}
