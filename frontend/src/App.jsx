import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import PrivateLayout from './components/layout/PrivateLayout'
import PublicLayout from './components/layout/PublicLayout'

// Public pages
import Landing from './pages/Landing'
import Pricing from './pages/Pricing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Private pages
import Dashboard from './pages/Dashboard'
import CreateVideo from './pages/CreateVideo'
import MyVideos from './pages/MyVideos'
import SocialNetworks from './pages/SocialNetworks'
import Affiliates from './pages/Affiliates'
import Settings from './pages/Settings'
import PaymentHistory from './pages/PaymentHistory'

// Components
import Toast from './components/ui/Toast'

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/signin" replace />
}

function PublicOnlyRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <>
      <Toast />
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/precios" element={<Pricing />} />
        </Route>

        <Route path="/signin" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Private routes */}
        <Route element={<PrivateRoute><PrivateLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crear-video" element={<CreateVideo />} />
          <Route path="/mis-videos" element={<MyVideos />} />
          <Route path="/redes-sociales" element={<SocialNetworks />} />
          <Route path="/afiliados" element={<Affiliates />} />
          <Route path="/configuracion" element={<Settings />} />
          <Route path="/pagos" element={<PaymentHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
