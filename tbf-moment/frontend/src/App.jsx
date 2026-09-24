import { Route, Routes } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import AdminBilling from './pages/admin/AdminBilling'
import AdminEvents from './pages/admin/AdminEvents'
import AdminLogin from './pages/admin/AdminLogin'
import AdminModeration from './pages/admin/AdminModeration'
import AdminOrganizations from './pages/admin/AdminOrganizations'
import AdminOverview from './pages/admin/AdminOverview'
import AdminSettings from './pages/admin/AdminSettings'
import RequireAdmin from './components/admin/RequireAdmin'
import Builder from './pages/Builder'
import CreateEvent from './pages/CreateEvent'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/dashboard/Analytics'
import CheckIn from './pages/dashboard/CheckIn'
import Communication from './pages/dashboard/Communication'
import Conference from './pages/dashboard/Conference'
import Gallery from './pages/dashboard/Gallery'
import GiftRegistry from './pages/dashboard/GiftRegistry'
import GuestBook from './pages/dashboard/GuestBook'
import Guests from './pages/dashboard/Guests'
import Invitations from './pages/dashboard/Invitations'
import MyEvents from './pages/dashboard/MyEvents'
import Program from './pages/dashboard/Program'
import SeatingPlan from './pages/dashboard/SeatingPlan'
import Settings from './pages/dashboard/Settings'
import Ticketing from './pages/dashboard/Ticketing'
import Ecosystem from './pages/Ecosystem'
import ForgotPassword from './pages/ForgotPassword'
import GiftRegistryPublic from './pages/GiftRegistryPublic'
import GuestInvitation from './pages/GuestInvitation'
import Home from './pages/Home'
import LegalNotice from './pages/LegalNotice'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Onboarding from './pages/Onboarding'
import Pricing from './pages/Pricing'
import ResetPassword from './pages/ResetPassword'
import Signup from './pages/Signup'
import Support from './pages/Support'
import Templates from './pages/Templates'

function SiteLayout({ children }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <SiteLayout>
            <Home />
          </SiteLayout>
        }
      />
      <Route path="/connexion" element={<Login />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
      <Route path="/bienvenue" element={<Onboarding />} />
      <Route path="/inscription" element={<Signup />} />
      <Route path="/modeles" element={<Templates />} />
      <Route path="/tarifs" element={<Pricing />} />
      <Route path="/ecosysteme" element={<Ecosystem />} />
      <Route path="/support" element={<Support />} />
      <Route path="/mentions-legales" element={<LegalNotice />} />
      <Route path="/invitation/:code" element={<GuestInvitation />} />
      <Route path="/cadeaux/:code" element={<GiftRegistryPublic />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/evenements" element={<MyEvents />} />
      <Route path="/dashboard/evenements/nouveau" element={<CreateEvent />} />
      <Route path="/dashboard/invitations" element={<Invitations />} />
      <Route path="/dashboard/communication" element={<Communication />} />
      <Route path="/dashboard/participants" element={<Guests />} />
      <Route path="/dashboard/billetterie" element={<Ticketing />} />
      <Route path="/dashboard/checkin" element={<CheckIn />} />
      <Route path="/dashboard/galerie" element={<Gallery />} />
      <Route path="/dashboard/livre-dor" element={<GuestBook />} />
      <Route path="/dashboard/statistiques" element={<Analytics />} />
      <Route path="/dashboard/parametres" element={<Settings />} />
      <Route path="/dashboard/programme" element={<Program />} />
      <Route path="/dashboard/plan-de-table" element={<SeatingPlan />} />
      <Route path="/dashboard/liste-mariage" element={<GiftRegistry />} />
      <Route path="/dashboard/conference" element={<Conference />} />

      <Route path="/builder" element={<Builder />} />

      <Route path="/admin/connexion" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminOverview />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/organisations"
        element={
          <RequireAdmin>
            <AdminOrganizations />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/evenements"
        element={
          <RequireAdmin>
            <AdminEvents />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/facturation"
        element={
          <RequireAdmin>
            <AdminBilling />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/moderation"
        element={
          <RequireAdmin>
            <AdminModeration />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/parametres"
        element={
          <RequireAdmin>
            <AdminSettings />
          </RequireAdmin>
        }
      />

      <Route
        path="*"
        element={
          <SiteLayout>
            <NotFound />
          </SiteLayout>
        }
      />
    </Routes>
  )
}

export default App
