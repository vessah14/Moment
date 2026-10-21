import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAdmin from './components/admin/RequireAdmin'
import AdminBilling from './pages/AdminBilling'
import AdminEvents from './pages/AdminEvents'
import AdminLogin from './pages/AdminLogin'
import AdminModeration from './pages/AdminModeration'
import AdminOrganizations from './pages/AdminOrganizations'
import AdminOverview from './pages/AdminOverview'
import AdminReviews from './pages/AdminReviews'
import AdminSettings from './pages/AdminSettings'
import AdminNotFound from './pages/AdminNotFound'
import ErrorBoundary from './components/ErrorBoundary'

function App () {
  return (
    // Page d'erreur au lieu d'un écran blanc si une page plante.
    <ErrorBoundary>
    <Routes>
      <Route path='/admin/connexion' element={<AdminLogin />} />
      <Route
        path='/admin'
        element={
          <RequireAdmin>
            <AdminOverview />
          </RequireAdmin>
        }
      />
      <Route
        path='/admin/organisations'
        element={
          <RequireAdmin>
            <AdminOrganizations />
          </RequireAdmin>
        }
      />
      <Route
        path='/admin/evenements'
        element={
          <RequireAdmin>
            <AdminEvents />
          </RequireAdmin>
        }
      />
      <Route
        path='/admin/facturation'
        element={
          <RequireAdmin>
            <AdminBilling />
          </RequireAdmin>
        }
      />
      <Route
        path='/admin/moderation'
        element={
          <RequireAdmin>
            <AdminModeration />
          </RequireAdmin>
        }
      />
      <Route
        path='/admin/avis'
        element={
          <RequireAdmin>
            <AdminReviews />
          </RequireAdmin>
        }
      />
      <Route
        path='/admin/parametres'
        element={
          <RequireAdmin>
            <AdminSettings />
          </RequireAdmin>
        }
      />
      <Route path='/' element={<Navigate to='/admin' replace />} />
      <Route path='*' element={<AdminNotFound />} />
    </Routes>
    </ErrorBoundary>
  )
}

export default App
