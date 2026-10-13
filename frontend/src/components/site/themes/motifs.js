// Motifs d'arrière-plan des modèles premium : tuiles SVG générées avec les couleurs de
// la palette (a = couleur du motif, b = couleur secondaire), répétées en fond.

export const MOTIFS = {
  etoile: {
    label: 'Étoile',
    size: 80,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><g fill='none' stroke='${a}' stroke-width='1.2'><path d='M40 14 47 33 66 40 47 47 40 66 33 47 14 40 33 33Z'/><rect x='26' y='26' width='28' height='28'/><rect x='26' y='26' width='28' height='28' transform='rotate(45 40 40)'/><path d='M0 0 14 14M80 0 66 14M0 80 14 66M80 80 66 66'/><circle cx='0' cy='0' r='7'/><circle cx='80' cy='0' r='7'/><circle cx='0' cy='80' r='7'/><circle cx='80' cy='80' r='7'/></g><circle cx='40' cy='40' r='3' fill='${b}'/></svg>`,
  },
  toghu: {
    label: 'Toghu',
    size: 64,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='48'><path d='M0 24 8 14 16 24 24 14 32 24 40 14 48 24 56 14 64 24' fill='none' stroke='${a}' stroke-width='2'/><path d='M16 0 24 8 16 16 8 8Z M48 32 56 40 48 48 40 40Z' fill='${b}'/><path d='M48 1 55 8 48 15 41 8Z M16 33 23 40 16 47 9 40Z' fill='none' stroke='${a}' stroke-width='1.5'/><circle cx='32' cy='40' r='2' fill='${a}'/><circle cx='0' cy='8' r='2' fill='${a}'/><circle cx='64' cy='8' r='2' fill='${a}'/><circle cx='32' cy='8' r='2' fill='${b}'/></svg>`,
  },
  floral: {
    label: 'Floral',
    size: 90,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><g transform='translate(45 45)' fill='none' stroke='${a}' stroke-width='1.2'>${[0, 60, 120, 180, 240, 300]
        .map((r) => `<ellipse cx='0' cy='-13' rx='5.5' ry='11' transform='rotate(${r})'/>`)
        .join('')}</g><circle cx='45' cy='45' r='3.5' fill='${b}'/>${[
        [0, 0],
        [90, 0],
        [0, 90],
        [90, 90],
      ]
        .map(([x, y]) => `<circle cx='${x}' cy='${y}' r='3' fill='${b}'/>`)
        .join('')}<path d='M10 45h8M72 45h8M45 10v8M45 72v8' stroke='${a}' stroke-width='1.2'/></svg>`,
  },
  cercles: {
    label: 'Cercles',
    size: 60,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><g fill='none' stroke='${a}' stroke-width='1.1'>${[
        [0, 0],
        [60, 0],
        [0, 60],
        [60, 60],
        [30, 30],
      ]
        .map(([x, y]) => `<circle cx='${x}' cy='${y}' r='30'/>`)
        .join('')}</g><circle cx='30' cy='30' r='3' fill='${b}'/><circle cx='0' cy='0' r='3' fill='${b}'/><circle cx='60' cy='60' r='3' fill='${b}'/><circle cx='60' cy='0' r='3' fill='${b}'/><circle cx='0' cy='60' r='3' fill='${b}'/></svg>`,
  },
  pois: {
    label: 'Confettis',
    size: 70,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='70' height='70'><circle cx='12' cy='14' r='3.5' fill='${a}'/><rect x='40' y='8' width='11' height='4' rx='2' transform='rotate(30 45 10)' fill='${b}'/><circle cx='56' cy='46' r='2.5' fill='${b}'/><path d='M16 54l6-10 6 10z' fill='${a}'/><rect x='32' y='30' width='3' height='10' rx='1.5' transform='rotate(-25 33 35)' fill='${a}'/><circle cx='64' cy='22' r='1.8' fill='${a}'/><path d='M44 62c3-3 6 0 9-3' stroke='${b}' stroke-width='2' fill='none' stroke-linecap='round'/></svg>`,
  },
  ndop: {
    label: 'Ndop',
    size: 56,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><g fill='none' stroke='${a}' stroke-width='1.6'><rect x='6' y='6' width='44' height='44'/><path d='M6 6 50 50M50 6 6 50'/><circle cx='28' cy='28' r='7'/></g><circle cx='28' cy='28' r='2.5' fill='${b}'/><g fill='${a}'><circle cx='17' cy='28' r='1.6'/><circle cx='39' cy='28' r='1.6'/><circle cx='28' cy='17' r='1.6'/><circle cx='28' cy='39' r='1.6'/></g></svg>`,
  },
  deco: {
    label: 'Art déco',
    size: 80,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'><g fill='none' stroke='${a}' stroke-width='1.1'><path d='M0 40a40 40 0 0 1 80 0'/><path d='M12 40a28 28 0 0 1 56 0'/><path d='M24 40a16 16 0 0 1 32 0'/><path d='M40 24V4M40 40 27 13M40 40 53 13M40 40 17 25M40 40 63 25'/></g><circle cx='40' cy='40' r='3' fill='${b}'/></svg>`,
  },
  grille: {
    label: 'Grille',
    size: 28,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><circle cx='14' cy='14' r='1.5' fill='${a}'/><path d='M0 0h4M0 0v4' stroke='${b}' stroke-width='1'/></svg>`,
  },
  rayons: {
    label: 'Rayons',
    size: 120,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><g stroke='${a}' stroke-width='1' fill='none'>${Array.from({ length: 12 }, (_, i) => {
        const t = (i * Math.PI) / 6
        return `<path d='M${(60 + Math.cos(t) * 14).toFixed(1)} ${(60 + Math.sin(t) * 14).toFixed(1)}L${(60 + Math.cos(t) * 40).toFixed(1)} ${(60 + Math.sin(t) * 40).toFixed(1)}'/>`
      }).join('')}<circle cx='60' cy='60' r='8'/></g><circle cx='60' cy='60' r='2.5' fill='${b}'/></svg>`,
  },
  vagues: {
    label: 'Vagues',
    size: 80,
    svg: (a, b) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='30'><path d='M0 15c10-10 30-10 40 0s30 10 40 0' fill='none' stroke='${a}' stroke-width='1.3'/><circle cx='20' cy='26' r='1.8' fill='${b}'/></svg>`,
  },
  aucun: { label: 'Uni', size: 0, svg: () => '' },
}

const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

// Style CSS (backgroundImage / backgroundSize) du motif `name` pour la palette donnée.
export function motifStyle(name, palette, scale = 1) {
  const motif = MOTIFS[name] ?? MOTIFS.aucun
  if (!motif.size) return { backgroundImage: 'none' }
  return {
    backgroundImage: svgUrl(motif.svg(palette.vars['--motif'], palette.vars['--accent-2'])),
    backgroundSize: `${motif.size * scale}px auto`,
  }
}
