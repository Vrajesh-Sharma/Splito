import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoadingScreen from './components/LoadingScreen'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import GroupPage from './pages/GroupPage'
import GroupDetailPage from './pages/GroupDetailPage'
import CustomCursor from './components/CustomCursor'

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
      <Route path="/"        element={user ? <HomePage />        : <Navigate to="/auth" />} />
      <Route path="/groups"  element={user ? <GroupPage />       : <Navigate to="/auth" />} />
      <Route path="/groups/:id" element={user ? <GroupDetailPage /> : <Navigate to="/auth" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CustomCursor />
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#181d28',
              color: '#e2e8f0',
              border: '1px solid #1e2535',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22d3ee', secondary: '#0d0f14' } },
            error:   { iconTheme: { primary: '#f43f5e', secondary: '#0d0f14' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}