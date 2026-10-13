// Modèles premium des autres catégories (sport, concert, conférence, entreprise,
// baptême, religieux, scolaire, graduation, hommage, famille, soirée, personnalisé,
// autre), portés depuis les maquettes HTML comme Noor, Bloom, etc. Même structure que
// SITE_THEMES (voir themeDefs.js) avec quelques champs en plus :
//   introLabel      étiquette du billet (ouverture « ticket ») ou du badge (« badge »)
//   introButton     texte du bouton de l'ouverture « bougie »
//   countdownLabel  libellé du compte à rebours dans l'en-tête
//   joiner          séparateur affiché entre deux noms (« vs » pour un match)
//   portrait        médaillon d'initiales au-dessus du titre (hommage)
//   bigFor(date)    grand mot du héros « big » quand le titre ne contient pas d'âge
//
// Les cadres SVG sont générés une fois, sans aucune donnée utilisateur.

const f = (n) => n.toFixed(1)
const GF = 'https://fonts.googleapis.com/css2?'

const dayMonth = (d) => (d ? `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}` : '')
const year = (d) => (d ? String(d.getFullYear()) : '')

// ---------- Cadres dessinés autour du héros ----------
const arenaFrame =
  '<svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
  '<path class="draw" pathLength="1" d="M60 60H1140V540H60Z"/>' +
  '<path class="draw" pathLength="1" style="--fd:.4s" d="M600 60V540"/>' +
  '<circle class="draw" pathLength="1" style="--fd:.6s" cx="600" cy="300" r="90"/>' +
  '<path class="draw" pathLength="1" style="--fd:.8s" d="M60 180H220V420H60M1140 180H980V420H1140"/>' +
  '<path class="draw" pathLength="1" style="--fd:1s" d="M60 240H120V360H60M1140 240H1080V360H1140"/></svg>'

const graceFrame = (() => {
  let d = ''
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12
    const len = i % 2 ? 420 : 560
    d += `<path class="draw" pathLength="1" style="--fd:${(i * 0.05).toFixed(2)}s;opacity:${i % 2 ? 0.4 : 0.8}" d="M${(600 + Math.cos(a) * 150).toFixed(0)} ${(300 + Math.sin(a) * 150).toFixed(0)}L${(600 + Math.cos(a) * len).toFixed(0)} ${(300 + Math.sin(a) * len).toFixed(0)}"/>`
  }
  return `<svg viewBox="0 0 1200 600" aria-hidden="true">${d}<circle class="draw" pathLength="1" style="--fd:1.2s" cx="600" cy="300" r="130"/></svg>`
})()

const horizonFrame = (() => {
  let d = ''
  for (let i = 0; i < 7; i++) {
    const y = 60 + i * 34
    d += `<path class="draw" pathLength="1" style="--fd:${(i * 0.12).toFixed(2)}s;opacity:${(1 - i * 0.12).toFixed(2)}" d="M0 ${y} C300 ${y - 40 - i * 6} 900 ${y + 40 + i * 6} 1200 ${y}"/>`
  }
  return `<svg viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">${d}</svg>`
})()

const libreFrame = `<svg viewBox="0 0 500 500" aria-hidden="true">${[210, 170, 130, 90, 50]
  .map((r, i) => `<circle class="draw" pathLength="1" style="--fd:${(i * 0.2).toFixed(1)}s" cx="250" cy="250" r="${r}"/>`)
  .join('')}</svg>`

const liveFrame =
  '<svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMin slice" aria-hidden="true">' +
  '<path class="beam fillin" style="--fd:.3s" d="M120 0L170 0L560 700L260 700Z"/>' +
  '<path class="beam fillin" style="--fd:.5s" d="M1030 0L1080 0L940 700L640 700Z"/>' +
  '<path class="draw" pathLength="1" d="M145 0L410 700"/><path class="draw" pathLength="1" style="--fd:.2s" d="M1055 0L790 700"/>' +
  '<path class="draw" pathLength="1" style="--fd:.6s" d="M0 660H1200"/></svg>'

const nuageFrame = (() => {
  const big = 'M40 260a50 50 0 0 1 20-96 70 70 0 0 1 130-20 50 50 0 0 1 80 50 40 40 0 0 1-20 66z'
  const small = 'M760 120a40 40 0 0 1 16-76 56 56 0 0 1 104-16 40 40 0 0 1 64 40 32 32 0 0 1-16 52z'
  return (
    '<svg viewBox="0 0 1000 300" aria-hidden="true">' +
    `<path class="cloud fillin" style="--fd:.3s" d="${big}"/>` +
    `<path class="cloud fillin" style="--fd:.6s" d="${small}"/>` +
    `<path class="draw" pathLength="1" style="--fd:.2s" d="${big}"/>` +
    `<path class="draw" pathLength="1" style="--fd:.5s" d="${small}"/></svg>`
  )
})()

