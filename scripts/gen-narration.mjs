// ============================================================
// 한국어 나레이션 생성 (ElevenLabs)
//
// 왜 스크립트인가:
//   음성은 자주 바꾸는 자산이 아니다. 나중에 대표님이 좋은 마이크로 직접 녹음하면
//   이 파일들을 교체하기만 하면 된다. 그때까지 쓸 임시 음성을 재현 가능하게 만든다.
//
// 실행:
//   1) https://elevenlabs.io → Profile → API Key 발급
//   2) echo "sk_...키..." > ~/.elevenlabs_key
//   3) node scripts/gen-narration.mjs
//
// 키는 파일에서만 읽고 절대 출력하지 않는다. 저장소에도 커밋하지 않는다(.gitignore).
// ============================================================

import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'audio')

// 경전 어법에 가까운 선언형. 명령형("들이쉬세요")은 "제대로 못 하고 있다"는
// 평가 압력을 만들고, 그 압력이 이완을 방해한다.
// 화면 라벨(들이쉬기·멈추기·내쉬기)과 결이 맞고, 4초 안에 끝나도록 짧게 둔다.
const LINES = {
  'ko-inhale': '들이쉽니다',
  'ko-hold': '머뭅니다',
  'ko-exhale': '내쉽니다',
}

// 무료 티어에서 쓸 수 있는 기본 음성. 한국어는 multilingual 모델이 필요하다.
//
// ⚠️ 한국어가 공식 검증된 음성(Bin·Hyuk)은 라이브러리 음성이라 무료 티어에서
//    API 호출이 막힌다(paid_plan_required). 기본 제공 음성 중에서 골라야 한다.
const VOICE_ID = process.env.ELEVEN_VOICE_ID || 'nPczCjzI2devNBz1zQrb' // Brian — 깊고 편안한 남성
const MODEL = 'eleven_multilingual_v2'

// 기본 속도는 명상 안내로는 너무 빠르다. 0.7이 API 하한(약 1.43배 느림)이다.
const SPEED = Number(process.env.ELEVEN_SPEED || 0.7)

async function loadKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim()
  try {
    return (await readFile(join(homedir(), '.elevenlabs_key'), 'utf8')).trim()
  } catch {
    throw new Error('API 키가 없습니다. ~/.elevenlabs_key에 저장하거나 ELEVENLABS_API_KEY를 설정하세요.')
  }
}

async function main() {
  const key = await loadKey()
  await mkdir(OUT_DIR, { recursive: true })

  // 모델이 가끔 긴 침묵을 덧붙인다(같은 문장이 1.5초로도, 3.4초로도 나온다).
  // 멈춤 구간은 2초짜리도 있어서 그런 파일이 들어가면 다음 안내와 겹친다.
  // mp3 128kbps ≈ 16KB/초이므로 크기로 걸러 다시 뽑는다.
  const MAX_KB = 34 // ≈ 2.1초
  const ATTEMPTS = 4

  const synth = async (text) => {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          // 명상 안내는 흔들림 없이 낮고 느린 편이 낫다.
          voice_settings: {
            stability: 0.8,
            similarity_boost: 0.7,
            style: 0.0,
            use_speaker_boost: true,
            speed: SPEED,
          },
        }),
      },
    )

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`생성 실패 (HTTP ${res.status}): ${body.slice(0, 300)}`)
    }

    const buf = Buffer.from(await res.arrayBuffer())
    return buf
  }

  for (const [name, text] of Object.entries(LINES)) {
    let best = null
    for (let i = 1; i <= ATTEMPTS; i++) {
      const buf = await synth(text)
      if (!best || buf.length < best.length) best = buf
      if (buf.length / 1024 <= MAX_KB) break
      console.log(`  … ${name} ${(buf.length / 1024).toFixed(1)}KB — 너무 김, 재시도 ${i}/${ATTEMPTS}`)
    }
    const out = join(OUT_DIR, `${name}.mp3`)
    await writeFile(out, best)
    console.log(`✔ ${name}.mp3  "${text}"  ${(best.length / 1024).toFixed(1)} KB`)
  }

  console.log('\n완료. src/lib/narration.js가 ko-*.mp3를 사용합니다.')
}

main().catch((e) => {
  console.error('✖', e.message)
  process.exit(1)
})
