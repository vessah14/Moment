import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TemplateCard from '../components/templates/TemplateCard'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { TEMPLATES } from '../data/templates'
import { useSeo } from '../utils/seo'

const TEMPLATE_CATEGORIES = [...new Set(TEMPLATES.map(tpl => tpl.category))]
const CATEGORIES = [
  { label: 'Tous', count: TEMPLATES.length },
  ...TEMPLATE_CATEGORIES.map(label => ({
    label,
    count: TEMPLATES.filter(tpl => tpl.category === label).length
  }))
]

export default function Templates () {
  useSeo({
    title: "Modèles de sites d'événement",
    description: `${TEMPLATES.length} modèles prêts à publier pour votre mariage, anniversaire, baptême, conférence, concert… Personnalisez-les en quelques clics.`,
    path: '/modeles'
  })
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('categorie')
  const [category, setCategory] = useState(
    CATEGORIES.some(c => c.label === initialCategory) ? initialCategory : 'Tous'
  )
  const [priceFilter, setPriceFilter] = useState(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return TEMPLATES.filter(tpl => {
      const matchesCategory = category === 'Tous' || tpl.category === category
      const matchesPrice = !priceFilter || tpl.badge === priceFilter
      const matchesQuery = tpl.name.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesPrice && matchesQuery
    })
  }, [category, priceFilter, query])

  return (
    <div className='flex min-h-svh flex-col'>
      <Header />

      <main className='mx-auto w-full max-w-7xl flex-1 px-6 py-12'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div>
            <h1 className='text-3xl font-bold text-ink'>
              {TEMPLATES.length} modèles prêts à publier
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

        <div className='mt-8 flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-wrap gap-3'>
            {CATEGORIES.map(cat => {
              const isActive = cat.label === category
              return (
                <button
                  key={cat.label}
                  type='button'
                  onClick={() => setCategory(cat.label)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                      : 'border border-border text-muted hover:border-faint hover:text-ink'
                  }`}
                >
                  {cat.label} · {cat.count}
                </button>
              )
            })}
          </div>

          <div className='flex gap-3'>
            {['GRATUIT', 'PREMIUM'].map(price => {
              const isActive = priceFilter === price
              return (
                <button
                  key={price}
                  type='button'
                  onClick={() => setPriceFilter(isActive ? null : price)}
                  className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                    isActive
                      ? price === 'PREMIUM'
                        ? 'bg-[color:var(--color-gold)] text-bg'
                        : 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                      : 'border border-border text-muted hover:border-faint hover:text-ink'
                  }`}
                >
                  {price === 'GRATUIT' ? 'Gratuit' : 'Premium'}
                </button>
              )
            })}
          </div>
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
