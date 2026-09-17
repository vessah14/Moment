import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import BrandBackdrop from '../ui/BrandBackdrop'

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <BrandBackdrop />
      <div className="relative px-6 pt-8">
        <Link to="/" className="inline-flex items-center">
          <img src={logo} alt="TBF Moment" className="h-8 w-auto" />
        </Link>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
