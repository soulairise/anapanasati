import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

// ============================================================
// 프리미엄 구독 상태
// - 로그인 시: Supabase profiles.is_premium 을 우선 조회 (실결제 반영)
// - profiles 테이블/행이 없거나 비로그인: localStorage 데모 값으로 폴백
// 실제 결제(토스) 승인은 Edge Function이 profiles.is_premium 을 갱신한다.
// ============================================================

const PremiumContext = createContext(null)
const keyFor = (u) => `anapanasati.premium.${u?.id || 'guest'}`

export function PremiumProvider({ children }) {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)

  const readLocal = (u) => {
    try {
      return localStorage.getItem(keyFor(u)) === '1'
    } catch {
      return false
    }
  }

  useEffect(() => {
    let active = true
    async function load() {
      if (user) {
        // Supabase profiles 우선
        const { data, error } = await supabase
          .from('profiles')
          .select('is_premium, premium_until')
          .eq('id', user.id)
          .maybeSingle()
        if (!active) return
        if (!error && data) {
          const stillValid =
            data.is_premium && (!data.premium_until || new Date(data.premium_until) > new Date())
          setIsPremium(!!stillValid || readLocal(user)) // 로컬 데모도 OR로 인정
          return
        }
      }
      setIsPremium(readLocal(user)) // 폴백
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  // 데모/즉시 반영용 (결제 성공 페이지·데모 버튼에서 호출)
  const setPremium = (val) => {
    try {
      if (val) localStorage.setItem(keyFor(user), '1')
      else localStorage.removeItem(keyFor(user))
    } catch {
      /* noop */
    }
    setIsPremium(!!val)
  }

  return (
    <PremiumContext.Provider value={{ isPremium, setPremium }}>
      {children}
    </PremiumContext.Provider>
  )
}

export const usePremium = () => useContext(PremiumContext)
