import { Check, FileDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import BarRow from '../../components/analytics/BarRow'
import RsvpDonut from '../../components/analytics/RsvpDonut'
import VisitsChart from '../../components/analytics/VisitsChart'
import StatCard from '../../components/dashboard/StatCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'

const STATS = [
  { label: 'Visites', value: '3 148', hint: '+18%', hintColor: 'success' },
  { label: 'Ouvertures', value: '71%', hint: '+4 pts', hintColor: 'success' },
  { label: 'RSVP', value: '412', hint: 'stable' },
  { label: 'Billets', value: '318', hint: '+27', hintColor: 'success' },
  { label: 'Partages', value: '864', hint: '+9%', hintColor: 'success' },
  { label: 'Scans', value: '241', hint: 'jour J' },
]

const RSVP_BREAKDOWN = [
  { label: 'Confirmés', value: 287, dot: 'bg-[color:var(--color-chart-green)]' },
  { label: 'En attente', value: 96, dot: 'bg-[color:var(--color-chart-amber)]' },
  { label: 'Refus', value: 29, dot: 'bg-[color:var(--color-chart-rose)]' },
]

const TRAFFIC_SOURCES = [
  { label: 'WhatsApp', value: 54 },
  { label: 'Lien direct', value: 21 },
  { label: 'E-mail', value: 14 },
  { label: 'Réseaux sociaux', value: 11 },
]

const DEVICES = [
  { label: 'Android', value: 68 },
  { label: 'iOS', value: 24 },
  { label: 'Desktop', value: 8 },
]

const REPORTS = ['Rapport RSVP · PDF', 'Participants · CSV', 'Journal check-in · CSV']

const CSV_REPORTS = {
  'Participants · CSV': {
    filename: 'participants.csv',
    content:
      'Nom,Statut,Accompagnants\nFatou Ndiaye,Confirmé,2\nMoussa Traoré,En attente,0\nAminata Bâ,Refus,0\nIbrahima Sow,Confirmé,1',
  },
  'Journal check-in · CSV': {
    filename: 'journal-checkin.csv',
    content:
      'Heure,Participant,Résultat\n09:41:07,Fatou Ndiaye,Validé\n09:40:52,Moussa Traoré,Double scan\n09:40:31,Aminata Bâ,Validé',
  },
}

export default function Analytics() {
  const [reportState, setReportState] = useState({})

  const handleExportReport = (report) => {
    setReportState((prev) => ({ ...prev, [report]: 'loading' }))
    setTimeout(() => {
      const csvReport = CSV_REPORTS[report]
      if (csvReport) {
        const blob = new Blob([csvReport.content], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = csvReport.filename
        link.click()
        URL.revokeObjectURL(url)
      }
      setReportState((prev) => ({ ...prev, [report]: 'done' }))
    }, 900)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Statistiques</h1>
          <p className="mt-1.5 text-sm text-muted">
            Tous les événements · 30 derniers jours
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Tous les événements</Button>
          <Button variant="outline">30 jours</Button>
          <Button variant="outline">Rapport</Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-soft bg-panel p-5">
          <h2 className="font-semibold text-ink">Visites et RSVP</h2>
          <VisitsChart />
        </div>

        <div className="rounded-2xl border border-border-soft bg-panel p-5">
          <h2 className="font-semibold text-ink">Répartition RSVP</h2>
          <RsvpDonut />
          <div className="mt-2 space-y-2">
            {RSVP_BREAKDOWN.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink">
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                  {item.label}
                </span>
                <span className="font-mono text-muted">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <h2 className="font-semibold text-ink">Sources de trafic</h2>
          <div className="mt-4 space-y-4">
            {TRAFFIC_SOURCES.map((s) => (
              <BarRow key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <h2 className="font-semibold text-ink">Appareils</h2>
          <div className="mt-4 space-y-4">
            {DEVICES.map((d) => (
              <BarRow
                key={d.label}
                label={d.label}
                value={d.value}
                colorClass="bg-[color:var(--color-chart-green)]"
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-faint">
            Priorité mobile-first et optimisation 3G, conformément au cahier des
            charges.
          </p>
        </div>

        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <h2 className="font-semibold text-ink">Rapports exportables</h2>
          <div className="mt-4 space-y-2">
            {REPORTS.map((report) => {
              const state = reportState[report]
              return (
                <button
                  key={report}
                  type="button"
                  disabled={state === 'loading'}
                  onClick={() => handleExportReport(report)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border-soft px-4 py-3 text-left text-sm text-ink transition hover:border-faint disabled:opacity-70"
                >
                  {state === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted" />
                  ) : state === 'done' ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <FileDown className="h-4 w-4 text-muted" />
                  )}
                  <span className="flex-1">{report}</span>
                  {state && (
                    <span className="text-xs text-faint">
                      {state === 'loading' ? 'Préparation…' : 'Prêt'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
