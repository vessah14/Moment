import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicReviews } from '../../api/account'
import Avatar from '../ui/Avatar'
import BrandBackdrop from '../ui/BrandBackdrop'
import SectionHeader from './SectionHeader'

// Témoignages : avis réels des clients, publiés après validation par l'équipe (console
// admin, Modération). Sans avis publié, la section n’apparaît pas : un visiteur ne doit
// jamais voir un emplacement vide.
export default function Testimonials() {
  const [reviews, setReviews] = useState(null)

  useEffect(() => {
    let cancelled = false
    getPublicReviews(6)
      .then((data) => !cancelled && setReviews(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setReviews([]))
    return () => {
      cancelled = true
    }
  }, [])

  if (!reviews?.length) return null

  return (
    <section className="relative overflow-hidden">
      <BrandBackdrop side="left" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <SectionHeader
          eyebrow="Témoignages"
          title="Ils ont créé leur moment"
          action={
            <Link to="/dashboard/avis" className="text-sm font-medium text-brand-purple hover:underline">
              Donner mon avis
            </Link>
          }
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {reviews.map((t, i) => (
            <figure key={`${t.displayName}-${i}`} className="rounded-2xl border border-border-soft bg-surface p-6">
              <div className="flex gap-0.5 text-brand-orange" role="img" aria-label={`${t.rating} étoiles sur 5`}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={`h-3.5 w-3.5 ${k < t.rating ? 'fill-current' : 'text-border'}`} />
                ))}
              </div>
              <blockquote className="mt-3 text-sm whitespace-pre-line text-muted">« {t.comment} »</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar name={t.displayName} />
                <div>
                  <p className="text-sm font-medium text-ink">{t.displayName}</p>
                  {t.context && <p className="text-xs text-faint">{t.context}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
