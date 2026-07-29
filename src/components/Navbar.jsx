import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { isPremium } = usePremium()

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="brand-icon">🌬️</span>
          <span className="brand-text">숨결의 길</span>
          <span className="sub faint" style={{ fontWeight: 300, fontSize: '0.8rem' }}>Ānāpānasati</span>
        </NavLink>
        <div className="navbar__links">
          <NavLink to="/learn" className="navbar__link">배우기</NavLink>
          <NavLink to="/breathe" className="navbar__link">호흡하기</NavLink>
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
