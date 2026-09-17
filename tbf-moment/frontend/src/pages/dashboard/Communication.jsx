import { useState } from 'react'
import AutoReminders from '../../components/communication/AutoReminders'
import CampaignComposer from '../../components/communication/CampaignComposer'
import CampaignsList from '../../components/communication/CampaignsList'
import StatCard from '../../components/dashboard/StatCard'
import DashboardLayout from '../../components/layout/DashboardLayout'

const INITIAL_CAMPAIGNS = [
  {
    id: 1,
    name: 'Invitation initiale',
    channel: 'E-mail',
    audience: 'Tous les invités',
    scheduledLabel: '01 févr. 2027',
    status: 'Envoyée',
  },
  {
    id: 2,
    name: 'Relance non-répondants',
    channel: 'E-mail',
    audience: 'Non répondus',
    scheduledLabel: '07 mars 2027',
    status: 'Programmée',
  },
  {
    id: 3,
    name: 'Rappel J-1',
    channel: 'SMS',
    audience: 'Confirmés',
    scheduledLabel: '13 mars 2027',
    status: 'Programmée',
  },
  {
    id: 4,
    name: 'Dernières places disponibles !',
    channel: 'SMS',
    audience: 'Non répondus',
    scheduledLabel: '15 mars 2026',
    status: 'Envoyée',
  },
  {
    id: 5,
    name: "Consignes d'accès et plan de table",
    channel: 'Push',
    audience: 'Confirmés',
    scheduledLabel: '01 juin 2027',
    status: 'Brouillon',
  },
]

const TABS = ['Email', 'SMS', 'Notifications', 'Rappels']
const TAB_CHANNEL = { Email: 'E-mail', SMS: 'SMS', Notifications: 'Push' }

export default function Communication() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS)
  const [tab, setTab] = useState('Email')

  const handleCreate = (campaign) => {
    setCampaigns((prev) => [{ id: Date.now(), ...campaign }, ...prev])
  }

  const stats = [
    {
      label: 'Campagnes envoyées',
      value: String(campaigns.filter((c) => c.status === 'Envoyée').length),
    },
    {
      label: 'Programmées',
      value: String(campaigns.filter((c) => c.status === 'Programmée').length),
    },
    { label: "Taux d'ouverture moyen", value: '71%', hint: '+4 pts', hintColor: 'success' },
    { label: 'Désabonnements', value: '3', hint: '0,4% des envois' },
  ]

  const activeChannel = TAB_CHANNEL[tab]
  const filteredCampaigns = activeChannel
    ? campaigns.filter((c) => c.channel === activeChannel)
    : []

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Messages & Communications</h1>
        <p className="mt-1.5 text-sm text-muted">
          Rédigez, programmez et envoyez des e-mails, SMS et rappels de vos
          événements.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
            <h2 className="mb-3 font-semibold text-ink">Modèles & Historiques</h2>
            <CampaignsList campaigns={filteredCampaigns} />
          </div>

          <CampaignComposer key={tab} defaultChannel={activeChannel} onCreate={handleCreate} />
        </div>
      )}
    </DashboardLayout>
  )
}
