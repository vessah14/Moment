import { Link2, Search } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { INITIAL_GUESTS } from '../../data/guests'
import { slugify } from '../../utils/slugify'
import { useLocalStorageState } from '../../utils/useLocalStorageState'
import { useToast } from '../../utils/useToast'

const FILTERS = [
  { label: 'Tous', count: 240 },
  { label: 'Confirmés', count: 187 },
  { label: 'En attente', count: 32 },
  { label: 'Refus', count: 21 },
]

const STATUS_BY_FILTER = {
  Confirmés: 'Confirmé',
  'En attente': 'En attente',
  Refus: 'Refus',
}

export default function Guests() {
  const toast = useToast()
  const [guests, setGuests] = useLocalStorageState('tbf_guests_v2', INITIAL_GUESTS)
  const [filter, setFilter] = useState('Tous')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set([INITIAL_GUESTS[0].id]))
  const [addFormOpen, setAddFormOpen] = useState(false)
  const importInputRef = useRef(null)

  const handleCopyLink = async (guest) => {
    const url = `${window.location.origin}/invitation/${slugify(guest.name)}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard indisponible (contexte non sécurisé)
    }
    toast(`Lien copié pour ${guest.name}`)
  }

  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const visible = useMemo(() => {
    return guests.filter((g) => {
      const matchesFilter = filter === 'Tous' || g.status === STATUS_BY_FILTER[filter]
      const matchesQuery =
        g.name.toLowerCase().includes(query.toLowerCase()) ||
        g.contact.toLowerCase().includes(query.toLowerCase())
      return matchesFilter && matchesQuery
    })
  }, [guests, filter, query])

  const handleDelete = () => {
    const count = selected.size
    setGuests((prev) => prev.filter((g) => !selected.has(g.id)))
    toast(`${count} invité(s) supprimé(s)`)
    setSelected(new Set())
  }

  const handleRelaunch = () => {
    toast(`Relance envoyée à ${selected.size} invité(s)`)
  }

  const handleChangeGroup = () => {
    toast(`Groupe mis à jour pour ${selected.size} invité(s)`)
  }

  const handleAddGuest = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const name = form.get('name')?.toString().trim()
    const contact = form.get('contact')?.toString().trim()
    const group = form.get('group')?.toString().trim() || 'Sans groupe'
    if (!name || !contact) return
    setGuests((prev) => [
      ...prev,
      {
        id: `g-${Date.now()}`,
        name,
        contact,
        group,
        role: 'Invité',
        status: 'En attente',
        accomp: '–',
        invitation: 'Non envoyée',
      },
    ])
    toast(`${name} ajouté(e) à la liste`)
    setAddFormOpen(false)
  }

  const handleExport = () => {
    const header = 'Nom,Contact,Groupe,Statut,Accompagnants,Invitation'
    const rows = guests.map((g) =>
      [g.name, g.contact, g.group, g.status, g.accomp, g.invitation].join(','),
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'invites-mariage-awa-ibrahim.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast(`${guests.length} invité(s) exporté(s) en CSV`)
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const lines = String(reader.result)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      const dataLines = /nom|name/i.test(lines[0]) ? lines.slice(1) : lines
      const imported = dataLines
        .map((line, index) => {
          const [name, contact, group] = line.split(',').map((v) => v?.trim())
          if (!name) return null
          return {
            id: `g-${Date.now()}-${index}`,
            name,
            contact: contact || '—',
            group: group || 'Importés',
            role: 'Invité',
            status: 'En attente',
            accomp: '–',
            invitation: 'Non envoyée',
          }
        })
        .filter(Boolean)
      setGuests((prev) => [...prev, ...imported])
      toast(`${imported.length} invité(s) importé(s)`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Invités — Mariage Awa & Ibrahim
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            240 invités · 187 confirmés · 32 en attente · 21 refus
          </p>
        </div>
        <div className="flex gap-3">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button variant="outline" onClick={() => importInputRef.current?.click()}>
            Importer
          </Button>
          <Button variant="outline" onClick={handleExport}>
            Exporter
          </Button>
          <Button variant="gradient" onClick={() => setAddFormOpen((v) => !v)}>
            Ajouter un invité
          </Button>
        </div>
      </div>

      {addFormOpen && (
        <form
          onSubmit={handleAddGuest}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-purple/40 bg-surface p-5"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">Nom</span>
            <input
              name="name"
              required
              className="mt-1.5 w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Contact</span>
            <input
              name="contact"
              required
              placeholder="email ou téléphone"
              className="mt-1.5 w-48 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Groupe</span>
            <input
              name="group"
              className="mt-1.5 w-36 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="gradient">
            Ajouter
          </Button>
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
              key={f.label}
              type="button"
              onClick={() => setFilter(f.label)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === f.label
                  ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                  : 'border border-border text-muted hover:border-faint hover:text-ink'
              }`}
            >
              {f.label} · {f.count}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Groupe : tous</Button>
          <Button variant="outline">Rôle : tous</Button>
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
              <th className="px-3 py-3 font-medium">Invitation</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-faint">
                  Aucun invité ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {visible.map((guest) => (
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
                    <Avatar name={guest.name} />
                    <div>
                      <p className="font-medium text-ink">{guest.name}</p>
                      <p
                        className={`text-xs ${guest.role === 'VIP' ? 'text-brand-orange' : 'text-faint'}`}
                      >
                        {guest.role}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-muted">{guest.contact}</td>
                <td className="px-3 py-4 text-muted">{guest.group}</td>
                <td className="px-3 py-4">
                  <StatusBadge status={guest.status} />
                </td>
                <td className="px-3 py-4 font-mono text-muted">{guest.accomp}</td>
                <td className="px-3 py-4 text-muted">{guest.invitation}</td>
                <td className="px-3 py-4">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(guest)}
                    title="Copier le lien d'invitation"
                    className="rounded-lg p-2 text-faint transition hover:bg-surface-2 hover:text-brand-purple"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted">{selected.size} sélectionné</span>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={handleRelaunch}
              className="text-brand-purple hover:underline disabled:pointer-events-none disabled:opacity-40"
            >
              Relancer
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={handleChangeGroup}
              className="text-brand-purple hover:underline disabled:pointer-events-none disabled:opacity-40"
            >
              Changer de groupe
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={handleDelete}
              className="text-danger hover:underline disabled:pointer-events-none disabled:opacity-40"
            >
              Supprimer
            </button>
          </div>

          <div className="flex items-center gap-1" title="Une seule page pour le moment">
            <button
              type="button"
              disabled
              className="h-8 w-8 cursor-not-allowed rounded-lg text-sm text-faint opacity-40"
            >
              ‹
            </button>
            <button type="button" className="h-8 w-8 rounded-lg bg-brand-indigo text-sm text-white">
              1
            </button>
            <button
              type="button"
              disabled
              className="h-8 w-8 cursor-not-allowed rounded-lg text-sm text-faint opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
