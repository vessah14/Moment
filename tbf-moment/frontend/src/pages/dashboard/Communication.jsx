import { useEffect, useState } from 'react'
import AutoReminders from '../../components/communication/AutoReminders'
import CampaignComposer from '../../components/communication/CampaignComposer'
import CampaignsList from '../../components/communication/CampaignsList'
import StatCard from '../../components/dashboard/StatCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { listEvents } from '../../api/events'
import { createCampaign, listCampaigns } from '../../api/campaigns'

const TABS = ['Email', 'SMS', 'Notifications', 'Rappels']
const TAB_CHANNEL = { Email: 'E-mail', SMS: 'SMS', Notifications: 'Push' }

export default function Communication() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Email')

  useEffect(() => {
    listEvents()
      .then((data) => {
        setEvents(data ?? [])
        if (data?.length) setSelectedEventId(data[0].id)
        else setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Impossible de charger vos événements.')
        setLoading(false)
      })
  }, [])

  const reload = (eventId) => {
    setLoading(true)
    listCampaigns(eventId)
      .then((data) => {
        setCampaigns(data ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger les campagnes.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  const handleCreate = async (campaign) => {
    setError('')
    try {
      await createCampaign(campaign, selectedEventId)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "La création a échoué.")
      throw err
    }
  }

  const stats = [
    {
      label: 'Campagnes envoyées',
      value: String(campaigns.filter((c) => c.status === 'Envoyee').length),
    },
    {
      label: 'Brouillons',
      value: String(campaigns.filter((c) => c.status === 'Brouillon').length),
    },
    {
      label: 'Destinataires totaux',
      value: String(campaigns.reduce((sum, c) => sum + c.recipientCount, 0)),
    },
  ]

  const activeChannel = TAB_CHANNEL[tab]
  const filteredCampaigns = activeChannel
    ? campaigns.filter((c) => c.channel === activeChannel)
    : []

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Messages & Communications</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez d'abord un événement.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Messages & Communications</h1>
          <p className="mt-1.5 text-sm text-muted">
            Rédigez et enregistrez des campagnes e-mail, SMS et notifications de vos événements.
          </p>
        </div>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t
                ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                : 'border border-border text-muted hover:border-faint hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Rappels' ? (
        <div className="mt-6 max-w-2xl">
          <AutoReminders />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="mb-3 font-semibold text-ink">Historique</h2>
            {loading ? (
              <p className="text-sm text-faint">Chargement…</p>
            ) : (
              <CampaignsList campaigns={filteredCampaigns} />
            )}
          </div>

          <CampaignComposer key={tab} defaultChannel={activeChannel} onCreate={handleCreate} />
        </div>
      )}
    </DashboardLayout>
  )
}
