import { Navigate, useLocation } from 'react-router-dom'
import { isAdminAuthenticated } from '../../utils/adminAuth'

export default function RequireAdmin({ children }) {
  const location = useLocation()

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/connexion" replace state={{ from: location }} />
  }

  return children
}
