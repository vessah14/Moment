import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BillingTab from '../../components/settings/BillingTab'
import DataExportTab from '../../components/settings/DataExportTab'
import DeleteAccountTab from '../../components/settings/DeleteAccountTab'
import DomainTab from '../../components/settings/DomainTab'
import LanguageTab from '../../components/settings/LanguageTab'
import NotificationsTab from '../../components/settings/NotificationsTab'
import ProfileTab from '../../components/settings/ProfileTab'
import SecurityTab from '../../components/settings/SecurityTab'
import SubscriptionTab from '../../components/settings/SubscriptionTab'
import DashboardLayout from '../../components/layout/DashboardLayout'

const TABS = [
  { label: 'Profil', Component: ProfileTab },
  { label: 'Sécurité', Component: SecurityTab },
  { label: 'Notifications', Component: NotificationsTab },
  { label: 'Abonnement', Component: SubscriptionTab },
  { label: 'Facturation', Component: BillingTab },
  { label: 'Langue et affichage', Component: LanguageTab },
  { label: 'Domaine', Component: DomainTab },
  { label: 'Données et export', Component: DataExportTab },
  { label: 'Supprimer le compte', Component: DeleteAccountTab, danger: true }
]

export default function Settings () {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() =>
    searchParams.get('tab') === 'billing' ? 'Facturation' : 'Profil'
  )

  const ActiveTab = TABS.find(t => t.label === tab)?.Component ?? ProfileTab

  return (
    <DashboardLayout>
      <h1 className='sr-only'>Paramètres du compte</h1>
      <div className='grid gap-8 lg:grid-cols-[200px_1fr]'>
        <nav className='space-y-1'>
          <p className='px-3 text-xs font-semibold tracking-wider text-faint uppercase'>
            Réglages
          </p>
          {TABS.map(({ label, danger }) => (
            <button
              key={label}
              type='button'
              onClick={() => setTab(label)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                tab === label
                  ? danger
                    ? 'bg-danger/15 text-danger'
                    : 'bg-brand-indigo text-white'
                  : danger
                  ? 'text-danger hover:bg-danger/10'
                  : 'text-muted hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <ActiveTab />
      </div>
    </DashboardLayout>
  )
}
