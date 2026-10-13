import { useState } from 'react'

const INITIAL = [
  {
    key: 'calendar',
    name: 'Google Calendar',
    description: 'Synchronisez vos événements avec votre agenda.',
    connected: true,
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Envoyez les invitations et relances par WhatsApp.',
    connected: true,
  },
  {
    key: 'stripe',
    name: 'Stripe',
    description: 'Encaissez vos billets et dons en ligne.',
    connected: false,
  },
  {
    key: 'zapier',
    name: 'Zapier',
    description: 'Connectez TBF Moment à plus de 5000 applications.',
    connected: false,
  },
]

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState(INITIAL)

  const toggle = (key) =>
    setIntegrations((prev) =>
      prev.map((i) => (i.key === key ? { ...i, connected: !i.connected } : i)),
    )

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Intégrations</h2>
      <p className="mt-1 text-sm text-muted">
        Connectez TBF Moment aux outils que vous utilisez déjà.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => (
          <div
            key={integration.key}
            className="rounded-xl border border-border-soft px-5 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{integration.name}</p>
                <p className="mt-1 text-xs text-faint">
                  {integration.description}
                </p>
              </div>
              {integration.connected && (
                <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
                  Connecté
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggle(integration.key)}
              className={`mt-4 w-full rounded-lg border px-4 py-2 text-sm font-medium transition ${
                integration.connected
                  ? 'border-danger/30 text-danger hover:bg-danger/10'
                  : 'border-brand-purple text-brand-purple hover:bg-brand-purple/10'
              }`}
            >
              {integration.connected ? 'Déconnecter' : 'Connecter'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
