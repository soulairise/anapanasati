import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

// ============================================================
// 프리미엄 이용 상태
//
// 체험·쿠폰·결제가 전부 profiles.premium_until 한 칸에 기간을 적는다.
// 그래서 여기서는 "언제까지인가" 하나만 보면 된다.
//
// ⚠️ 예전에는 localStorage 값을 OR로 인정했다. 개발자도구에서 값 하나만
//    넣으면 프리미엄이 열리는 상태였다. 실결제를 여는 이상 그대로 둘 수 없어
//    걷어냈다. 체험이 생겼으니 데모용 우회로도 더는 필요 없다.
// ============================================================

const PremiumContext = createContext(null)

const DAY = 86400000

export function PremiumProvider({ children }) {
  const { user } = useAuth()
  const [state, setState] = useState({
    isPremium: false,
    until: null,
    source: null, // trial | coupon | payment
    loading: true,
  })

  const load = useCallback(async () => {
    if (!user) {
      setState({ isPremium: false, until: null, source: null, loading: false })
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium, premium_until, premium_source')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !data) {
      setState({ isPremium: false, until: null, source: null, loading: false })
      return
    }
    const until = data.premium_until ? new Date(data.premium_until) : null
    // 기간이 지났으면 is_premium 이 true로 남아 있어도 열어주지 않는다.
    // 만료를 청소하는 배치가 없으므로 읽는 쪽에서 판단한다.
    const alive = Boolean(data.is_premium && until && until > new Date())
    setState({
      isPremium: alive,
      until: alive ? until : null,
      source: alive ? data.premium_source : null,
      loading: false,
    })
  }, [user])

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true }))
    load().then(() => {
      if (!active) return
    })
    return () => {
      active = false
    }
  }, [load])

  // 쿠폰 사용 — 검증과 기간 부여는 전부 서버(redeem_coupon)에서 한다.
  // 프론트에서 하면 조작된다.
  const redeemCoupon = useCallback(
    async (code) => {
      const { data, error } = await supabase.rpc('redeem_coupon', { p_code: code })
      if (error) return { ok: false, reason: 'error', message: error.message }
      if (data?.ok) await load()
      return data ?? { ok: false, reason: 'error' }
    },
    [load],
  )

  // 남은 날짜 — 올림한다. 반나절 남았는데 "0일"이라고 하면 이미 끝난 것처럼 보인다.
  const daysLeft = state.until
    ? Math.max(0, Math.ceil((state.until.getTime() - Date.now()) / DAY))
    : 0

  return (
    <PremiumContext.Provider
      value={{
        isPremium: state.isPremium,
        premiumUntil: state.until,
        source: state.source,
        isTrial: state.source === 'trial',
        loading: state.loading,
        daysLeft,
        redeemCoupon,
        refresh: load,
      }}
    >
      {children}
    </PremiumContext.Provider>
  )
}

export const usePremium = () => useContext(PremiumContext)