const racinesFrame = (() => {
  // Arbre : tronc, branches et feuilles
  let d = '<path class="draw" pathLength="1" d="M300 560C300 480 290 420 300 340"/>'
  const branches = [
    ['M300 420C250 380 200 370 150 330', 150, 330],
    ['M300 400C350 360 410 350 460 300', 460, 300],
    ['M300 350C260 300 230 250 210 190', 210, 190],
    ['M300 340C340 290 380 240 400 170', 400, 170],
    ['M300 340C300 260 300 200 300 110', 300, 110],
  ]
  branches.forEach(([p], i) => {
    d += `<path class="draw" pathLength="1" style="--fd:${(0.3 + i * 0.15).toFixed(2)}s" d="${p}"/>`
  })
  let k = 0
  branches.forEach(([, x, y]) => {
    for (let j = 0; j < 6; j++) {
      const a = j * 1.05 + k * 0.3
      const r = 24 + (j % 3) * 14
      d += `<path class="leaf draw" pathLength="1" style="--fd:${(1 + k * 0.04).toFixed(2)}s" transform="translate(${(x + Math.cos(a) * r).toFixed(0)} ${(y + Math.sin(a) * r).toFixed(0)}) rotate(${(a * 57).toFixed(0)})" d="M0 0C6 -9 20 -10 30 0C20 10 6 9 0 0Z"/>`
      k++
    }
  })
  d += '<path class="draw" pathLength="1" style="--fd:.2s" d="M300 560C260 580 220 585 180 590M300 560C340 580 380 585 420 590"/>'
  return `<svg viewBox="0 0 600 600" aria-hidden="true">${d}</svg>`
})()

