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
const VOICE_ID = process.env.ELEVEN_VOICE_ID || 'pFZP5JQG7iQjIQuC4Bku' // Lily
const MODEL = 'eleven_multilingual_v2'

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

  for (const [name, text] of Object.entries(LINES)) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          // 명상 안내는 흔들림 없이 낮고 느린 편이 낫다.
          voice_settings: { stability: 0.75, similarity_boost: 0.7, style: 0.0, use_speaker_boost: true },
        }),
      },
    )

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`${name} 생성 실패 (HTTP ${res.status}): ${body.slice(0, 300)}`)
    }

    const buf = Buffer.from(await res.arrayBuffer())
    const out = join(OUT_DIR, `${name}.mp3`)
    await writeFile(out, buf)
    console.log(`✔ ${name}.mp3  "${text}"  ${(buf.length / 1024).toFixed(1)} KB`)
  }

  console.log('\n완료. src/lib/narration.js가 ko-*.mp3를 사용합니다.')
}

main().catch((e) => {
  console.error('✖', e.message)
  process.exit(1)
})
