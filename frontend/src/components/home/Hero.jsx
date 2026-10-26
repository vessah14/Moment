import { Check, QrCode, Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import campusShot from '../../assets/home/campus.webp'
import fiestaShot from '../../assets/home/fiesta.webp'
import ndopShot from '../../assets/home/ndop.webp'
import toghuShot from '../../assets/home/toghu.webp'
import { TEMPLATES } from '../../data/templates'
import Button from '../ui/Button'
import FestiveBackground from './FestiveBackground'

// En-tête de l'accueil : titre, trois téléphones montrant de vrais modèles et bulles
// de notifications flottantes.

const PREMIUM_COUNT = TEMPLATES.filter((t) => t.theme).length
const SHOTS = [
  { src: toghuShot, alt: 'Modèle Toghu Royal pour une dot' },
  { src: ndopShot, alt: 'Modèle Ndop pour une dot' },
  { src: campusShot, alt: 'Modèle Campus pour une journée culturelle' },
  { src: fiestaShot, alt: 'Modèle Fiesta pour un anniversaire' },
]
const TRUST = ['Gratuit pour commencer', 'Aucune application à installer', 'Orange Money et MTN MoMo']

// Chaque téléphone ne rend que sa capture active : pas de décodage des images invisibles.
function Phone({ active, className }) {
  const shot = SHOTS[active]
  return (
    <div className={`hero-phone ${className}`}>
      <div className="hero-phone-screen">
        <img
          key={shot.src}
          src={shot.src}
          alt={shot.alt}
          decoding="async"
          fetchPriority={className === 'hero-phone-main' ? 'high' : 'auto'}
          className="hero-phone-img"
        />
      </div>
    </div>
  )
}

function Float({ className, color, icon: Icon, title, text }) {
  return (
    <div className={`hero-float ${className}`}>
      <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] text-white" style={{ background: color }}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span>
        <b className="block text-[0.84rem]">{title}</b>
        <small className="text-[#5B5680]">{text}</small>
      </span>
    </div>
  )
}

export default function Hero() {
  const [k, setK] = useState(0)

  // Les téléphones changent de modèle toutes les 4,5 s (pas si on réduit les animations,
  // ni quand l'onglet est caché).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = window.setInterval(() => {
      if (!document.hidden) setK((v) => (v + 1) % SHOTS.length)
    }, 4500)
    return () => window.clearInterval(id)
  }, [])


  return (
    <section className="relative isolate overflow-x-clip" data-no-reveal>
      <div
        aria-hidden="true"
        className="absolute inset-x-[-20%] -top-[10%] -z-10 h-[720px]"
        style={{
          background:
            'radial-gradient(40% 50% at 18% 30%, #FF7A3D26, transparent 70%), radial-gradient(45% 55% at 78% 25%, #6C4BF44D, transparent 70%), radial-gradient(35% 40% at 55% 75%, #E2337E1F, transparent 70%)',
        }}
      />
      <FestiveBackground />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pt-14 pb-8 text-center lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:text-left">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface/70 py-1.5 pr-3 pl-1.5 text-[0.82rem] text-muted">
            <b className="rounded-full bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-2 py-0.5 text-[0.7rem] font-bold text-white">
              Nouveau
            </b>
            Mariages, dots, écoles, concerts : {PREMIUM_COUNT} modèles premium
          </span>

          <h1 className="mt-5 text-[clamp(2.5rem,6.4vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink">
            Vos moments importants méritent{' '}
            <span className="bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] bg-clip-text text-transparent">
              mieux qu'un flyer.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[clamp(1.02rem,1.6vw,1.17rem)] text-muted lg:mx-0">
            Créez en 5 minutes une page qui s'ouvre comme une vraie invitation. Partagez-la sur
            WhatsApp, voyez qui vient, vendez vos billets par Mobile Money et accueillez vos
            invités avec un QR code.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button as={Link} to="/inscription" variant="gradient" className="rounded-[14px] px-6 py-3.5 text-base shadow-[0_14px_40px_-14px_#E2337E]">
              Créer mon événement gratuitement
            </Button>
            <Button as={Link} to="/modeles" variant="outline" className="rounded-[14px] px-6 py-3.5 text-base">
              Voir les modèles
            </Button>
          </div>

          <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.84rem] text-muted lg:justify-start">
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" className="h-4 w-4 text-[#3DD68C]" strokeWidth={2.6} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-stage" aria-hidden="true">
          <Phone active={(k + 1) % SHOTS.length} className="hero-phone-left" />
          <Phone active={(k + 2) % SHOTS.length} className="hero-phone-right" />
          <Phone active={k} className="hero-phone-main" />
          <Float className="hero-float-1" color="#25A86A" icon={Check} title="Brenda a répondu oui" text="3 personnes · Famille de la mariée" />
          <Float className="hero-float-2" color="#FF7900" icon={Ticket} title="2 billets Gradins vendus" text="20 000 FCFA · Orange Money" />
          <Float className="hero-float-3" color="#6C4BF4" icon={QrCode} title="Pass valide" text="Laure Ndjock · 4 places" />
        </div>
      </div>

    </section>
  )
}
