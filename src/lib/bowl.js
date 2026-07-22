// ============================================================
// 싱잉볼 사운드 합성 (Web Audio API)
// 실제 싱잉볼처럼 비조화(inharmonic) 배음을 쌓고,
// 초반에 크게 울렸다가 서서히 사라지는 엔벨로프를 적용한다.
// 오디오 파일 없이 브라우저에서 실시간 합성 → 로딩/용량 0.
// ============================================================

let ctx = null

export function getAudioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  // 사용자 제스처 이후 재개 (자동재생 정책)
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// 싱잉볼 배음 구조 (실제 종처럼 약간 어긋난 파셜들)
// 높은 파셜의 음량을 낮춰 금속성 날카로움을 줄이고 따뜻하게 만든다.
const PARTIALS = [
  { ratio: 1.0, gain: 1.0 },
  { ratio: 2.76, gain: 0.28 },
  { ratio: 5.4, gain: 0.08 },
  { ratio: 8.93, gain: 0.03 },
]

/**
 * 싱잉볼 한 번 울리기.
 * @param {number} baseFreq 기본 주파수(Hz)
 * @param {number} duration 지속 시간(초) — 이 시간에 걸쳐 서서히 소멸
 * @param {number} volume 최대 음량 (0~1)
 * @returns {{stop: (fade?:number)=>void}} 조기 정지 핸들
 */
export function playBowl(baseFreq, duration, volume = 0.5) {
  const ac = getAudioContext()
  if (!ac) return { stop: () => {} }

  const now = ac.currentTime
  const master = ac.createGain()
  master.connect(ac.destination)

  // 엔벨로프: 빠르게 커졌다가(attack) → 지속적으로 감쇠(decay)
  const attack = Math.min(0.15, duration * 0.12)
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(volume, now + attack)
  master.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(duration, attack + 0.1))

  // 부드러운 타격감을 위한 로우패스 (컷오프를 낮춰 고음 날카로움 완화)
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1600
  lp.connect(master)

  const oscs = []
  PARTIALS.forEach((p, i) => {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = baseFreq * p.ratio
    // 미세한 디튠으로 금속 종의 맥놀이(beating) 표현
    osc.detune.value = (i - 1.5) * 1.5

    const g = ac.createGain()
    g.gain.value = p.gain
    osc.connect(g).connect(lp)
    osc.start(now)
    osc.stop(now + duration + 0.3)
    oscs.push(osc)
  })

  return {
    stop(fade = 0.4) {
      const t = ac.currentTime
      try {
        master.gain.cancelScheduledValues(t)
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t)
        master.gain.exponentialRampToValueAtTime(0.0001, t + fade)
        oscs.forEach((o) => o.stop(t + fade + 0.05))
      } catch {
        /* 이미 정지된 경우 무시 */
      }
    },
  }
}

// 들숨/날숨 주파수 (서로 다른 음정) — 낮고 따뜻하게 조정
export const INHALE_FREQ = 264 // C4, 맑지만 부드러운 울림
export const EXHALE_FREQ = 176 // F3, 낮고 깊은 울림
