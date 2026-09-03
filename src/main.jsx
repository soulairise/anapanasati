import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PremiumProvider } from './context/PremiumContext'
import App from './App'
import './index.css'

// '/anapanasati/' → '/anapanasati' (BrowserRouter 는 끝 슬래시를 원하지 않는다)
const BASENAME = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/'

// ⚠️ HashRouter(/#/learn) 에서 BrowserRouter(/learn) 로 바꿨다.
//
//    해시 뒤의 경로는 검색엔진이 별개 페이지로 보지 않는다. 즉 구글에게
//    이 사이트는 페이지 하나였다. 16단계 학습·위빠사나·요가호흡 전부
//    검색에 잡히지 않았다. 명상 앱의 주 유입 채널이 검색인데 문이 닫혀 있었다.
//
//    정적 호스팅에서 /learn 을 직접 열면 404 가 나므로 두 가지를 함께 둔다:
//      · GitHub Pages  → dist/404.html (index.html 복사본). scripts/spa-fallback.mjs
//      · Cloudflare Pages → public/_redirects 의 /* /index.html 200
//
//    basename 은 vite 의 BASE_URL 에서 끌어온다. 지금은 /anapanasati/ 이고,
//    커스텀 도메인으로 옮기면 base 를 '/' 로만 바꾸면 코드는 그대로 돌아간다.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={BASENAME}>
      <AuthProvider>
        <PremiumProvider>
          <App />
        </PremiumProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
