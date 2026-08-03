// ============================================================
// 요가 호흡 사운드 (Web Audio 실시간 합성)
// 아나빠나사띠의 싱잉볼과 달리, 따뜻한 "숨결 패드음":
//  - 들숨: 소리가 천천히 차오르며 살짝 높아짐
//  - 날숨: 소리가 천천히 잦아들며 낮아짐
//  - 멈춤: 낮게 은은히
// 파일 없이 합성. bowl.js의 AudioContext를 공유(수정하지 않고 import).
// ============================================================

import { getAudioContext } from './bowl'

// 따뜻한 배음(옥타브 위주) — 부드러운 패드
const PARTIALS = [
  { mult: 1, gain: 0.6 },
  { mult: 2, gain: 0.25 },
  { mult: 3, gain: 0.1 },
]

/**
 * 한 호흡 단계의 숨결음 재생.
 * @param {'inhale'|'exhale'|'hold'} action
 * @param {number} durSec 단계 길이(초)
 * @param {number} volume 0~1
 */
export function playYogaBreath(action, durSec, volume = 0.32) {
  const ac = getAudioContext()
  if (!ac) return { stop: () => {} }

  const now = ac.currentTime
  const master = ac.createGain()
  master.connect(ac.destination)

  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 720
  lp.connect(master)

  // 들숨은 조금 높게, 날숨은 낮게 (따뜻한 저역)
  const base = action === 'exhale' ? 174.61 : action === 'hold' ? 196 : 220
  const oscs = []
  PARTIALS.forEach((p) => {
    const o = ac.createOscillator()
    o.type = 'sine'
    o.frequency.value = base * p.mult
    const g = ac.createGain()
    g.gain.value = p.gain
    o.connect(g).connect(lp)
    o.start(now)
    o.stop(now + durSec + 0.6)
    oscs.push(o)
  })

  const d = Math.max(durSec, 0.6)
  master.gain.setValueAtTime(0.0001, now)
  if (action === 'inhale') {
    // 천천히 차오름
    master.gain.exponentialRampToValueAtTime(volume, now + d * 0.85)
    master.gain.exponentialRampToValueAtTime(0.0001, now + d + 0.4)
  } else if (action === 'exhale') {
    // 빠르게 열렸다 천천히 잦아듦
    master.gain.exponentialRampToValueAtTime(volume, now + 0.35)
    master.gain.exponentialRampToValueAtTime(0.0001, now + d)
  } else {
    // 멈춤: 낮게 은은히
    master.gain.exponentialRampToValueAtTime(volume * 0.35, now + 0.3)
    master.gain.exponentialRampToValueAtTime(0.0001, now + d)
  }

  return {
    stop(fade = 0.3) {
      const t = ac.currentTime
      try {
        master.gain.cancelScheduledValues(t)
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t)
        master.gain.exponentialRampToValueAtTime(0.0001, t + fade)
        oscs.forEach((o) => o.stop(t + fade + 0.05))
      } catch {
        /* 이미 정지 */
      }
    },
  }
}

// 펄스형(카팔라바티/바스트리카)용 짧고 부드러운 숨 소리
export function playYogaPulse(volume = 0.22) {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime
  const master = ac.createGain()
  master.connect(ac.destination)
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  lp.connect(master)
  const o = ac.createOscillator()
  o.type = 'sine'
  o.frequency.value = 200
  o.connect(lp)
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(volume, now + 0.04)
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
  o.start(now)
  o.stop(now + 0.35)
}
