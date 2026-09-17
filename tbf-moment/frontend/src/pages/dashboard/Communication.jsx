import { Plus } from 'lucide-react'
import { useState } from 'react'
import AutoReminders from '../../components/communication/AutoReminders'
import CampaignComposer from '../../components/communication/CampaignComposer'
import CampaignsList from '../../components/communication/CampaignsList'
import StatCard from '../../components/dashboard/StatCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'

const INITIAL_CAMPAIGNS = [
  {
    id: 1,
    name: 'Invitation initiale',
    channel: 'WhatsApp',
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
]

export default function Communication() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS)
  const [composerOpen, setComposerOpen] = useState(false)

  const handleCreate = (campaign) => {
    setCampaigns((prev) => [{ id: Date.now(), ...campaign }, ...prev])
    setComposerOpen(false)
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

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Communication</h1>
          <p className="mt-1.5 text-sm text-muted">
            Campagnes et rappels — Mariage Awa & Ibrahim
          </p>
        </div>
        <Button variant="gradient" onClick={() => setComposerOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Nouvelle campagne
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          {composerOpen && (
            <CampaignComposer
              onCreate={handleCreate}
              onCancel={() => setComposerOpen(false)}
            />
          )}
          <h2 className="mb-3 font-semibold text-ink">Campagnes</h2>
          <CampaignsList campaigns={campaigns} />
        </div>

        <AutoReminders />
      </div>
    </DashboardLayout>
  )
}
