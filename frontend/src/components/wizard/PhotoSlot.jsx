import { ImagePlus, X } from 'lucide-react'
import { useState } from 'react'

// Mêmes règles que l'API (EventsController, GalleryController) : vérifiées ici pour
// prévenir tout de suite plutôt qu'à la publication.
export const PHOTO_TYPES = 'image/jpeg,image/png,image/webp'
const MAX_BYTES = 10 * 1024 * 1024
export const WIZARD_GALLERY_MAX = 6

// Photo choisie dans l'assistant : gardée sur l'appareil (aperçu local) jusqu'à la
// création de l'événement, puis envoyée. `url` est rempli une fois l'envoi réussi.
export function photoFromFile(file) {
  if (!PHOTO_TYPES.split(',').includes(file.type)) throw new Error('Format non pris en charge : choisissez une photo JPG, PNG ou WebP.')
  if (file.size > MAX_BYTES) throw new Error('Photo trop lourde : 10 Mo maximum.')
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, preview: URL.createObjectURL(file), url: null }
}

export function releasePhoto(photo) {
  if (photo?.preview) URL.revokeObjectURL(photo.preview)
}

// Un emplacement : couverture, photo de l'invitation ou de l'histoire.
export function PhotoSlot({ id, label, hint, photo, onChange, wide = false }) {
  const [error, setError] = useState('')
  const pick = (file) => {
    if (!file) return
    try {
      const next = photoFromFile(file)
      setError('')
      releasePhoto(photo)
      onChange(next)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid gap-2">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      <label
        htmlFor={id}
        className={`relative grid cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-2 text-sm text-muted transition hover:border-brand-purple focus-within:border-brand-purple ${
          wide ? 'aspect-video' : 'aspect-4/3'
        }`}
      >
        {photo ? (
          <img src={photo.preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid justify-items-center gap-1.5 px-3 text-center">
            <ImagePlus className="h-6 w-6 text-brand-purple" aria-hidden="true" />
            <b className="text-ink">Ajouter une photo</b>
            <small>JPG, PNG ou WebP · 10 Mo max.</small>
          </span>
        )}
        <input
          id={id}
          type="file"
          accept={PHOTO_TYPES}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            pick(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>
      {photo && (
        <div className="flex flex-wrap items-center gap-3 text-xs leading-none font-semibold">
          <label htmlFor={id} className="cursor-pointer text-brand-purple hover:underline">
            Changer
          </label>
          <button
            type="button"
            onClick={() => {
              releasePhoto(photo)
              onChange(null)
            }}
            className="text-muted hover:text-danger"
          >
            Retirer
          </button>
        </div>
      )}
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Premières photos de la galerie (quelques-unes) : la suite se gère dans « Galerie ».
export function GalleryPicker({ photos, onChange }) {
  const [error, setError] = useState('')
  const room = WIZARD_GALLERY_MAX - photos.length

  const add = (files) => {
    const picked = []
    let firstError = ''
    for (const file of [...files].slice(0, Math.max(0, room))) {
      try {
        picked.push(photoFromFile(file))
      } catch (err) {
        firstError ||= `${file.name} : ${err.message}`
      }
    }
    if (files.length > room) firstError ||= `${WIZARD_GALLERY_MAX} photos maximum ici : ajoutez les autres ensuite dans Galerie.`
    setError(firstError)
    if (picked.length) onChange([...photos, ...picked])
  }

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-surface-2">
            <img src={photo.preview} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Retirer cette photo"
              onClick={() => {
                releasePhoto(photo)
                onChange(photos.filter((p) => p !== photo))
              }}
              className="absolute top-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        {room > 0 && (
          <label className="relative grid aspect-square cursor-pointer place-items-center rounded-lg border border-dashed border-border bg-surface-2 text-center text-xs text-muted transition hover:border-brand-purple focus-within:border-brand-purple">
            <span className="grid justify-items-center gap-1">
              <ImagePlus className="h-5 w-5 text-brand-purple" aria-hidden="true" />
              Ajouter
            </span>
            <input
              type="file"
              accept={PHOTO_TYPES}
              multiple
              aria-label="Ajouter des photos à la galerie"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                add(e.target.files ?? [])
                e.target.value = ''
              }}
            />
          </label>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
