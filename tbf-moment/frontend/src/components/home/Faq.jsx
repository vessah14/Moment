import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandBackdrop from '../ui/BrandBackdrop'
import Button from '../ui/Button'

const QUESTIONS = [
  {
    q: 'Puis-je créer un événement gratuitement ?',
    a: 'Le plan Free couvre un événement actif, 50 invités, les modèles gratuits et le RSVP de base.',
  },
  {
    q: 'Comment fonctionnent les QR Codes ?',
    a: "Chaque invité reçoit un QR unique scanné à l'entrée pour valider sa présence en temps réel.",
  },
  {
    q: 'Puis-je vendre des billets ?',
    a: 'Oui, la billetterie intégrée gère les billets payants, les quotas et les remboursements.',
  },
  {
    q: 'Mes données sont-elles isolées ?',
    a: "Chaque événement est cloisonné : vos invités et vos statistiques restent privés à votre organisation.",
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="relative overflow-hidden">
      <BrandBackdrop side="left" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold text-ink">Questions fréquentes</h2>
          <div className="mt-8 space-y-3">
            {QUESTIONS.map((item, index) => {
              const isOpen = index === openIndex
              return (
                <div
                  key={item.q}
                  className="rounded-xl border border-border-soft bg-surface"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-ink">
                      {item.q}
                    </span>
                    <span
                      className={`text-faint transition ${isOpen ? 'rotate-45' : ''}`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-4 text-sm text-muted">{item.a}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border-soft bg-[linear-gradient(160deg,_var(--color-surface),_var(--color-panel))] p-10">
          <span className="text-xs font-semibold tracking-widest text-success uppercase">
            Sans carte bancaire
          </span>
          <h3 className="mt-4 text-2xl font-bold text-ink">
            Votre premier événement en ligne aujourd'hui
          </h3>
          <p className="mt-4 text-muted">
            Choisissez un modèle, invitez vos proches, suivez les réponses.
            Vous passez à un plan supérieur seulement si vous en avez besoin.
          </p>
          <Button as={Link} to="/inscription" variant="gradient" className="mt-6">
            Créer mon événement
          </Button>
        </div>
      </div>
    </section>
  )
}
