import SignupForm from '../components/auth/SignupForm'
import AuthLayout from '../components/layout/AuthLayout'
import { useSeo } from '../utils/seo'

export default function Signup() {
  useSeo({
    title: 'Créer un compte',
    description:
      "Créez gratuitement votre compte TBF Moment et publiez le site de votre événement en quelques minutes.",
    path: '/inscription',
  })
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  )
}
