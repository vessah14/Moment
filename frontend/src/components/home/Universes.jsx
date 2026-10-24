import { Briefcase, Gift, GraduationCap, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TEMPLATES } from '../../data/templates'
import { TEMPLATE_UNIVERSES } from '../../data/templateUniverses'
import SectionHeader from './SectionHeader'

// « Pour qui ? » (repris du prototype) : les quatre univers, chacun ouvre la galerie
// filtrée sur ses modèles.
const ICONS = { prive: Heart, ecoles: GraduationCap, entreprises: Briefcase, saisons: Gift }

const countFor = (universe) =>
  TEMPLATES.filter((t) => t.theme && universe.categories.includes(t.category)).length

export default function Universes() {
  return (
    <section className="relative" aria-labelledby="universes-heading">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader id="universes-heading" eyebrow="Pour qui ?" title="Familles, écoles, entreprises : chacun son univers">
          Choisissez votre univers, puis votre type d'événement. TBF Moment propose le modèle, les
          sections et les textes adaptés.
        </SectionHeader>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATE_UNIVERSES.map((u) => {
            const Icon = ICONS[u.id]
            const count = countFor(u)
            return (
              <Link
                key={u.id}
                to={`/modeles?categorie=${u.id}`}
                className="group relative flex flex-col gap-2 overflow-hidden rounded-[20px] border border-border-soft bg-surface p-5 transition hover:border-[color:var(--u)]"
                style={{ '--u': u.color }}
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-[14px]"
                  style={{ background: `${u.color}38`, color: u.color }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-2 text-lg font-bold text-ink">{u.label}</h3>
                <p className="text-sm leading-relaxed text-muted">{u.description}</p>
                <span className="mt-auto pt-3 text-sm font-semibold text-ink">
                  {count} modèle{count > 1 ? 's' : ''} →
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
