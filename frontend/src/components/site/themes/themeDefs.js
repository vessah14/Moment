// Modèles « premium » du site public (Noor, Bloom, Toghu Royal, Ndop, Fiesta, Prestige,
// puis ceux des autres catégories dans moreThemes.js),
// portés depuis les maquettes HTML : chaque thème décrit son apparence (palettes,
// polices, ouverture, héros, particules, musique, cadre et ornement SVG). Les données
// affichées viennent toujours de l'événement réel, jamais de ces fichiers.
//
// Les cadres SVG sont des chaînes générées une fois, insérées telles quelles (aucune
// donnée utilisateur dedans).

import { MORE_THEMES } from './moreThemes'

const f = (n) => n.toFixed(1)

// ---------- Cadres dessinés autour du héros ----------
const noorFrame =
  '<svg viewBox="0 0 400 560" preserveAspectRatio="none" aria-hidden="true">' +
  '<path class="draw" pathLength="1" d="M30 560V250C30 130 120 62 200 18C280 62 370 130 370 250V560"/>' +
  '<path class="draw thin" pathLength="1" style="--fd:.5s" d="M48 560V256C48 146 130 82 200 42C270 82 352 146 352 256V560"/>' +
  '<path class="draw thin" pathLength="1" style="--fd:.9s" d="M30 250H370"/>' +
  '</svg>'

const bloomFrame = (() => {
  // Couronne de feuillage : deux branches et des feuilles le long d'un cercle
  const c = [250, 250]
  const R = 205
  const pt = (a) => [c[0] + Math.cos(a) * R, c[1] + Math.sin(a) * R]
  const branch = (a0, a1) => {
    const [x0, y0] = pt(a0)
    const [x1, y1] = pt(a1)
    return `M${f(x0)} ${f(y0)} A${R} ${R} 0 0 ${a1 > a0 ? 1 : 0} ${f(x1)} ${f(y1)}`
  }
  let leaves = ''
  let k = 0
  for (let a = 2.0; a < 5.9; a += 0.22) {
    const [x, y] = pt(a)
    const deg = (a * 180) / Math.PI + (k % 2 ? 60 : -60) + 90
    leaves += `<path class="leaf draw" pathLength="1" style="--fd:${(0.4 + k * 0.07).toFixed(2)}s" transform="translate(${f(x)} ${f(y)}) rotate(${deg.toFixed(0)})" d="M0 0C6 -9 20 -10 30 0C20 10 6 9 0 0Z"/>`
    k++
  }
  const buds = [2.05, 3.6, 5.15, 5.85]
    .map((a, i) => {
      const [x, y] = pt(a)
      return `<circle class="bud fillin" style="--fd:${(1.8 + i * 0.2).toFixed(1)}s" cx="${f(x)}" cy="${f(y)}" r="${i % 2 ? 6 : 9}"/>`
    })
    .join('')
  const r2 = R - 14
  return (
    '<svg viewBox="0 0 500 500" aria-hidden="true">' +
    `<path class="draw" pathLength="1" d="${branch(1.95, 6.0)}"/>` +
    `<path class="draw" pathLength="1" style="--fd:.3s" d="M${f(c[0] + Math.cos(2.4) * r2)} ${f(c[1] + Math.sin(2.4) * r2)} A${r2} ${r2} 0 0 1 ${f(c[0] + Math.cos(4.2) * r2)} ${f(c[1] + Math.sin(4.2) * r2)}"/>` +
    leaves +
    buds +
    '</svg>'
  )
})()

