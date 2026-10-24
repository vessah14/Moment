import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import FestiveBackground from './FestiveBackground'

const WHATSAPP_URL = `https://wa.me/237680264060?text=${encodeURIComponent(
  'Bonjour TBF Moment, j’ai une question sur mon événement',
)}`

const CARD_BG =
  'radial-gradient(70% 120% at 0% 0%, rgba(255,122,61,.25), transparent 60%), radial-gradient(70% 120% at 100% 100%, rgba(108,75,244,.5), transparent 60%), var(--color-surface)'

// Dernier appel à l'accueil (repris du prototype) : carte sombre avec halos orange et
// violet, grand « M » centré qui se dessine et formes de fête qui flottent.
export default function FinalCta() {
  return (
    <section className="px-6 py-16">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-border-soft px-6 py-16 text-center sm:py-20"
        style={{ background: CARD_BG }}
      >
        <FestiveBackground density={14000} bigM="center" />
        <div className="relative">
          <h2 className="text-4xl leading-[1.05] font-bold tracking-tight text-ink sm:text-5xl">
            Votre prochain événement
            <br />
            <span className="bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] bg-clip-text text-transparent">
              commence ici.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Créez votre page gratuitement, partagez-la ce soir sur WhatsApp, et voyez les premières
            réponses arriver.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/inscription" variant="gradient">
              Créer mon événement
            </Button>
            <Button as="a" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" variant="outline">
              Nous écrire sur WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
