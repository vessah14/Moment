import { Bell, BookHeart, Check, CheckCheck, Image, Mail, MailX, Ticket, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { useDashboardNotifications } from '../../components/layout/DashboardNotificationsContext'

const ICONS = {
  guestbook: BookHeart,
  guest_photo: Image,
  rsvp: Users,
  gift_reserved: Ticket,
  campaign_sent: Mail,
  campaign_failed: MailX,
}

function notificationTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function Notifications() {
  return (
    <DashboardLayout>
      <NotificationsContent />
    </DashboardLayout>
  )
}

function NotificationsContent() {
  const navigate = useNavigate()
  const {
    items, unreadCount, error, loading, refresh, markRead, markAllRead, removeNotification,
  } = useDashboardNotifications()
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const handleMarkAllRead = async () => {
    setBusy(true)
    setActionError('')
    try {
      await markAllRead()
    } catch (requestError) {
      setActionError(requestError.message || 'Impossible de mettre à jour les notifications.')
    } finally {
      setBusy(false)
    }
  }

  const handleOpen = async (id) => {
    setActionError('')
    try {
      await markRead(id)
      return true
    } catch (requestError) {
      setActionError(requestError.message || 'Impossible de marquer cette notification comme lue.')
      return false
    }
  }

  const handleRefresh = async () => {
    setActionError('')
    try {
      await refresh()
    } catch (requestError) {
      setActionError(requestError.message || 'Impossible d’actualiser les notifications.')
    }
  }

  const handleMarkRead = async (id) => {
    setBusyId(id)
    setActionError('')
    try {
      await markRead(id)
    } catch (requestError) {
      setActionError(requestError.message || 'Impossible de marquer cette notification comme lue.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id) => {
    setBusyId(id)
    setActionError('')
    try {
      await removeNotification(id)
    } catch (requestError) {
      setActionError(requestError.message || 'Impossible de supprimer cette notification.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Notifications</h1>
            <p className="mt-1 text-sm text-muted">
              Suivez les messages, photos, réponses RSVP et réservations de cadeaux de vos événements.
            </p>
            <p className="mt-2 text-xs text-faint">
              {unreadCount} non lue(s) · Actualisation automatique toutes les 10 secondes
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleRefresh}>Actualiser</Button>
            <Button type="button" variant="outline" onClick={handleMarkAllRead} disabled={!unreadCount || busy}>
              <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />
              Tout marquer comme lu
            </Button>
          </div>
        </div>

        {(error || actionError) && (
          <p role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {actionError || error}
          </p>
        )}

        {loading && items.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-border-soft bg-panel p-8 text-center text-sm text-faint">
            Chargement des notifications…
          </p>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border-soft py-14 text-center">
            <Bell className="mx-auto h-8 w-8 text-faint" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-ink">Aucune notification pour le moment</p>
            <p className="mt-1 text-sm text-faint">Les nouvelles activités de vos invités apparaîtront ici.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((item) => {
              const Icon = ICONS[item.type] ?? Bell
              return (
                <article
                  key={item.id}
                  className={`flex gap-3 rounded-2xl border p-4 transition ${
                    item.readAt ? 'border-border-soft bg-panel' : 'border-brand-purple/30 bg-brand-purple/5'
                  }`}
                >
                  <Link
                    to={item.link}
                    onClick={async (event) => {
                      event.preventDefault()
                      if (await handleOpen(item.id)) navigate(item.link)
                    }}
                    className="flex min-w-0 flex-1 gap-3 rounded-xl text-left hover:opacity-80"
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-ink">{item.title}</span>
                        {!item.readAt && <span className="h-2 w-2 rounded-full bg-brand-purple" aria-label="Non lue" />}
                      </span>
                      <span className="mt-1 block text-sm text-muted">{item.message}</span>
                      <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-faint">
                        <span>{item.eventName}</span>
                        <time dateTime={item.createdAt}>{notificationTime(item.createdAt)}</time>
                      </span>
                    </span>
                  </Link>
                  <div className="flex shrink-0 items-start gap-1">
                    {!item.readAt && (
                      <button
                        type="button"
                        aria-label="Marquer comme lue"
                        title="Marquer comme lue"
                        disabled={busyId === item.id}
                        onClick={() => handleMarkRead(item.id)}
                        className="rounded-lg p-2 text-muted hover:bg-brand-purple/10 hover:text-brand-purple disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Supprimer la notification"
                      title="Supprimer la notification"
                      disabled={busyId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
    </div>
  )
}
