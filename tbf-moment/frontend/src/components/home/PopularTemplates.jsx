import { Link } from 'react-router-dom'
import TemplateCard from '../templates/TemplateCard'
import BrandBackdrop from '../ui/BrandBackdrop'

const TEMPLATES = [
  { name: 'Éclat', category: 'Mariage', meta: 'Mariage · 8 blocs', badge: 'GRATUIT' },
  { name: 'Signal', category: 'Conférence', meta: 'Conférence · 11 blocs', badge: 'PREMIUM' },
  { name: 'Confetti', category: 'Anniversaire', meta: 'Anniversaire · 7 blocs', badge: 'GRATUIT' },
  { name: 'Promo', category: 'Graduation', meta: 'Graduation · 9 blocs', badge: 'PREMIUM' },
]

export default function PopularTemplates({ category }) {
  const filtered =
    !category || category === 'Tous'
      ? TEMPLATES
      : TEMPLATES.filter((tpl) => tpl.category === category)

  return (
    <section id="modeles" className="relative overflow-hidden">
      <BrandBackdrop side="left" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-ink">Modèles populaires</h2>
            <p className="mt-2 text-muted">
              {category
                ? `Modèles ${category.toLowerCase()} prêts à publier.`
                : 'Dupliquez, modifiez dans le Builder, publiez.'}
            </p>
          </div>
          <Link
            to="/modeles"
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            Voir les 48 modèles
          </Link>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((tpl) => (
              <TemplateCard key={tpl.name} {...tpl} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border-soft py-12 text-center">
            <p className="text-sm text-muted">
              Pas encore de modèle vedette pour « {category} », mais la
              bibliothèque complète en propose déjà.
            </p>
            <Link
              to="/modeles"
              className="mt-3 inline-block text-sm font-medium text-brand-purple hover:underline"
            >
              Explorer les 48 modèles
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
