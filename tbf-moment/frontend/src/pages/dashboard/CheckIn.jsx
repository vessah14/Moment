import { ScanLine } from 'lucide-react'
import { useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import StatCard from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import DashboardLayout from '../../components/layout/DashboardLayout'

const INITIAL_SCANS = [
  {
    time: '09:41:07',
    name: 'Fatou Ndiaye',
    ticket: 'VIP',
    post: 'Poste A',
    result: 'Validé',
  },
  {
    time: '09:40:52',
    name: 'Moussa Traoré',
    ticket: 'Standard',
    post: 'Poste B',
    result: 'Double scan',
  },
  {
    time: '09:40:31',
    name: 'Aminata Bâ',
    ticket: 'Étudiant',
    post: 'Poste A',
    result: 'Validé',
  },
  {
    time: '09:39:58',
    name: 'Ibrahima Sow',
    ticket: 'Standard',
    post: 'Poste C',
    result: 'Validé',
  },
]

const NEXT_GUESTS = [
  { name: 'Khadija Fall', ticket: 'Standard' },
  { name: 'Omar Diallo', ticket: 'VIP' },
  { name: 'Bineta Cissé', ticket: 'Étudiant' },
]

export default function CheckIn() {
  const [scans, setScans] = useState(INITIAL_SCANS)
  const [lastResult, setLastResult] = useState(scans[0])
  const [attended, setAttended] = useState(241)

  const recordScan = (guest) => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour12: false })
    const entry = {
      time,
      name: guest.name,
      ticket: guest.ticket,
      post: 'Poste A',
      result: 'Validé',
    }
    setScans((prev) => [entry, ...prev])
    setLastResult(entry)
    setAttended((prev) => prev + 1)
  }

  const handleScan = () => {
    const guest = NEXT_GUESTS[scans.length % NEXT_GUESTS.length]
    recordScan(guest)
  }

  const handleManualEntry = () => {
    const code = window.prompt('Code du billet (ex: TBF-2027-0X4J91) ?')
    if (!code?.trim()) return
    recordScan({ name: `Billet ${code.trim()}`, ticket: 'Manuel' })
  }

  const handleExportLog = () => {
    const header = 'Heure,Participant,Billet,Poste,Résultat'
    const rows = scans.map((s) => [s.time, s.name, s.ticket, s.post, s.result].join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'journal-checkin.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const STATS = [
    { label: 'Présents', value: String(attended), hint: '', valueStyle: 'success' },
    { label: 'Attendus', value: '318', hint: `${318 - attended} restants` },
    { label: 'Refusés', value: '7', hint: 'doubles scans' },
    { label: 'Débit / min', value: '11', hint: 'fluide' },
  ]

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">Check-in QR</h1>
        <p className="mt-1.5 text-sm text-muted">
          Application agent + console d'entrée
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-border-soft bg-panel p-5">
          <div className="flex items-center justify-between text-xs text-faint">
            <span className="font-mono">
              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>Poste A</span>
          </div>

          <div className="relative mt-3 flex aspect-3/4 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-surface))]">
            <div className="h-32 w-32 rounded-lg border-2 border-dashed border-brand-purple/60" />
            <span className="absolute bottom-4 text-xs text-ink/70">
              Alignez le QR dans le cadre
            </span>
          </div>

          {lastResult.result === 'Validé' ? (
            <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3">
              <p className="text-sm font-semibold text-success">Entrée validée</p>
              <p className="mt-1 text-sm text-ink">{lastResult.name}</p>
              <p className="mt-0.5 font-mono text-xs text-faint">
                {lastResult.time} · {lastResult.ticket}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3">
              <p className="text-sm font-semibold text-danger">Billet déjà scanné</p>
              <p className="mt-1 text-xs text-muted">{lastResult.name}</p>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleManualEntry}>
              Manuel
            </Button>
            <Button variant="gradient" className="flex-1" onClick={handleScan}>
              <ScanLine className="h-4 w-4" />
              Scanner
            </Button>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink">Console d'entrée</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <span className="h-2 w-2 rounded-full bg-success" />
                3 postes connectés · flux temps réel
              </p>
            </div>
            <Button variant="outline" onClick={handleExportLog}>
              Exporter le journal
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
                  <th className="px-6 py-3 font-medium">Heure</th>
                  <th className="px-3 py-3 font-medium">Participant</th>
                  <th className="px-3 py-3 font-medium">Billet</th>
                  <th className="px-3 py-3 font-medium">Poste</th>
                  <th className="px-3 py-3 font-medium">Résultat</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan, index) => (
                  <tr
                    key={`${scan.time}-${index}`}
                    className="border-b border-border-soft last:border-b-0"
                  >
                    <td className="px-6 py-4 font-mono text-muted">{scan.time}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={scan.name} />
                        <span className="font-medium text-ink">{scan.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-muted">{scan.ticket}</td>
                    <td className="px-3 py-4 text-muted">{scan.post}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={scan.result} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
