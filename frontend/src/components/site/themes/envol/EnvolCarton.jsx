import { useEffect, useState } from 'react'
import { createGuestTicketQr } from '../../../../utils/ticketQr'
import Sceau from './Sceau'
import './envolCarton.css'

// Carton d'invitation A5 nominatif (maquette carton.html), 874 × 1236 px à l'écran : capturé
// puis posé seul sur une page A5 du PDF à imprimer chez TBF DIGITAL. Classes tkc / qr :
// reconnues par la capture des billets (attente du QR dessiné).
export default function EnvolCarton({ guest, carton }) {
  const [qr, setQr] = useState('')
  useEffect(() => {
    let cancelled = false
    createGuestTicketQr(guest.id)
      .then((url) => !cancelled && setQr(url))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [guest.id])

  const { organisation, logo, intro, title, year, when, venue, dress, deadline, url, color } = carton
  return (
    <div className="tkc envol-carton" style={{ '--org': color || '#0F1F44' }}>
      <div className="envol-carton-f1">
        <i />
        <i />
        <i />
        <i />
        <div className="envol-carton-f2">
          <div>
            <Sceau className="envol-carton-seal" stroke="#C49A3C" fill="#FFFDF8" width={0.7} spin={false}>
              {logo ? <img src={logo} alt="" crossOrigin="anonymous" /> : null}
            </Sceau>
            {organisation && <p className="envol-carton-org">{organisation}</p>}
          </div>
          {intro && <p className="envol-carton-intro">{intro}</p>}
          <div>
            <p className="envol-carton-title">{title}</p>
            {year && <p className="envol-carton-year">{year}</p>}
            <svg className="envol-carton-orn" viewBox="0 0 160 12" aria-hidden="true">
              <path d="M0 6H68M92 6H160" stroke="#C49A3C" />
              <path d="M80 1l5 5-5 5-5-5z" fill="#C49A3C" />
            </svg>
          </div>
          <div>
            {when && <p className="envol-carton-when">{when}</p>}
            {venue && <p className="envol-carton-muted">{venue}</p>}
          </div>
          <div>
            <p className="envol-carton-eyebrow">Invitation personnelle</p>
            <p className="envol-carton-name">{guest.name}</p>
          </div>
          <div className="envol-carton-bottom">
            <span className="qr">{qr && <img src={qr} alt="" />}</span>
            <p>
              <b>Présentez ce QR code à l’accueil.</b>
              {dress && (
                <>
                  <br />
                  Tenue : {dress}
                </>
              )}
              <br />
              {deadline ? `Merci de confirmer avant le ${deadline} sur ${url}` : `Confirmez votre présence sur ${url}`}
            </p>
          </div>
          <p className="envol-carton-muted envol-carton-made">Créé avec TBF Moment · Imprimé par TBF DIGITAL</p>
        </div>
      </div>
    </div>
  )
}
