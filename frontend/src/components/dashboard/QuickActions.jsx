import { FileSpreadsheet, QrCode, ScanLine, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

const ACTIONS = [
  { label: 'Envoyer des invitations', icon: Send, to: '/dashboard/invitations' },
  {
    label: 'Importer une liste Excel',
    icon: FileSpreadsheet,
    to: '/dashboard/participants',
  },
  { label: 'Générer les QR Codes', icon: QrCode, to: '/dashboard/checkin' },
  { label: 'Ouvrir le mode check-in', icon: ScanLine, to: '/dashboard/checkin' },
]

export default function QuickActions() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-ink">Actions rapides</h2>
        <div className="mt-4 space-y-3">
          {ACTIONS.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex w-full items-center gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3.5 text-left text-sm font-medium text-ink transition hover:border-faint"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2">
                <action.icon className="h-4 w-4 text-muted" />
              </span>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border-soft bg-surface p-5">
        <h3 className="text-xs font-semibold tracking-wider text-faint uppercase">
          Activité
        </h3>
        <p className="mt-3 text-sm text-faint">
          Le flux d'activité en temps réel arrive bientôt.
        </p>
      </div>
    </div>
  )
}
