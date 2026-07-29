// ============================================================
// 음성 안내 (녹음 파일 재생)
// Web Speech(TTS)는 기기·브라우저 편차가 커서 소리가 안 나는 경우가 많아,
// 실제 녹음 음성(inhale/hold/exhale, m4a)을 재생한다 → 모든 기기에서 안정적.
// ============================================================

import inhaleUrl from '../assets/audio/inhale.mp3'
import holdUrl from '../assets/audio/hold.mp3'
import exhaleUrl from '../assets/audio/exhale.mp3'

const SOURCES = { inhale: inhaleUrl, hold: holdUrl, exhale: exhaleUrl }
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
