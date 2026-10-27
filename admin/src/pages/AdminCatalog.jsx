import { useMemo, useState } from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import { EVENT_TYPES, EVENT_UNIVERSES, LOGO_POLICY } from '../../../frontend/src/data/eventTypes.js'
import { TEMPLATES } from '../../../frontend/src/data/templates.js'

export default function AdminCatalog() {
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLocaleLowerCase('fr')
  const visibleTypes = useMemo(
    () => EVENT_TYPES.filter((type) =>
      `${type.label} ${type.categoryCode} ${EVENT_UNIVERSES.find((universe) => universe.id === type.univers)?.label ?? ''}`
        .toLocaleLowerCase('fr')
        .includes(normalizedSearch),
    ),
    [normalizedSearch],
  )
  const visibleTemplates = useMemo(
    () => TEMPLATES.filter((template) =>
      `${template.name} ${template.category} ${template.description}`
        .toLocaleLowerCase('fr')
        .includes(normalizedSearch),
    ),
    [normalizedSearch],
  )

  return (
    <AdminLayout>
      <header>
        <h1 className="text-2xl font-bold text-ink">Catalogue</h1>
        <p className="mt-1.5 text-sm text-muted">
          Types d’événement et modèles actuellement proposés dans le parcours de création. Lecture seule.
        </p>
      </header>

      <label className="mt-6 block max-w-lg">
        <span className="sr-only">Rechercher dans le catalogue</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un type ou un modèle…"
          className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand-purple"
        />
      </label>

      <section className="mt-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">Types d’événement</h2>
          <span className="text-xs text-faint">{visibleTypes.length} / {EVENT_TYPES.length}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleTypes.map((type) => {
            const universe = EVENT_UNIVERSES.find((item) => item.id === type.univers)
            const templates = type.templates.map((id) => TEMPLATES.find((template) => template.theme === id)).filter(Boolean)
            return (
              <article key={type.id} className="rounded-xl border border-border-soft bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{type.label}</h3>
                    <p className="mt-1 text-xs text-faint">{universe?.label} · {type.categoryCode}</p>
                  </div>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
                    Logo {LOGO_POLICY[type.logo]?.toLowerCase()}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted">
                  Modèles conseillés : {templates.length ? templates.map((template) => template.name).join(', ') : 'aucun associé'}
                </p>
              </article>
            )
          })}
          {visibleTypes.length === 0 && <p className="text-sm text-faint">Aucun type correspondant.</p>}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">Modèles de site</h2>
          <span className="text-xs text-faint">{visibleTemplates.length} / {TEMPLATES.length}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTemplates.map((template) => (
            <article key={template.theme} className="overflow-hidden rounded-xl border border-border-soft bg-surface">
              <div
                className="flex min-h-36 flex-col justify-end p-5"
                style={{ backgroundColor: template.preview.bg, color: template.preview.ink }}
              >
                <p className="text-xs opacity-80">{template.preview.eyebrow}</p>
                <p className="mt-1 font-heading text-2xl font-semibold">{template.preview.title}</p>
                <p className="mt-2 text-xs opacity-80">{template.preview.date}</p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{template.name}</h3>
                    <p className="mt-1 text-xs text-muted">{template.category} · {template.blocks.length} blocs</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${template.premium ? 'bg-brand-purple/15 text-brand-purple' : 'bg-success/15 text-success'}`}>
                    {template.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-5 text-muted">{template.description}</p>
                <p className="mt-3 text-xs text-faint">{template.blocks.join(' · ')}</p>
              </div>
            </article>
          ))}
          {visibleTemplates.length === 0 && <p className="text-sm text-faint">Aucun modèle correspondant.</p>}
        </div>
      </section>
    </AdminLayout>
  )
}
