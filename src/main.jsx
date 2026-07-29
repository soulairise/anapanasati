import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PremiumProvider } from './context/PremiumContext'
import App from './App'
import './index.css'

// GitHub Pages(정적 호스팅)에서 SPA 라우팅이 404 없이 동작하도록
// HashRouter 사용 (/#/learn 형태). base 경로 설정 부담도 줄여준다.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <PremiumProvider>
          <App />
        </PremiumProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
