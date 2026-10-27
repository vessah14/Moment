import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../../api/client'
import { loginPathForReturnPath, rememberReturnPath } from '../../utils/returnPath'

export default function RequireAuth({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    const returnPath = `${location.pathname}${location.search}`
    rememberReturnPath(returnPath)
    return <Navigate to={loginPathForReturnPath(returnPath)} replace state={{ from: location }} />
  }

  return children
}
