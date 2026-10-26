// Billets téléchargés et imprimés : la carte affichée (TicketCard) est capturée telle quelle,
// puis mise en page (image pour WhatsApp, PDF de l'invité, planches A4 de l'organisateur).
// jsPDF et html-to-image ne sont chargés qu'au premier téléchargement.

const loadPdf = () => import('jspdf').then((m) => m.jsPDF)
const loadHtmlToImage = () => import('html-to-image').then((m) => m.toCanvas)

// Les polices standard du PDF ne connaissent que l'alphabet latin : on remplace les signes rares.
export const clean = (s) =>
  String(s ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[  ]/g, ' ')
    .replace(/[^\x00-\xFF]/g, '')

const rgb = (h) => {
  let x = String(h || '#6C4BF4').trim().replace('#', '')
  if (x.length === 3) x = x.split('').map((c) => c + c).join('')
  const n = parseInt(x.slice(0, 6), 16)
  return Number.isNaN(n) ? [108, 75, 244] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const fname = (s) =>
  clean(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'billets'

// ---------- Billet affiché → image et PDF « propres » ----------
// La carte affichée (TicketCard) est capturée telle quelle, puis posée au centre d'un fond aux
// couleurs du thème (format vertical 1080 × 1920, comme un statut WhatsApp), avec la consigne
// d'accueil en bas. Le PDF contient exactement la même image, sur une page aux mêmes proportions.
// Format du fichier : vertical 1080 × 1920 (carte, badge), paysage 1800 × 1100 (billet d'entrée).
const PORTRAIT = { w: 1080, h: 1920, mm: [90, 160] }
const LANDSCAPE = { w: 1800, h: 1100, mm: [180, 110] }
const CAPTION = { carte: 'Montrez cette carte', badge: 'Montrez ce badge', billet: 'Montrez ce billet' }

async function composeTicket(cardEl, { palette, deco, prefix }) {
  const toCanvas = await loadHtmlToImage()
  try {
    await document.fonts?.ready
  } catch {
    // police non chargée : la police de repli suffit
  }
  const v = palette?.vars ?? {}
  const shot = await toCanvas(cardEl, {
    pixelRatio: 3,
    cacheBust: true,
    filter: (node) => !(node instanceof Element && node.hasAttribute('data-print-hide')),
  })
  const size = shot.width > shot.height ? LANDSCAPE : PORTRAIT
  const OUT_W = size.w
  const OUT_H = size.h
  const out = document.createElement('canvas')
  out.width = OUT_W
  out.height = OUT_H
  out.dataset.mm = size.mm.join('x')
  const x = out.getContext('2d')
  // Fond : dégradé du thème et halo de la couleur de décor
  const bg = v['--bg'] || '#0F0B2E'
  const g = x.createLinearGradient(0, 0, 0, OUT_H)
  g.addColorStop(0, v['--surface'] || bg)
  g.addColorStop(1, bg)
  x.fillStyle = g
  x.fillRect(0, 0, OUT_W, OUT_H)
  const [r, gg, b] = rgb(deco || v['--accent'])
  const halo = x.createRadialGradient(OUT_W / 2, OUT_H * 0.38, 0, OUT_W / 2, OUT_H * 0.38, OUT_W * 0.85)
  halo.addColorStop(0, `rgba(${r},${gg},${b},.22)`)
  halo.addColorStop(1, `rgba(${r},${gg},${b},0)`)
  x.fillStyle = halo
  x.fillRect(0, 0, OUT_W, OUT_H)
  // Carte, centrée, avec une ombre douce
  const maxW = OUT_W - (shot.width > shot.height ? 240 : 260)
  const scale = Math.min(maxW / shot.width, (OUT_H - 300) / shot.height)
  const w = shot.width * scale
  const h = shot.height * scale
  const left = (OUT_W - w) / 2
  const top = (OUT_H - 150 - h) / 2 + 20
  x.save()
  x.shadowColor = 'rgba(0,0,0,.38)'
  x.shadowBlur = 70
  x.shadowOffsetY = 34
  x.drawImage(shot, left, top, w, h)
  x.restore()
  // Consigne en bas
  x.textAlign = 'center'
  x.fillStyle = v['--muted'] || 'rgba(255,255,255,.75)'
  x.font = '500 30px Inter, system-ui, sans-serif'
  x.fillText(`${CAPTION[prefix] || CAPTION.billet} à l'accueil · tbfmoment.com`, OUT_W / 2, OUT_H - 70)
  return out
}

// Nom du fichier : « carte-… », « billet-… » ou « badge-… » selon le format.
const fileBase = ({ title, guestName, prefix }) => `${prefix || 'billet'}-${fname(title || 'evenement')}-${fname(guestName || 'invite')}`

export async function deliverTicketImage(blob, options) {
  const filename = `${fileBase(options)}.png`
  const file = typeof File === 'undefined'
    ? null
    : new File([blob], filename, { type: 'image/png' })
  const shareData = file
    ? {
        files: [file],
        title: options.title || 'Billet événement',
        text: 'Conservez ce billet sur votre téléphone pour le présenter à l’accueil.',
      }
    : null

  if (shareData && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const supportsFileSharing =
        typeof navigator.canShare !== 'function' || navigator.canShare(shareData)
      if (supportsFileSharing) {
        await navigator.share(shareData)
        return 'shared'
      }
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled'
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = filename
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return 'downloaded'
}

export async function ticketImage(cardEl, options) {
  const canvas = await composeTicket(cardEl, options)
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error('Impossible de créer l’image du billet.'))
    }, 'image/png')
  })
  return deliverTicketImage(blob, options)
}

