import { EVENT_TYPES } from '../../data/eventTypes'
import BrandBackdrop from '../ui/BrandBackdrop'

export default function EventTypeTabs({ active, onChange }) {
  return (
    <section className="relative overflow-hidden border-y border-border-soft/60">
      <BrandBackdrop side="left" />
      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-xs font-semibold tracking-widest text-faint uppercase">
          Quel événement organisez-vous ?
        </h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {EVENT_TYPES.map((type) => {
            const isActive = type === active
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange(type)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                    : 'border border-border text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {type}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
