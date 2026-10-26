import { useSeo } from '../utils/seo'
import BrandLoader from '../components/ui/BrandLoader'

export default function LoadingPage ({ text = 'Chargement de votre espace…' }) {
  useSeo({ title: 'Chargement', noindex: true })
  return <BrandLoader text={text} />
}
