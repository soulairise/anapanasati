import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import './Navbar.css'

// 수련 메뉴 — 실제로 "앉아서 하는" 것들을 한 곳에 모은다.
// 링크를 나란히 늘리면 모바일에서 마지막 항목이 잘린다(375px에서 실측 확인).
// 위빠사나·자애가 여기에 추가된다.
const PRACTICE_LINKS = [
  { to: '/breathe', label: '호흡하기', hint: '숨을 지켜보기' },
  { to: '/yoga', label: '요가 호흡', hint: '숨을 다스리기' },
  { to: '/vipassana', label: '관찰 수행', hint: '있는 그대로 보기' },
  { to: '/metta', label: '마음 나누기', hint: '잘되기를 바라기' },
  { to: '/mbsr', label: '8주 마음챙김', hint: '순서대로 걷기' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { isPremium } = usePremium()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // 화면을 옮기면 닫는다
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 바깥을 누르거나 ESC를 누르면 닫는다 (터치 기기 포함)
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const practiceActive = PRACTICE_LINKS.some((l) => pathname.startsWith(l.to))

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="brand-icon">🌬️</span>
          <span className="brand-text">숨결의 길</span>
          {/* 팔리어 병기 제거 — 표면(1층)에는 전통 용어를 쓰지 않는다.
              전통은 학습·상세 화면(2층)에서 드러낸다. 근거: docs/PRODUCT_STRATEGY.md 2-3 */}
        </NavLink>

        <div className="navbar__links">
          <NavLink to="/learn" className="navbar__link">배우기</NavLink>

          <div className="navbar__menu" ref={menuRef}>
            <button
              type="button"
              className={`navbar__link navbar__menu-btn ${practiceActive ? 'active' : ''}`}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              수련
              <span className={`navbar__caret ${open ? 'is-open' : ''}`} aria-hidden="true">▾</span>
            </button>

            {open && (
              <div className="navbar__dropdown" role="menu">
                {PRACTICE_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    role="menuitem"
                    className={({ isActive }) =>
                      `navbar__dropdown-item ${isActive ? 'is-current' : ''}`
                    }
                  >
                    <span className="navbar__dropdown-label">{l.label}</span>
                    <span className="navbar__dropdown-hint">{l.hint}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/journal" className="navbar__link">수행일지</NavLink>
          <NavLink to="/premium" className="navbar__link navbar__link--premium">
            {isPremium ? '프리미엄 ✓' : '프리미엄'}
          </NavLink>
          {user ? (
            <button className="navbar__link" onClick={signOut} title={user.email}>
              나가기
            </button>
          ) : (
            <NavLink to="/login" className="navbar__link">로그인</NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
