import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import GiftCard from '../components/gifts/GiftCard'
import Button from '../components/ui/Button'
import { getPublicEvent, getPublicGifts, reservePublicGift } from '../api/giftRegistry'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { useSeo } from '../utils/seo'
import { findTemplate, resolveSiteStyle, siteRootStyle } from '../utils/templateTheme'

export default function GiftRegistryPublic() {
  const { code } = useParams()
  const [event, setEvent] = useState(null)
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reservingId, setReservingId] = useState('')
  useSeo({
    title: event?.name ? `Liste de cadeaux · ${event.name}` : 'Liste de cadeaux',
    noindex: true,
  })

  const reload = () => {
    Promise.all([getPublicEvent(code), getPublicGifts(code)])
      .then(([eventData, giftsData]) => {
        setEvent(eventData)
        setGifts(giftsData ?? [])
        setError('')
      })
      .catch(() => setError("Cette liste de cadeaux n'est pas disponible."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const handleReserve = async (giftId) => {
    const name = window.prompt('Votre nom, pour que les organisateurs sachent qui les gâte ?')
    if (!name?.trim()) return
    setReservingId(giftId)
    try {
      await reservePublicGift(giftId, { reservedByName: name.trim() })
      reload()
    } catch (err) {
      setError(err.message || 'La réservation a échoué — quelqu\'un vient peut-être de le réserver.')
    } finally {
      setReservingId('')
    }
  }

  const toCardProps = (gift) => ({
    id: gift.id,
    name: gift.name,
    description: gift.description,
    price: gift.priceCents,
    status: gift.isReserved ? 'reserved' : 'available',
    reservedBy: gift.reservedByName,
  })

  if (loading) {
    return <div className="flex min-h-svh items-center justify-center text-sm text-faint">Chargement…</div>
  }

  if (error || !event) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6 text-center text-sm text-faint">
        {error || 'Liste de cadeaux introuvable.'}
      </div>
    )
  }

  const template = findTemplate(event.template)
  const siteStyle = resolveSiteStyle({ template, themeColor: event.themeColor })

  return (
    <div
      className="min-h-svh bg-bg px-6 py-12 text-ink"
      style={siteRootStyle(template, siteStyle)}
      data-template={template?.name ?? 'custom'}
    >
      <LanguageSwitcher floating />
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-purple uppercase">
            Liste de cadeaux
          </span>
          <h1
            className="mt-4 text-3xl font-bold text-ink"
            style={{ fontFamily: 'var(--site-heading-font)' }}
          >
            {event.name}
          </h1>
          <p className="mt-2 text-muted">
            Merci de faire partie de notre histoire. Voici quelques idées pour nous accompagner.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {gifts.length === 0 && (
            <p className="col-span-full text-center text-sm text-faint">
              Aucun cadeau proposé pour le moment.
            </p>
          )}
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={toCardProps(gift)}
              footer={
                gift.isReserved ? (
                  <p className="mt-4 text-center text-xs text-faint">
                    Déjà réservé par {gift.reservedByName}
                  </p>
                ) : (
                  <Button
                    variant="gradient"
                    className="mt-4 w-full"
                    disabled={reservingId === gift.id}
                    onClick={() => handleReserve(gift.id)}
                  >
                    {reservingId === gift.id ? 'Réservation…' : 'Je réserve ce cadeau'}
                  </Button>
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
