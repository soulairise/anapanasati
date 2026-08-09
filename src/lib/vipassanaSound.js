// ============================================================
// 관찰 수행 사운드 (Web Audio 실시간 합성)
//
// 아나빠나사띠 = 싱잉볼(호흡 박자), 요가 = 숨결 패드음(호흡 지시)와 달리
// 관찰 수행의 소리는 "박자를 지시하지 않는다".
// 구간이 바뀌거나 알아차림을 환기할 때 한 번 울리고 길게 사라지는 종(bell)만 쓴다.
// 사라지는 소리 자체가 무상(anicca)의 안내가 된다.
//
// bowl.js의 AudioContext를 공유한다 (bowl.js는 수정하지 않고 import만).
// ============================================================

import { getAudioContext } from './bowl'

// 종은 배음이 정수배가 아니다(inharmonic). 이 비율이 "댕—" 하는 금속 울림을 만든다.
const BELL_PARTIALS = [
  { mult: 0.56, gain: 0.55, decay: 1.0 },
  { mult: 1.0, gain: 1.0, decay: 1.0 },
  { mult: 1.19, gain: 0.42, decay: 0.85 },
  { mult: 1.71, gain: 0.28, decay: 0.6 },
  { mult: 2.0, gain: 0.2, decay: 0.5 },
  { mult: 2.74, gain: 0.12, decay: 0.35 },
]

/**
 * 관찰의 종. 한 번 치고 길게 사라진다.
 * @param {object} opts
 * @param {number} opts.freq   기본 주파수(Hz). 낮을수록 무겁다.
 * @param {number} opts.volume 0~1
 * @param {number} opts.decay  전체 여운(초)
 */
export function playBell({ freq = 261.63, volume = 0.3, decay = 7 } = {}) {
  const ac = getAudioContext()
  if (!ac) return

  const now = ac.currentTime
  const master = ac.createGain()
  master.gain.value = volume
  master.connect(ac.destination)

  // 금속성 고역을 부드럽게 깎아 귀에 거슬리지 않게
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 3200
  lp.connect(master)

  BELL_PARTIALS.forEach((p) => {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq * p.mult

    const g = ac.createGain()
    // 타격음: 즉시 솟았다가 지수적으로 사라진다
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(p.gain, now + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, now + decay * p.decay)

    osc.connect(g).connect(lp)
    osc.start(now)
    osc.stop(now + decay * p.decay + 0.1)
  })
}

/** 구간이 바뀔 때 — 더 높고 짧게, 흐름을 끊지 않을 정도로만 */
export function playSoftChime(volume = 0.16) {
  playBell({ freq: 392, volume, decay: 3.2 })
}

/** 수행을 마칠 때 — 낮고 길게 */
export function playClosingBell(volume = 0.32) {
  playBell({ freq: 196, volume, decay: 9 })
}

/** 경행 3박자 표시 — 아주 짧은 나무 소리(딱). 박자를 "지시"하지 않고 뒤따라 표시만 한다. */
export function playStepTick(volume = 0.12) {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  const master = ac.createGain()
  master.gain.value = volume
  master.connect(ac.destination)

  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 900
  bp.Q.value = 2.5
  bp.connect(master)

  const osc = ac.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(760, now)
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.09)

  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(1, now + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

  osc.connect(g).connect(bp)
  osc.start(now)
  osc.stop(now + 0.16)
}