const toghuFrame = (() => {
  const c = 200
  const ring = (r1, r2, n) =>
    Array.from({ length: n * 2 + 1 }, (_, i) => {
      const a = (i * Math.PI) / n
      const r = i % 2 ? r2 : r1
      return `${f(c + Math.cos(a) * r)} ${f(c + Math.sin(a) * r)}`
    }).join(' L')
  const tri = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6
    const p = (r, d = 0) => `${f(c + Math.cos(a + d) * r)} ${f(c + Math.sin(a + d) * r)}`
    return `<path class="draw" pathLength="1" style="--fd:${(1 + i * 0.08).toFixed(2)}s" d="M${p(96, -0.12)} L${p(120)} L${p(96, 0.12)}Z"/>`
  }).join('')
  return (
    '<svg viewBox="0 0 400 400" aria-hidden="true">' +
    '<circle class="draw" pathLength="1" cx="200" cy="200" r="196"/>' +
    '<circle class="draw" pathLength="1" style="--fd:.3s" cx="200" cy="200" r="182"/>' +
    `<path class="draw" pathLength="1" style="--fd:.6s" d="M${ring(170, 150, 36)}"/>` +
    '<circle class="draw" pathLength="1" style="--fd:.8s" cx="200" cy="200" r="136"/>' +
    tri +
    '<circle class="draw" pathLength="1" style="--fd:1.6s" cx="200" cy="200" r="60"/>' +
    `<path class="draw" pathLength="1" style="--fd:1.8s" d="M${ring(52, 30, 8)}"/>` +
    '</svg>'
  )
})()

const ndopFrame = (() => {
  // Losanges concentriques et croix, comme les panneaux d'un pagne Ndop
  let d = ''
  ;[250, 210, 170].forEach((r, i) => {
    d += `<path class="draw" pathLength="1" style="--fd:${(i * 0.25).toFixed(2)}s" d="M300 ${300 - r}L${300 + r} 300L300 ${300 + r}L${300 - r} 300Z"/>`
  })
  ;[
    [300, 30],
    [570, 300],
    [300, 570],
    [30, 300],
  ].forEach(([x, y], i) => {
    d += `<circle class="draw" pathLength="1" style="--fd:${(1 + i * 0.15).toFixed(2)}s" cx="${x}" cy="${y}" r="16"/><path class="draw" pathLength="1" style="--fd:${(1.2 + i * 0.15).toFixed(2)}s" d="M${x - 9} ${y}h18M${x} ${y - 9}v18"/>`
  })
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4
    const x = 300 + Math.cos(a) * 150
    const y = 300 + Math.sin(a) * 150
    d += `<path class="draw" pathLength="1" style="--fd:${(1.6 + i * 0.12).toFixed(2)}s" d="M${(x - 14).toFixed(0)} ${(y - 14).toFixed(0)}l28 28M${(x + 14).toFixed(0)} ${(y - 14).toFixed(0)}l-28 28"/>`
  }
  return `<svg viewBox="0 0 600 600" aria-hidden="true">${d}</svg>`
})()

const fiestaFrame = (() => {
  const P0 = [0, 18]
  const P1 = [600, 150]
  const P2 = [1200, 18]
  const B = (t, k) => (1 - t) * (1 - t) * P0[k] + 2 * (1 - t) * t * P1[k] + t * t * P2[k]
  const cols = ['var(--accent)', 'var(--accent-2)', '#F2387C', '#FFC93C', '#2EC4A6']
  let flags = ''
  for (let i = 1; i < 16; i++) {
    const t = i / 16
    const x = B(t, 0)
    const y = B(t, 1)
    flags += `<path class="fillin" style="--fd:${(0.5 + i * 0.07).toFixed(2)}s;fill:${cols[i % cols.length]}" d="M${f(x - 20)} ${f(y)} L${f(x + 20)} ${f(y)} L${f(x)} ${f(y + 48)}Z"/>`
  }
  return (
    '<svg viewBox="0 0 1200 220" aria-hidden="true">' +
    '<path class="draw" pathLength="1" style="stroke:var(--fg);opacity:.5" d="M0 18 Q600 150 1200 18"/>' +
    flags +
    '<path class="draw" pathLength="1" style="--fd:1s;stroke:var(--accent-2)" d="M40 0C70 50 10 80 50 130S30 190 70 220"/>' +
    '<path class="draw" pathLength="1" style="--fd:1.2s;stroke:var(--accent)" d="M1160 0C1130 50 1190 80 1150 130S1170 190 1130 220"/>' +
    '</svg>'
  )
})()

