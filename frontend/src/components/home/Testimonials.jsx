import { MessageSquarePlus, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicReviews } from '../../api/account'
import Avatar from '../ui/Avatar'
import BrandBackdrop from '../ui/BrandBackdrop'

// Témoignages : avis réels des clients, publiés après validation par l'équipe (console
// admin, Modération). Sans avis publié, la section invite les clients à donner le leur.
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

  return (
    <section className="relative overflow-hidden">
      <BrandBackdrop side="left" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-brand-purple uppercase">
              Témoignages
            </span>
            <h2 className="mt-3 text-3xl font-bold text-ink">Ils ont créé leur moment</h2>
          </div>
          {reviews?.length > 0 && (
            <Link to="/dashboard/avis" className="text-sm font-medium text-brand-purple hover:underline">
              Donner mon avis
            </Link>
          )}
        </div>

        {reviews === null ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-border-soft bg-surface" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
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
        ) : (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-soft px-6 py-12 text-center">
            <MessageSquarePlus className="h-8 w-8 text-brand-purple" />
            <p className="max-w-md text-sm text-muted">
              Vous avez organisé un événement avec TBF Moment ? Partagez votre expérience : votre avis apparaîtra ici.
            </p>
            <Link to="/dashboard/avis" className="rounded-xl bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white">
              Donner mon avis
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
