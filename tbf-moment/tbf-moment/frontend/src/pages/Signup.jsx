import SignupForm from '../components/auth/SignupForm'
import AuthLayout from '../components/layout/AuthLayout'
import { routeSeo } from '../data/seoRoutes'
import { siteUrl, useSeo } from '../utils/seo'

export default function Signup() {
  useSeo(routeSeo('/inscription', siteUrl()))
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  )
}
