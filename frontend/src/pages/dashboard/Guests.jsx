import { Link2, Mail, Pencil, Plus, Printer, Search, Send, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import DashboardLayout from '../../components/layout/DashboardLayout'
import GuestEditDialog from '../../components/guests/GuestEditDialog'
import PrintTicketsDialog from '../../components/guests/PrintTicketsDialog'
import { ConfirmDialog } from '../../components/ui/Dialog'
import { createGuest, deleteGuest, listGuests, sendGuestInvitation, sendPendingInvitations, updateGuest } from '../../api/guests'
import { createGuestGroup, listGuestGroups } from '../../api/guestGroups'
import { listEvents } from '../../api/events'
import { listRsvps } from '../../api/rsvps'
import { downloadCsv } from '../../utils/csv'
import { GUEST_STATUS_BY_FILTER, guestStatusLabel, hasGuestStatus } from '../../utils/guestStatus'
import { notifyGuestsChanged } from '../../utils/guestEvents'
import { usePagination } from '../../utils/pagination'
import { useToast } from '../../utils/useToast'

const FILTERS = ['Tous', 'Confirmés', 'En attente', 'Refus']

export default function Guests() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const requestedEventId = searchParams.get('eventId')
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(requestedEventId || '')
  const [groups, setGroups] = useState([])
  const [guests, setGuests] = useState([])
  const [accompanyingByGuest, setAccompanyingByGuest] = useState({})
  const [sideByGuest, setSideByGuest] = useState({})
  // Invités qui ont répondu « Peut-être » (réponse enregistrée sans présence confirmée).
  const [maybeGuests, setMaybeGuests] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('Tous')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [addFormOpen, setAddFormOpen] = useState(() => searchParams.get('add') === '1')
  const [newGroupName, setNewGroupName] = useState('')
  const [bulkGroupTarget, setBulkGroupTarget] = useState('')
  const [editingGuest, setEditingGuest] = useState(null)
  const [deletingGuest, setDeletingGuest] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)

  useEffect(() => {
    listEvents()
      .then((data) => {
        setEvents(data ?? [])
        if (data?.length) {
          const matchingEvent = data.find((event) => event.id === requestedEventId)
          setSelectedEventId(matchingEvent?.id ?? data[0].id)
        }
        else setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Impossible de charger vos événements.')
        setLoading(false)
      })
  }, [requestedEventId])

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
        const sideMap = {}
        const maybe = new Set()
        for (const r of rsvpsData ?? []) {
          accompMap[r.guestId] = r.accompanyingCount
          if (r.side) sideMap[r.guestId] = r.side
          if (r.confirmed === null && r.respondedAt) maybe.add(r.guestId)
        }
        setAccompanyingByGuest(accompMap)
        setSideByGuest(sideMap)
        setMaybeGuests(maybe)
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
    notifyGuestsChanged()
  }

  const handleCopyLink = async (guest) => {
    const eventSlug = events.find((event) => event.id === selectedEventId)?.slug
    const url = eventSlug
      ? `${window.location.origin}/e/${encodeURIComponent(eventSlug)}?invite=${encodeURIComponent(guest.id)}`
      : `${window.location.origin}/invitation/${guest.id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard indisponible (contexte non sécurisé)
    }
    toast(`Lien copié pour ${guest.fullName}`)
  }

  const visible = useMemo(() => {
    const expectedStatus = GUEST_STATUS_BY_FILTER[filter]
    const q = query.trim().toLocaleLowerCase('fr')
    return guests.filter((g) => {
      const matchesFilter = filter === 'Tous' || hasGuestStatus(g.status, expectedStatus)
      const matchesQuery =
        String(g.fullName ?? '').toLocaleLowerCase('fr').includes(q) ||
        String(g.email ?? '').toLocaleLowerCase('fr').includes(q) ||
        String(g.phone ?? '').toLocaleLowerCase('fr').includes(q)
      return matchesFilter && matchesQuery
    })
  }, [guests, filter, query])

  // Pagination : retour à la page 1 quand l'événement, le filtre ou la recherche change.
  const pagination = usePagination(visible, 'tbf_page_size_guests', `${selectedEventId}|${filter}|${query}`)

  const counts = useMemo(
    () => ({
      Tous: guests.length,
      Confirmés: guests.filter((g) => hasGuestStatus(g.status, 'Present')).length,
      'En attente': guests.filter((g) => hasGuestStatus(g.status, 'EnAttente')).length,
      Refus: guests.filter((g) => hasGuestStatus(g.status, 'Absent')).length,
    }),
    [guests],
  )

  const selectedEvent = events.find((e) => e.id === selectedEventId)
  const eventPublished = selectedEvent?.status === 'Publie'
  const notInvited = guests.filter((g) => g.email && !g.invitationSentAt && !g.invitationPending)

  // Les invitations partent en quelques secondes : la liste se met à jour seule tant
  // qu'il en reste en cours d'envoi (événement publié).
  const hasPendingInvitations = eventPublished && guests.some((g) => g.invitationPending)
  useEffect(() => {
    if (!hasPendingInvitations || !selectedEventId) return
    const timer = setInterval(() => {
      listGuests(selectedEventId).then((fresh) => setGuests(fresh ?? [])).catch(() => {})
    }, 5000)
    const stop = setTimeout(() => clearInterval(timer), 120000)
    return () => {
      clearInterval(timer)
      clearTimeout(stop)
    }
  }, [hasPendingInvitations, selectedEventId])

  const handleUpdateGuest = async (dto) => {
    const updated = await updateGuest(editingGuest.id, dto)
    setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
    notifyGuestsChanged()
    toast(`${updated.fullName} modifié(e)`)
  }

  const handleDeleteOne = async () => {
    setDeleteBusy(true)
    setError('')
    try {
      await deleteGuest(deletingGuest.id)
      setGuests((prev) => prev.filter((g) => g.id !== deletingGuest.id))
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(deletingGuest.id)
        return next
      })
      notifyGuestsChanged()
      toast(`${deletingGuest.fullName} supprimé(e) de la liste`)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    } finally {
      setDeleteBusy(false)
      setDeletingGuest(null)
    }
  }

  const handleSendInvitation = async (guest) => {
    setError('')
    try {
      const updated = await sendGuestInvitation(guest.id)
      setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
      toast(eventPublished ? `Invitation en cours d'envoi à ${guest.fullName}` : `Invitation prête : elle partira à la publication de l'événement`)
    } catch (err) {
      setError(err.message || "L'invitation n'a pas pu être envoyée.")
    }
  }

  const handleSendAllInvitations = async () => {
    setError('')
    try {
      const { queued } = await sendPendingInvitations(selectedEventId)
      await reloadGuests()
      toast(queued > 0 ? `${queued} invitation${queued > 1 ? 's' : ''} en cours d'envoi` : 'Tous les invités ont déjà reçu leur invitation')
    } catch (err) {
      setError(err.message || "Les invitations n'ont pas pu être envoyées.")
    }
  }

  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDelete = async () => {
    setError('')
    const count = selected.size
    try {
      await Promise.all([...selected].map((id) => deleteGuest(id)))
      await reloadGuests()
      toast(`${count} invité(s) supprimé(s)`)
      setSelected(new Set())
    } catch (err) {
      // Une partie a pu être supprimée avant l'erreur : on recompte quand même.
      notifyGuestsChanged()
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const handleBulkChangeGroup = async (groupId) => {
    setBulkGroupTarget(groupId)
    if (!groupId && groupId !== '') return
    setError('')
    const count = selected.size
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
            seats: g.seats ?? null,
          }),
        ),
      )
      await reloadGuests()
      toast(`Groupe mis à jour pour ${count} invité(s)`)
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
    const seats = Number(form.get('seats')) || null
    const sendInvitation = form.get('sendInvitation') === 'on' && Boolean(email)
    if (!fullName) return

    setError('')
    try {
      await createGuest({ fullName, phone, email, seats, sendInvitation }, { eventId: selectedEventId, groupId })
      await reloadGuests()
      toast(
        !email
          ? `${fullName} ajouté(e) à la liste. Ajoutez un e-mail pour envoyer son invitation.`
          : !sendInvitation
          ? `${fullName} ajouté(e) à la liste`
          : eventPublished
            ? `${fullName} ajouté(e) : son lien d'invitation part par e-mail`
            : `${fullName} ajouté(e) : l'invitation partira à la publication de l'événement`,
      )
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
    downloadCsv(
      'invites.csv',
      ['Nom', 'Téléphone', 'Email', 'Groupe', 'Statut', 'Accompagnants', 'Choix'],
      guests.map((g) => [
        g.fullName,
        g.phone,
        g.email,
        groupNameById(g.groupId),
        guestStatusLabel(g.status),
        accompanyingByGuest[g.id] ?? 0,
        sideByGuest[g.id] ?? '',
      ]),
    )
    toast(`${guests.length} invité(s) exporté(s) en CSV`)
  }

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
        <div className="flex w-full max-w-full flex-wrap gap-3 xl:w-auto xl:justify-end">
          {notInvited.length > 0 && (
            <Button
              variant="outline"
              onClick={handleSendAllInvitations}
              title="Envoyer le lien de confirmation à tous les invités qui ne l'ont pas encore reçu"
            >
              <Send className="h-4 w-4" />
              Envoyer les invitations ({notInvited.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => setPrintOpen(true)} disabled={guests.length === 0}>
            <Printer className="h-4 w-4" />
            Imprimer les billets
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={guests.length === 0}>
            Exporter
          </Button>
          <Button variant="gradient" onClick={() => setAddFormOpen((v) => !v)}>
            Ajouter un invité
          </Button>
        </div>
      </div>

      <PrintTicketsDialog
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        event={selectedEvent}
        guests={guests}
        visible={visible}
        accompanyingByGuest={accompanyingByGuest}
        sideByGuest={sideByGuest}
        onDone={(message) => {
          setPrintOpen(false)
          toast(message)
        }}
      />

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
            <span className="text-xs font-medium text-ink">Téléphone (facultatif)</span>
            <input
              name="phone"
              type="tel"
              placeholder="+237 6 90 00 00 00"
              className="mt-1.5 w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">E-mail (facultatif)</span>
            <input
              name="email"
              type="email"
              className="mt-1.5 w-48 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Places</span>
            <input
              name="seats"
              type="number"
              min={1}
              max={50}
              placeholder="Auto"
              title="Places pour cette invitation, invité compris (ex. 2 pour un couple). Vide : règle du formulaire de réponse."
              className="mt-1.5 w-20 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
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
          <label className="flex items-center gap-2 self-center text-xs font-medium text-ink">
            <input type="checkbox" name="sendInvitation" defaultChecked className="h-4 w-4 rounded border-border accent-brand-purple" />
            Envoyer le lien par e-mail
          </label>
          <Button type="submit" variant="gradient">
            Ajouter
          </Button>
          <p className="w-full text-xs text-faint">
            {!eventPublished
              ? "L'e-mail d'invitation partira dès la publication de l'événement."
              : "L'invité reçoit son lien personnel par e-mail. Sans e-mail, vous pouvez ajouter son nom puis partager son lien depuis sa fiche."}
          </p>

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
        <div className="divide-y divide-border-soft md:hidden">
          {loading && <p className="px-4 py-8 text-center text-sm text-faint">Chargement…</p>}
          {!loading && visible.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-faint">Aucun invité dans cette sélection.</p>
          )}
          {!loading && pagination.items.map((guest) => (
            <article key={guest.id} className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(guest.id)}
                  onChange={() => toggleSelected(guest.id)}
                  aria-label={`Sélectionner ${guest.fullName}`}
                  className="mt-1 h-4 w-4 rounded border-border accent-brand-purple"
                />
                <Avatar name={guest.fullName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{guest.fullName}{guest.seats > 1 && <span className="ml-1.5 text-xs font-normal text-faint">· {guest.seats} places</span>}</p>
                  <p className="break-all text-xs text-muted">{guest.email || 'Aucun e-mail'}</p>
                  <p className="text-xs text-faint">{guest.phone || 'Aucun téléphone'}</p>
                </div>
                <StatusBadge status={guestStatusLabel(guest.status)} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pl-7 text-xs text-muted">
                <span>{groupNameById(guest.groupId)}</span>
                <InvitationStatus guest={guest} published={eventPublished} />
                <span>{accompanyingByGuest[guest.id] ?? '–'} accompagnant(s)</span>
              </div>
              <div className="flex justify-end gap-1 pl-7">
                {guest.email && !guest.invitationPending && (
                  <button
                    type="button"
                    onClick={() => handleSendInvitation(guest)}
                    aria-label={`Envoyer l'invitation à ${guest.fullName}`}
                    className="rounded-lg p-2 text-faint hover:bg-surface-2 hover:text-brand-purple"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleCopyLink(guest)}
                  aria-label={`Copier le lien d'invitation de ${guest.fullName}`}
                  className="rounded-lg p-2 text-faint hover:bg-surface-2 hover:text-brand-purple"
                >
                  <Link2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGuest(guest)}
                  aria-label={`Modifier ${guest.fullName}`}
                  className="rounded-lg p-2 text-faint hover:bg-surface-2 hover:text-brand-purple"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingGuest(guest)}
                  aria-label={`Supprimer ${guest.fullName}`}
                  className="rounded-lg p-2 text-faint hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
                <th className="w-10 px-6 py-3" />
                <th className="px-3 py-3 font-medium">Invité</th>
                <th className="px-3 py-3 font-medium">Contact</th>
                <th className="px-3 py-3 font-medium">Groupe</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="px-3 py-3 font-medium">Invitation</th>
                <th className="px-3 py-3 font-medium">Accomp.</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-faint">
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-faint">
                    <div className="flex flex-col items-center gap-3">
                      <span>
                        {guests.length === 0
                          ? 'Aucun invité dans cet événement.'
                          : 'Aucun invité ne correspond aux filtres sélectionnés.'}
                      </span>
                      {(query || filter !== 'Tous') && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery('')
                            setFilter('Tous')
                          }}
                          className="font-medium text-brand-purple hover:underline"
                        >
                          Effacer la recherche et les filtres
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                pagination.items.map((guest) => (
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
                        <div>
                          <p className="font-medium text-ink">{guest.fullName}{guest.seats > 1 && <span className="ml-1.5 text-xs font-normal text-faint">· {guest.seats} places</span>}</p>
                          {sideByGuest[guest.id] && <p className="text-xs text-faint">{sideByGuest[guest.id]}</p>}
                          {maybeGuests.has(guest.id) && <p className="text-xs text-brand-orange">A répondu « Peut-être »</p>}
                        </div>
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
                    <td className="px-3 py-4 text-xs">
                      <InvitationStatus guest={guest} published={eventPublished} />
                    </td>
                    <td className="px-3 py-4 font-mono text-muted">
                      {accompanyingByGuest[guest.id] ?? '–'}
                    </td>
                    <td className="flex items-center px-3 py-4">
                      {guest.email && !guest.invitationPending && (
                        <button
                          type="button"
                          onClick={() => handleSendInvitation(guest)}
                          title={guest.invitationSentAt ? "Renvoyer l'invitation par e-mail" : "Envoyer l'invitation par e-mail"}
                          aria-label={guest.invitationSentAt ? `Renvoyer l'invitation à ${guest.fullName}` : `Envoyer l'invitation à ${guest.fullName}`}
                          className="rounded-lg p-2 text-faint transition hover:bg-surface-2 hover:text-brand-purple"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(guest)}
                        title="Copier le lien d'invitation"
                        className="rounded-lg p-2 text-faint transition hover:bg-surface-2 hover:text-brand-purple"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingGuest(guest)}
                        title="Modifier"
                        aria-label={`Modifier ${guest.fullName}`}
                        className="rounded-lg p-2 text-faint transition hover:bg-surface-2 hover:text-brand-purple"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingGuest(guest)}
                        title="Supprimer"
                        aria-label={`Supprimer ${guest.fullName}`}
                        className="rounded-lg p-2 text-faint transition hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="border-t border-border-soft px-6 py-3">
            <Pagination pagination={pagination} label="invités" />
          </div>
        )}

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
          </div>
        </div>
      </div>
      {editingGuest && (
        <GuestEditDialog
          key={editingGuest.id}
          guest={editingGuest}
          groups={groups}
          onClose={() => setEditingGuest(null)}
          onSave={handleUpdateGuest}
        />
      )}
      <ConfirmDialog
        open={Boolean(deletingGuest)}
        title="Supprimer l’invité ?"
        message={`${deletingGuest?.fullName ?? ''} sera retiré(e) de la liste, avec sa réponse et son placement. Son lien d'invitation ne fonctionnera plus.`}
        busy={deleteBusy}
        onConfirm={handleDeleteOne}
        onClose={() => setDeletingGuest(null)}
      />
    </DashboardLayout>
  )
}

// État de l'e-mail d'invitation d'un invité (lien personnel de confirmation de présence).
function InvitationStatus({ guest, published }) {
  if (guest.invitationSentAt)
    return (
      <span className="inline-flex items-center gap-1 text-success" title={new Date(guest.invitationSentAt).toLocaleString('fr-FR')}>
        <Mail className="h-3.5 w-3.5" />
        Envoyée le {new Date(guest.invitationSentAt).toLocaleDateString('fr-FR')}
      </span>
    )
  if (guest.invitationPending)
    return (
      <span className="text-brand-orange" title={guest.invitationError ?? undefined}>
        {published ? (guest.invitationError ? 'Nouvel essai bientôt' : 'Envoi en cours…') : 'À la publication'}
      </span>
    )
  if (guest.invitationError)
    return (
      <span className="text-danger" title={guest.invitationError}>
        Échec de l'envoi
      </span>
    )
  return <span className="text-faint">{guest.email ? 'Non envoyée' : 'Pas d’e-mail'}</span>
}
