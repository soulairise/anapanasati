import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Learn from './pages/Learn'
import StageDetail from './pages/StageDetail'
import Breathe from './pages/Breathe'
import SessionComplete from './pages/SessionComplete'
import Journal from './pages/Journal'
import JournalDetail from './pages/JournalDetail'
import Login from './pages/Login'
import Premium from './pages/Premium'
import PaySuccess from './pages/PaySuccess'
import PayFail from './pages/PayFail'
import YogaBreathing from './pages/YogaBreathing'
import YogaAshtanga from './pages/YogaAshtanga'
import YogaTechnique from './pages/YogaTechnique'
import YogaPractice from './pages/YogaPractice'
import Vipassana from './pages/Vipassana'
import VipassanaSatipatthana from './pages/VipassanaSatipatthana'
import VipassanaDetail from './pages/VipassanaDetail'
import VipassanaSession from './pages/VipassanaSession'
import Metta from './pages/Metta'
import MettaDetail from './pages/MettaDetail'
import MettaSession from './pages/MettaSession'
import Mbsr from './pages/Mbsr'
import MbsrWeek from './pages/MbsrWeek'
import Legal from './pages/Legal'
import SiteFooter from './components/SiteFooter'
import './App.css'

// 로그인 필요한 라우트 보호
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page container">불러오는 중…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:id" element={<StageDetail />} />
          <Route path="/breathe" element={<Breathe />} />
          <Route path="/yoga" element={<YogaBreathing />} />
          <Route path="/yoga/ashtanga" element={<YogaAshtanga />} />
          <Route path="/yoga/:id" element={<YogaTechnique />} />
          <Route path="/yoga/:id/practice" element={<YogaPractice />} />
          <Route path="/vipassana" element={<Vipassana />} />
          <Route path="/vipassana/satipatthana" element={<VipassanaSatipatthana />} />
          <Route path="/vipassana/:id" element={<VipassanaDetail />} />
          <Route path="/vipassana/:id/practice" element={<VipassanaSession />} />
          <Route path="/metta" element={<Metta />} />
          <Route path="/metta/:id" element={<MettaDetail />} />
          <Route path="/metta/:id/practice" element={<MettaSession />} />
          <Route path="/mbsr" element={<Mbsr />} />
          <Route path="/mbsr/week/:n" element={<MbsrWeek />} />
          <Route path="/legal/:slug" element={<Legal />} />
          <Route path="/complete" element={<SessionComplete />} />
          <Route path="/login" element={<Login />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/pay/success" element={<PaySuccess />} />
          <Route path="/pay/fail" element={<PayFail />} />
          <Route
            path="/journal"
            element={
              <Protected>
                <Journal />
              </Protected>
            }
          />
          <Route
            path="/journal/:id"
            element={
              <Protected>
                <JournalDetail />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  )
}
