import LoginForm from '../components/auth/LoginForm'
import AuthLayout from '../components/layout/AuthLayout'
import { useSeo } from '../utils/seo'

export default function Login() {
  useSeo({ title: 'Connexion', path: '/connexion', noindex: true })
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
