// ============================================================
// 배경 앰비언트 사운드 (Web Audio 실시간 합성)
// - 파도(ocean):     필터링된 노이즈 + 느린 LFO로 밀려왔다 빠지는 물결
// - 모닥불(campfire): 낮은 웅웅거림 + 랜덤 '탁탁' 크래클
// - 빗소리(rain):    넓은 대역 노이즈(쏴) + 불규칙한 물방울 '톡'
// - 숲(forest):      낮은 바람 + 이따금 지나가는 새소리
//
// 오디오 파일 없이 합성 → 로딩/용량 0. 싱잉볼과 같은 AudioContext 공유.
// 파일을 쓰면 4종에 수 MB가 붙고 첫 재생이 끊긴다. 합성은 즉시 나온다.
//
// 파도는 무료다(원래 그랬다). 나머지 3종이 프리미엄이다.
// 지금 듣던 사람에게서 뺏지 않고, 고를 수 있는 것을 더한다.
// ============================================================

import { getAudioContext } from './bowl'

// 재사용 화이트 노이즈 버퍼 (2초 루프)
let noiseBuffer = null
function getNoiseBuffer(ac) {
  if (noiseBuffer) return noiseBuffer
  const len = ac.sampleRate * 2
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  noiseBuffer = buf
  return buf
}

function noiseSource(ac) {
  const src = ac.createBufferSource()
  src.buffer = getNoiseBuffer(ac)
  src.loop = true
  return src
}

// ---------- 파도 소리 ----------
function createOcean(ac, out) {
  const src = noiseSource(ac)
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 620
  lp.Q.value = 0.6

  const gain = ac.createGain()
  gain.gain.value = 0.22 // 기본 음량 (LFO가 위아래로 흔듦)

  src.connect(lp).connect(gain).connect(out)

  // 물결 밀려오고 빠지는 느낌 (게인 LFO, ~9초 주기)
  const lfo = ac.createOscillator()
  lfo.frequency.value = 0.11
  const lfoDepth = ac.createGain()
  lfoDepth.gain.value = 0.18
  lfo.connect(lfoDepth).connect(gain.gain)

  // 필터 스윕으로 '쏴아' 하는 질감 (별도 주기)
  const lfo2 = ac.createOscillator()
  lfo2.frequency.value = 0.08
  const lfo2Depth = ac.createGain()
  lfo2Depth.gain.value = 260
  lfo2.connect(lfo2Depth).connect(lp.frequency)

  src.start()
  lfo.start()
  lfo2.start()

  return {
    stop() {
      try {
        src.stop()
        lfo.stop()
        lfo2.stop()
      } catch {
        /* 이미 정지 */
      }
    },
  }
}

// ---------- 모닥불 소리 ----------
function createCampfire(ac, out) {
  // 낮은 웅웅거림 (불의 저음)
  const src = noiseSource(ac)
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 440
  const base = ac.createGain()
  base.gain.value = 0.13
  src.connect(lp).connect(base).connect(out)
  src.start()

  // 랜덤 '탁탁' 크래클 — 짧은 노이즈 버스트를 불규칙 간격으로
  let stopped = false
  let timer = null
  const crackle = () => {
    if (stopped) return
    const b = noiseSource(ac)
    const bp = ac.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1400 + Math.random() * 2600
    bp.Q.value = 1.1
    const g = ac.createGain()
    const now = ac.currentTime
    const amp = 0.05 + Math.random() * 0.2
    const dur = 0.03 + Math.random() * 0.07
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(amp, now + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    b.connect(bp).connect(g).connect(out)
    b.start(now)
    b.stop(now + dur + 0.05)
    timer = setTimeout(crackle, 40 + Math.random() * 280)
  }
  crackle()

  return {
    stop() {
      stopped = true
      if (timer) clearTimeout(timer)
      try {
        src.stop()
      } catch {
        /* 이미 정지 */
      }
    },
  }
}

// ---------- 빗소리 ----------
function createRain(ac, out) {
  // 쏴- 하는 바탕. 파도보다 대역을 넓게 잡아야 '물이 떨어지는' 느낌이 난다.
  const src = noiseSource(ac)
  const hp = ac.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 420
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 5200
  const base = ac.createGain()
  base.gain.value = 0.16
  src.connect(hp).connect(lp).connect(base).connect(out)

  // 빗줄기가 굵어졌다 가늘어졌다 (아주 느리게)
  const lfo = ac.createOscillator()
  lfo.frequency.value = 0.05
  const depth = ac.createGain()
  depth.gain.value = 0.05
  lfo.connect(depth).connect(base.gain)

  src.start()
  lfo.start()

  // 처마에서 떨어지는 물방울 '톡' — 짧은 사인 하강음
  let stopped = false
  let timer = null
  const drop = () => {
    if (stopped) return
    const osc = ac.createOscillator()
    const g = ac.createGain()
    const now = ac.currentTime
    const f = 700 + Math.random() * 900
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, now)
    osc.frequency.exponentialRampToValueAtTime(f * 0.55, now + 0.09)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.03 + Math.random() * 0.03, now + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
    osc.connect(g).connect(out)
    osc.start(now)
    osc.stop(now + 0.16)
    timer = setTimeout(drop, 300 + Math.random() * 2200)
  }
  timer = setTimeout(drop, 800)

  return {
    stop() {
      stopped = true
      if (timer) clearTimeout(timer)
      try {
        src.stop()
        lfo.stop()
      } catch {
        /* 이미 정지 */
      }
    },
  }
}

