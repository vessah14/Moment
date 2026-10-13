import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import SitePage from '../components/site/SitePage'
import { TEMPLATE_DEMOS } from '../data/templateDemos'
import { TEMPLATES } from '../data/templates'
import { routeSeo } from '../data/seoRoutes'
import { siteUrl, useSeo } from '../utils/seo'

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
    Rebours: {},
    Histoire: { heading: heading('Histoire', 'Notre histoire'), showHeading: true, body: demo.story ?? '' },
    Programme: { heading: heading('Programme', 'Programme'), showHeading: true },
    Localisation: { heading: heading('Localisation', 'Le lieu'), showHeading: true },
    Galerie: { heading: heading('Galerie', 'Galerie'), showHeading: true },
    "Livre d'or": { heading: heading("Livre d'or", demo.guestbookHeading ?? "Livre d'or"), showHeading: true },
    RSVP: { heading: heading('RSVP', 'Serez-vous des nôtres ?'), showHeading: true },
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
    Partenaires: { heading: heading('Partenaires', 'Partenaires'), showHeading: true, partners: demo.partners ?? [] },
    Billetterie: { heading: heading('Billetterie', 'Billetterie'), showHeading: true },
    FAQ: { heading: heading('FAQ', 'Questions'), showHeading: true, items: (demo.faq ?? []).map(([question, answer]) => ({ question, answer })) },
    'Plan de table': { heading: heading('Plan de table', 'Trouver ma place'), showHeading: true },
    'Pied de page': {},
  }
  return { blocks: template.blocks, blockContent }
}

// Une démo par modèle : changer de modèle repart d'un état neuf (réponse, livre d'or).
export default function TemplateDemo() {
  const { theme } = useParams()
  return <Demo key={theme} theme={theme} />
}

function Demo({ theme }) {
  const template = TEMPLATES.find((t) => t.theme === theme)
  const demo = TEMPLATE_DEMOS[theme]
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

  const { blocks, blockContent } = buildDemo(template, demo)
  const seatingTables = demo.tables ?? []

  const data = {
    slug: null,
    eventDateTime: demo.eventDateTime,
    coverPath: null,
    description: demo.description,
    locationLabel: demo.locationLabel,
    locationAddress: demo.locationAddress,
    programItems: demo.program,
    galleryPhotos: [],
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
      rsvpConfirmed: dto.confirmed,
      rsvpAccompanyingCount: dto.accompanyingCount,
    }),
    submitGuestBook: async (dto) => setEntries((prev) => [{ authorName: dto.authorName, message: dto.message }, ...prev]),
    findSeat: async (name) => {
      const key = nameKey(name)
      const table = seatingTables.find((t) => (t.guests ?? []).some((g) => nameKey(g) === key))
      return table ? { found: true, number: table.number, label: table.label } : { found: false }
    },
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-[#0F0B2E] px-4 py-2.5 text-sm text-[#F2EFFF]">
        <Link to="/modeles" className="inline-flex items-center gap-1.5 text-[#A8A1D1] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Tous les modèles
        </Link>
        <span className="hidden text-[#A8A1D1] sm:inline">
          Démo du modèle <b className="text-white">{template.name}</b> · contenu d'exemple.
          {blocks.includes('RSVP') && ` Essayez la réponse (${demo.guest})`}
          {blocks.includes('Plan de table') && ' et « Trouver ma place »'}
          {blocks.includes('RSVP') && '.'}
        </span>
        <Link
          to={`/dashboard/evenements/nouveau?modele=${encodeURIComponent(template.name)}`}
          className="ml-auto rounded-full bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-4 py-1.5 font-semibold text-white"
        >
          Utiliser ce modèle
        </Link>
      </div>
      <SitePage
        fullPage
        template={template}
        heroStyle={{ title: demo.title, kicker: demo.kicker, palette: null, motif: null, color: template.preview.accent, font: 'Playfair Display + Inter', darkOverlay: true }}
        blocks={blocks}
        blockContent={blockContent}
        data={data}
      />
    </>
  )
}
