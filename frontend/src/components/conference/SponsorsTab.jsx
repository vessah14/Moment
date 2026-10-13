import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { SPONSOR_TIERS } from '../../data/conference'
import Button from '../ui/Button'
import { useToast } from '../../utils/useToast'

const TIER_STYLES = {
  Platine: 'border-[color:var(--color-gold)]/60 text-[color:var(--color-gold)]',
  Or: 'border-brand-orange/50 text-brand-orange',
  Argent: 'border-border text-muted',
  Bronze: 'border-border text-faint',
}

export default function SponsorsTab({ sponsors, onAdd, onRemove }) {
  const toast = useToast()
  const [formOpen, setFormOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const name = form.get('name')?.toString().trim()
    const tier = form.get('tier')?.toString()
    if (!name) return
    onAdd({ name, tier })
    setFormOpen(false)
    e.target.reset()
    toast(`${name} ajouté (${tier})`)
  }

  const handleRemove = (sponsor) => {
    onRemove(sponsor.id)
    toast(`${sponsor.name} retiré`, { variant: 'danger' })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-ink">Sponsors</h2>
          <p className="mt-1 text-sm text-muted">{sponsors.length} sponsor(s)</p>
        </div>
        <Button variant="gradient" onClick={() => setFormOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Ajouter un sponsor
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-purple/40 bg-surface p-5"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">Nom du sponsor</span>
            <input
              name="name"
              required
              className="mt-1.5 w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Niveau</span>
            <select
              name="tier"
              defaultValue="Argent"
              className="mt-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            >
              {SPONSOR_TIERS.map((tier) => (
                <option key={tier}>{tier}</option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="gradient">
            Ajouter
          </Button>
        </form>
      )}

      <div className="mt-5 space-y-6">
        {SPONSOR_TIERS.map((tier) => {
          const tierSponsors = sponsors.filter((s) => s.tier === tier)
          if (tierSponsors.length === 0) return null
          return (
            <div key={tier}>
              <h3 className="text-xs font-semibold tracking-wider text-faint uppercase">
                {tier}
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tierSponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className={`flex items-center justify-between rounded-xl border bg-surface px-4 py-3 ${TIER_STYLES[sponsor.tier]}`}
                  >
                    <span className="text-sm font-medium">{sponsor.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(sponsor)}
                      className="text-faint hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