// ---------- 숲 ----------
function createForest(ac, out) {
  // 나뭇잎을 스치는 바람 — 파도보다 더 낮고 조용하게
  const src = noiseSource(ac)
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  const base = ac.createGain()
  base.gain.value = 0.09
  src.connect(lp).connect(base).connect(out)

  const lfo = ac.createOscillator()
  lfo.frequency.value = 0.07
  const depth = ac.createGain()
  depth.gain.value = 0.05
  lfo.connect(depth).connect(base.gain)

  const sweep = ac.createOscillator()
  sweep.frequency.value = 0.045
  const sweepDepth = ac.createGain()
  sweepDepth.gain.value = 380
  sweep.connect(sweepDepth).connect(lp.frequency)

  src.start()
  lfo.start()
  sweep.start()

  // 새소리 — 2~3음절로 짧게 지저귄다. 너무 자주 나오면 명상에 방해가 되므로
  // 간격을 넉넉히(6~20초) 둔다.
  let stopped = false
  let timer = null
  const chirp = () => {
    if (stopped) return
    const notes = 2 + Math.floor(Math.random() * 2)
    const start = ac.currentTime + 0.02
    const f0 = 2100 + Math.random() * 1400
    for (let i = 0; i < notes; i++) {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      const t = start + i * (0.07 + Math.random() * 0.05)
      const f = f0 * (1 + (Math.random() - 0.5) * 0.25)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, t)
      osc.frequency.exponentialRampToValueAtTime(f * (1.15 + Math.random() * 0.3), t + 0.05)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.02 + Math.random() * 0.02, t + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
      osc.connect(g).connect(out)
      osc.start(t)
      osc.stop(t + 0.1)
    }
    timer = setTimeout(chirp, 6000 + Math.random() * 14000)
  }
  timer = setTimeout(chirp, 3000 + Math.random() * 4000)

  return {
    stop() {
      stopped = true
      if (timer) clearTimeout(timer)
      try {
        src.stop()
        lfo.stop()
        sweep.stop()
      } catch {
        /* 이미 정지 */
      }
    },
  }
}

// ---------- 컨트롤러 ----------
// 파도는 무료다. 원래 무료였으니 그대로 둔다.
// 나머지 3종을 프리미엄으로 얹는다 — 뺏는 것 없이 고를 것을 더한다.
export const AMBIENT_KINDS = [
  { key: 'ocean', label: '🌊 파도', premium: false },
  { key: 'rain', label: '🌧️ 빗소리', premium: true },
  { key: 'forest', label: '🌲 숲', premium: true },
  { key: 'campfire', label: '🔥 모닥불', premium: true },
]

export const AMBIENT_LABELS = Object.fromEntries(
  AMBIENT_KINDS.map((k) => [k.key, k.label]),
)

const BUILDERS = {
  ocean: createOcean,
  rain: createRain,
  forest: createForest,
  campfire: createCampfire,
}

/**
 * 배경음을 하나 재생한다.
 * @param {number} volume
 * @param {'ocean'|'rain'|'forest'|'campfire'} kind 모르는 값이면 파도로 떨어진다.
 * @returns {{kind:string, stop:(fade?:number)=>void}}
 */
export function createAmbient(volume = 0.3, kind = 'ocean') {
  const ac = getAudioContext()
  if (!ac) return { kind: null, stop: () => {} }

  const master = ac.createGain()
  master.gain.value = volume
  master.connect(ac.destination)

  const build = BUILDERS[kind] || createOcean
  const used = BUILDERS[kind] ? kind : 'ocean'
  const layer = build(ac, master)

  return {
    kind: used,
    stop(fade = 0.8) {
      const t = ac.currentTime
      try {
        master.gain.cancelScheduledValues(t)
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t)
        master.gain.exponentialRampToValueAtTime(0.0001, t + fade)
      } catch {
        /* noop */
      }
      setTimeout(() => layer.stop(), fade * 1000 + 120)
    },
  }
}
