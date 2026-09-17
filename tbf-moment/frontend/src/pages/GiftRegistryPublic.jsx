import { useState } from 'react'
import CagnottePanel from '../components/gifts/CagnottePanel'
import GiftCard from '../components/gifts/GiftCard'
import Button from '../components/ui/Button'
import { INITIAL_CAGNOTTE, INITIAL_GIFTS } from '../data/giftRegistry'
import { formatFcfa } from '../utils/formatCurrency'

export default function GiftRegistryPublic() {
  const [gifts, setGifts] = useState(INITIAL_GIFTS)
  const [cagnotte, setCagnotte] = useState(INITIAL_CAGNOTTE)
  const [contribution, setContribution] = useState('')
  const [lastContribution, setLastContribution] = useState(0)
  const [contributed, setContributed] = useState(false)

  const handleReserve = (id) => {
    const name = window.prompt('Votre nom, pour que les mariés sachent qui les gâte ?')
    if (!name?.trim()) return
    setGifts((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, status: 'reserved', reservedBy: name.trim() } : g,
      ),
    )
  }

  const handleContribute = (e) => {
    e.preventDefault()
    const amount = Number(contribution)
    if (!amount || amount <= 0) return
    setCagnotte((prev) => ({
      ...prev,
      raised: prev.raised + amount,
      contributions: [{ name: 'Vous', amount }, ...prev.contributions],
    }))
    setLastContribution(amount)
    setContribution('')
    setContributed(true)
    setTimeout(() => setContributed(false), 3000)
  }

  return (
    <div className="min-h-svh bg-bg px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-purple uppercase">
            Liste de mariage
          </span>
          <h1 className="mt-4 text-3xl font-bold text-ink">Awa & Ibrahim</h1>
          <p className="mt-2 text-muted">
            Merci de faire partie de notre histoire. Voici quelques idées pour
            nous accompagner dans cette nouvelle étape.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-5 sm:grid-cols-2">
            {gifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                footer={
                  gift.status === 'available' ? (
                    <Button
                      variant="gradient"
                      className="mt-4 w-full"
                      onClick={() => handleReserve(gift.id)}
                    >
                      Je réserve ce cadeau
                    </Button>
                  ) : (
                    <p className="mt-4 text-center text-xs text-faint">
                      {gift.status === 'given'
                        ? 'Déjà offert, merci !'
                        : `Déjà réservé par ${gift.reservedBy}`}
                    </p>
                  )
                }
              />
            ))}
          </div>

          <CagnottePanel cagnotte={cagnotte}>
            <form onSubmit={handleContribute} className="mt-4 space-y-2">
              <label className="block">
                <span className="text-xs font-medium text-ink">
                  Montant à contribuer (FCFA)
                </span>
                <input
                  type="number"
                  min="1"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder="10000"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
                />
              </label>
              <Button type="submit" variant="gradient" className="w-full">
                Contribuer
              </Button>
              {contributed && (
                <p className="text-center text-xs text-success">
                  Merci pour votre contribution de {formatFcfa(lastContribution)} !
                </p>
              )}
            </form>
          </CagnottePanel>
        </div>
      </div>
    </div>
  )
}