const prestigeFrame = (() => {
  // Soleil Art déco : rayons depuis le bas et gradins dans les coins
  let d = ''
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI + (i * Math.PI) / 18
    const x = 600 + Math.cos(a) * 760
    const y = 640 + Math.sin(a) * 760
    d += `<path class="draw" pathLength="1" style="--fd:${(i * 0.05).toFixed(2)}s;opacity:${i % 2 ? 0.35 : 0.7}" d="M600 640L${x.toFixed(0)} ${y.toFixed(0)}"/>`
  }
  ;[180, 240, 300].forEach((r, i) => {
    d += `<path class="draw" pathLength="1" style="--fd:${(1 + i * 0.2).toFixed(1)}s" d="M${600 - r} 640A${r} ${r} 0 0 1 ${600 + r} 640"/>`
  })
  d +=
    '<path class="draw" pathLength="1" style="--fd:1.4s" d="M0 120H60V80H100V40H140V0"/>' +
    '<path class="draw" pathLength="1" style="--fd:1.4s" d="M1200 120H1140V80H1100V40H1060V0"/>'
  return `<svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${d}</svg>`
})()

// ---------- Ornements sous les titres de section ----------
const ORN = {
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 2l2.5 6.5L21 9.5l-5 4.5 1.5 7L12 17l-5.5 4 1.5-7-5-4.5 6.5-1z"/></svg>',
  flower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 21V9"/><path d="M12 13c-4 0-6-3-6-6 3 0 6 2 6 6zM12 11c4 0 6-3 6-6-3 0-6 2-6 6z"/><circle cx="12" cy="6" r="2"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l5 9-5 9-5-9z" fill="currentColor"/><path d="M3 12h3M18 12h3" stroke="currentColor" stroke-width="1.5"/></svg>',
  ndop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="5" width="14" height="14" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="2.5"/></svg>',
  fan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2 18a10 10 0 0 1 20 0M6 18a6 6 0 0 1 12 0M12 18V6M12 18 6 10M12 18l6-8"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
}

const GF = 'https://fonts.googleapis.com/css2?'

