import { useMemo, useRef, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'

const INITIAL_MEDIA = [
  { id: 1, uploader: 'Fatou', time: 'il y a 2 h', status: 'pending' },
  { id: 2, uploader: 'Moussa', time: 'il y a 3 h', status: 'pending' },
  { id: 3, status: 'published' },
  { id: 4, status: 'published' },
  { id: 5, status: 'published' },
]

const INITIAL_ALBUMS = [
  { name: 'Cérémonie', meta: '96 médias' },
  { name: 'Réception', meta: '118 médias' },
]

export default function Gallery() {
  const [media, setMedia] = useState(INITIAL_MEDIA)
  const [albums, setAlbums] = useState(INITIAL_ALBUMS)
  const [filter, setFilter] = useState('En attente')
  const fileInputRef = useRef(null)

  const counts = useMemo(
    () => ({
      'En attente': media.filter((m) => m.status === 'pending').length,
      Publiés: media.filter((m) => m.status === 'published').length,
      Refusées: media.filter((m) => m.status === 'refused').length,
    }),
    [media],
  )

  const filters = [
    { label: 'En attente', count: counts['En attente'] },
    { label: 'Publiés', count: counts.Publiés },
    { label: 'Refusées', count: counts.Refusées },
  ]

  const statusByFilter = { 'En attente': 'pending', Publiés: 'published', Refusées: 'refused' }
  const visible = media.filter((m) => m.status === statusByFilter[filter])

  const setStatus = (id, status) =>
    setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const nextId = Math.max(0, ...media.map((m) => m.id)) + 1
    const newItems = files.map((_, index) => ({
      id: nextId + index,
      status: 'published',
    }))
    setMedia((prev) => [...prev, ...newItems])
    setFilter('Publiés')
    e.target.value = ''
  }

  const handleNewAlbum = () => {
    const name = window.prompt('Nom du nouvel album ?')
    if (!name?.trim()) return
    setAlbums((prev) => [...prev, { name: name.trim(), meta: '0 média' }])
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Galerie — Mariage Awa & Ibrahim
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            248 médias · {counts['En attente']} en attente de validation ·{' '}
            {albums.length} albums
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleNewAlbum}>
            Nouvel album
          </Button>
          <Button variant="gradient" onClick={() => fileInputRef.current?.click()}>
            Importer des médias
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {filters.map((f) => (
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
          <Button variant="outline">Album : Cérémonie</Button>
          <Button variant="outline">Contributeur</Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-faint">
            Aucun média dans « {filter} ».
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {visible.map((item) => (
              <div key={item.id}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]">
                  {item.status === 'pending' && (
                    <span className="absolute top-2 left-2 rounded-full bg-brand-orange/90 px-2 py-0.5 text-[10px] font-semibold text-bg">
                      À valider
                    </span>
                  )}
                </div>
                {item.status === 'pending' ? (
                  <>
                    <p className="mt-2 text-xs text-faint">
                      {item.uploader} · {item.time}
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStatus(item.id, 'published')}
                        className="flex-1 rounded-md bg-success/15 py-1.5 text-xs font-semibold text-success"
                      >
                        Valider
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(item.id, 'refused')}
                        className="flex-1 rounded-md bg-danger/15 py-1.5 text-xs font-semibold text-danger"
                      >
                        Refuser
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-faint">
                    {item.status === 'published' ? 'Publiée' : 'Refusée'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFilesSelected}
        />
        <label className="mt-4 flex aspect-[6/1] cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-border text-center transition hover:border-faint">
          <span className="px-2 text-xs text-faint">
            Déposer des fichiers · WebP, JPG, MP4
          </span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="sr-only"
            onChange={handleFilesSelected}
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {albums.map((album) => (
          <div
            key={album.name}
            className="rounded-xl border border-border-soft bg-surface px-5 py-4"
          >
            <p className="font-medium text-ink">{album.name}</p>
            <p className="mt-1 text-sm text-faint">{album.meta}</p>
          </div>
        ))}
        <div className="rounded-xl border border-border-soft bg-surface px-5 py-4">
          <p className="font-medium text-ink">Envois des invités</p>
          <p
            className={`mt-1 text-sm ${counts['En attente'] > 0 ? 'text-brand-orange' : 'text-faint'}`}
          >
            {counts['En attente']} à modérer
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
