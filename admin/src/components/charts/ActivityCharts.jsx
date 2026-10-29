import { useEffect, useState } from 'react'
import { getTimeSeries } from '../../api/platform'
import { SERIES_COLORS } from './chartColors'
import TrendChart from './TrendChart'

const PERIODS = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '90 jours' },
  { days: 365, label: '12 mois' },
]
const REFRESH_INTERVAL_MS = 30_000

const fcfa = (v) => `${v.toLocaleString('fr-FR')} F`
const updatedAtLabel = (value) => new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}).format(value)

// Au-delà de 90 jours, une barre par jour devient illisible : regroupement par semaine
// (la date affichée est le premier jour de la semaine).
function byWeek(rows) {
  const weeks = []
  for (let i = 0; i < rows.length; i += 7) {
    const chunk = rows.slice(i, i + 7)
    const sum = { date: chunk[0].date }
    for (const row of chunk)
      for (const [k, v] of Object.entries(row)) if (k !== 'date') sum[k] = (sum[k] ?? 0) + v
    weeks.push(sum)
  }
  return weeks
}

// Activité de la plateforme jour par jour, sur la période choisie (heure du Cameroun).
export default function ActivityCharts({ paymentsEnabled }) {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    let cancelled = false
    let loading = false

    const refresh = async () => {
      if (loading || document.visibilityState === 'hidden') return
      loading = true
      try {
        const rows = await getTimeSeries(days)
        if (!cancelled) {
          setData(rows ?? [])
          setLastUpdated(new Date())
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Graphiques indisponibles.')
      } finally {
        loading = false
      }
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    refresh()
    const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [days])

  const [blue, orange] = SERIES_COLORS
  const weekly = days > 90
  const shown = data && weekly ? byWeek(data) : data
  const per = weekly ? 'par semaine' : 'par jour'

  return (
    <section className="mt-8" aria-labelledby="activity-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="activity-heading" className="text-lg font-semibold text-ink">Activité de la plateforme</h2>
        <div className="flex gap-1 rounded-xl border border-border-soft bg-surface p-1" role="group" aria-label="Période">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              aria-pressed={days === p.days}
              onClick={() => setDays(p.days)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${days === p.days ? 'bg-brand-purple text-white' : 'text-muted hover:text-ink'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-right text-xs text-faint" aria-live="polite">
        {lastUpdated
          ? `Données actualisées à ${updatedAtLabel(lastUpdated)} · actualisation automatique toutes les 30 s`
          : 'Chargement des données depuis la base…'}
      </p>

      {error && <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</p>}

      {!data ? (
        <div className="mt-4 grid gap-6 lg:grid-cols-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl border border-border-soft bg-surface" />)}
        </div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <TrendChart title="Nouvelles inscriptions" subtitle={`Comptes créés ${per}`} data={shown} bucket={weekly ? 'week' : 'day'} kind="bar" series={[{ key: 'signups', label: 'Inscriptions', color: blue }]} />
          <TrendChart
            title="Événements"
            subtitle={`Créés et publiés ${per}`}
            data={shown} bucket={weekly ? 'week' : 'day'}
            series={[
              { key: 'eventsCreated', label: 'Créés', color: blue },
              { key: 'eventsPublished', label: 'Publiés', color: orange },
            ]}
          />
          <TrendChart
            title="Invités et réponses"
            subtitle={`Invités ajoutés et réponses reçues ${per}`}
            data={shown} bucket={weekly ? 'week' : 'day'}
            series={[
              { key: 'guests', label: 'Invités ajoutés', color: blue },
              { key: 'rsvps', label: 'Réponses', color: orange },
            ]}
          />
          <TrendChart
            title="Pages d'événement"
            subtitle={`Visites et partages ${per}`}
            data={shown} bucket={weekly ? 'week' : 'day'}
            series={[
              { key: 'visits', label: 'Visites', color: blue },
              { key: 'shares', label: 'Partages', color: orange },
            ]}
          />
          {paymentsEnabled && (
            <TrendChart title="Revenus encaissés" subtitle="Paiements SasPay confirmés, en FCFA" data={shown} bucket={weekly ? 'week' : 'day'} kind="bar" format={fcfa} series={[{ key: 'revenue', label: 'Revenus', color: blue }]} />
          )}
        </div>
      )}
    </section>
  )
}
