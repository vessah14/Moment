import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../../api/client'

export default function RequireAuth({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/connexion" replace state={{ from: location }} />
  }

  return children
}
