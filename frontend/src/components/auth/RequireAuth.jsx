import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../../api/client'
import { rememberReturnPath } from '../../utils/returnPath'

export default function RequireAuth({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    rememberReturnPath(`${location.pathname}${location.search}`)
    return <Navigate to="/connexion" replace state={{ from: location }} />
  }

  return children
}
