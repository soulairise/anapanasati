import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/store'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 최초 세션 확인
    auth.getUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
    // 로그인/로그아웃 상태 변화 실시간 반영
    const unsubscribe = auth.onChange((u) => setUser(u))
    return unsubscribe
  }, [])

  const signUp = (email, password) => auth.signUp(email, password)
  const signIn = (email, password) => auth.signIn(email, password)
  const signOut = async () => {
    await auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
