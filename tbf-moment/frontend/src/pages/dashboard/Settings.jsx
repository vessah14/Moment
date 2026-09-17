import { useState } from 'react'
import BrandTab from '../../components/settings/BrandTab'
import DataExportTab from '../../components/settings/DataExportTab'
import IntegrationsTab from '../../components/settings/IntegrationsTab'
import LanguageTab from '../../components/settings/LanguageTab'
import NotificationsTab from '../../components/settings/NotificationsTab'
import ProfileTab from '../../components/settings/ProfileTab'
import SecurityTab from '../../components/settings/SecurityTab'
import DashboardLayout from '../../components/layout/DashboardLayout'

const TABS = [
  { label: 'Profil', Component: ProfileTab },
  { label: 'Sécurité', Component: SecurityTab },
  { label: 'Notifications', Component: NotificationsTab },
  { label: 'Langue et fuseau', Component: LanguageTab },
  { label: 'Marque', Component: BrandTab },
  { label: 'Intégrations', Component: IntegrationsTab },
  { label: 'Données et export', Component: DataExportTab },
]

export default function Settings() {
  const [tab, setTab] = useState('Profil')

  const ActiveTab = TABS.find((t) => t.label === tab)?.Component ?? ProfileTab

  return (
    <DashboardLayout>
      <h1 className="sr-only">Paramètres du compte</h1>
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold tracking-wider text-faint uppercase">
            Réglages
          </p>
          {TABS.map(({ label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(label)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                tab === label
                  ? 'bg-brand-indigo text-white'
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
