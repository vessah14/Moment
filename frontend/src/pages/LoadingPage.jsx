import { useSeo } from '../utils/seo'
import BrandLoader from '../components/ui/BrandLoader'

export default function LoadingPage() {
  useSeo({ title: 'Chargement', noindex: true })
  return <BrandLoader />
}
