import QuickActions from '../components/dashboard/QuickActions'
import RecentEventsTable from '../components/dashboard/RecentEventsTable'
import StatCard from '../components/dashboard/StatCard'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'

const STATS = [
  { label: 'Événements', value: '3', hint: '2 publiés · 1 brouillon' },
  {
    label: 'Invités',
    value: '412',
    hint: '+38 cette semaine',
    hintColor: 'success',
  },
  {
    label: 'Confirmés',
    value: '287',
    hint: '70% de réponses',
    valueStyle: 'brand',
  },
  {
    label: 'En attente',
    value: '96',
    hint: 'relance programmée',
    valueStyle: 'brand',
  },
  {
    label: 'Visiteurs',
    value: '3 148',
    hint: '+18%',
    hintColor: 'success',
  },
]

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Bonjour Awa</h1>
          <p className="mt-1.5 text-muted">
            3 événements actifs · le prochain dans 12 jours
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">30 derniers jours</Button>
          <Button variant="outline">Exporter</Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <RecentEventsTable />
        <QuickActions />
      </div>
    </DashboardLayout>
  )
}
