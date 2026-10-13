import { Link } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'
import BrandBackdrop from '../ui/BrandBackdrop'
import { useSeo } from '../../utils/seo'

export default function AuthLayout({ children }) {
  useSeo({ title: 'Connexion', noindex: true })
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <BrandBackdrop />
      <div className="relative px-6 pt-8">
        <Link to="/" className="inline-flex items-center">
          <BrandLogo className="h-8 w-auto" />
        </Link>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
