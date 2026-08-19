// ============================================================
// 마이크로 날숨 감지 (선택 기능)
//
// 왜 이것만 하는가:
//   호흡 시각화 연구(JMIR 2021, n=170)에서 화면을 예쁘게 만드는 것은 효과감·재방문
//   의사를 못 올렸고, 저자들은 그 이유를 "보여주기만 하고 상호작용이 없어서"로 지목했다.
//   마이크로 날숨을 잡으면 오브가 "내 숨"에 반응한다 — 그 빈칸을 메우는 유일하게
//   실현 가능한 수단이다(카메라 심박은 iOS가 플래시 제어를 지원하지 않아 막혀 있다).
//
// 왜 날숨만인가:
//   들숨은 소리가 거의 없어 사람 채점자도 놓친다(연구에서 F1 0.63). 날숨은 마찰음이
//   광대역으로 실려 임계값만으로도 잡힌다. 정확한 분류(ML)를 포기하고 반응성만 취한다.
//
// 한계 (사용자에게 그대로 알린다):
//   - 블루투스 헤드셋은 노이즈 억제가 호흡음을 지워버린다 → 기기 마이크 권장
//   - 아주 조용한 코호흡은 안 잡힌다. 우리는 코호흡을 가르치는 앱이라 특히 그렇다
//   - 그래서 실패해도 수행이 끊기지 않게, 타이머 모드로 조용히 되돌아간다
//
// 프라이버시: 오디오는 브라우저 밖으로 나가지 않는다. 녹음도 저장도 하지 않고
//   주파수 대역 에너지만 읽는다.
// ============================================================

const BAND_LOW_HZ = 300
const BAND_HIGH_HZ = 4000

export const micSupported = () =>
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function'

/**
 * 마이크를 열고 날숨 세기를 0~1로 흘려보낸다.
 * @param {object} o
 * @param {(level:number)=>void} o.onLevel  0~1 (보정된 날숨 세기)
 * @param {(err:string)=>void} [o.onError]
 * @returns {Promise<{stop:()=>void, calibrating:()=>boolean}>}
 */
export async function startBreathMic({ onLevel, onError }) {
  if (!micSupported()) {
    onError?.('이 브라우저는 마이크를 지원하지 않습니다.')
    return { stop: () => {}, calibrating: () => false }
  }

  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        // 노이즈 억제·자동이득은 호흡음을 지워버린다. 반드시 끈다.
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })
  } catch (e) {
    onError?.(
      e?.name === 'NotAllowedError'
        ? '마이크 권한이 필요합니다. 허용하지 않으셔도 수행은 그대로 진행됩니다.'
        : '마이크를 열 수 없습니다. 수행은 그대로 진행됩니다.',
    )
    return { stop: () => {}, calibrating: () => false }
  }

  const AC = window.AudioContext || window.webkitAudioContext
  const ac = new AC()
  const src = ac.createMediaStreamSource(stream)
  const analyser = ac.createAnalyser()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0.6
  src.connect(analyser)

  const bins = new Uint8Array(analyser.frequencyBinCount)
  const hzPerBin = ac.sampleRate / analyser.fftSize
  const loBin = Math.floor(BAND_LOW_HZ / hzPerBin)
  const hiBin = Math.min(analyser.frequencyBinCount - 1, Math.ceil(BAND_HIGH_HZ / hzPerBin))

  // 첫 3초는 주변 소음 바닥을 잰다. 조용한 방과 카페의 기준이 다르기 때문이다.
  let floor = null
  const samples = []
  const startedAt = performance.now()
  const CALIBRATE_MS = 3000
  let raf = 0
  let stopped = false
  let smooth = 0

  const readBand = () => {
    analyser.getByteFrequencyData(bins)
    let sum = 0
    for (let i = loBin; i <= hiBin; i++) sum += bins[i]
    return sum / (hiBin - loBin + 1) / 255 // 0~1
  }

  const tick = () => {
    if (stopped) return
    const raw = readBand()

    if (floor === null) {
      samples.push(raw)
      if (performance.now() - startedAt >= CALIBRATE_MS) {
        samples.sort((a, b) => a - b)
        // 중앙값을 바닥으로. 평균은 순간 소음에 끌려간다.
        floor = samples[Math.floor(samples.length / 2)]
      }
      onLevel(0)
    } else {
      // 바닥 위로 얼마나 솟았는지만 본다
      const over = Math.max(0, raw - floor)
      const norm = Math.min(1, over / 0.16)
      // 톱니 방지: 오를 땐 빠르게, 내릴 땐 천천히
      smooth = norm > smooth ? smooth + (norm - smooth) * 0.5 : smooth + (norm - smooth) * 0.12
      onLevel(smooth)
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return {
    stop() {
      stopped = true
      cancelAnimationFrame(raf)
      stream.getTracks().forEach((t) => t.stop())
      ac.close().catch(() => {})
    },
    calibrating: () => floor === null,
  }
}
