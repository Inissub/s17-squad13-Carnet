import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const AUTH_ACTIVE = false

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (!AUTH_ACTIVE) return <Outlet />
  if (loading) return null
  if (!user) return <Navigate to={`/connexion?suite=${encodeURIComponent(location.pathname)}`} replace />
  return <Outlet />
}
