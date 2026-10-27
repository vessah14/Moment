import { useEffect, useRef, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { listEvents } from '../../api/events'
import { eventShareUrl, mediaUrl } from '../../api/client'
import { deleteGalleryPhoto, listGalleryPhotos, updateGalleryPhotoStatus, uploadGalleryPhoto } from '../../api/gallery'
import { tbfDigitalOrderUrl } from '../../data/tbfDigital'

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

  // Photos de l'organisateur : publiées directement. Photos des invités (album) : en
  // attente jusqu'à validation ici.
  const visible = media.filter((m) => m.status === 'Publie')
  const pending = media.filter((m) => m.status === 'EnAttente')

  const handleModerate = async (id, status) => {
    setError('')
    try {
      await updateGalleryPhotoStatus(id, status)
      setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    } catch (err) {
      setError(err.message || 'La validation a échoué.')
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
    } catch (err) {
      // Ex. limite de photos de l'offre atteinte : les photos déjà envoyées restent affichées.
      setError(err.message || "L'import a échoué.")
    } finally {
      reload(selectedEventId)
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

      {pending.length > 0 && (
        <div className="mt-6 rounded-2xl border border-brand-orange/30 bg-brand-orange/5 p-5">
          <h2 className="font-semibold text-ink">
            {pending.length} photo{pending.length > 1 ? 's' : ''} d’invités à valider
          </h2>
          <p className="mt-1 text-sm text-muted">Rien n’apparaît sur la page ni sur le mur sans votre accord.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {pending.map((item) => (
              <div key={item.id}>
                <div className="aspect-square overflow-hidden rounded-xl bg-surface-2">
                  <img src={mediaUrl(item.url)} alt="" className="h-full w-full object-cover" />
                </div>
                {item.uploadedBy && <p className="mt-1 truncate text-xs text-faint">par {item.uploadedBy}</p>}
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => handleModerate(item.id, 'Publie')} className="flex-1 rounded-lg bg-success/15 py-1.5 text-xs font-semibold text-success">
                    Publier
                  </button>
                  <button type="button" onClick={() => handleModerate(item.id, 'Refuse')} className="flex-1 rounded-lg bg-danger/10 py-1.5 text-xs font-semibold text-danger">
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedEvent?.status === 'Publie' && selectedEvent.slug && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border-soft bg-surface p-5">
            <h2 className="font-semibold text-ink">Mur du jour J</h2>
            <p className="mt-1 text-sm text-muted">
              À projeter dans la salle : les photos et messages validés défilent en grand, avec un QR code pour en envoyer d’autres.
            </p>
            <a href={`/e/${encodeURIComponent(selectedEvent.slug)}/mur`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-brand-purple hover:underline">
              Ouvrir le mur →
            </a>
          </div>
          <div className="rounded-2xl border border-border-soft bg-surface p-5">
            <h2 className="font-semibold text-ink">Gardez un souvenir imprimé</h2>
            <p className="mt-1 text-sm text-muted">
              TBF DIGITAL imprime l’album de votre événement, ou un cadre NFC qui ouvre votre page d’un simple contact du téléphone.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <a href={tbfDigitalOrderUrl('un album photo de mon événement', eventShareUrl(selectedEvent.slug))} target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">
                Commander l’album →
              </a>
              <a href={tbfDigitalOrderUrl('un cadre NFC souvenir', eventShareUrl(selectedEvent.slug))} target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">
                Commander le cadre NFC →
              </a>
            </div>
          </div>
        </div>
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
