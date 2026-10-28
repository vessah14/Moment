import { ArrowLeft, Monitor, QrCode, Smartphone } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import SitePage from '../components/site/SitePage'
import { TEMPLATE_DEMOS } from '../data/templateDemos'
import { invitationFor } from '../data/invitations'
import { rsvpSidesDemo } from '../data/rsvpSides'
import { TEMPLATES } from '../data/templates'
import { routeSeo } from '../data/seoRoutes'
import { siteUrl, useSeo } from '../utils/seo'
import { WIZARD_DRAFT_MESSAGE, WIZARD_READY_MESSAGE } from '../utils/wizardPreview'

// Démo d'un modèle premium (/modeles/:theme) : exactement le rendu du site publié, avec le
// contenu d'exemple des maquettes. Réponse, livre d'or et recherche de place fonctionnent
// en local (rien n'est envoyé au serveur), pour essayer le modèle comme un invité.

const nameKey = (name) =>
  (name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .sort()
    .join(' ')

const DEMO_GUEST_ID = '00000000-0000-4000-8000-000000000001'

function buildDemo(template, demo) {
  // Titre de section : celui du modèle s'il en propose un, sinon celui de la démo.
  const heading = (type, fallback) => template.headings?.[type] ?? fallback
  const blockContent = {
    Invitation: { heading: 'Invitation', showHeading: false, ...invitationFor(template.theme)?.demo },
    Rebours: {},
    Histoire: { heading: heading('Histoire', 'Notre histoire'), showHeading: true, body: demo.story ?? '' },
    Programme: { heading: heading('Programme', 'Programme'), showHeading: true },
    Localisation: {
      heading: heading('Localisation', 'Le lieu'),
      showHeading: true,
      additionalVenues: demo.additionalVenues ?? [],
    },
    Galerie: { heading: heading('Galerie', 'Galerie'), showHeading: true },
    "Livre d'or": { heading: heading("Livre d'or", demo.guestbookHeading ?? "Livre d'or"), showHeading: true },
    RSVP: { heading: heading('RSVP', 'Serez-vous des nôtres ?'), showHeading: true, ...rsvpSidesDemo(template.theme) },
    Familles: { heading: heading('Familles', 'Les familles'), showHeading: true, ...(demo.families ?? {}) },
    'Dress code': {
      heading: heading('Dress code', 'Code vestimentaire'),
      showHeading: true,
      title: demo.dress?.title,
      body: demo.dress?.body,
      colors: (demo.dress?.colors ?? []).map(([hex, name]) => ({ hex, name })),
    },
    Cadeaux: {
      heading: demo.gift?.heading ?? heading('Cadeaux', 'Liste de cadeaux'),
      showHeading: true,
      body: demo.gift?.body,
      accounts: (demo.gift?.accounts ?? []).map(([operator, name, number]) => ({ operator, name, number })),
    },
    Intervenants: {
      heading: heading('Intervenants', 'Intervenants'),
      showHeading: true,
      people: (demo.people ?? []).map(([name, role, topic]) => ({ name, role, topic })),
    },
    Distinctions: {
      heading: heading('Distinctions', 'Distinctions'),
      showHeading: true,
      body: demo.honours?.body,
      people: (demo.honours?.people ?? []).map(([name, role, topic, rank]) => ({ name, role, topic, rank })),
    },
    Partenaires: { heading: heading('Partenaires', 'Partenaires'), showHeading: true, partners: demo.partners ?? [] },
    Billetterie: { heading: heading('Billetterie', 'Billetterie'), showHeading: true },
    FAQ: { heading: heading('FAQ', 'Questions'), showHeading: true, items: (demo.faq ?? []).map(([question, answer]) => ({ question, answer })) },
    'Plan de table': { heading: heading('Plan de table', 'Trouver ma place'), showHeading: true },
    'Pied de page': {},
  }
  // Textes fixes du modèle (data/templates.js, content) là où la démo n'en donne pas.
  for (const [type, extra] of Object.entries(template.content ?? {})) {
    if (!blockContent[type]) continue
    for (const [key, value] of Object.entries(extra)) blockContent[type][key] ||= value
  }
  return { blocks: template.blocks, blockContent }
}

// Une démo par modèle : changer de modèle repart d'un état neuf (réponse, livre d'or).
export default function TemplateDemo() {
  const { theme } = useParams()
  return <Demo key={theme} theme={theme} />
}

// Largeur et hauteur d'un téléphone courant (iPhone 13/14, la plupart des Android).
const PHONE = { width: 390, height: 844 }

function Demo({ theme }) {
  const template = TEMPLATES.find((t) => t.theme === theme)
  const demo = TEMPLATE_DEMOS[theme]
  const [searchParams] = useSearchParams()
  const [minuitDemoTarget] = useState(() => Date.now() + 10_000)
  // ?cadre=1 : la démo seule, sans barre, affichée dans le téléphone de l'aperçu.
  const embedded = searchParams.get('cadre') === '1'
  const minuitDemo = theme === 'minuit' && searchParams.get('demo') === 'minuit'
  // &apercu=1 : aperçu de l'assistant de création. La page s'affiche ouverte et reprend ce
  // que l'organisateur saisit (message envoyé par la page parente, même origine uniquement).
  const live = embedded && searchParams.get('apercu') === '1'
  const draft = useWizardDraft(live)
  const [view, setView] = useState('ordinateur')
  const [qrOpen, setQrOpen] = useState(false)
  const [entries, setEntries] = useState(() => demo?.guestbook ?? [])
  const [invitation, setInvitation] = useState(() =>
    demo
      ? {
          guestId: DEMO_GUEST_ID,
          guestFullName: demo.guest,
          eventName: demo.title,
          rsvpConfirmed: null,
          rsvpAccompanyingCount: 0,
          rsvpClosed: false,
        }
      : null,
  )

  useSeo(routeSeo(`/modeles/${theme}`, siteUrl()))

  if (!template || !demo) return <Navigate to="/modeles" replace />

  const { blocks, blockContent: demoBlockContent } = buildDemo(template, demo)
  const blockContent = {
    ...demoBlockContent,
    ...Object.fromEntries(Object.entries(draft?.blockContent ?? {}).map(([type, value]) => [type, { ...(demoBlockContent[type] ?? {}), ...value }])),
  }
  const seatingTables = demo.tables ?? []

  const data = {
    slug: null,
    eventDateTime: draft?.eventDateTime || demo.eventDateTime,
    countdownTarget: minuitDemo ? minuitDemoTarget : undefined,
    countdownDemo: minuitDemo,
    coverPath: null,
    description: draft?.description || demo.description,
    locationLabel: draft?.locationLabel || demo.locationLabel,
    locationAddress: draft?.locationAddress || demo.locationAddress,
    organizer: draft?.organizer ?? null,
    programItems: demo.program,
    galleryPhotos: [],
    galleryLabels: invitationFor(template.theme)?.gallery ?? [],
    ticketTypes: (demo.tickets ?? []).map(([name, price, quota, soldCount], i) => ({
      id: i + 1,
      name,
      priceCents: price * 100,
      quota,
      soldCount,
    })),
    guestBookEntries: entries,
    gifts: (demo.gift?.wishlist ?? []).map(([name, taken], i) => ({ id: i + 1, name, isReserved: Boolean(taken) })),
    seatingTables,
    invitation,
    onInvitationChange: setInvitation,
    // Démo : tout reste dans le navigateur.
    submitRsvp: async (_id, dto) => ({
      ...invitation,
      rsvpConfirmed: dto.maybe ? null : dto.confirmed,
      rsvpMaybe: Boolean(dto.maybe),
      rsvpAccompanyingCount: dto.accompanyingCount,
      rsvpSide: dto.side,
      rsvpExtra: dto.extra,
    }),
    submitGuestBook: async (dto) => setEntries((prev) => [{ authorName: dto.authorName, message: dto.message, service: dto.service }, ...prev]),
    findSeat: async (name) => {
      const key = nameKey(name)
      const table = seatingTables.find((t) => (t.guests ?? []).some((g) => nameKey(g) === key))
      return table ? { found: true, number: table.number, label: table.label } : { found: false }
    },
  }

  const page = (
    <SitePage
      fullPage
      startOpen={live}
      template={template}
      heroStyle={{ title: draft?.title || demo.title, kicker: draft?.kicker || demo.kicker, palette: null, motif: null, color: template.preview.accent, font: 'Playfair Display + Inter', darkOverlay: true }}
      blocks={blocks}
      blockContent={blockContent}
      data={data}
    />
  )

  if (embedded) return <main className="min-h-svh">{page}</main>

  return (
    <div className="min-h-svh">
      <header className="relative z-[60] flex flex-wrap items-center gap-x-4 gap-y-2 bg-[#0F0B2E] px-4 py-2.5 text-sm text-[#F2EFFF]">
        <Link to="/modeles" className="inline-flex items-center gap-1.5 text-[#A8A1D1] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Tous les modèles
        </Link>
        <span
          aria-label="Aperçu interactif avec données fictives. Aucune réponse n'est envoyée."
          title="Les invités, réponses et informations affichés sont fictifs. Rien n'est envoyé à l'organisateur."
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/90"
        >
          Aperçu interactif · données fictives
        </span>
        <span className="hidden text-[#A8A1D1] 2xl:inline">
          Démo du modèle <b className="text-white">{template.name}</b> · contenu d'exemple.
          {blocks.includes('RSVP') && ` Essayez la réponse (${demo.guest})`}
          {blocks.includes('Plan de table') && ' et « Trouver ma place »'}
          {blocks.includes('RSVP') && '.'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden rounded-full border border-white/15 p-0.5 md:flex" role="group" aria-label="Aperçu">
            {[
              ['ordinateur', Monitor, 'Ordinateur'],
              ['telephone', Smartphone, 'Téléphone'],
            ].map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => setView(id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  view === id ? 'bg-white text-[#0F0B2E]' : 'text-[#A8A1D1] hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          <div className="relative hidden md:block">
            <button
              type="button"
              aria-expanded={qrOpen}
              onClick={() => setQrOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#F2EFFF] hover:border-white/40"
            >
              <QrCode className="h-3.5 w-3.5" />
              Sur mon téléphone
            </button>
            {qrOpen && <PhoneQr theme={theme} onClose={() => setQrOpen(false)} />}
          </div>
          <Link
            to={`/dashboard/evenements/nouveau?modele=${encodeURIComponent(template.name)}`}
            className="rounded-full bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-4 py-1.5 font-semibold whitespace-nowrap text-white"
          >
            Utiliser ce modèle
          </Link>
        </div>
      </header>
      <main id="main-content">
        {view === 'telephone' ? <PhoneFrame theme={theme} name={template.name} /> : page}
      </main>
    </div>
  )
}

// Brouillon de l'assistant : seuls les textes attendus sont repris, et le logo seulement
// s'il s'agit d'une image PNG préparée par l'assistant.
function useWizardDraft(enabled) {
  const [draft, setDraft] = useState(null)
  useEffect(() => {
    if (!enabled) return
    const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '')
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.source !== window.parent || e.data?.type !== WIZARD_DRAFT_MESSAGE) return
      const d = e.data.draft ?? {}
      const logo = str(d.organizer?.logoSrc, 2_000_000)
      const bound = (value, depth = 0) => {
        if (typeof value === 'string') return value.slice(0, 3000)
        if (typeof value === 'number' || typeof value === 'boolean' || value === null) return value
        if (depth >= 3) return undefined
        if (Array.isArray(value)) return value.slice(0, 20).map((item) => bound(item, depth + 1))
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).slice(0, 30).map(([key, item]) => [key.slice(0, 80), bound(item, depth + 1)]))
        return undefined
      }
      setDraft({
        title: str(d.title, 150),
        kicker: str(d.kicker, 150),
        description: str(d.description, 600),
        eventDateTime: str(d.eventDateTime, 40),
        locationLabel: str(d.locationLabel, 120),
        locationAddress: str(d.locationAddress, 200),
        organizer:
          d.organizer && (d.organizer.name || logo)
            ? { name: str(d.organizer.name, 80), logoSrc: logo.startsWith('data:image/png;base64,') ? logo : '' }
            : null,
        blockContent: bound(d.blockContent) ?? {},
      })
    }
    window.addEventListener('message', onMessage)
    window.parent.postMessage({ type: WIZARD_READY_MESSAGE }, window.location.origin)
    return () => window.removeEventListener('message', onMessage)
  }, [enabled])
  return draft
}