export const SITE_THEMES = {
  noor: {
    id: 'noor',
    name: 'Noor',
    fonts: `${GF}family=Pinyon+Script&family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@400;500;600;700&display=swap`,
    intro: 'envelope',
    hero: 'centered',
    particles: 'or',
    burst: 'coeurs',
    music: 'harpe',
    motifs: ['etoile', 'cercles', 'floral', 'aucun'],
    ornament: ORN.star,
    frame: noorFrame,
    kicker: 'Ensemble, pour la vie',
    introFor: 'Vous êtes invité·e',
    palettes: [
      { id: 'emeraude', label: 'Émeraude & or', dark: true,
        vars: { '--bg': '#0C2620', '--surface': '#12332B', '--surface-2': '#1A4339', '--fg': '#F6F0E3', '--muted': '#B9C7BD', '--accent': '#D9B46A', '--accent-2': '#E9D3A0', '--on-accent': '#0C2620', '--line': '#2A5046', '--motif': '#D9B46A', '--motif-opacity': '.13' },
        particleColors: ['#E9C982', '#F6E2B0', '#C9A050'] },
      { id: 'ivoire', label: 'Ivoire & or', dark: false,
        vars: { '--bg': '#FAF6EE', '--surface': '#FFFFFF', '--surface-2': '#F1E9DA', '--fg': '#1F3A33', '--muted': '#5B6B63', '--accent': '#87631F', '--accent-2': '#1F5C4E', '--on-accent': '#FFFFFF', '--line': '#E4D7BF', '--motif': '#B8955A', '--motif-opacity': '.22' },
        particleColors: ['#C9A050', '#E2C78B', '#1F5C4E'] },
      { id: 'nuit', label: 'Nuit & rose', dark: true,
        vars: { '--bg': '#1A1424', '--surface': '#231B30', '--surface-2': '#2E2441', '--fg': '#F6EEF2', '--muted': '#C4B5C9', '--accent': '#E8B4B8', '--accent-2': '#D9B46A', '--on-accent': '#1A1424', '--line': '#3B2F4E', '--motif': '#E8B4B8', '--motif-opacity': '.12' },
        particleColors: ['#E8B4B8', '#F5D6D8', '#D9B46A'] },
    ],
  },
  bloom: {
    id: 'bloom',
    name: 'Bloom',
    fonts: `${GF}family=Parisienne&family=Bodoni+Moda:ital,wght@0,400;0,500;1,400&family=Karla:wght@400;500;600;700&display=swap`,
    intro: 'bloom',
    hero: 'split',
    particles: 'petales',
    burst: 'coeurs',
    music: 'harpe',
    motifs: ['floral', 'cercles', 'pois', 'aucun'],
    ornament: ORN.flower,
    frame: bloomFrame,
    kicker: 'Le printemps de notre amour',
    introFor: 'Une invitation fleurie pour vous',
    palettes: [
      { id: 'poudre', label: 'Rose poudré', dark: false,
        vars: { '--bg': '#FBF3EF', '--surface': '#FFFFFF', '--surface-2': '#F5E4DF', '--fg': '#3A2A2E', '--muted': '#6E5A5E', '--accent': '#B5616E', '--accent-2': '#6F8F76', '--on-accent': '#FFFFFF', '--line': '#EBD6D0', '--motif': '#C98B95', '--motif-opacity': '.2' },
        particleColors: ['#E8B4B8', '#F3CFD0', '#D9A3AA', '#B9CDB9'] },
      { id: 'sauge', label: 'Vert sauge', dark: false,
        vars: { '--bg': '#F2F4EE', '--surface': '#FFFFFF', '--surface-2': '#E3E9DE', '--fg': '#26332A', '--muted': '#56645A', '--accent': '#4E7258', '--accent-2': '#C27C86', '--on-accent': '#FFFFFF', '--line': '#D5DECF', '--motif': '#7C9A82', '--motif-opacity': '.2' },
        particleColors: ['#B9CDB9', '#E8B4B8', '#DDE7D6'] },
      { id: 'bordeaux', label: 'Soir bordeaux', dark: true,
        vars: { '--bg': '#2A1418', '--surface': '#371B21', '--surface-2': '#45232A', '--fg': '#F8ECEA', '--muted': '#D2B8B6', '--accent': '#E6A6AE', '--accent-2': '#A8C3A6', '--on-accent': '#2A1418', '--line': '#55303A', '--motif': '#E6A6AE', '--motif-opacity': '.12' },
        particleColors: ['#E6A6AE', '#F5CDD1', '#A8C3A6'] },
    ],
  },
  toghu: {
    id: 'toghu',
    name: 'Toghu Royal',
    fonts: `${GF}family=Yeseva+One&family=Mulish:wght@400;600;700;800&display=swap`,
    intro: 'curtain',
    hero: 'split',
    particles: 'etoiles',
    burst: 'etoiles',
    music: 'balafon',
    motifs: ['toghu', 'etoile', 'cercles', 'aucun'],
    ornament: ORN.diamond,
    frame: toghuFrame,
    kicker: 'Mariage coutumier · Dot',
    introFor: 'Les familles vous accueillent',
    palettes: [
      { id: 'velours', label: 'Velours noir', dark: true,
        vars: { '--bg': '#0E0C0C', '--surface': '#1A1615', '--surface-2': '#262020', '--fg': '#F4EDE1', '--muted': '#BBAE9E', '--accent': '#E9B526', '--accent-2': '#C8312B', '--on-accent': '#0E0C0C', '--line': '#3A302C', '--motif': '#E9B526', '--motif-opacity': '.12' },
        particleColors: ['#E9B526', '#C8312B', '#2E8B57', '#F4EDE1'] },
      { id: 'royal', label: 'Rouge royal', dark: true,
        vars: { '--bg': '#2A0B0B', '--surface': '#3A1212', '--surface-2': '#4A1818', '--fg': '#FBEFE3', '--muted': '#D9BFAF', '--accent': '#F2C14E', '--accent-2': '#2E8B57', '--on-accent': '#2A0B0B', '--line': '#5A2626', '--motif': '#F2C14E', '--motif-opacity': '.12' },
        particleColors: ['#F2C14E', '#FBEFE3', '#2E8B57'] },
      { id: 'lin', label: 'Lin clair', dark: false,
        vars: { '--bg': '#F6EFE4', '--surface': '#FFFFFF', '--surface-2': '#EDE2D1', '--fg': '#1A1312', '--muted': '#5C4F47', '--accent': '#A32620', '--accent-2': '#C98B0B', '--on-accent': '#FFFFFF', '--line': '#DFD0BA', '--motif': '#A32620', '--motif-opacity': '.1' },
        particleColors: ['#A32620', '#C98B0B', '#1F7A4A'] },
    ],
  },
  ndop: {
    id: 'ndop',
    name: 'Ndop',
    fonts: `${GF}family=Marcellus&family=Outfit:wght@400;500;600;700&display=swap`,
    intro: 'iris',
    hero: 'centered',
    particles: 'etoiles',
    burst: 'etoiles',
    music: 'balafon',
    motifs: ['ndop', 'toghu', 'cercles', 'aucun'],
    ornament: ORN.ndop,
    frame: ndopFrame,
    kicker: 'Mariage traditionnel · Dot',
    introFor: 'Les familles vous ouvrent leurs portes',
    palettes: [
      { id: 'indigo', label: 'Indigo', dark: true,
        vars: { '--bg': '#14213D', '--surface': '#1B2B4E', '--surface-2': '#23365F', '--fg': '#F3F1EA', '--muted': '#B6BFD3', '--accent': '#F3F1EA', '--accent-2': '#E0B04B', '--on-accent': '#14213D', '--line': '#34477A', '--motif': '#F3F1EA', '--motif-opacity': '.1' },
        particleColors: ['#F3F1EA', '#E0B04B', '#9FB3E0'] },
      { id: 'nuit', label: 'Nuit bleue', dark: true,
        vars: { '--bg': '#0B1226', '--surface': '#121C38', '--surface-2': '#1A2749', '--fg': '#EEF1F8', '--muted': '#A9B3CB', '--accent': '#E0B04B', '--accent-2': '#6E8BD6', '--on-accent': '#0B1226', '--line': '#26355F', '--motif': '#6E8BD6', '--motif-opacity': '.14' },
        particleColors: ['#E0B04B', '#EEF1F8', '#6E8BD6'] },
      { id: 'ecru', label: 'Écru', dark: false,
        vars: { '--bg': '#F4F0E6', '--surface': '#FFFFFF', '--surface-2': '#E9E2D2', '--fg': '#14213D', '--muted': '#4D5873', '--accent': '#1F3A7A', '--accent-2': '#B8862B', '--on-accent': '#FFFFFF', '--line': '#D9D0BC', '--motif': '#1F3A7A', '--motif-opacity': '.1' },
        particleColors: ['#1F3A7A', '#B8862B', '#6E8BD6'] },
    ],
  },
  fiesta: {
    id: 'fiesta',
    name: 'Fiesta',
    fonts: `${GF}family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap`,
    intro: 'gift',
    hero: 'big',
    particles: 'ballons',
    burst: 'confetti',
    music: 'kalimba',
    motifs: ['pois', 'cercles', 'floral', 'aucun'],
    ornament: ORN.sparkle,
    frame: fiestaFrame,
    kicker: 'On fait la fête',
    introFor: "Une surprise t'attend",
    palettes: [
      { id: 'pop', label: 'Pop', dark: false,
        vars: { '--bg': '#FFF6EE', '--surface': '#FFFFFF', '--surface-2': '#FFE9DA', '--fg': '#2A1640', '--muted': '#655478', '--accent': '#6C4BF4', '--accent-2': '#FF7A3D', '--on-accent': '#FFFFFF', '--line': '#F1DFF0', '--motif': '#F2387C', '--motif-opacity': '.16' },
        particleColors: ['#FF7A3D', '#F2387C', '#6C4BF4', '#FFC93C', '#2EC4A6'] },
      { id: 'neon', label: 'Néon nuit', dark: true,
        vars: { '--bg': '#120A2A', '--surface': '#1C1240', '--surface-2': '#271A55', '--fg': '#F7F2FF', '--muted': '#B9AEDB', '--accent': '#FF4FA3', '--accent-2': '#FFD23F', '--on-accent': '#120A2A', '--line': '#34266C', '--motif': '#7C5CFF', '--motif-opacity': '.22' },
        particleColors: ['#FF4FA3', '#FFD23F', '#3DF5D1', '#7C5CFF'] },
      { id: 'pastel', label: 'Pastel', dark: false,
        vars: { '--bg': '#F3F7FF', '--surface': '#FFFFFF', '--surface-2': '#E3ECFF', '--fg': '#1D2550', '--muted': '#525C86', '--accent': '#3B5BDB', '--accent-2': '#FF8FAB', '--on-accent': '#FFFFFF', '--line': '#D6E0FA', '--motif': '#FF8FAB', '--motif-opacity': '.2' },
        particleColors: ['#3B5BDB', '#FF8FAB', '#FFD166', '#63E6BE'] },
    ],
  },
  prestige: {
    id: 'prestige',
    name: 'Prestige',
    fonts: `${GF}family=Poiret+One&family=Josefin+Sans:wght@300;400;600;700&display=swap`,
    intro: 'curtain',
    hero: 'big',
    particles: 'or',
    burst: 'etoiles',
    music: 'lounge',
    motifs: ['deco', 'cercles', 'etoile', 'aucun'],
    ornament: ORN.fan,
    frame: prestigeFrame,
    kicker: 'Soirée de gala',
    introFor: 'Soirée sur invitation',
    palettes: [
      { id: 'onyx', label: 'Onyx & or', dark: true,
        vars: { '--bg': '#0D0D0F', '--surface': '#16161A', '--surface-2': '#202026', '--fg': '#F4ECD8', '--muted': '#B9AF98', '--accent': '#D4AF61', '--accent-2': '#F1DCA7', '--on-accent': '#0D0D0F', '--line': '#34322C', '--motif': '#D4AF61', '--motif-opacity': '.1' },
        particleColors: ['#D4AF61', '#F1DCA7', '#FFF4D6'] },
      { id: 'emeraude', label: 'Émeraude', dark: true,
        vars: { '--bg': '#071A16', '--surface': '#0D2621', '--surface-2': '#13322C', '--fg': '#F2EEDF', '--muted': '#A9BDB4', '--accent': '#D4AF61', '--accent-2': '#E8D29A', '--on-accent': '#071A16', '--line': '#1F433B', '--motif': '#D4AF61', '--motif-opacity': '.12' },
        particleColors: ['#D4AF61', '#E8D29A'] },
      { id: 'champagne', label: 'Champagne', dark: false,
        vars: { '--bg': '#F7F1E3', '--surface': '#FFFDF7', '--surface-2': '#EFE5CF', '--fg': '#1B1813', '--muted': '#5F574A', '--accent': '#8C6A22', '--accent-2': '#C2A15A', '--on-accent': '#FFFFFF', '--line': '#E2D5B8', '--motif': '#8C6A22', '--motif-opacity': '.12' },
        particleColors: ['#C2A15A', '#8C6A22', '#E8D29A'] },
    ],
  },
  ...MORE_THEMES,
}

export function getSiteTheme(id) {
  return id ? (SITE_THEMES[id] ?? null) : null
}

export function themePalette(theme, paletteId) {
  return theme.palettes.find((p) => p.id === paletteId) ?? theme.palettes[0]
}

export function themeMotif(theme, motifId) {
  return theme.motifs.includes(motifId) ? motifId : theme.motifs[0]
}
