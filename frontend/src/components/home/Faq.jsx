import { useState } from 'react'
import { HOME_FAQ } from '../../data/homeFaq'
import BrandBackdrop from '../ui/BrandBackdrop'
import SectionHeader from './SectionHeader'

const QUESTIONS = HOME_FAQ

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="relative overflow-hidden">
      <BrandBackdrop side="left" />
      <div className="relative mx-auto max-w-2xl px-6 py-20 text-center">
        <SectionHeader eyebrow="Questions" title="Questions fréquentes">
          Tout ce que vous devez savoir pour démarrer sereinement sur notre plateforme.
        </SectionHeader>

        <div className="mt-8 space-y-3 text-left">
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
                    className={`shrink-0 text-faint transition ${isOpen ? 'rotate-45' : ''}`}
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
    </section>
  )
}