// La démo dans un téléphone : un vrai écran de 390 px de large (iframe), réduit si la
// fenêtre est trop basse pour l'afficher en entier.
function PhoneFrame({ theme, name }) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 120) / (PHONE.height + 28)))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div className="flex min-h-[calc(100svh-48px)] flex-col items-center justify-start bg-[radial-gradient(60%_50%_at_50%_40%,#21195a,transparent_70%),#0B0824] px-4 py-6">
      <div style={{ width: (PHONE.width + 28) * scale, height: (PHONE.height + 28) * scale }}>
        <div
          className="origin-top-left rounded-[48px] bg-[linear-gradient(145deg,#2A2360,#120E33)] p-3.5 shadow-[0_40px_80px_-30px_rgba(0,0,0,.7),inset_0_0_0_1px_#3A3176]"
          style={{ width: PHONE.width + 28, height: PHONE.height + 28, transform: `scale(${scale})` }}
        >
          <iframe
            src={`/modeles/${theme}?cadre=1`}
            title={`Aperçu téléphone du modèle ${name}`}
            className="h-full w-full rounded-[36px] bg-white"
            style={{ border: 0 }}
          />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-[#A8A1D1]">
        Aperçu sur un écran de téléphone ({PHONE.width} × {PHONE.height} px). Faites défiler dans le téléphone.
      </p>
    </div>
  )
}

