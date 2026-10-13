import logo from '../../assets/logo.png'
import logoLight from '../../assets/logo-light.png'

// Logo complet adapté au thème : texte blanc sur fond sombre, texte foncé en mode clair.
// Les deux images sont rendues et l'une est masquée en CSS selon data-theme (index.css),
// ce qui évite tout flash au chargement (le thème est posé avant React).
export default function BrandLogo({ className = 'h-9 w-auto', alt = 'TBF Moment' }) {
  return (
    <>
      <img src={logo} alt={alt} className={`brand-logo-dark ${className}`} />
      <img src={logoLight} alt={alt} className={`brand-logo-light ${className}`} />
    </>
  )
}
