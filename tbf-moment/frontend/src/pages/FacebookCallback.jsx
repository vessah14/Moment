import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithFacebook } from '../api/auth'
import logoMark from '../assets/logo-mark.png'
import AuthLayout from '../components/layout/AuthLayout'

export default function FacebookCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const accessToken = params.get('access_token')
    const errorDescription = params.get('error_description')

    if (errorDescription) {
      setError(decodeURIComponent(errorDescription.replace(/\+/g, ' ')))
      return
    }
    if (!accessToken) {
      setError('Aucun jeton Facebook reçu.')
      return
    }

    loginWithFacebook(accessToken)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err) => setError(err.message || 'Connexion Facebook impossible.'))
  }, [navigate])

  return (
    <AuthLayout>
      <div className="w-full max-w-sm text-center">
        <img src={logoMark} alt="" className="mx-auto h-10 w-10" />
        {error ? (
          <>
            <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {error}
            </p>
            <Link
              to="/connexion"
              className="mt-6 inline-block text-sm font-medium text-brand-purple hover:underline"
            >
              ← Retour à la connexion
            </Link>
          </>
        ) : (
          <p className="mt-6 text-sm text-faint">Connexion en cours…</p>
        )}
      </div>
    </AuthLayout>
  )
}