// QR code de la démo, à scanner pour l'ouvrir sur son propre téléphone.
function PhoneQr({ theme, onClose }) {
  const url = `${window.location.origin}/modeles/${theme}`
  const [src, setSrc] = useState(null)
  const local = /^(localhost|127\.|\[::1\])/.test(window.location.hostname)

  useEffect(() => {
    let alive = true
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#111111', light: '#ffffff' } })
      .then((data) => alive && setSrc(data))
      .catch(() => alive && setSrc(null))
    return () => {
      alive = false
    }
  }, [url])

  return (
    <>
      <button type="button" aria-label="Fermer" onClick={onClose} className="fixed inset-0 z-[61] cursor-default" />
      <div className="absolute top-full right-0 z-[62] mt-3 w-64 rounded-2xl border border-white/10 bg-[#19133F] p-4 text-center shadow-2xl">
        <p className="text-sm font-semibold text-white">Ouvrir sur mon téléphone</p>
        <p className="mt-1 text-xs text-[#A8A1D1]">Scannez avec l’appareil photo du téléphone.</p>
        <div className="mx-auto mt-3 w-44 rounded-xl bg-white p-2">
          {src ? <img src={src} alt={`QR code vers ${url}`} className="block h-auto w-full" /> : <div className="aspect-square" />}
        </div>
        {local && (
          <p className="mt-3 text-left text-[11px] leading-snug text-[#FFE3A8]">
            Le site tourne sur cet ordinateur (localhost) : le téléphone ne pourra l’ouvrir qu’une fois le site
            en ligne, ou en remplaçant « localhost » par l’adresse IP de l’ordinateur sur le même Wi-Fi.
          </p>
        )}
      </div>
    </>
  )
}
