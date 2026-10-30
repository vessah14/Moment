import { Copy, Download, MessageCircle, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { API_ORIGIN, eventPosterUrl, eventShareUrl, mediaUrl } from '../../api/client'
import { getPublicSite, trackPublicEvent } from '../../api/publicEvents'
import { isMobileDevice } from '../../utils/calendar'
import { rsvpRules } from '../../utils/rsvpRules'
import { buildShareMessage, whatsappShareUrl } from '../../utils/shareMessage'
import { safeCoverPath } from '../../utils/sitePage'
import { useToast } from '../../utils/useToast'

const POSTERS = [
  { format: 'square', label: 'Affiche carrée', hint: 'Pour un groupe : l’image seule, en plus de l’invitation', ratio: 'aspect-square' },
  { format: 'story', label: 'Affiche pour le Statut', hint: 'Verticale, l’adresse est écrite dessus', ratio: 'aspect-[9/16]' },
]

// Lieu affiché : le nom donné par l'organisateur, sinon l'adresse.
const placeOf = (event) =>
  event?.locationLabel && event.locationLabel !== 'Lieu principal'
    ? event.locationLabel
    : event?.locationAddress ?? ''

// Le gras WhatsApp (*texte*) tel qu'il s'affichera dans la bulle.
function WhatsAppText({ text }) {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) =>
    /^\*[^*\n]+\*$/.test(part) ? <b key={i}>{part.slice(1, -1)}</b> : <span key={i}>{part}</span>,
  )
}

// Kit de partage WhatsApp d'un événement publié. L'invitation part en texte seul : WhatsApp
// en tire une carte d'aperçu (image de l'événement EN HAUT, titre, description), puis le
// texte, dans une seule bulle. Une image jointe serait envoyée dans une bulle à part, sous
// le texte, sans carte : les affiches restent donc une option, envoyées seules.
export default function ShareKit({ slug, title, date, time, location, intro }) {
  const toast = useToast()
  const url = eventShareUrl(slug)
  const [message, setMessage] = useState(() => buildShareMessage({ title, date, time, location, url, intro }))
  // Carte d'aperçu attendue (mêmes règles que ShareController côté API : couverture, sinon affiche).
  const [card, setCard] = useState({
    image: `${API_ORIGIN}/share/e/${encodeURIComponent(slug)}/poster.png`,
    title,
    description: '',
  })
  // Tant que l'organisateur n'a pas retouché le message, il est complété avec le lieu et la
  // date limite de réponse lus sur la page publiée.
  const [edited, setEdited] = useState(false)
  useEffect(() => {
    let cancelled = false
    getPublicSite(slug)
      .then((site) => {
        if (cancelled || !site?.event) return
        const { event } = site
        const cover = safeCoverPath(event.coverImageUrl)
        setCard((prev) => ({
          image: cover ? mediaUrl(cover) : prev.image,
          title: event.heroTitle?.trim() || event.name || prev.title,
          description: (event.description || event.heroSubtitle || event.tagline || '').trim(),
        }))
        if (edited) return
        const rsvp = site.blocks?.find((block) => block.blockType === 'RSVP')
        let deadline = ''
        try {
          deadline = rsvpRules(JSON.parse(rsvp?.content || '{}') ?? {}).deadline
        } catch {
          deadline = ''
        }
        setMessage(buildShareMessage({ title, date, time, location: location || placeOf(site.event), url, intro, deadline }))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      toast('Message copié : collez-le seul dans WhatsApp, la carte apparaît au-dessus.')
    } catch {
      toast('Copie impossible : sélectionnez le message pour le copier.', { variant: 'error' })
    }
  }

  // Images chargées dès l'ouverture du kit : Safari (iPhone) n'ouvre le menu de partage
  // que si l'appel suit immédiatement le toucher, sans téléchargement entre les deux.
  const [files, setFiles] = useState({})
  useEffect(() => {
    // Préchauffage de l'aperçu WhatsApp : réveille le serveur et prépare l'affiche du lien
    // avant que le message soit collé ; WhatsApp abandonne la carte si la réponse tarde.
    for (const path of ['', '/poster.png']) {
      fetch(`${API_ORIGIN}/share/e/${encodeURIComponent(slug)}${path}`, { mode: 'no-cors' }).catch(() => {})
    }
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

  // Affiche envoyée seule (Statut, groupe) : sans texte, WhatsApp ne la met pas sous le message.
  const sharePoster = (format) => {
    const file = files[format]
    const imageUrl = eventPosterUrl(slug, format)
    if (!file) {
      // Image pas encore prête : on l'ouvre, l'appui long permet de l'enregistrer.
      window.open(imageUrl, '_blank', 'noopener')
      return
    }
    if (navigator.canShare?.({ files: [file] })) {
      navigator
        .share({ files: [file] })
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
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-ink">Ce que vos invités recevront</p>
        {/* Bulle WhatsApp simulée : carte d'aperçu en haut, puis le message. */}
        <div className="rounded-2xl bg-[#e7f8d5] p-1.5 text-[#111b21] shadow-sm">
          <div className="overflow-hidden rounded-xl bg-black/5">
            <img src={card.image} alt="" className="aspect-[1200/630] w-full bg-black/10 object-cover" />
            <div className="px-3 py-2">
              <p className="line-clamp-1 text-sm font-semibold">{card.title}</p>
              {card.description && <p className="line-clamp-2 text-xs opacity-75">{card.description}</p>}
              <p className="mt-0.5 text-xs opacity-60">{new URL(url).host}</p>
            </div>
          </div>
          <p className="px-2 pt-2 pb-1 text-sm leading-relaxed whitespace-pre-wrap break-words">
            <WhatsAppText text={message} />
          </p>
        </div>
      </div>

      <a
        href={whatsappShareUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          trackPublicEvent(slug, 'share')
          // Téléphone : menu de partage avec le texte seul (emojis intacts, carte d'aperçu
          // créée par WhatsApp). Ordinateur : lien api.whatsapp.com.
          if (isMobileDevice() && navigator.canShare?.({ text: message })) {
            e.preventDefault()
            navigator.share({ text: message }).catch(() => {})
          }
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Envoyer l’invitation sur WhatsApp
      </a>
      <p className="-mt-3 text-xs text-faint">
        Dans WhatsApp, attendez une à deux secondes que la carte apparaisse au-dessus du message
        avant d’envoyer. Pour vos invités enregistrés, préférez leur lien personnel (page
        Invitations) : ils y sont accueillis par leur prénom et reçoivent leur pass.
      </p>

      <details className="rounded-xl border border-border-soft p-3">
        <summary className="cursor-pointer text-sm font-semibold text-ink">Modifier le message</summary>
        <textarea
          value={message}
          onChange={(e) => {
            setEdited(true)
            setMessage(e.target.value)
          }}
          rows={11}
          className="mt-3 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-ink outline-none focus:border-brand-purple"
        />
        <button
          type="button"
          onClick={copy}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink hover:border-faint"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          Copier le message
        </button>
      </details>

      <div className="grid gap-2">
        <p className="text-sm font-semibold text-ink">Affiches à part (Statut, groupes)</p>
        <p className="-mt-1 text-xs text-faint">Envoyées comme image seule, sans le message.</p>
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
                {!files[poster.format] ? 'Préparation…' : navigator.canShare ? 'Partager l’image' : 'Télécharger'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
