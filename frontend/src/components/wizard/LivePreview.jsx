import { useEffect, useRef, useState } from 'react'
import { BLOCK_CONTENT_DEFAULTS } from '../../data/blockDefaults'
import { formatEventDate } from '../../utils/formatDate'
import { resolveSiteStyle, templateBlockHeading, templateBlocks } from '../../utils/templateTheme'
import { WIZARD_DRAFT_MESSAGE, WIZARD_READY_MESSAGE } from '../../utils/wizardPreview'
import SitePage from '../site/SitePage'

// Écran du téléphone : la page fait 390 px de large (un vrai téléphone), réduite à 296 px.
const SCREEN = { width: 296, height: 620, page: 390 }
const SCALE = SCREEN.width / SCREEN.page

// Aperçu en direct de la page de l'invité pendant la création. Modèle premium : la démo
// du modèle (/modeles/:theme) dans un cadre, qui reçoit le brouillon par message. Modèle
// classique : le rendu du site directement, avec les sections du modèle.
export default function LivePreview({ template, draft, shown }) {
  return (
    <aside
      aria-label="Aperçu de la page invité"
      className={`${shown ? 'grid' : 'hidden'} order-first justify-items-center gap-3 lg:sticky lg:top-24 lg:order-none lg:grid`}
    >
      <span className="font-mono text-[0.72rem] tracking-[0.1em] text-muted uppercase">Aperçu en direct</span>
      <div className="relative h-[640px] w-[316px] overflow-hidden rounded-[40px] border border-border-soft bg-[#05040F] p-2.5 shadow-[0_40px_80px_-40px_#000]">
        <div className="relative overflow-hidden rounded-[30px] bg-black" style={{ width: SCREEN.width, height: SCREEN.height }}>
          {template?.theme ? (
            <ThemedFrame key={template.theme} theme={template.theme} name={template.name} draft={draft} />
          ) : template ? (
            <ClassicScreen template={template} draft={draft} />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-sm text-white/70">
              Choisissez un type d'événement pour voir votre page.
            </div>
          )}
        </div>
      </div>
      <p className="max-w-[316px] text-center text-[0.85rem] text-muted">
        L’aperçu suit les informations et les sections que vous renseignez. Les horaires, photos et billets se complètent dans le tableau de bord.
      </p>
    </aside>
  )
}

function ThemedFrame({ theme, name, draft }) {
  const frame = useRef(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)

  // Nouveau modèle : nouvelle page, on attend qu'elle se signale.
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return
      if (e.data?.type === WIZARD_READY_MESSAGE) setReady(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [theme])

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => {
      frame.current?.contentWindow?.postMessage({ type: WIZARD_DRAFT_MESSAGE, draft }, window.location.origin)
      setLoading(false)
    }, 250)
    return () => clearTimeout(t)
  }, [ready, draft])

  return (
    <>
      <iframe
        ref={frame}
        key={theme}
        src={`/modeles/${theme}?cadre=1&apercu=1`}
        title={`Aperçu de la page avec le modèle ${name}`}
        className="absolute top-0 left-0 border-0 bg-white"
        style={{ width: SCREEN.page, height: SCREEN.height / SCALE, transform: `scale(${SCALE})`, transformOrigin: '0 0' }}
      />
      <div
        className={`pointer-events-none absolute inset-0 grid place-items-center bg-[rgba(5,4,15,.55)] text-[0.8rem] text-white transition-opacity ${
          loading ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        Mise à jour…
      </div>
    </>
  )
}

function ClassicScreen({ template, draft }) {
  const blocks = templateBlocks(template)
  const blockContent = Object.fromEntries(
    blocks.map((type) => [
      type,
      { ...(BLOCK_CONTENT_DEFAULTS[type] ?? {}), heading: templateBlockHeading(template, type), ...(draft.blockContent?.[type] ?? {}) },
    ]),
  )
  const style = resolveSiteStyle({ template })
  const [date, time] = (draft.eventDateTime || '').split('T')
  return (
    <div
      className="absolute top-0 left-0 overflow-y-auto bg-white"
      style={{ width: SCREEN.page, height: SCREEN.height / SCALE, transform: `scale(${SCALE})`, transformOrigin: '0 0' }}
    >
      <SitePage
        template={template}
        heroStyle={{
          color: style.accent,
          font: style.fontKey,
          darkOverlay: true,
          title: draft.title || template.preview?.title || template.name,
          subtitle: [date && formatEventDate(date), time?.slice(0, 5)].filter(Boolean).join(' · '),
        }}
        blocks={blocks}
        blockContent={blockContent}
        data={{
          slug: null,
          eventDateTime: draft.eventDateTime,
          description: draft.description,
          locationLabel: draft.locationLabel,
          locationAddress: draft.locationAddress,
          organizer: draft.organizer,
          programItems: [],
          galleryPhotos: [],
          guestBookEntries: [],
          ticketTypes: [],
        }}
      />
    </div>
  )
}
