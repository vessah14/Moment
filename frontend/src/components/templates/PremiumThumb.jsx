import { useEffect } from 'react'
import { loadThemeFonts } from '../site/themes/themeFonts'
import { getSiteTheme } from '../site/themes/themeDefs'
import { monogramOf, parseTitle } from '../site/themes/titleParts'
import './premiumThumbs.css'

// Miniature d'un modèle premium, reprise de la galerie des maquettes : l'ouverture du
// modèle (enveloppe, fleur, rideau, médaillon, cadeau, soleil Art déco) dessinée en CSS,
// ou une carte typographique pour les modèles des autres catégories.
// Remplit son parent (position absolue) et s'adapte à sa taille.
export default function PremiumThumb({ template }) {
  const theme = getSiteTheme(template?.theme)
  useEffect(() => loadThemeFonts(theme), [theme])
  if (!theme) return null

  const info = parseTitle(template.preview?.title ?? '', theme.hero)
  const mono = monogramOf(info)

  switch (theme.id) {
    case 'noor':
      return (
        <div className="pthumb pt-noor" aria-hidden="true">
          <span className="for">Vous êtes invité·e</span>
          <div className="env">
            <span className="seal">{mono}</span>
          </div>
        </div>
      )
    case 'bloom':
      return (
        <div className="pthumb pt-bloom" aria-hidden="true">
          <div className="fl">
            {Array.from({ length: 10 }, (_, k) => (
              <i key={k} style={{ '--k': k }} />
            ))}
            <b>{mono}</b>
          </div>
        </div>
      )
    case 'toghu':
      return (
        <div className="pthumb pt-toghu" aria-hidden="true">
          <div className="p l" />
          <div className="p r" />
          <span className="m">{mono.replace('&', '·')}</span>
        </div>
      )
    case 'ndop':
      return (
        <div className="pthumb pt-ndop" aria-hidden="true">
          <span className="ring" />
          <span className="m">{mono.replace('&', '·')}</span>
        </div>
      )
    case 'fiesta':
      return (
        <div className="pthumb pt-fiesta" aria-hidden="true">
          <i className="bal" style={{ left: '14%', top: '14%', background: '#F2387C', color: '#F2387C' }} />
          <i className="bal" style={{ right: '16%', top: '22%', background: '#FF7A3D', color: '#FF7A3D' }} />
          <i className="bal sm" style={{ right: '30%', top: '8%', background: '#6C4BF4', color: '#6C4BF4' }} />
          <i className="c" style={{ left: '30%', top: '58%', background: '#FFC93C', transform: 'rotate(30deg)' }} />
          <i className="c" style={{ left: '62%', top: '40%', background: '#2EC4A6', transform: 'rotate(-20deg)' }} />
          <i className="c" style={{ left: '22%', top: '78%', background: '#6C4BF4', transform: 'rotate(60deg)' }} />
          <div className="gift">
            <span className="box">
              <span className="rib" />
            </span>
            <span className="lid">
              <span className="rib" />
            </span>
          </div>
        </div>
      )
    case 'prestige':
      return (
        <div className="pthumb pt-prestige" aria-hidden="true">
          <span className="sun" />
          <b>{info.big ?? '50'}</b>
          <small>ANS</small>
        </div>
      )
    default: {
      // Autres catégories : carte typographique de la galerie (sous-titre, grand titre
      // dans la police du modèle, pastilles des trois couleurs).
      const p = template.preview ?? {}
      return (
        <div
          className="pthumb pt-type"
          aria-hidden="true"
          style={{ '--tb': p.bg, '--ti': p.ink, '--ta': p.accent, '--t2': p.accent2 ?? p.accent }}
        >
          <span className="sub">{p.eyebrow}</span>
          <b style={{ fontFamily: p.font }}>{p.title}</b>
          <span className="dots">
            <i />
            <i />
            <i />
          </span>
        </div>
      )
    }
  }
}
