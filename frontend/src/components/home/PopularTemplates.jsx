import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TEMPLATES } from '../../data/templates'
import { TEMPLATE_UNIVERSES } from '../../data/templateUniverses'
import SectionHeader from './SectionHeader'

// Accueil : les modèles premium en carrousel (repris du prototype). Onglets par univers,
// cartes compactes (capture du modèle, nom, type) qui ouvrent la démo, flèches sur
// ordinateur, défilement au doigt sur téléphone.
// Les captures (assets/templates/<theme>.webp) sont l'accueil de chaque démo, ouverture
// passée, au format d'un aperçu de lien.

const SHOTS = Object.fromEntries(
  Object.entries(import.meta.glob('../../assets/templates/*.webp', { eager: true, import: 'default' })).map(
    ([path, url]) => [path.split('/').pop().replace('.webp', ''), url],
  ),
)

const PREMIUM = TEMPLATES.filter((tpl) => tpl.theme)
const TABS = [
  { id: 'tous', label: 'Tous', templates: PREMIUM },
  ...TEMPLATE_UNIVERSES.map((u) => ({
    id: u.id,
    label: u.label.replace(' et associations', ''),
    templates: PREMIUM.filter((tpl) => u.categories.includes(tpl.category)),
  })),
].filter((tab) => tab.templates.length > 0)

function RailCard({ template }) {
  const shot = SHOTS[template.theme]
  return (
    <li className="w-[min(78vw,320px)] flex-none snap-start">
      <Link
        to={`/modeles/${template.theme}`}
        className="group block overflow-hidden rounded-[18px] border border-border-soft bg-surface transition duration-300 hover:-translate-y-1 hover:border-brand-purple/60 hover:shadow-lg"
      >
        <div className="relative aspect-[1200/630] overflow-hidden" style={{ background: template.preview?.bg }}>
          {shot && (
            <img
              src={shot}
              alt={`Modèle ${template.name} : ${template.subtitle ?? template.category}`}
              loading="lazy"
              width="640"
              height="336"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          )}
          <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-1.5 bg-[linear-gradient(transparent,rgba(0,0,0,.65))] pt-8 pb-3 text-sm font-semibold text-white transition duration-300 group-hover:translate-y-0">
            Voir la démo <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 px-4 py-3">
          <b className="text-[0.98rem] text-ink">{template.name}</b>
          <small className="truncate text-right text-[0.8rem] text-muted">{template.subtitle ?? template.category}</small>
        </div>
      </Link>
    </li>
  )
}

export default function PopularTemplates() {
  const railRef = useRef(null)
  const [tab, setTab] = useState('tous')
  const current = TABS.find((t) => t.id === tab) ?? TABS[0]

  const scrollBy = (dir) => {
    const rail = railRef.current
    if (!rail) return
    const card = rail.querySelector('li')
    const step = (card?.getBoundingClientRect().width ?? 320) + 16
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rail.scrollBy({ left: dir * step * 2, behavior: reduced ? 'auto' : 'smooth' })
  }

  const selectTab = (id) => {
    setTab(id)
    if (railRef.current) railRef.current.scrollLeft = 0
  }

  return (
    <section id="modeles" className="relative scroll-mt-20" aria-labelledby="popular-heading">
      <div className="mx-auto max-w-7xl px-6 pt-20">
        <SectionHeader id="popular-heading" eyebrow="Modèles" title={`${PREMIUM.length} modèles premium, dessinés pour nos fêtes`}>
          Toghu, Ndop, wax, mosquée, église, campus, stade… Chaque modèle a ses couleurs, son ouverture animée et sa
          musique.
        </SectionHeader>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Univers">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === tab}
              onClick={() => selectTab(t.id)}
              className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${
                t.id === tab ? 'border-ink bg-ink text-bg' : 'border-border-soft text-muted hover:border-faint hover:text-ink'
              }`}
            >
              {t.label}
              <span className="ml-1.5 font-mono text-xs opacity-70">{t.templates.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-6">
        <ul ref={railRef} className="template-rail flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pt-2 pb-6" role="tabpanel" aria-labelledby="popular-heading">
          {current.templates.map((tpl) => (
            <RailCard key={tpl.name} template={tpl} />
          ))}
        </ul>
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Modèles précédents"
          className="absolute top-[calc(50%-1.75rem)] left-3 z-10 hidden h-11 w-11 place-items-center rounded-full border border-border-soft bg-surface/90 text-ink shadow-lg backdrop-blur transition hover:border-brand-purple md:grid"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Modèles suivants"
          className="absolute top-[calc(50%-1.75rem)] right-3 z-10 hidden h-11 w-11 place-items-center rounded-full border border-border-soft bg-surface/90 text-ink shadow-lg backdrop-blur transition hover:border-brand-purple md:grid"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="pb-16 text-center">
        <Link
          to="/modeles"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-soft px-5 text-sm font-semibold text-ink transition hover:border-brand-purple"
        >
          Voir toute la galerie ({TEMPLATES.length} modèles) <ArrowRight className="h-4 w-4" />
        </Link>
      </p>
    </section>
  )
}
