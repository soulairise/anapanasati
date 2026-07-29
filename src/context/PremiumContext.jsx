import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

// ============================================================
// 프리미엄 구독 상태
// 지금은 데모용으로 localStorage에 저장한다.
// 실제 결제(토스페이먼츠) 연동 시 → 결제 성공 webhook이
// Supabase profiles.is_premium 를 갱신하고, 여기서 그 값을 읽도록 교체.
// ============================================================

const PremiumContext = createContext(null)
const keyFor = (u) => `anapanasati.premium.${u?.id || 'guest'}`

export function PremiumProvider({ children }) {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    try {
      setIsPremium(localStorage.getItem(keyFor(user)) === '1')
    } catch {
      setIsPremium(false)
    }
  }, [user])

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
