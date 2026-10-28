// Modèle Envol — sceau guilloché et bande du pied de page (maquette envol.js), dessinés
// en SVG : rien à télécharger, net à toutes les tailles, aux couleurs passées en props.

// Courbe guillochée : rayon r0 + amp·sin(k·t), n points, centrée sur (100, 100).
export function guilloche(r0, amp, k, n) {
  let d = ''
  for (let i = 0; i < n; i++) {
    const t = (2 * Math.PI * i) / n
    const r = r0 + amp * Math.sin(k * t)
    d += `${i ? 'L' : 'M'}${(100 + r * Math.cos(t)).toFixed(1)} ${(100 + r * Math.sin(t)).toFixed(1)}`
  }
  return `${d}Z`
}

const WAVE = guilloche(78, 16, 12, 144)
const EDGE = guilloche(97, 2.2, 60, 180)
const ANGLES = [0, 5, 10, 15, 20, 25]

// Sceau : rosace à 12 lobes (6 ondes décalées de 5°), bord festonné et disque central qui
// reçoit le logo (children). bare : sans disque, pour un filigrane. spin : rotation lente
// (120 s), coupée par prefers-reduced-motion dans themes.css.
export default function Sceau({ children, stroke = '#D9B567', fill = '#F7F2E7', width = 0.55, spin = true, bare = false, className = '', style }) {
  return (
    <div className={`envol-seal ${className}`} style={style}>
      <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <g className={spin ? 'envol-spin' : undefined} fill="none" stroke={stroke} strokeWidth={width}>
          <path d={EDGE} strokeWidth={width + 0.35} />
          {ANGLES.map((a) => (
            <path key={a} d={WAVE} transform={`rotate(${a} 100 100)`} />
          ))}
        </g>
        {!bare && (
          <>
            <circle cx="100" cy="100" r="61" fill="none" stroke={stroke} />
            <circle cx="100" cy="100" r="57" fill={fill} />
          </>
        )}
      </svg>
      {!bare && children && <span className="envol-seal-logo">{children}</span>}
    </div>
  )
}

// Bande guillochée : quatre sinusoïdes décalées (période 36), répétées sur toute la largeur.
export function BandeGuillochee({ color = '#C49A3C', className = '' }) {
  const wave = (dx) => {
    let d = ''
    for (let x = -36; x <= 72; x += 3) d += `${x === -36 ? 'M' : 'L'}${x + dx} ${(11 + 7 * Math.sin((2 * Math.PI * x) / 36)).toFixed(1)}`
    return d
  }
  return (
    <svg className={`envol-band ${className}`} width="100%" height="22" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="envol-band" width="36" height="22" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth=".8">
            {[0, 9, 18, 27].map((dx) => (
              <path key={dx} d={wave(dx - 36)} />
            ))}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="22" fill="url(#envol-band)" />
    </svg>
  )
}
