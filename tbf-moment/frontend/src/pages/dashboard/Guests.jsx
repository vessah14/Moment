import { Link2, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { createGuest, deleteGuest, listGuests, updateGuest } from '../../api/guests'
import { createGuestGroup, listGuestGroups } from '../../api/guestGroups'
import { listEvents } from '../../api/events'
import { listRsvps } from '../../api/rsvps'
import { slugify } from '../../utils/slugify'
import { GUEST_STATUS_BY_LABEL, guestStatusLabel } from '../../utils/guestStatus'

const FILTERS = ['Tous', 'Confirmés', 'En attente', 'Refus']

export default function Guests() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [groups, setGroups] = useState([])
  const [guests, setGuests] = useState([])
  const [accompanyingByGuest, setAccompanyingByGuest] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('Tous')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [actionMessage, setActionMessage] = useState('')
  const [addFormOpen, setAddFormOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const [bulkGroupTarget, setBulkGroupTarget] = useState('')

  useEffect(() => {
    listEvents()
      .then((data) => {
        setEvents(data ?? [])
        if (data?.length) setSelectedEventId(data[0].id)
        else setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Impossible de charger vos événements.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedEventId) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      listGuests(selectedEventId),
      listGuestGroups(selectedEventId),
      listRsvps({ eventId: selectedEventId }),
    ])
      .then(([guestsData, groupsData, rsvpsData]) => {
        if (cancelled) return
        setGuests(guestsData ?? [])
        setGroups(groupsData ?? [])
        const accompMap = {}
        for (const r of rsvpsData ?? []) accompMap[r.guestId] = r.accompanyingCount
        setAccompanyingByGuest(accompMap)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || 'Impossible de charger les invités.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedEventId])

  const groupNameById = useMemo(() => {
    const map = new Map(groups.map((g) => [g.id, g.name]))
    return (groupId) => (groupId ? (map.get(groupId) ?? '—') : 'Sans groupe')
  }, [groups])

  const reloadGuests = async () => {
    const fresh = await listGuests(selectedEventId)
    setGuests(fresh ?? [])
  }

  const visible = useMemo(() => {
    return guests.filter((g) => {
      const matchesFilter = filter === 'Tous' || g.status === GUEST_STATUS_BY_LABEL[filter]
      const q = query.toLowerCase()
      const matchesQuery =
        g.fullName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [guests, filter, query])

  const counts = useMemo(
    () => ({
      Tous: guests.length,
      Confirmés: guests.filter((g) => g.status === 'Present').length,
      'En attente': guests.filter((g) => g.status === 'EnAttente').length,
      Refus: guests.filter((g) => g.status === 'Absent').length,
    }),
    [guests],
  )

  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCopyLink = async (guest) => {
    const url = `${window.location.origin}/invitation/${slugify(guest.fullName)}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard indisponible (contexte non sécurisé), on affiche quand même le lien
    }
    setCopiedId(guest.id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  const handleDelete = async () => {
    setError('')
    try {
      await Promise.all([...selected].map((id) => deleteGuest(id)))
      await reloadGuests()
      setActionMessage(`${selected.size} invité(s) supprimé(s)`)
      setSelected(new Set())
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const handleBulkChangeGroup = async (groupId) => {
    setBulkGroupTarget(groupId)
    if (!groupId && groupId !== '') return
    setError('')
    try {
      const targets = guests.filter((g) => selected.has(g.id))
      await Promise.all(
        targets.map((g) =>
          updateGuest(g.id, {
            groupId: groupId || null,
            fullName: g.fullName,
            phone: g.phone,
            email: g.email,
            status: g.status,
          }),
        ),
      )
      await reloadGuests()
      setActionMessage(`Groupe mis à jour pour ${selected.size} invité(s)`)
      setSelected(new Set())
    } catch (err) {
      setError(err.message || 'La mise à jour a échoué.')
    } finally {
      setBulkGroupTarget('')
    }
  }

  const handleAddGuest = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const fullName = form.get('name')?.toString().trim()
    const phone = form.get('phone')?.toString().trim()
    const email = form.get('email')?.toString().trim()
    const groupId = form.get('group')?.toString() || undefined
    if (!fullName || !phone || !email) return

    setError('')
    try {
      await createGuest({ fullName, phone, email }, { eventId: selectedEventId, groupId })
      await reloadGuests()
      setActionMessage(`${fullName} ajouté(e) à la liste`)
      setAddFormOpen(false)
      e.target.reset()
    } catch (err) {
      setError(err.message || "L'ajout a échoué.")
    }
  }

  const handleCreateGroup = async () => {
    const name = newGroupName.trim()
    if (!name || !selectedEventId) return
    setError('')
    try {
      await createGuestGroup({ name }, selectedEventId)
      const fresh = await listGuestGroups(selectedEventId)
      setGroups(fresh ?? [])
      setNewGroupName('')
    } catch (err) {
      setError(err.message || 'La création du groupe a échoué.')
    }
  }

  const handleExport = () => {
    const header = 'Nom,Téléphone,Email,Groupe,Statut,Accompagnants'
    const rows = guests.map((g) =>
      [
        g.fullName,
        g.phone,
        g.email,
        groupNameById(g.groupId),
        guestStatusLabel(g.status),
        accompanyingByGuest[g.id] ?? 0,
      ].join(','),
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'invites.csv'
    link.click()
    URL.revokeObjectURL(url)
    setActionMessage(`${guests.length} invité(s) exporté(s) en CSV`)
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Invités</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez d'abord un événement pour pouvoir y ajouter des invités.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Invités</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value)
                setSelected(new Set())
              }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink outline-none focus:border-brand-purple"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
            {!loading && (
              <p className="text-sm text-muted">
                {counts.Tous} invités · {counts.Confirmés} confirmés · {counts['En attente']} en
                attente · {counts.Refus} refus
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} disabled={guests.length === 0}>
            Exporter
          </Button>
          <Button variant="gradient" onClick={() => setAddFormOpen((v) => !v)}>
            Ajouter un invité
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {addFormOpen && (
        <form
          onSubmit={handleAddGuest}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-purple/40 bg-surface p-5"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">Nom complet</span>
            <input
              name="name"
              required
              className="mt-1.5 w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Téléphone</span>
            <input
              name="phone"
              required
              placeholder="+221 77 000 00 00"
              className="mt-1.5 w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Email</span>
            <input
              name="email"
              type="email"
              required
              className="mt-1.5 w-48 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Groupe</span>
            <select
              name="group"
              defaultValue=""
              className="mt-1.5 w-36 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            >
              <option value="">Sans groupe</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="gradient">
            Ajouter
          </Button>

          <div className="flex w-full items-center gap-2 border-t border-border-soft pt-3">
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nouveau groupe (ex: Famille)"
              className="w-48 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-brand-purple"
            />
            <button
              type="button"
              onClick={handleCreateGroup}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:border-faint hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Créer le groupe
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un invité"
              className="w-56 rounded-lg border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
          </div>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === f
                  ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                  : 'border border-border text-muted hover:border-faint hover:text-ink'
              }`}
            >
              {f} · {counts[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
                <th className="w-10 px-6 py-3" />
                <th className="px-3 py-3 font-medium">Invité</th>
                <th className="px-3 py-3 font-medium">Contact</th>
                <th className="px-3 py-3 font-medium">Groupe</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="px-3 py-3 font-medium">Accomp.</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-faint">
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-faint">
                    Aucun invité ne correspond à cette recherche.
                  </td>
                </tr>
              )}
              {!loading &&
                visible.map((guest) => (
                  <tr key={guest.id} className="border-b border-border-soft last:border-b-0">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(guest.id)}
                        onChange={() => toggleSelected(guest.id)}
                        className="h-4 w-4 rounded border-border accent-brand-purple"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={guest.fullName} />
                        <p className="font-medium text-ink">{guest.fullName}</p>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-muted">
                      <p>{guest.email}</p>
                      <p className="text-xs text-faint">{guest.phone}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{groupNameById(guest.groupId)}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={guestStatusLabel(guest.status)} />
                    </td>
                    <td className="px-3 py-4 font-mono text-muted">
                      {accompanyingByGuest[guest.id] ?? '–'}
                    </td>
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(guest)}
                        title="Copier le lien d'invitation"
                        className="rounded-lg p-2 text-faint transition hover:bg-surface-2 hover:text-brand-purple"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                      {copiedId === guest.id && (
                        <span className="ml-1 text-xs text-success">Copié !</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted">{selected.size} sélectionné</span>
            {selected.size > 0 && (
              <select
                value={bulkGroupTarget}
                onChange={(e) =>
                  handleBulkChangeGroup(e.target.value === 'none' ? '' : e.target.value)
                }
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-ink outline-none focus:border-brand-purple"
              >
                <option value="" disabled>
                  Changer de groupe…
                </option>
                <option value="none">Sans groupe</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={handleDelete}
              className="text-danger hover:underline disabled:pointer-events-none disabled:opacity-40"
            >
              Supprimer
            </button>
            {actionMessage && (
              <span className="text-xs text-success">{actionMessage}</span>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
