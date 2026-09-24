import { Route, Routes } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import RequireAuth from './components/auth/RequireAuth'
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
import FacebookCallback from './pages/FacebookCallback'
import ForgotPassword from './pages/ForgotPassword'
import GiftRegistryPublic from './pages/GiftRegistryPublic'
import GuestInvitation from './pages/GuestInvitation'
import Home from './pages/Home'
import LegalNotice from './pages/LegalNotice'
import Login from './pages/Login'
import MiniSite from './pages/MiniSite'
import NotFound from './pages/NotFound'
import Pricing from './pages/Pricing'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ResetPassword from './pages/ResetPassword'
import Signup from './pages/Signup'
import Support from './pages/Support'
import Templates from './pages/Templates'
import TermsOfService from './pages/TermsOfService'

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
      <Route path="/auth/facebook/callback" element={<FacebookCallback />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
      <Route path="/inscription" element={<Signup />} />
      <Route path="/modeles" element={<Templates />} />
      <Route path="/tarifs" element={<Pricing />} />
      <Route path="/ecosysteme" element={<Ecosystem />} />
      <Route path="/support" element={<Support />} />
      <Route path="/mentions-legales" element={<LegalNotice />} />
      <Route path="/cgu" element={<TermsOfService />} />
      <Route path="/confidentialite" element={<PrivacyPolicy />} />
      <Route path="/invitation/:code" element={<GuestInvitation />} />
      <Route path="/cadeaux/:code" element={<GiftRegistryPublic />} />
      <Route path="/e/:slug" element={<MiniSite />} />

      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/dashboard/evenements" element={<RequireAuth><MyEvents /></RequireAuth>} />
      <Route
        path="/dashboard/evenements/nouveau"
        element={<RequireAuth><CreateEvent /></RequireAuth>}
      />
      <Route
        path="/dashboard/evenements/:id/modifier"
        element={<RequireAuth><CreateEvent /></RequireAuth>}
      />
      <Route path="/dashboard/invitations" element={<RequireAuth><Invitations /></RequireAuth>} />
      <Route
        path="/dashboard/communication"
        element={<RequireAuth><Communication /></RequireAuth>}
      />
      <Route path="/dashboard/participants" element={<RequireAuth><Guests /></RequireAuth>} />
      <Route path="/dashboard/billetterie" element={<RequireAuth><Ticketing /></RequireAuth>} />
      <Route path="/dashboard/checkin" element={<RequireAuth><CheckIn /></RequireAuth>} />
      <Route path="/dashboard/galerie" element={<RequireAuth><Gallery /></RequireAuth>} />
      <Route path="/dashboard/livre-dor" element={<RequireAuth><GuestBook /></RequireAuth>} />
      <Route path="/dashboard/statistiques" element={<RequireAuth><Analytics /></RequireAuth>} />
      <Route path="/dashboard/parametres" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/dashboard/programme" element={<RequireAuth><Program /></RequireAuth>} />
      <Route
        path="/dashboard/plan-de-table"
        element={<RequireAuth><SeatingPlan /></RequireAuth>}
      />
      <Route
        path="/dashboard/liste-mariage"
        element={<RequireAuth><GiftRegistry /></RequireAuth>}
      />
      <Route path="/dashboard/conference" element={<RequireAuth><Conference /></RequireAuth>} />

      <Route path="/builder/:eventId" element={<RequireAuth><Builder /></RequireAuth>} />

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
