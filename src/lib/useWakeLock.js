import { useEffect, useRef } from 'react'

// ============================================================
// 화면 켜둠 유지 (Screen Wake Lock API)
//
// 왜 필수인가:
//   눈감기 모드로 화면을 어둡게 하면 사용자는 폰을 엎어놓거나 잠근다.
//   그런데 iOS는 화면이 잠기면 Web Audio를 즉시 중단시킨다 — 명상 도중
//   소리가 끊긴다. 그래서 눈감기 모드와 Wake Lock은 한 세트다.
//
// 지원: iOS/iPadOS 16.4+ (16.6부터 완전), Android Chrome ✅.
//   미지원 기기에서는 조용히 실패하고 호출부가 안내 문구를 띄운다.
//
// 주의: 탭이 백그라운드로 가면 자동 해제되므로 visibilitychange에서 재획득한다.
// ============================================================

export const wakeLockSupported = () =>
  typeof navigator !== 'undefined' && 'wakeLock' in navigator

/** @param {boolean} active 켜둘지 여부 (수행 중일 때 true) */
export function useWakeLock(active) {
  const lockRef = useRef(null)

  useEffect(() => {
    if (!active || !wakeLockSupported()) return

    let cancelled = false

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          lock.release().catch(() => {})
          return
        }
        lockRef.current = lock
        // 사용자가 직접 잠그면 해제된다. 참조만 비워 둔다.
        lock.addEventListener('release', () => {
          lockRef.current = null
        })
      } catch {
        /* 권한 거부·미지원 — 안내는 호출부가 담당 */
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !lockRef.current) acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      if (lockRef.current) {
        lockRef.current.release().catch(() => {})
        lockRef.current = null
      }
    }
  }, [active])
}
