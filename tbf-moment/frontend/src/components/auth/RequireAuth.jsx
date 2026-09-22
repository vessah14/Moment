import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '../../api/client'

export default function RequireAuth({ children }) {
  const location = useLocation()

  if (!getToken()) {
    return <Navigate to="/connexion" replace state={{ from: location }} />
  }

  return children
}
