import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { resolveFace, storeFace, faceInQuery } from '../lib/face'

// ============================================================
// 해와 달 — 앱 전체가 아는 상태
//
// 두 가지가 서로 다른 범위로 움직인다. 헷갈리기 쉬워 여기 적어 둔다.
//
//   ① 팔레트(색)   — 홈에서만 바뀐다. 안쪽 화면은 하나의 얼굴로 둔다.
//                    안쪽 화면들은 어두운 색을 맞춰두지 않았다.
//   ② 배경의 해·달 — 어디서나 따라다닌다. 밤에 들어온 사람에게는
//                    수행 화면에서도 달이 함께 있는 편이 자연스럽다.
// ============================================================

const FaceContext = createContext(null)

export function FaceProvider({ children }) {
  const { search, pathname } = useLocation()
  const [face, setFace] = useState(() => resolveFace(search))
  const isHome = pathname === '/'

  // 주소로 얼굴이 지정되면 그때마다 따른다.
  // useState 초기화 함수는 처음 한 번만 돈다. 이게 없으면 앱 안에서
  // ?sun 링크를 눌러도 화면이 그대로다 — 전체 새로고침일 때만 먹혔다.
  useEffect(() => {
    const wanted = faceInQuery(search)
    if (wanted) {
      setFace(wanted)
      storeFace(wanted)
    }
  }, [search])

  // 팔레트는 홈에서만. 나갈 때 반드시 뗀다.
  useEffect(() => {
    const root = document.documentElement
    if (isHome && face === 'moon') root.setAttribute('data-face', 'moon')
    else root.removeAttribute('data-face')
    return () => root.removeAttribute('data-face')
  }, [face, isHome])

  // 홈(v3)은 늘 어둡다. 상단바와 푸터는 전역 토큰을 쓰는 공통 부품이라
  // 그대로 두면 어두운 화면 위에 미색 띠가 얹힌다.
  // 화면 CSS 11개를 건드리지 않고 크롬만 맞추기 위해 뿌리에 표시를 남긴다.
  // ⚠️ 안쪽 27개 화면은 아직 미색이다. 전체 이관은 별도 작업.
  useEffect(() => {
    const root = document.documentElement
    if (isHome) root.setAttribute('data-chrome', 'dark')
    else root.removeAttribute('data-chrome')
    return () => root.removeAttribute('data-chrome')
  }, [isHome])

  const toggleFace = () => {
    const next = face === 'moon' ? 'sun' : 'moon'
    setFace(next)
    storeFace(next)
  }

  return (
    <FaceContext.Provider value={{ face, isHome, toggleFace }}>{children}</FaceContext.Provider>
  )
}

export const useFace = () => useContext(FaceContext)
