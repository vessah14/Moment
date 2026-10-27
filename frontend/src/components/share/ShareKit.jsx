import { Copy, Download, MessageCircle, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { eventPosterUrl, eventShareUrl } from '../../api/client'
import { trackPublicEvent } from '../../api/publicEvents'
import { buildShareMessage, whatsappShareUrl } from '../../utils/shareMessage'
import { useToast } from '../../utils/useToast'

const POSTERS = [
  { format: 'square', label: 'Image pour les discussions', hint: 'Carrée, à envoyer avec le message', ratio: 'aspect-square' },
  { format: 'story', label: 'Image pour le Statut', hint: 'Verticale, l’adresse est écrite dessus', ratio: 'aspect-[9/16]' },
]

// Kit de partage WhatsApp d'un événement publié : message prêt (modifiable), envoi direct,
// et deux images générées par l'API. Le partage natif transmet l'affiche et le message.
export default function ShareKit({ slug, title, date, time, location }) {
  const toast = useToast()
  const url = eventShareUrl(slug)
  const [message, setMessage] = useState(() => buildShareMessage({ title, date, time, location, url }))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      toast('Message copié')
    } catch {
      toast('Copie impossible : sélectionnez le message pour le copier.', { variant: 'error' })
    }
  }

  // Images chargées dès l'ouverture du kit : Safari (iPhone) n'ouvre le menu de partage
  // que si l'appel suit immédiatement le toucher, sans téléchargement entre les deux.
  const [files, setFiles] = useState({})
  useEffect(() => {
    let cancelled = false
    for (const { format } of POSTERS) {
      fetch(eventPosterUrl(slug, format))
        .then((response) => (response.ok ? response.blob() : Promise.reject(new Error(String(response.status)))))
        .then((blob) => {
          if (!cancelled) setFiles((prev) => ({ ...prev, [format]: new File([blob], `${slug}-${format}.png`, { type: 'image/png' }) }))
        })
        .catch(() => {})
    }
    return () => {
      cancelled = true
    }
  }, [slug])

  const sharePoster = (format) => {
    const file = files[format]
    const imageUrl = eventPosterUrl(slug, format)
    if (!file) {
      // Image pas encore prête : on l'ouvre, l'appui long permet de l'enregistrer.
      window.open(imageUrl, '_blank', 'noopener')
      return
    }
    // Transmettre aussi le texte prérempli pour les applications qui acceptent image et message.
    if (navigator.canShare?.({ files: [file], text: message })) {
      navigator
        .share({ files: [file], text: message })
        .then(() => trackPublicEvent(slug, 'share'))
        .catch((err) => {
          // Partage annulé par l'utilisateur : rien à signaler.
          if (err?.name !== 'AbortError') toast('Partage impossible ici : l’image s’ouvre, enregistrez-la par un appui long.', { variant: 'error' })
          if (err?.name !== 'AbortError') window.open(imageUrl, '_blank', 'noopener')
        })
      return
    }
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = file.name
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold text-ink">Message prêt à envoyer</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-ink outline-none focus:border-brand-purple"
        />
      </label>
      <div className="flex flex-wrap gap-2.5">
        <a
          href={whatsappShareUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackPublicEvent(slug, 'share')}
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Envoyer sur WhatsApp
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-faint"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          Copier le message
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {POSTERS.map((poster) => (
          <div key={poster.format} className="grid content-start gap-2">
            <img
              src={eventPosterUrl(slug, poster.format)}
              alt={poster.label}
              loading="lazy"
              className={`${poster.ratio} w-full rounded-xl border border-border-soft bg-surface-2 object-cover`}
            />
            <p className="text-xs font-semibold text-ink">{poster.label}</p>
            <p className="text-xs text-faint">{poster.hint}</p>
            <button
              type="button"
              onClick={() => sharePoster(poster.format)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-ink hover:border-faint disabled:opacity-50"
            >
              {navigator.canShare ? <Share2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
              {!files[poster.format] ? 'Préparation…' : navigator.canShare ? 'Partager' : 'Télécharger'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
