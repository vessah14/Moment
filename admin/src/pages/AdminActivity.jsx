import { useEffect, useState } from 'react'
import { listAdminActivity } from '../api/platform'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import { describeActivity } from '../utils/activityLabels'

const formatDate = (value) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value))

export default function AdminActivity() {
  const [activity, setActivity] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listAdminActivity(250)
      .then(setActivity)
      .catch((err) => setError(err.message || 'Impossible de charger le journal.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <header>
        <h1 className="text-2xl font-bold text-ink">Journal d’activité</h1>
        <p className="mt-1.5 text-sm text-muted">
          Modifications effectuées par les superadmins. Les actions sont conservées 90 jours à compter du déploiement.
        </p>
      </header>

      {error && (
        <p className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <section className="mt-8 overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold text-ink">Actions récentes</h2>
          <span className="text-xs text-faint">Maximum 250 entrées</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Administrateur</th>
                <th className="px-3 py-3 font-medium">Action</th>
                <th className="px-3 py-3 font-medium">Détail technique</th>
              </tr>
            </thead>
            <tbody>
              {!loading && activity.length === 0 && !error && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-faint">Aucune action enregistrée depuis l’activation du journal.</td></tr>
              )}
              {activity.map((item, index) => (
                <tr key={`${item.createdAt}-${index}`} className="border-b border-border-soft last:border-b-0">
                  <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(item.createdAt)}</td>
                  <td className="px-3 py-3 text-ink">{item.adminEmail}</td>
                  <td className="px-3 py-3 text-ink">
                    {(() => {
                      const { label, link } = describeActivity(item.httpMethod, item.route)
                      return link ? <Link to={link} className="hover:text-brand-purple hover:underline">{label}</Link> : label
                    })()}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-faint">{item.httpMethod} {item.route}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  )
}
