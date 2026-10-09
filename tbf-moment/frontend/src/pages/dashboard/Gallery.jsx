import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { listEvents } from '../../api/events'
import { mediaUrl } from '../../api/client'
import {
  deleteGalleryPhoto,
  listGalleryPhotos,
  updateGalleryPhotoStatus,
  uploadGalleryPhoto,
} from '../../api/gallery'

const STATUS_BY_FILTER = { 'En attente': 'EnAttente', Publiés: 'Publie', Refusées: 'Refuse' }

export default function Gallery() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('En attente')
  const fileInputRef = useRef(null)

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

  const reload = (eventId) => {
    setLoading(true)
    listGalleryPhotos(eventId)
      .then((data) => {
        setMedia(data ?? [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger la galerie.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  const counts = useMemo(
    () => ({
      'En attente': media.filter((m) => m.status === 'EnAttente').length,
      Publiés: media.filter((m) => m.status === 'Publie').length,
      Refusées: media.filter((m) => m.status === 'Refuse').length,
    }),
    [media],
  )
  const visible = media.filter((m) => m.status === STATUS_BY_FILTER[filter])

  const setStatus = async (id, status) => {
    setError('')
    try {
      await updateGalleryPhotoStatus(id, status)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'action a échoué.")
    }
  }

  const handleApproveAll = async () => {
    setError('')
    try {
      await Promise.all(
        media.filter((m) => m.status === 'EnAttente').map((m) => updateGalleryPhotoStatus(m.id, 'Publie')),
      )
      setFilter('Publiés')
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'action a échoué.")
    }
  }

  const handleRejectAll = async () => {
    setError('')
    try {
      await Promise.all(
        media.filter((m) => m.status === 'EnAttente').map((m) => updateGalleryPhotoStatus(m.id, 'Refuse')),
      )
      setFilter('Refusées')
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'action a échoué.")
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await deleteGalleryPhoto(id)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setUploading(true)
    setError('')
    try {
      for (const file of files) {
        await uploadGalleryPhoto(file, selectedEventId)
      }
      setFilter('Publiés')
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'import a échoué.")
    } finally {
      setUploading(false)
    }
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Galerie</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez d'abord un événement.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Galerie — {selectedEvent?.name ?? ''}</h1>
          <p className="mt-1.5 text-sm text-muted">
            {media.length} médias · {counts['En attente']} en attente de validation
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
          <Button
            variant="gradient"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Import…' : 'Importer des médias'}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {counts['En attente'] > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-5 py-3">
          <p className="text-sm text-ink">
            <span className="font-semibold">Modération</span> · {counts['En attente']} nouvelles
            photos en attente de validation.
          </p>
          <div className="ml-auto flex gap-2">
            <Button variant="gradient" onClick={handleApproveAll}>
              Tout approuver
            </Button>
            <Button variant="outline" onClick={handleRejectAll}>
              Tout rejeter
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {['En attente', 'Publiés', 'Refusées'].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setFilter(label)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === label
                ? 'bg-[linear-gradient(92deg,_var(--color-brand-indigo),_var(--color-brand-purple))] text-white'
                : 'border border-border text-muted hover:border-faint hover:text-ink'
            }`}
          >
            {label} · {counts[label]}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-faint">Chargement…</p>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-faint">Aucun média dans « {filter} ».</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {visible.map((item) => (
              <div key={item.id}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-2">
                  <img
                    src={mediaUrl(item.url)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {item.status === 'EnAttente' && (
                    <span className="absolute top-2 left-2 rounded-full bg-brand-orange/90 px-2 py-0.5 text-[10px] font-semibold text-bg">
                      À valider
                    </span>
                  )}
                </div>
                {item.status === 'EnAttente' ? (
                  <div className="mt-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStatus(item.id, 'Publie')}
                      className="flex-1 rounded-md bg-success/15 py-1.5 text-xs font-semibold text-success"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(item.id, 'Refuse')}
                      className="flex-1 rounded-md bg-danger/15 py-1.5 text-xs font-semibold text-danger"
                    >
                      Refuser
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-faint">
                      {item.status === 'Publie' ? 'Publiée' : 'Refusée'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-faint hover:text-danger"
                    >
                      Suppr.
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFilesSelected}
        />
        <label className="mt-4 flex aspect-[6/1] cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-border text-center transition hover:border-faint">
          <span className="px-2 text-xs text-faint">Déposer des fichiers · JPG, PNG, WebP, GIF</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleFilesSelected}
          />
        </label>
      </div>
    </DashboardLayout>
  )
}