const summitFrame = (() => {
  // Réseau de points reliés
  const pts = [[120, 120], [300, 60], [480, 150], [200, 300], [420, 330], [300, 470], [540, 420], [90, 450]]
  let d = ''
  ;[[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [3, 5], [4, 6], [5, 6], [3, 7], [7, 5], [1, 3]].forEach(([a, b], i) => {
    d += `<path class="draw" pathLength="1" style="--fd:${(i * 0.08).toFixed(2)}s" d="M${pts[a]}L${pts[b]}"/>`
  })
  pts.forEach(([x, y], i) => {
    d += `<circle class="draw" pathLength="1" style="--fd:${(0.8 + i * 0.08).toFixed(2)}s" cx="${x}" cy="${y}" r="${i % 3 ? 7 : 12}"/>`
  })
  return `<svg viewBox="0 0 600 520" aria-hidden="true">${d}</svg>`
})()

const togeFrame = (() => {
  // Couronne de laurier ouverte en haut
  const c = [400, 330]
  const R = 270
  let d = ''
  let k = 0
  const side = (dir) => {
    for (let a = Math.PI * 0.58; a < Math.PI * 1.32; a += 0.1) {
      const aa = dir > 0 ? a : Math.PI - a
      const x = c[0] + Math.cos(aa) * R
      const y = c[1] + Math.sin(aa) * R
      const deg = (aa * 180) / Math.PI + (dir > 0 ? -150 : -30)
      d += `<path class="leaf draw" pathLength="1" style="--fd:${(0.3 + k * 0.05).toFixed(2)}s" transform="translate(${f(x)} ${f(y)}) rotate(${deg.toFixed(0)})" d="M0 0C8 -10 24 -10 34 0C24 10 8 10 0 0Z"/>`
      k++
    }
  }
  side(1)
  side(-1)
  const p = (sx, a) => `${(c[0] + sx * Math.cos(Math.PI * a) * R).toFixed(0)} ${(c[1] + Math.sin(Math.PI * a) * R).toFixed(0)}`
  return (
    '<svg viewBox="0 0 800 640" aria-hidden="true">' +
    `<path class="draw" pathLength="1" d="M${p(1, 0.58)}A${R} ${R} 0 0 1 ${p(1, 1.32)}"/>` +
    `<path class="draw" pathLength="1" d="M${p(-1, 0.58)}A${R} ${R} 0 0 0 ${p(-1, 1.32)}"/>` +
    `${d}</svg>`
  )
})()

// ---------- Ornements sous les titres de section ----------
const svg24 = (sw, body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" aria-hidden="true">${body}</svg>`
const ORN = {
  ball: svg24(1.5, '<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/>'),
  cross: svg24(1.4, '<path d="M12 3v18M7 8h10"/>'),
  sunrise: svg24(1.5, '<path d="M2 16h20M5 16a7 7 0 0 1 14 0M12 5v2M5 8l1.5 1.5M19 8l-1.5 1.5"/>'),
  note: svg24(1.5, '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  candle: svg24(1.3, '<path d="M12 3c-2 3-2 5 0 7 2-2 2-4 0-7zM9 13h6v8H9z"/>'),
  cloud: svg24(1.5, '<path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9a4.5 4.5 0 0 1 0 9z"/>'),
  sprout: svg24(1.4, '<path d="M12 21v-8M12 13c-3 0-5-2-5-5 3 0 5 2 5 5zM12 11c3 0 5-2 5-5-3 0-5 2-5 5zM8 21h8"/>'),
  bars: svg24(1.5, '<path d="M4 18h16M6 18V9M10 18V5M14 18v-7M18 18v-4"/>'),
  cap: svg24(1.4, '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>'),
  sparkle:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
}

export const MORE_THEMES = {
  arena: {
    id: 'arena',
    name: 'Arena',
    fonts: `${GF}family=Bebas+Neue&family=Barlow:wght@400;500;600;700;800&display=swap`,
    intro: 'ticket',
    hero: 'split',
    particles: 'confetti',
    burst: 'confetti',
    music: 'pulse',
    motifs: ['grille', 'rayons', 'vagues', 'aucun'],
    ornament: ORN.ball,
    frame: arenaFrame,
    kicker: 'Compétition · Finale',
    introFor: 'Votre place pour le match',
    introLabel: 'Entrée · Tribune',
    countdownLabel: "Coup d'envoi dans",
    joiner: 'vs',
    palettes: [
      { id: 'nuit', label: 'Nuit de stade', dark: true,
        vars: { '--bg': '#0B1020', '--surface': '#131A30', '--surface-2': '#1B2440', '--fg': '#F2F5FF', '--muted': '#AAB4D0', '--accent': '#FFD23F', '--accent-2': '#E63946', '--on-accent': '#0B1020', '--line': '#2A3558', '--motif': '#FFFFFF', '--motif-opacity': '.07' },
        particleColors: ['#FFD23F', '#E63946', '#FFFFFF'] },
      { id: 'pelouse', label: 'Pelouse', dark: true,
        vars: { '--bg': '#0B2A1A', '--surface': '#113622', '--surface-2': '#17432B', '--fg': '#F1FAF3', '--muted': '#A8C9B3', '--accent': '#F5F5F5', '--accent-2': '#FFC93C', '--on-accent': '#0B2A1A', '--line': '#24573A', '--motif': '#FFFFFF', '--motif-opacity': '.08' },
        particleColors: ['#FFFFFF', '#FFC93C', '#7BD389'] },
      { id: 'jour', label: 'Jour de match', dark: false,
        vars: { '--bg': '#F4F6FA', '--surface': '#FFFFFF', '--surface-2': '#E5EAF2', '--fg': '#0F1730', '--muted': '#4B5675', '--accent': '#C1121F', '--accent-2': '#1D4ED8', '--on-accent': '#FFFFFF', '--line': '#D7DEEA', '--motif': '#1D4ED8', '--motif-opacity': '.1' },
        particleColors: ['#C1121F', '#1D4ED8', '#FFC93C'] },
    ],
  },
  atelier: {
    id: 'atelier',
    name: 'Atelier',
    fonts: `${GF}family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&display=swap`,
    intro: 'curtain',
    hero: 'big',
    particles: null,
    burst: 'confetti',
    music: 'lounge',
    motifs: ['aucun', 'grille', 'rayons', 'cercles'],
    ornament: ORN.sparkle,
    frame: '',
    kicker: 'Exposition',
    introFor: 'Vous êtes invité·e',
    countdownLabel: 'Ouverture dans',
    bigFor: (d) => ({ big: 'EXPO', label: year(d) }),
    palettes: [
      { id: 'galerie', label: 'Galerie blanche', dark: false,
        vars: { '--bg': '#F4F1EC', '--surface': '#FFFFFF', '--surface-2': '#E9E4DB', '--fg': '#161412', '--muted': '#5C5650', '--accent': '#C2410C', '--accent-2': '#1D4ED8', '--on-accent': '#FFFFFF', '--line': '#DDD6CA', '--motif': '#161412', '--motif-opacity': '.08' },
        particleColors: ['#C2410C', '#1D4ED8'] },
      { id: 'encre', label: 'Encre', dark: true,
        vars: { '--bg': '#111111', '--surface': '#1A1A1A', '--surface-2': '#232323', '--fg': '#F3EFE7', '--muted': '#ABA59A', '--accent': '#F97316', '--accent-2': '#60A5FA', '--on-accent': '#111111', '--line': '#333333', '--motif': '#F3EFE7', '--motif-opacity': '.07' },
        particleColors: ['#F97316', '#60A5FA'] },
      { id: 'ocre', label: 'Ocre', dark: false,
        vars: { '--bg': '#F3E9D8', '--surface': '#FBF5EA', '--surface-2': '#EADBC2', '--fg': '#2A1E12', '--muted': '#665643', '--accent': '#9A3412', '--accent-2': '#0F766E', '--on-accent': '#FFFFFF', '--line': '#DECBAA', '--motif': '#9A3412', '--motif-opacity': '.1' },
        particleColors: ['#9A3412', '#0F766E'] },
    ],
  },
  campus: {
    id: 'campus',
    name: 'Campus',
    fonts: `${GF}family=Lilita+One&family=Nunito+Sans:wght@400;600;700;800&display=swap`,
    intro: 'badge',
    hero: 'big',
    particles: 'confetti',
    burst: 'confetti',
    music: 'kalimba',
    motifs: ['pois', 'grille', 'vagues', 'aucun'],
    ornament: ORN.sparkle,
    frame: '',
    kicker: 'Journée culturelle',
    introFor: '',
    introLabel: 'Étudiant·e',
    countdownLabel: "Le campus s'anime dans",
    bigFor: (d) => (d ? { big: year(d), label: 'édition' } : null),
    palettes: [
      { id: 'ecole', label: "Couleurs d'école", dark: false,
        vars: { '--bg': '#FFF8EC', '--surface': '#FFFFFF', '--surface-2': '#FFEBCC', '--fg': '#1D1A33', '--muted': '#5A5470', '--accent': '#2F3DCC', '--accent-2': '#FF6B35', '--on-accent': '#FFFFFF', '--line': '#F2DFC0', '--motif': '#FF6B35', '--motif-opacity': '.14' },
        particleColors: ['#2F3DCC', '#FF6B35', '#FFC300', '#06D6A0'] },
      { id: 'tableau', label: 'Tableau noir', dark: true,
        vars: { '--bg': '#1B2B24', '--surface': '#223529', '--surface-2': '#2A4031', '--fg': '#F2F5EE', '--muted': '#B5C2B6', '--accent': '#FFD166', '--accent-2': '#EF476F', '--on-accent': '#1B2B24', '--line': '#355241', '--motif': '#F2F5EE', '--motif-opacity': '.08' },
        particleColors: ['#FFD166', '#EF476F', '#F2F5EE'] },
      { id: 'menthe', label: 'Menthe', dark: false,
        vars: { '--bg': '#F0FAF6', '--surface': '#FFFFFF', '--surface-2': '#DDF2E9', '--fg': '#10302A', '--muted': '#4B6A62', '--accent': '#0F8B6E', '--accent-2': '#7C3AED', '--on-accent': '#FFFFFF', '--line': '#CBE8DC', '--motif': '#0F8B6E', '--motif-opacity': '.12' },
        particleColors: ['#0F8B6E', '#7C3AED', '#FFC300'] },
    ],
  },
  grace: {
    id: 'grace',
    name: 'Grâce',
    fonts: `${GF}family=Great+Vibes&family=Cormorant+Garamond:wght@400;500;600&family=Lato:wght@400;700&display=swap`,
    intro: 'candle',
    hero: 'centered',
    particles: 'or',
    burst: 'etoiles',
    music: 'recueil',
    motifs: ['rayons', 'etoile', 'cercles', 'aucun'],
    ornament: ORN.cross,
    frame: graceFrame,
    kicker: "Action de grâce",
    introFor: '',
    introButton: 'Allumer une bougie et entrer',
    countdownLabel: 'La célébration dans',
    palettes: [
      { id: 'aube', label: 'Aube', dark: false,
        vars: { '--bg': '#FBF8F2', '--surface': '#FFFFFF', '--surface-2': '#F2EBDD', '--fg': '#2B2418', '--muted': '#6A5F4C', '--accent': '#9B7424', '--accent-2': '#5B7DB1', '--on-accent': '#FFFFFF', '--line': '#E8DDC8', '--motif': '#C9A45C', '--motif-opacity': '.16' },
        particleColors: ['#E8C77D', '#F6E3B4', '#FFFFFF'] },
      { id: 'cierge', label: 'Cierge', dark: true,
        vars: { '--bg': '#16120C', '--surface': '#211A11', '--surface-2': '#2B2316', '--fg': '#F7F0E1', '--muted': '#C2B59C', '--accent': '#E8C77D', '--accent-2': '#9DB7E0', '--on-accent': '#16120C', '--line': '#3A3020', '--motif': '#E8C77D', '--motif-opacity': '.1' },
        particleColors: ['#E8C77D', '#FFE6A8'] },
      { id: 'azur', label: 'Azur', dark: false,
        vars: { '--bg': '#F4F7FB', '--surface': '#FFFFFF', '--surface-2': '#E6EDF6', '--fg': '#14213B', '--muted': '#4E5C75', '--accent': '#2B5797', '--accent-2': '#B88A2E', '--on-accent': '#FFFFFF', '--line': '#D8E1EE', '--motif': '#7A9CCB', '--motif-opacity': '.16' },
        particleColors: ['#B9CDEB', '#E8C77D', '#FFFFFF'] },
    ],
  },
  horizon: {
    id: 'horizon',
    name: 'Horizon',
    fonts: `${GF}family=Syne:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap`,
    intro: 'iris',
    hero: 'centered',
    particles: 'or',
    burst: 'etoiles',
    music: 'lounge',
    motifs: ['vagues', 'grille', 'cercles', 'aucun'],
    ornament: ORN.sunrise,
    frame: horizonFrame,
    kicker: "Soirée d'entreprise",
    introFor: 'Invitation réservée aux collaborateurs',
    countdownLabel: 'La soirée commence dans',
    palettes: [
      { id: 'ocean', label: 'Océan', dark: true,
        vars: { '--bg': '#0A1628', '--surface': '#11213A', '--surface-2': '#172B4A', '--fg': '#EEF3FA', '--muted': '#A8B6CC', '--accent': '#4FB3FF', '--accent-2': '#F2B84B', '--on-accent': '#0A1628', '--line': '#24395E', '--motif': '#4FB3FF', '--motif-opacity': '.1' },
        particleColors: ['#4FB3FF', '#9AD7FF', '#F2B84B'] },
      { id: 'graphite', label: 'Graphite', dark: true,
        vars: { '--bg': '#121417', '--surface': '#1B1E23', '--surface-2': '#24282F', '--fg': '#F2F3F5', '--muted': '#ADB2BA', '--accent': '#E8C468', '--accent-2': '#7DD3FC', '--on-accent': '#121417', '--line': '#33383F', '--motif': '#E8C468', '--motif-opacity': '.1' },
        particleColors: ['#E8C468', '#FFFFFF'] },
      { id: 'lumiere', label: 'Lumière', dark: false,
        vars: { '--bg': '#F5F8FC', '--surface': '#FFFFFF', '--surface-2': '#E7EEF7', '--fg': '#0B1B33', '--muted': '#4C5B72', '--accent': '#0B5FD3', '--accent-2': '#E39B17', '--on-accent': '#FFFFFF', '--line': '#D6E1EF', '--motif': '#0B5FD3', '--motif-opacity': '.1' },
        particleColors: ['#0B5FD3', '#E39B17'] },
    ],
  },
  libre: {
    id: 'libre',
    name: 'Libre',
    fonts: `${GF}family=Archivo+Black&family=Archivo:wght@400;500;600;700&display=swap`,
    intro: 'iris',
    hero: 'split',
    particles: 'bulles',
    burst: 'confetti',
    music: 'kalimba',
    motifs: ['vagues', 'pois', 'grille', 'aucun'],
    ornament: ORN.sparkle,
    frame: libreFrame,
    kicker: 'Rendez-vous',
    introFor: 'On compte sur toi',
    countdownLabel: 'On commence dans',
    palettes: [
      { id: 'vert', label: 'Vert citoyen', dark: false,
        vars: { '--bg': '#F2F7F3', '--surface': '#FFFFFF', '--surface-2': '#E1EEE5', '--fg': '#13241B', '--muted': '#4C6155', '--accent': '#1F7A4D', '--accent-2': '#F2A541', '--on-accent': '#FFFFFF', '--line': '#D3E4D8', '--motif': '#1F7A4D', '--motif-opacity': '.12' },
        particleColors: ['#1F7A4D', '#8CCB9B', '#F2A541'] },
      { id: 'ocean', label: 'Océan', dark: false,
        vars: { '--bg': '#F1F6FA', '--surface': '#FFFFFF', '--surface-2': '#E0EBF4', '--fg': '#0F1E2C', '--muted': '#4A5E70', '--accent': '#0E6BA8', '--accent-2': '#F25F5C', '--on-accent': '#FFFFFF', '--line': '#D2E0EC', '--motif': '#0E6BA8', '--motif-opacity': '.12' },
        particleColors: ['#0E6BA8', '#7CC6FE', '#F25F5C'] },
      { id: 'nuit', label: 'Nuit', dark: true,
        vars: { '--bg': '#0F1714', '--surface': '#16221D', '--surface-2': '#1D2C26', '--fg': '#EEF5F0', '--muted': '#A9BAB0', '--accent': '#5DD39E', '--accent-2': '#F2A541', '--on-accent': '#0F1714', '--line': '#2A3D35', '--motif': '#5DD39E', '--motif-opacity': '.1' },
        particleColors: ['#5DD39E', '#F2A541'] },
    ],
  },
  live: {
    id: 'live',
    name: 'Live',
    fonts: `${GF}family=Big+Shoulders+Display:wght@700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap`,
    intro: 'ticket',
    hero: 'big',
    particles: 'etoiles',
    burst: 'etoiles',
    music: 'pulse',
    motifs: ['cercles', 'rayons', 'grille', 'aucun'],
    ornament: ORN.note,
    frame: liveFrame,
    kicker: 'Concert',
    introFor: 'Votre billet vous attend',
    introLabel: 'Concert · Entrée',
    countdownLabel: 'Le show commence dans',
    bigFor: (d) => ({ big: 'LIVE', label: dayMonth(d) }),
    palettes: [
      { id: 'scene', label: 'Scène', dark: true,
        vars: { '--bg': '#09060F', '--surface': '#140E20', '--surface-2': '#1D1530', '--fg': '#FBF7FF', '--muted': '#B9AFCF', '--accent': '#FF3D7F', '--accent-2': '#2EE6D6', '--on-accent': '#09060F', '--line': '#2E2448', '--motif': '#FF3D7F', '--motif-opacity': '.1' },
        particleColors: ['#FF3D7F', '#2EE6D6', '#FFFFFF'] },
      { id: 'ambre', label: 'Ambre', dark: true,
        vars: { '--bg': '#0F0A05', '--surface': '#1C140B', '--surface-2': '#271C10', '--fg': '#FFF6EA', '--muted': '#C9B79C', '--accent': '#FFB703', '--accent-2': '#FB5607', '--on-accent': '#0F0A05', '--line': '#3A2B18', '--motif': '#FFB703', '--motif-opacity': '.1' },
        particleColors: ['#FFB703', '#FB5607', '#FFF6EA'] },
      { id: 'glace', label: 'Glace', dark: true,
        vars: { '--bg': '#050B14', '--surface': '#0C1626', '--surface-2': '#132036', '--fg': '#EEF6FF', '--muted': '#A7B8D0', '--accent': '#5EB8FF', '--accent-2': '#C084FC', '--on-accent': '#050B14', '--line': '#22324E', '--motif': '#5EB8FF', '--motif-opacity': '.1' },
        particleColors: ['#5EB8FF', '#C084FC', '#FFFFFF'] },
    ],
  },
  memoire: {
    id: 'memoire',
    name: 'Mémoire',
    fonts: `${GF}family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Source+Sans+3:wght@400;600;700&display=swap`,
    intro: 'candle',
    hero: 'centered',
    particles: 'braises',
    burst: 'none',
    music: 'recueil',
    motifs: ['aucun', 'cercles', 'vagues', 'rayons'],
    ornament: ORN.candle,
    frame: '',
    kicker: 'En mémoire de',
    introFor: '',
    introButton: 'Allumer une bougie',
    countdownLabel: 'La cérémonie aura lieu dans',
    portrait: true,
    palettes: [
      { id: 'ardoise', label: 'Ardoise', dark: true,
        vars: { '--bg': '#1C1D20', '--surface': '#24262A', '--surface-2': '#2D2F34', '--fg': '#ECE8E1', '--muted': '#AFAAA1', '--accent': '#D9C9A3', '--accent-2': '#9DB0C9', '--on-accent': '#1C1D20', '--line': '#3A3C42', '--motif': '#D9C9A3', '--motif-opacity': '.06' },
        particleColors: ['#F2C88B', '#D9C9A3'] },
      { id: 'ivoire', label: 'Ivoire', dark: false,
        vars: { '--bg': '#F6F3EE', '--surface': '#FFFFFF', '--surface-2': '#ECE7DF', '--fg': '#26231F', '--muted': '#625C53', '--accent': '#5E5240', '--accent-2': '#4D6A8A', '--on-accent': '#FFFFFF', '--line': '#DFD8CC', '--motif': '#8A7C66', '--motif-opacity': '.08' },
        particleColors: ['#C9A877', '#8A7C66'] },
      { id: 'violet', label: 'Violet de deuil', dark: true,
        vars: { '--bg': '#1E1A26', '--surface': '#262130', '--surface-2': '#2F2A3B', '--fg': '#EEEAF2', '--muted': '#B3ABC0', '--accent': '#C9B6E4', '--accent-2': '#D9C9A3', '--on-accent': '#1E1A26', '--line': '#3D3550', '--motif': '#C9B6E4', '--motif-opacity': '.06' },
        particleColors: ['#C9B6E4', '#F2C88B'] },
    ],
  },
  nuage: {
    id: 'nuage',
    name: 'Nuage',
    fonts: `${GF}family=Sacramento&family=Quicksand:wght@400;500;600;700&display=swap`,
    intro: 'envelope',
    hero: 'centered',
    particles: 'bulles',
    burst: 'coeurs',
    music: 'harpe',
    motifs: ['cercles', 'pois', 'floral', 'aucun'],
    ornament: ORN.cloud,
    frame: nuageFrame,
    kicker: 'Baptême',
    introFor: 'Une petite invitation pour vous',
    countdownLabel: 'La fête dans',
    palettes: [
      { id: 'ciel', label: 'Bleu ciel', dark: false,
        vars: { '--bg': '#F3F7FB', '--surface': '#FFFFFF', '--surface-2': '#E3EDF7', '--fg': '#24334A', '--muted': '#5A6880', '--accent': '#4A7FB5', '--accent-2': '#E3B7A0', '--on-accent': '#FFFFFF', '--line': '#D6E2EF', '--motif': '#8DB4DA', '--motif-opacity': '.22' },
        particleColors: ['#A9CBEA', '#F3D9CB', '#FFFFFF'] },
      { id: 'rose', label: 'Rose dragée', dark: false,
        vars: { '--bg': '#FCF4F4', '--surface': '#FFFFFF', '--surface-2': '#F6E3E3', '--fg': '#3D2A30', '--muted': '#6F5A60', '--accent': '#C0607A', '--accent-2': '#8FB3CF', '--on-accent': '#FFFFFF', '--line': '#EED8D8', '--motif': '#E5A8B6', '--motif-opacity': '.22' },
        particleColors: ['#F2C4CE', '#CDE0EE', '#FFFFFF'] },
      { id: 'sable', label: 'Sable', dark: false,
        vars: { '--bg': '#F8F4EC', '--surface': '#FFFFFF', '--surface-2': '#EFE6D6', '--fg': '#33302A', '--muted': '#665F52', '--accent': '#8A6D3B', '--accent-2': '#7FA7C2', '--on-accent': '#FFFFFF', '--line': '#E5DACA', '--motif': '#C9B48E', '--motif-opacity': '.2' },
        particleColors: ['#E5D3B3', '#BFD6E6', '#FFFFFF'] },
    ],
  },
  racines: {
    id: 'racines',
    name: 'Racines',
    fonts: `${GF}family=Lora:ital,wght@0,500;0,600;1,500&family=Caveat:wght@600&family=Work+Sans:wght@400;500;600;700&display=swap`,
    intro: 'curtain',
    hero: 'split',
    particles: 'petales',
    burst: 'confetti',
    music: 'balafon',
    motifs: ['vagues', 'cercles', 'ndop', 'aucun'],
    ornament: ORN.sprout,
    frame: racinesFrame,
    kicker: 'Grandes retrouvailles',
    introFor: "La famille t'attend",
    countdownLabel: 'On se retrouve dans',
    palettes: [
      { id: 'terre', label: 'Terre cuite', dark: false,
        vars: { '--bg': '#F7F1E8', '--surface': '#FFFFFF', '--surface-2': '#EFE4D3', '--fg': '#2C2117', '--muted': '#685A4A', '--accent': '#A4471F', '--accent-2': '#4F7A3A', '--on-accent': '#FFFFFF', '--line': '#E4D6C1', '--motif': '#A4471F', '--motif-opacity': '.12' },
        particleColors: ['#7FA35E', '#A4471F', '#D9B26A'] },
      { id: 'foret', label: 'Forêt', dark: true,
        vars: { '--bg': '#14201A', '--surface': '#1B2A22', '--surface-2': '#22352B', '--fg': '#F1EEE4', '--muted': '#B2B9AA', '--accent': '#D9B26A', '--accent-2': '#8FBF6B', '--on-accent': '#14201A', '--line': '#304538', '--motif': '#D9B26A', '--motif-opacity': '.1' },
        particleColors: ['#8FBF6B', '#D9B26A'] },
      { id: 'kente', label: 'Kente', dark: false,
        vars: { '--bg': '#FFF8E6', '--surface': '#FFFFFF', '--surface-2': '#FDEBC0', '--fg': '#231A0F', '--muted': '#6A5636', '--accent': '#B8860B', '--accent-2': '#1F6F43', '--on-accent': '#FFFFFF', '--line': '#F2DDAA', '--motif': '#B8860B', '--motif-opacity': '.14' },
        particleColors: ['#B8860B', '#1F6F43', '#C0392B'] },
    ],
  },
  summit: {
    id: 'summit',
    name: 'Summit',
    fonts: `${GF}family=Sora:wght@400;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap`,
    intro: 'badge',
    hero: 'split',
    particles: null,
    burst: 'etoiles',
    music: null,
    motifs: ['grille', 'cercles', 'vagues', 'aucun'],
    ornament: ORN.bars,
    frame: summitFrame,
    kicker: 'Conférence',
    introFor: 'Votre badge est prêt',
    introLabel: 'Participant',
    countdownLabel: 'Ouverture des portes dans',
    palettes: [
      { id: 'clair', label: 'Clair', dark: false,
        vars: { '--bg': '#F6F7F9', '--surface': '#FFFFFF', '--surface-2': '#ECEFF4', '--fg': '#0E1726', '--muted': '#4A5568', '--accent': '#2346D6', '--accent-2': '#0EA5A0', '--on-accent': '#FFFFFF', '--line': '#DCE1EA', '--motif': '#2346D6', '--motif-opacity': '.12' },
        particleColors: ['#2346D6'] },
      { id: 'ardoise', label: 'Ardoise', dark: true,
        vars: { '--bg': '#0E1420', '--surface': '#151D2C', '--surface-2': '#1C2638', '--fg': '#EEF2F8', '--muted': '#A3AEC2', '--accent': '#6C8BFF', '--accent-2': '#2DD4BF', '--on-accent': '#0E1420', '--line': '#2A354B', '--motif': '#6C8BFF', '--motif-opacity': '.12' },
        particleColors: ['#6C8BFF'] },
      { id: 'savane', label: 'Savane', dark: false,
        vars: { '--bg': '#FAF6EF', '--surface': '#FFFFFF', '--surface-2': '#F0E9DC', '--fg': '#1D1A14', '--muted': '#5E5649', '--accent': '#B5541C', '--accent-2': '#2F6B4F', '--on-accent': '#FFFFFF', '--line': '#E6DCCB', '--motif': '#B5541C', '--motif-opacity': '.1' },
        particleColors: ['#B5541C'] },
    ],
  },
  toge: {
    id: 'toge',
    name: 'Toge',
    fonts: `${GF}family=Cinzel:wght@400;600;700&family=Allura&family=Raleway:wght@400;500;600;700&display=swap`,
    intro: 'envelope',
    hero: 'centered',
    particles: 'or',
    burst: 'etoiles',
    music: 'harpe',
    motifs: ['etoile', 'rayons', 'cercles', 'aucun'],
    ornament: ORN.cap,
    frame: togeFrame,
    kicker: 'Remise des diplômes',
    introFor: 'Invitation à la cérémonie',
    countdownLabel: 'La cérémonie dans',
    palettes: [
      { id: 'academie', label: 'Académie', dark: true,
        vars: { '--bg': '#0E1B33', '--surface': '#152542', '--surface-2': '#1C2F52', '--fg': '#F5F1E6', '--muted': '#B5BCCB', '--accent': '#D6B35E', '--accent-2': '#E9D9A6', '--on-accent': '#0E1B33', '--line': '#2A3D63', '--motif': '#D6B35E', '--motif-opacity': '.1' },
        particleColors: ['#D6B35E', '#E9D9A6', '#FFFFFF'] },
      { id: 'pourpre', label: 'Pourpre', dark: true,
        vars: { '--bg': '#22101F', '--surface': '#2F1729', '--surface-2': '#3B1F34', '--fg': '#F8EEF3', '--muted': '#C7AFBD', '--accent': '#E0B860', '--accent-2': '#E9CFE0', '--on-accent': '#22101F', '--line': '#4D2B44', '--motif': '#E0B860', '--motif-opacity': '.1' },
        particleColors: ['#E0B860', '#F2D7E6'] },
      { id: 'parchemin', label: 'Parchemin', dark: false,
        vars: { '--bg': '#F7F2E6', '--surface': '#FFFDF7', '--surface-2': '#EEE5D0', '--fg': '#1B2238', '--muted': '#55596A', '--accent': '#1E3A6E', '--accent-2': '#A8802E', '--on-accent': '#FFFFFF', '--line': '#E2D7BE', '--motif': '#A8802E', '--motif-opacity': '.14' },
        particleColors: ['#A8802E', '#1E3A6E'] },
    ],
  },
  velvet: {
    id: 'velvet',
    name: 'Velvet',
    fonts: `${GF}family=Italiana&family=Montserrat:wght@400;500;600;700&display=swap`,
    intro: 'ticket',
    hero: 'big',
    particles: 'confetti',
    burst: 'confetti',
    music: 'pulse',
    motifs: ['deco', 'etoile', 'cercles', 'aucun'],
    ornament: ORN.sparkle,
    frame: '',
    kicker: 'Soirée privée',
    introFor: 'Invitation strictement personnelle',
    introLabel: 'Invitation privée',
    countdownLabel: 'La soirée commence dans',
    bigFor: (d) => (d ? { big: dayMonth(d), label: year(d) } : null),
    palettes: [
      { id: 'minuit', label: 'Minuit nacré', dark: true,
        vars: { '--bg': '#0B0B10', '--surface': '#15151D', '--surface-2': '#1E1E29', '--fg': '#FAF7F2', '--muted': '#B9B5C4', '--accent': '#F3E6D0', '--accent-2': '#C9A86A', '--on-accent': '#0B0B10', '--line': '#2C2C3A', '--motif': '#F3E6D0', '--motif-opacity': '.08' },
        particleColors: ['#FFFFFF', '#F3E6D0', '#C9A86A'] },
      { id: 'rosegold', label: 'Or rose', dark: true,
        vars: { '--bg': '#1A1013', '--surface': '#26181C', '--surface-2': '#321F25', '--fg': '#FBF1EF', '--muted': '#C9B2B1', '--accent': '#E8B4A0', '--accent-2': '#F6D7C6', '--on-accent': '#1A1013', '--line': '#45303A', '--motif': '#E8B4A0', '--motif-opacity': '.1' },
        particleColors: ['#E8B4A0', '#FFFFFF', '#F6D7C6'] },
      { id: 'blanc', label: 'Tout blanc', dark: false,
        vars: { '--bg': '#FBFAF7', '--surface': '#FFFFFF', '--surface-2': '#F0EDE6', '--fg': '#121214', '--muted': '#5C5A60', '--accent': '#121214', '--accent-2': '#B08D57', '--on-accent': '#FFFFFF', '--line': '#E4E0D8', '--motif': '#B08D57', '--motif-opacity': '.12' },
        particleColors: ['#D9D4CA', '#B08D57', '#121214'] },
    ],
  },
}
