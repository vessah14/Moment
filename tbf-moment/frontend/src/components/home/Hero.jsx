import { Link } from 'react-router-dom'
import heroPreview from '../../assets/img001.jpg'
import BrandBackdrop from '../ui/BrandBackdrop'
import Button from '../ui/Button'

const STATS = [
  { value: '14', label: "types d'événements" },
  { value: '48', label: 'modèles prêts' },
  { value: '10 min', label: 'pour publier' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <BrandBackdrop />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <span className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-purple uppercase">
            Create. Connect. Celebrate.
          </span>

          <h1 className="mt-6 text-5xl leading-[1.05] font-bold tracking-tight text-ink lg:text-6xl">
            Vos événements.
            <br />
            Votre univers.
            <br />
            <span className="text-brand-gradient">Votre moment.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted">
            Créez un site d'événement, envoyez vos invitations, suivez vos
            confirmations et accueillez vos invités au QR code. Sans une
            ligne de code.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button as={Link} to="/inscription" variant="gradient">
              Créer mon événement
            </Button>
            <Button as={Link} to="/modeles" variant="outline">
              Explorer les modèles
            </Button>
          </div>

          <div className="mt-12 flex max-w-md items-center gap-8 border-t border-border-soft pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-2xl font-bold text-ink">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-faint">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-border-soft px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-pink" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-purple" />
              <span className="ml-2 font-mono text-xs text-faint">
                tbfmoment.com/awa-ibrahim
              </span>
            </div>
            <div className="aspect-4/3 overflow-hidden">
              <img
                src={heroPreview}
                alt="Alliances de mariage"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-xl border border-border bg-panel p-4 shadow-xl shadow-black/40 sm:block">
            <div className="flex items-center gap-2 text-sm font-semibold text-success">
              <span className="h-2 w-2 rounded-full bg-success" />
              Entrée validée
            </div>
            <p className="mt-2 text-sm font-medium text-ink">Fatou Ndiaye</p>
            <p className="mt-1 font-mono text-xs text-faint">
              00:41 · +2 accomp.
            </p>
          </div>

          <div className="absolute -right-4 -bottom-10 hidden gap-3 sm:flex">
            <div className="rounded-xl border border-border bg-panel px-4 py-3 shadow-xl shadow-black/40">
              <p className="text-brand-gradient font-mono text-xl font-bold">
                32
              </p>
              <p className="mt-1 text-xs text-faint">en attente</p>
            </div>
            <div className="rounded-xl border border-border bg-panel px-4 py-3 shadow-xl shadow-black/40">
              <p className="text-brand-gradient font-mono text-xl font-bold">
                240
              </p>
              <p className="mt-1 text-xs text-faint">invités</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
