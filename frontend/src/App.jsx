import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './contexts/UserContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Explore from './pages/Explore'
import Watchlist from './pages/Watchlist'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import { UserProvider } from './contexts/UserContext'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="bg-primary-900 min-h-screen flex items-center justify-center">
        <div className="text-4xl">⏳</div>
      </div>
    )
  }

  if (!user || !user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

function AppContent() {
  const { user, loading } = useUser()

  // Don't show navbar on onboarding
  const showNavbar = !loading && (user === null || window.location.pathname !== '/onboarding')

  return (
    <div className="bg-primary-900 min-h-screen">
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
