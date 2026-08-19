import { Link } from 'react-router-dom'
import { BUSINESS, biz } from '../data/legal'

// 전자상거래법 제10조 — 상호·대표자·주소·연락처·사업자등록번호·이용약관을
// "초기 화면"에 표시해야 한다. 모바일은 순차 표시가 허용되므로 접어 둔다.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="faint site-footer__tagline">
          숨결의 길 · Ānāpānasati Path — 들숨과 날숨, 그 사이의 알아차림
        </p>

        <nav className="site-footer__links">
          <Link to="/legal/terms">이용약관</Link>
          <Link to="/legal/terms-payment">유료서비스 약관</Link>
          <Link to="/legal/privacy"><b>개인정보처리방침</b></Link>
        </nav>

        <details className="site-footer__biz">
          <summary>사업자 정보</summary>
          <p>
            {biz('name')} · 대표 {biz('ceo')} · 사업자등록번호 {biz('regNo')}
            <br />
            {biz('address')}
            <br />
            전화 {biz('tel')} · 이메일 {BUSINESS.email}
            <br />
            통신판매업 신고 {biz('salesNo')} · 호스팅 제공 {BUSINESS.host}
          </p>
        </details>
      </div>
    </footer>
  )
}
