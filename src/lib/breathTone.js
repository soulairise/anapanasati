// ============================================================
// 호흡을 따라 이어지는 소리 (연속 페이서) + 공간 음향
//
// 왜 만들었나:
//   bowl.js의 playBowl은 "댕—" 하고 한 번 치는 타격음이라, 페이즈가 시작됐다는
//   신호는 되지만 "얼마나 남았는지"는 알려주지 못한다. 그래서 사용자가 숫자를
//   보려고 눈을 뜨게 된다 — 명상 앱으로서 모순이다.
//
//   모달리티 비교 연구에서 청각 유도가 시각보다 우수했고, 웹에서 햅틱은
//   iOS가 navigator.vibrate를 지원하지 않아 막혀 있다. 청각이 유일하게 남은
//   최상위 채널이라, 소리가 호흡 전 구간을 채우도록 만든다.
//
// 공간 음향: 들숨엔 소리가 다가오고 날숨엔 멀어진다. HRTF 패닝은
//   프레즌스를 유의하게 올린다는 근거가 있고 Web Audio 기본 기능이라 비용이 없다.
//   (이어폰에서 가장 잘 들리고, 스피커에서는 효과가 약하다)
// ============================================================

import { getAudioContext } from './bowl'

// 목소리(음색) — 갈래마다 정체성이 다르므로 배음 구조를 나눈다
const VOICES = {
  // 아나빠나사띠: 싱잉볼 계열(비조화 배음)
  bowl: {
    partials: [
      { ratio: 1.0, gain: 1.0 },
      { ratio: 2.76, gain: 0.2 },
      { ratio: 5.4, gain: 0.05 },
    ],
    lowpass: 1600,
  },
  // 요가: 따뜻한 패드(옥타브 위주)
  pad: {
    partials: [
      { ratio: 1.0, gain: 0.6 },
      { ratio: 2.0, gain: 0.25 },
      { ratio: 3.0, gain: 0.1 },
    ],
    lowpass: 900,
  },
}

/**
 * 숨결에 맞춰 다가왔다 멀어지는 패너를 만든다.
 * 브라우저가 AudioParam 방식(positionZ)을 지원하면 부드럽게 움직이고,
 * 구형 Safari 등은 setPosition() 고정 배치로 조용히 물러난다.
 */
export function createBreathPanner(ac, action, durSec) {
  let panner
  try {
    panner = ac.createPanner()
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'inverse'
    panner.refDistance = 0.6
    panner.maxDistance = 6
  } catch {
    return null // 패닝 미지원 — 호출부에서 그냥 건너뛴다
  }

  const near = -0.5
  const far = -2.2
  const from = action === 'inhale' ? far : near
  const to = action === 'inhale' ? near : far

  const now = ac.currentTime
  const d = Math.max(durSec, 0.4)

  if (panner.positionZ && typeof panner.positionZ.setValueAtTime === 'function') {
    panner.positionX.setValueAtTime(0, now)
    panner.positionY.setValueAtTime(0, now)
    panner.positionZ.setValueAtTime(from, now)
    // 멈춤(hold)은 움직이지 않는다 — 지시가 아니라 머무름이므로
    if (action === 'inhale' || action === 'exhale') {
      panner.positionZ.linearRampToValueAtTime(to, now + d)
    }
  } else if (typeof panner.setPosition === 'function') {
    panner.setPosition(0, 0, action === 'hold' ? near : from)
  }

  return panner
}

/**
 * 한 페이즈 길이만큼 이어지는 숨결음.
 * @param {object} o
 * @param {'inhale'|'exhale'|'hold'} o.action
 * @param {number} o.durSec  페이즈 길이(초)
 * @param {number} o.baseFreq 기본 주파수
 * @param {number} o.volume  0~1
 * @param {'bowl'|'pad'} o.voice
 * @returns {{stop:(fade?:number)=>void}}
 */
export function playBreathTone({ action, durSec, baseFreq, volume = 0.34, voice = 'bowl' }) {
  const ac = getAudioContext()
  if (!ac) return { stop: () => {} }

  const cfg = VOICES[voice] || VOICES.bowl
  const now = ac.currentTime
  const d = Math.max(durSec, 0.4)

  const master = ac.createGain()
  const panner = createBreathPanner(ac, action, d)
  if (panner) master.connect(panner).connect(ac.destination)
  else master.connect(ac.destination)

  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = cfg.lowpass
  lp.connect(master)

  // 음높이도 호흡을 따라간다 — 들숨에 살짝 오르고 날숨에 내린다.
  // 폭을 좁게(±6%) 둬야 "지시"가 아니라 "동행"으로 느껴진다.
  const startMul = action === 'inhale' ? 1.0 : 1.06
  const endMul = action === 'inhale' ? 1.12 : 0.94

  const oscs = []
  cfg.partials.forEach((p) => {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(baseFreq * p.ratio * startMul, now)
    if (action !== 'hold') {
      osc.frequency.linearRampToValueAtTime(baseFreq * p.ratio * endMul, now + d)
    }
    const g = ac.createGain()
    g.gain.value = p.gain
    osc.connect(g).connect(lp)
    osc.start(now)
    osc.stop(now + d + 0.5)
    oscs.push(osc)
  })

  // 엔벨로프 — 여기가 핵심. 페이즈 전 구간을 소리가 채운다.
  const eps = 0.0001
  master.gain.setValueAtTime(eps, now)
  if (action === 'inhale') {
    // 천천히 차오르다 끝에서 살짝 머문다
    master.gain.exponentialRampToValueAtTime(volume, now + d * 0.82)
    master.gain.exponentialRampToValueAtTime(eps, now + d + 0.25)
  } else if (action === 'exhale') {
    // 빠르게 열렸다가 끝까지 길게 잦아든다
    master.gain.exponentialRampToValueAtTime(volume, now + Math.min(0.5, d * 0.18))
    master.gain.exponentialRampToValueAtTime(eps, now + d)
  } else {
    // 멈춤 — 낮고 은은하게 깔린다
    master.gain.exponentialRampToValueAtTime(volume * 0.3, now + 0.25)
    master.gain.exponentialRampToValueAtTime(eps, now + d)
  }

  return {
    stop(fade = 0.3) {
      const t = ac.currentTime
      try {
        master.gain.cancelScheduledValues(t)
        master.gain.setValueAtTime(Math.max(master.gain.value, eps), t)
        master.gain.exponentialRampToValueAtTime(eps, t + fade)
        oscs.forEach((o) => o.stop(t + fade + 0.05))
      } catch {
        /* 이미 정지됨 */
      }
    },
  }
}
