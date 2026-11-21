import { Check, QrCode, Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import campusShot from '../../assets/home/campus.webp'
import fiestaShot from '../../assets/home/fiesta.webp'
import ndopShot from '../../assets/home/ndop.webp'
import toghuShot from '../../assets/home/toghu.webp'
import { TEMPLATES } from '../../data/templates'
import Button from '../ui/Button'
import FestiveBackground from './FestiveBackground'
import { TRY_TYPES, tryUrl } from '../../utils/tryNames'
import { t } from '../../i18n'

// En-tête de l'accueil : titre, trois téléphones montrant de vrais modèles et bulles
// de notifications flottantes.

const PREMIUM_COUNT = TEMPLATES.filter((t) => t.theme).length
const SHOTS = [
  { src: toghuShot, alt: t("Modèle Toghu Royal pour une dot") },
  { src: ndopShot, alt: t("Modèle Ndop pour une dot") },
  { src: campusShot, alt: t("Modèle Campus pour une journée culturelle") },
  { src: fiestaShot, alt: t("Modèle Fiesta pour un anniversaire") },
]
const TRUST = [t("Gratuit jusqu’à 50 invités"), t("Aucune application à installer"), t("Orange Money et MTN MoMo")]

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
              {t("Nouveau")}
            </b>
            {t('Mariages, dots, écoles, concerts : {n} modèles premium', { n: PREMIUM_COUNT })}
          </span>

          <h1 className="mt-5 text-[clamp(2.5rem,6.4vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink">
            {t('Vos moments importants méritent')}{' '}
            <span className="bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] bg-clip-text text-transparent">
              {t("mieux qu'un flyer.")}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[clamp(1.02rem,1.6vw,1.17rem)] text-muted lg:mx-0">
            {t("Créez en 5 minutes une page qui s'ouvre comme une vraie invitation. Partagez-la sur WhatsApp, voyez qui vient, vendez vos billets par Mobile Money et accueillez vos invités avec un QR code.")}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button as={Link} to="/inscription" variant="gradient" className="rounded-[14px] px-6 py-3.5 text-base shadow-[0_14px_40px_-14px_#E2337E]">
              {t("Créer mon événement gratuitement")}
            </Button>
            <Button as={Link} to="/modeles" variant="outline" className="rounded-[14px] px-6 py-3.5 text-base">
              {t("Voir les modèles")}
            </Button>
          </div>

          <TryWithNames />

          <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.84rem] text-muted lg:justify-start">
            {TRUST.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" className="h-4 w-4 text-[#3DD68C]" strokeWidth={2.6} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-stage" aria-hidden="true">
          <Phone active={(k + 1) % SHOTS.length} className="hero-phone-left" />
          <Phone active={(k + 2) % SHOTS.length} className="hero-phone-right" />
          <Phone active={k} className="hero-phone-main" />
          <Float className="hero-float-1" color="#25A86A" icon={Check} title={t("Brenda a répondu oui")} text={t("3 personnes · Famille de la mariée")} />
          <Float className="hero-float-2" color="#FF7900" icon={Ticket} title={t("2 billets Gradins vendus")} text={t("20 000 FCFA · Orange Money")} />
          <Float className="hero-float-3" color="#6C4BF4" icon={QrCode} title={t("Pass valide")} text={t("Laure Ndjock · 4 places")} />
        </div>
      </div>

    </section>
  )
}

// « Essayez tout de suite avec vos prénoms » : ouvre la démo du modèle avec ces prénoms,
// sans compte ; rien n'est enregistré.
function TryWithNames() {
  const navigate = useNavigate()
  const [names, setNames] = useState('')
  const [type, setType] = useState(TRY_TYPES[0].id)
  const example = TRY_TYPES.find((option) => option.id === type)?.example
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        navigate(tryUrl(type, names))
      }}
      className="mx-auto mt-6 max-w-xl rounded-2xl border border-border-soft bg-surface/70 p-3 text-left backdrop-blur lg:mx-0"
    >
      <label htmlFor="try-names" className="block px-1 text-sm font-semibold text-ink">
        {t("Essayez tout de suite avec vos prénoms")}
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id="try-names"
          value={names}
          onChange={(e) => setNames(e.target.value)}
          maxLength={40}
          placeholder={t('Ex. {example}', { example })}
          autoComplete="off"
          enterKeyHint="go"
          aria-describedby="try-help"
          className="min-w-0 flex-[1_1_10rem] rounded-lg border border-border-soft bg-bg px-3 py-2.5 text-sm text-ink"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label={t("Type d'événement")}
          className="flex-[0_1_auto] rounded-lg border border-border-soft bg-bg px-3 py-2.5 text-sm text-ink"
        >
          {TRY_TYPES.map((option) => (
            <option key={option.id} value={option.id}>
              {t(option.label)}
            </option>
          ))}
        </select>
        <button type="submit" className="flex-[1_0_auto] rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-indigo">
          {t("Voir mon invitation")}
        </button>
      </div>
      <p id="try-help" className="mt-2 px-1 text-xs text-muted">
        {t("Votre invitation s'ouvre en direct, avec son animation. Sans compte, rien n'est publié.")}
      </p>
    </form>
  )
}
