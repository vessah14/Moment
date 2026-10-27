import QRCode from 'qrcode'
import { Maximize } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { eventShareUrl, mediaUrl } from '../api/client'
import { getPublicWall } from '../api/publicEvents'
import { useSeo } from '../utils/seo'

const REFRESH_MS = 15000
const SLIDE_MS = 7000

// Mur du jour J (/e/{slug}/mur), à projeter dans la salle : photos et messages validés
// par l'organisateur défilent en grand, avec un QR code pour en envoyer d'autres.
export default function EventWall() {
  const { slug } = useParams()
  useSeo({ title: 'Mur de l’événement', noindex: true })
  const [wall, setWall] = useState(null)
  const [error, setError] = useState('')
  const [index, setIndex] = useState(0)
  const [qr, setQr] = useState('')
  const pageUrl = eventShareUrl(slug)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      getPublicWall(slug)
        .then((data) => {
          if (!cancelled) {
            setWall(data)
            setError('')
          }
        })
        .catch((err) => !cancelled && setError(err.message || 'Mur indisponible.'))
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [slug])

  useEffect(() => {
    QRCode.toDataURL(pageUrl, { margin: 1, width: 360, color: { dark: '#111111', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [pageUrl])

  // Photos et messages en alternance, les plus récents d'abord.
  const slides = useMemo(() => {
    const photos = (wall?.photos ?? []).map((p) => ({ kind: 'photo', key: `p-${p.id}`, url: mediaUrl(p.url), by: p.uploadedBy }))
    const messages = (wall?.messages ?? []).map((m, i) => ({ kind: 'message', key: `m-${i}-${m.createdAt}`, text: m.message, by: m.authorName }))
    const mixed = []
    for (let i = 0; i < Math.max(photos.length, messages.length); i++) {
      if (photos[i]) mixed.push(photos[i])
      if (messages[i]) mixed.push(messages[i])
    }
    return mixed
  }, [wall])

  useEffect(() => {
    if (slides.length < 2) return undefined
    const timer = setInterval(() => setIndex((i) => i + 1), SLIDE_MS)
    return () => clearInterval(timer)
  }, [slides.length])

  const slide = slides.length ? slides[index % slides.length] : null
  const accent = wall?.themeColor || '#C970FF'

  return (
    <div className="flex min-h-svh flex-col bg-[#0B0820] text-white" style={{ '--wall-accent': accent }}>
      <header className="flex items-center justify-between gap-4 px-6 pt-5 sm:px-10">
        <p className="truncate text-xl font-bold sm:text-3xl">{wall?.title ?? ''}</p>
        <button
          type="button"
          onClick={() => document.documentElement.requestFullscreen?.()}
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          <Maximize className="h-4 w-4" aria-hidden="true" />
          Plein écran
        </button>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-6 sm:px-10">
        {error && !wall ? (
          <p className="text-lg text-white/70">{error}</p>
        ) : !slide ? (
          <div className="max-w-2xl text-center">
            <p className="text-3xl font-bold sm:text-5xl">Partagez vos plus beaux moments !</p>
            <p className="mt-4 text-lg text-white/70">Scannez le QR code pour envoyer vos photos et laisser un message.</p>
          </div>
        ) : slide.kind === 'photo' ? (
          <figure key={slide.key} className="flex h-full max-h-[75svh] flex-col items-center gap-3 animate-[fadeIn_.8s_ease]">
            <img src={slide.url} alt="" className="max-h-[68svh] max-w-full rounded-2xl object-contain shadow-2xl" />
            {slide.by && <figcaption className="text-lg text-white/70">📸 {slide.by}</figcaption>}
          </figure>
        ) : (
          <blockquote key={slide.key} className="max-w-4xl text-center animate-[fadeIn_.8s_ease]">
            <p className="text-3xl leading-snug font-semibold sm:text-5xl">« {slide.text} »</p>
            <footer className="mt-6 text-xl font-semibold" style={{ color: accent }}>— {slide.by}</footer>
          </blockquote>
        )}
      </main>

      <footer className="flex items-end justify-between gap-6 px-6 pb-6 sm:px-10">
        <p className="text-sm text-white/50">Créé avec TBF MOMENT</p>
        {qr && (
          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-3 pr-5">
            <img src={qr} alt="" className="h-24 w-24 rounded-lg sm:h-28 sm:w-28" />
            <p className="max-w-[14rem] text-sm text-white/80 sm:text-base">
              Scannez pour envoyer vos photos et vos messages
            </p>
          </div>
        )}
      </footer>
    </div>
  )
}
