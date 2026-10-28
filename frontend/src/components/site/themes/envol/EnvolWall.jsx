import { Maximize } from 'lucide-react'
import { useEffect, useState } from 'react'
import { mediaUrl } from '../../../../api/client'
import { getSiteTheme } from '../themeDefs'
import { loadThemeFonts } from '../themeFonts'
import Sceau from './Sceau'
import './envolWall.css'

const SLIDE_MS = 6000
const MAX_DOTS = 12

// Mur des vœux projeté dans la salle (maquette projection.html, 16:9) : seulement les vœux
// validés par l'organisateur, un par écran toutes les 6 secondes, avec le QR pour en envoyer.
export default function EnvolWall({ wall, qr, error }) {
  const [index, setIndex] = useState(0)
  const messages = wall?.messages ?? []
  const color = wall?.themeColor || '#0F1F44'
  const year = wall?.eventDate ? wall.eventDate.slice(0, 4) : ''
  const organisation = wall?.organizerName?.trim() || wall?.title || ''
  const logo = wall?.organizerLogoUrl ? mediaUrl(wall.organizerLogoUrl) : ''

  useEffect(() => loadThemeFonts(getSiteTheme('envol')), [])
  useEffect(() => {
    if (messages.length < 2) return undefined
    const timer = setInterval(() => setIndex((i) => i + 1), SLIDE_MS)
    return () => clearInterval(timer)
  }, [messages.length])

  const current = messages.length ? index % messages.length : 0
  const wish = messages[current]
  const count = wall?.messageCount ?? messages.length

  return (
    <div className="envol-wall" style={{ '--org': color }}>
      <Sceau className="envol-wall-wm" bare width={0.35} />
      <div className="envol-wall-left">
        <p className="envol-wall-live">
          <i aria-hidden="true" />
          Mur des vœux · en direct
        </p>
        <div>
          <div className="envol-wall-brand">
            <Sceau className="envol-wall-seal">{logo ? <img src={logo} alt="" /> : null}</Sceau>
            <span>{organisation}</span>
          </div>
          <h1>Présentation des vœux</h1>
          {year && <p className="envol-wall-year">{year}</p>}
        </div>
        <div className="envol-wall-send">
          {qr ? <img src={qr} alt="" /> : <span className="envol-wall-qr" />}
          <p>
            <b>Envoyez votre vœu</b>
            <span>Scannez ce code avec votre téléphone. Votre message apparaîtra ici après validation.</span>
            <em>{count > 1 ? `${count} vœux reçus` : count === 1 ? '1 vœu reçu' : 'Soyez le premier !'}</em>
          </p>
        </div>
      </div>
      <div className="envol-wall-right">
        {error && !wall ? (
          <p className="envol-wall-empty">{error}</p>
        ) : wish ? (
          <>
            <figure key={`${current}-${wish.createdAt}`}>
              <blockquote>{wish.message}</blockquote>
              <figcaption>
                <b>{wish.authorName}</b>
                {wish.service && <span>· {wish.service}</span>}
              </figcaption>
            </figure>
            {messages.length > 1 && (
              <div className="envol-wall-dots" aria-hidden="true">
                {messages.slice(0, MAX_DOTS).map((m, i) => (
                  <i key={i} className={i === current % MAX_DOTS ? 'on' : ''} />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="envol-wall-empty">Les vœux validés s’afficheront ici.</p>
        )}
      </div>
      <button type="button" className="envol-wall-full" onClick={() => document.documentElement.requestFullscreen?.()}>
        <Maximize aria-hidden="true" />
        Plein écran
      </button>
    </div>
  )
}
