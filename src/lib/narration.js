// ============================================================
// 음성 안내 (녹음 파일 재생)
// Web Speech(TTS)는 기기·브라우저 편차가 커서 소리가 안 나는 경우가 많아,
// 실제 음성 파일을 재생한다 → 모든 기기에서 안정적.
//
// 한국어 앱에서 영어 "inhale/hold/exhale"이 나오면 몰입이 깨진다.
// 한국어 음성(ko-*.mp3)이 있으면 그걸 쓰고, 아직 없으면 기존 영어로 폴백한다.
// 한국어 음성 생성: node scripts/gen-narration.mjs
// (나중에 직접 녹음한 파일로 교체하면 코드 변경 없이 그대로 바뀐다)
// ============================================================

import inhaleUrl from '../assets/audio/inhale.mp3'
import holdUrl from '../assets/audio/hold.mp3'
import exhaleUrl from '../assets/audio/exhale.mp3'

// Vite: 없는 파일을 import하면 빌드가 깨지므로 glob으로 "있으면 쓴다"를 구현한다.
const koFiles = import.meta.glob('../assets/audio/ko-*.mp3', { eager: true, query: '?url', import: 'default' })
const ko = (name) => koFiles[`../assets/audio/ko-${name}.mp3`]

export const isKorean = Boolean(ko('inhale') && ko('hold') && ko('exhale'))

const SOURCES = isKorean
  ? { inhale: ko('inhale'), hold: ko('hold'), exhale: ko('exhale') }
  : { inhale: inhaleUrl, hold: holdUrl, exhale: exhaleUrl }

// 화면 안내 문구에 쓸 실제 발화 내용
export const SPOKEN = isKorean
  ? { inhale: '들이쉽니다', hold: '머뭅니다', exhale: '내쉽니다' }
  : { inhale: 'inhale', hold: 'hold', exhale: 'exhale' }
const cache = {}

function getAudio(word) {
  if (!cache[word]) {
    const a = new Audio(SOURCES[word])
    a.preload = 'auto'
    a.volume = 1.0
    cache[word] = a
  }
  return cache[word]
}

// 사용자 제스처(시작 버튼) 시점에 호출 — 모바일 자동재생 잠금 해제
export function primeNarration() {
  Object.keys(SOURCES).forEach((w) => {
    const a = getAudio(w)
    try {
      a.muted = true
      const p = a.play()
      if (p && p.then) {
        p.then(() => {
          a.pause()
          a.currentTime = 0
          a.muted = false
        }).catch(() => {
          a.muted = false
        })
      }
    } catch {
      a.muted = false
    }
  })
}

// 한 단어 안내 재생 (inhale / hold / exhale)
export function speak(word) {
  if (!SOURCES[word]) return
  const a = getAudio(word)
  try {
    a.muted = false
    a.currentTime = 0
    const p = a.play()
    if (p && p.catch) p.catch(() => {})
  } catch {
    /* noop */
  }
}

export function stopNarration() {
  Object.values(cache).forEach((a) => {
    try {
      a.pause()
      a.currentTime = 0
    } catch {
      /* noop */
    }
  })
}

// 페이즈별 안내 단어 (들숨·멈춤·날숨·멈춤)
export const PHASE_WORDS = ['inhale', 'hold', 'exhale', 'hold']
export const hasSpeech = true
