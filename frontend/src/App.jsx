import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import CookieConsent from './components/layout/CookieConsent'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import Hero from './components/home/Hero'
import RequireAuth from './components/auth/RequireAuth'
import ErrorBoundary from './components/ErrorBoundary'

const Builder = lazy(() => import('./pages/Builder'))
const CookiesPolicy = lazy(() => import('./pages/CookiesPolicy'))
const CreateEvent = lazy(() => import('./pages/CreateEvent'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => import('./pages/dashboard/Analytics'))
const CheckIn = lazy(() => import('./pages/dashboard/CheckIn'))
const Communication = lazy(() => import('./pages/dashboard/Communication'))
const Conference = lazy(() => import('./pages/dashboard/Conference'))
const Gallery = lazy(() => import('./pages/dashboard/Gallery'))
const GiftRegistry = lazy(() => import('./pages/dashboard/GiftRegistry'))
const GuestBook = lazy(() => import('./pages/dashboard/GuestBook'))
const Guests = lazy(() => import('./pages/dashboard/Guests'))
const Invitations = lazy(() => import('./pages/dashboard/Invitations'))
const LoadingPage = lazy(() => import('./pages/LoadingPage'))
const MyEvents = lazy(() => import('./pages/dashboard/MyEvents'))
const Program = lazy(() => import('./pages/dashboard/Program'))
const SeatingPlan = lazy(() => import('./pages/dashboard/SeatingPlan'))
const Settings = lazy(() => import('./pages/dashboard/Settings'))
const MyReview = lazy(() => import('./pages/dashboard/MyReview'))
const Ticketing = lazy(() => import('./pages/dashboard/Ticketing'))
const Ecosystem = lazy(() => import('./pages/Ecosystem'))
const FacebookCallback = lazy(() => import('./pages/FacebookCallback'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const GiftRegistryPublic = lazy(() => import('./pages/GiftRegistryPublic'))
const GuestInvitation = lazy(() => import('./pages/GuestInvitation'))
const Home = lazy(() => import('./pages/Home'))
const LegalNotice = lazy(() => import('./pages/LegalNotice'))
const Login = lazy(() => import('./pages/Login'))
const MiniSite = lazy(() => import('./pages/MiniSite'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Pricing = lazy(() => import('./pages/Pricing'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const CheckEmail = lazy(() => import('./pages/CheckEmail'))
const Signup = lazy(() => import('./pages/Signup'))
const Support = lazy(() => import('./pages/Support'))
const Templates = lazy(() => import('./pages/Templates'))
const TemplateDemo = lazy(() => import('./pages/TemplateDemo'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))

function SiteLayout ({ children }) {
  return (
    <div className='flex min-h-svh flex-col'>
      <Header />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  )
}

function RouteLoader ({ children }) {
  const location = useLocation()

  const fallback =
    location.pathname === '/' ? (
      <div className='relative overflow-hidden bg-bg'>
        <Hero />
        <div className='pointer-events-none absolute inset-0 bg-white/10' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='flex items-center gap-3 rounded-full border border-white/20 bg-surface/80 px-5 py-3 text-sm font-medium text-ink shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm'>
            <div className='h-5 w-5 animate-spin rounded-full border-2 border-brand-purple/25 border-t-brand-purple' />
            Chargement de la page d’accueil…
          </div>
        </div>
      </div>
    ) : (
      <LoadingPage text='Chargement de l’application…' />
    )

  return <Suspense fallback={fallback}>{children}</Suspense>
}

function App () {
  return (
    <>
      {/* Page d'erreur au lieu d'un écran blanc si une page plante. */}
      <ErrorBoundary>
      <RouteLoader>
        <Routes>
          <Route
            path='/'
            element={
              <SiteLayout>
                <Home />
              </SiteLayout>
            }
          />
          <Route path='/connexion' element={<Login />} />
          <Route
            path='/auth/facebook/callback'
            element={<FacebookCallback />}
          />
          <Route path='/mot-de-passe-oublie' element={<ForgotPassword />} />
          <Route
            path='/reinitialiser-mot-de-passe'
            element={<ResetPassword />}
          />
          <Route path='/verifier-email' element={<VerifyEmail />} />
          <Route path='/bienvenue' element={<Onboarding />} />
          <Route path='/inscription' element={<Signup />} />
          <Route path='/inscription/verifiez-vos-emails' element={<CheckEmail />} />
          <Route path='/modeles' element={<Templates />} />
          <Route path='/modeles/:theme' element={<TemplateDemo />} />
          <Route path='/tarifs' element={<Pricing />} />
          <Route path='/ecosysteme' element={<Ecosystem />} />
          <Route path='/support' element={<Support />} />
          <Route path='/mentions-legales' element={<LegalNotice />} />
          <Route path='/cgu' element={<TermsOfService />} />
          <Route path='/confidentialite' element={<PrivacyPolicy />} />
          <Route path='/cookies' element={<CookiesPolicy />} />
          <Route path='/politique-cookies' element={<CookiesPolicy />} />
          <Route
            path='/loading'
            element={<LoadingPage text='Chargement de votre espace…' />}
          />
          <Route
            path='/chargement'
            element={<LoadingPage text='Chargement de votre espace…' />}
          />
          <Route path='/invitation/:code' element={<GuestInvitation />} />
          <Route path='/cadeaux/:code' element={<GiftRegistryPublic />} />
          <Route path='/e/:slug' element={<MiniSite />} />

          <Route
            path='/dashboard'
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/evenements'
            element={
              <RequireAuth>
                <MyEvents />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/evenements/nouveau'
            element={
              <RequireAuth>
                <CreateEvent />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/evenements/:id/modifier'
            element={
              <RequireAuth>
                <CreateEvent />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/invitations'
            element={
              <RequireAuth>
                <Invitations />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/communication'
            element={
              <RequireAuth>
                <Communication />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/participants'
            element={
              <RequireAuth>
                <Guests />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/billetterie'
            element={
              <RequireAuth>
                <Ticketing />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/checkin'
            element={
              <RequireAuth>
                <CheckIn />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/galerie'
            element={
              <RequireAuth>
                <Gallery />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/livre-dor'
            element={
              <RequireAuth>
                <GuestBook />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/statistiques'
            element={
              <RequireAuth>
                <Analytics />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/avis'
            element={
              <RequireAuth>
                <MyReview />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/parametres'
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/programme'
            element={
              <RequireAuth>
                <Program />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/plan-de-table'
            element={
              <RequireAuth>
                <SeatingPlan />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/liste-mariage'
            element={
              <RequireAuth>
                <GiftRegistry />
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/conference'
            element={
              <RequireAuth>
                <Conference />
              </RequireAuth>
            }
          />

          <Route
            path='/builder/:eventId'
            element={
              <RequireAuth>
                <Builder />
              </RequireAuth>
            }
          />

          <Route
            path='*'
            element={
              <SiteLayout>
                <NotFound />
              </SiteLayout>
            }
          />
        </Routes>
      </RouteLoader>
      </ErrorBoundary>
      <CookieConsent />
    </>
  )
}

export default App