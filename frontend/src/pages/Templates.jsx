import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TemplateCard from '../components/templates/TemplateCard'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { TEMPLATES } from '../data/templates'
import { TEMPLATE_UNIVERSES } from '../data/templateUniverses'
import { routeSeo } from '../data/seoRoutes'
import { siteUrl, useSeo } from '../utils/seo'

const PREVIEWABLE_TEMPLATES = TEMPLATES.filter(tpl => tpl.theme)

// Univers partagés avec l'accueil (data/templateUniverses.js).
const TEMPLATE_CATEGORIES = TEMPLATE_UNIVERSES

export default function Templates () {
  useSeo(routeSeo('/modeles', siteUrl()))
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('categorie')
  const initialGroup = TEMPLATE_CATEGORIES.find(group =>
    group.id === initialCategory || group.categories.includes(initialCategory)
  )
  const [category, setCategory] = useState(initialGroup?.id ?? 'Tous')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return PREVIEWABLE_TEMPLATES.filter(tpl => {
      const selectedGroup = TEMPLATE_CATEGORIES.find(group => group.id === category)
      const matchesCategory = !selectedGroup || selectedGroup.categories.includes(tpl.category)
      const matchesQuery = tpl.name.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  return (
    <div className='flex min-h-svh flex-col'>
      <Header />

      <main className='mx-auto w-full max-w-7xl flex-1 px-6 py-12'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div>
            <h1 className='text-3xl font-bold text-ink'>
              {PREVIEWABLE_TEMPLATES.length} modèles prêts à publier
            </h1>
            <p className='mt-2 text-muted'>
              Dupliquez un modèle, il devient le vôtre dans le Builder.
            </p>
          </div>

          <div className='relative'>
            <Search className='pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint' />
            <input
              type='search'
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Rechercher un modèle'
              className='w-64 rounded-lg border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple'
            />
          </div>
        </div>

        <div className='mt-8 flex flex-wrap gap-3'>
          <button
            type='button'
            aria-pressed={category === 'Tous'}
            onClick={() => setCategory('Tous')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === 'Tous'
                ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                : 'border border-border text-muted hover:border-faint hover:text-ink'
            }`}
          >
            Tous · {PREVIEWABLE_TEMPLATES.length}
          </button>
          {TEMPLATE_CATEGORIES.map(group => {
            const isActive = group.id === category
            const count = PREVIEWABLE_TEMPLATES.filter(tpl => group.categories.includes(tpl.category)).length
            return (
              <button
                key={group.id}
                type='button'
                aria-pressed={isActive}
                onClick={() => setCategory(isActive ? 'Tous' : group.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                    : 'border border-border text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {group.label} · {count}
              </button>
            )
          })}
        </div>

        {filtered.some(tpl => tpl.theme) && (
          <section className='mt-10'>
            <h2 className='text-xs font-semibold tracking-widest text-[color:var(--color-gold)] uppercase'>
              Modèles premium · ouverture animée, fond animé, musique
            </h2>
            <div className='mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {filtered
                .filter(tpl => tpl.theme)
                .map(tpl => (
                  <TemplateCard key={tpl.name} template={tpl} />
                ))}
            </div>
          </section>
        )}

        <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filtered
            .filter(tpl => !tpl.theme)
            .map(tpl => (
              <TemplateCard key={tpl.name} template={tpl} />
            ))}

          <Link
            to='/builder'
            className='flex min-h-[28rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 text-center transition hover:border-faint'
          >
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2'>
              <Plus className='h-5 w-5 text-muted' />
            </span>
            <span className='font-semibold text-ink'>Page vierge</span>
            <span className='max-w-[10rem] text-xs text-faint'>
              Composer librement dans le Builder
            </span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
