// ============================================================
// 배경 앰비언트 사운드 (Web Audio 실시간 합성)
// - 파도(ocean): 필터링된 노이즈 + 느린 LFO로 밀려왔다 빠지는 물결
// - 모닥불(campfire): 낮은 웅웅거림 + 랜덤 '탁탁' 크래클
// 오디오 파일 없이 합성 → 로딩/용량 0. 싱잉볼과 같은 AudioContext 공유.
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

// ---------- 컨트롤러 ----------
export const AMBIENT_LABELS = {
  ocean: '🌊 파도',
  campfire: '🔥 모닥불',
}

/**
 * 파도/모닥불 중 랜덤으로 하나를 재생.
 * @returns {{kind:'ocean'|'campfire', stop:(fade?:number)=>void}}
 */
export function createAmbient(volume = 0.3) {
  const ac = getAudioContext()
  if (!ac) return { kind: null, stop: () => {} }

  const master = ac.createGain()
  master.gain.value = volume
  master.connect(ac.destination)

  // 파도 소리만 사용 (모닥불은 비활성화)
  const kind = 'ocean'
  const layer = createOcean(ac, master)

  return {
    kind,
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
