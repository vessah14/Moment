import { useEffect, useRef, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { listEvents } from '../../api/events'
import { mediaUrl } from '../../api/client'
import { deleteGalleryPhoto, listGalleryPhotos, uploadGalleryPhoto } from '../../api/gallery'

export default function Gallery() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
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

  // Les photos sont ajoutées par l'organisateur et publiées directement.
  const visible = media.filter((m) => m.status === 'Publie')

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
            {visible.length} photo{visible.length > 1 ? 's' : ''} publiée{visible.length > 1 ? 's' : ''}
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

      <div className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-faint">Chargement…</p>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-faint">Aucune photo publiée pour le moment.</p>
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
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-faint hover:text-danger"
                  >
                    Supprimer
                  </button>
                </div>
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