export async function buildTicketPdf(cardEl, options) {
  const [canvas, JsPDF] = await Promise.all([composeTicket(cardEl, options), loadPdf()])
  // Page aux proportions de l'image : le billet s'imprime sans bande ni déformation.
  const [w, h] = canvas.dataset.mm.split('x').map(Number)
  const doc = new JsPDF({ unit: 'mm', format: [w, h], orientation: w > h ? 'landscape' : 'portrait' })
  doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, w, h)
  return doc
}

export async function ticketPdf(cardEl, options) {
  const doc = await buildTicketPdf(cardEl, options)
  doc.save(`${fileBase(options)}.pdf`)
}

// ---------- Impression groupée par l'organisateur ----------
// Les cartes que reçoivent les invités (TicketCard), capturées une à une, posées sur des
// feuilles A4 avec traits de coupe. Cartes et badges (verticaux) : A4 paysage, 3 par feuille,
// ou 2 en grand format (un par moitié A5). Billets d'entrée (horizontaux) : A4 portrait,
// 3 par feuille, ou 2 en grand format.
export async function captureCard(cardEl) {
  const toCanvas = await loadHtmlToImage()
  try {
    await document.fonts?.ready
  } catch {
    // police non chargée : la police de repli suffit
  }
  // Fond blanc : les découpes transparentes (perforations, coins) restent blanches sur papier.
  return toCanvas(cardEl, {
    pixelRatio: 2.5,
    backgroundColor: '#ffffff',
    cacheBust: true,
    filter: (node) => !(node instanceof Element && node.hasAttribute('data-print-hide')),
  })
}

export function cardSheetLayout(tall, layout) {
  const per = layout === 'a5' ? 2 : 3
  return tall
    ? { orientation: 'landscape', pageW: 297, pageH: 210, cols: per, rows: 1, per }
    : { orientation: 'portrait', pageW: 210, pageH: 297, cols: 1, rows: per, per }
}

export async function buildCardSheetPdf(canvases, layout) {
  const JsPDF = await loadPdf()
  const tall = canvases[0].height > canvases[0].width
  const L = cardSheetLayout(tall, layout)
  const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: L.orientation })
  const cellW = L.pageW / L.cols
  const cellH = L.pageH / L.rows
  const margin = 7
  const cuts = () => {
    doc.setLineDashPattern([2, 2], 0)
    doc.setDrawColor(170)
    doc.setLineWidth(0.2)
    for (let c = 1; c < L.cols; c++) doc.line(c * cellW, 0, c * cellW, L.pageH)
    for (let r = 1; r < L.rows; r++) doc.line(0, r * cellH, L.pageW, r * cellH)
    doc.setLineDashPattern([], 0)
  }
  canvases.forEach((canvas, i) => {
    const slot = i % L.per
    if (i && slot === 0) {
      doc.addPage('a4', L.orientation)
    }
    if (slot === 0) cuts()
    const col = slot % L.cols
    const row = Math.floor(slot / L.cols)
    const scale = Math.min((cellW - margin * 2) / canvas.width, (cellH - margin * 2) / canvas.height)
    const w = canvas.width * scale
    const h = canvas.height * scale
    doc.addImage(canvas.toDataURL('image/jpeg', 0.93), 'JPEG', col * cellW + (cellW - w) / 2, row * cellH + (cellH - h) / 2, w, h)
  })
  return doc
}

export async function cardSheetPdf(canvases, layout, { title, prefix }) {
  const doc = await buildCardSheetPdf(canvases, layout)
  doc.save(`${prefix || 'billet'}s-${fname(title || 'evenement')}.pdf`)
}
