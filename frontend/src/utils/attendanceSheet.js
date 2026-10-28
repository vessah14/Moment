// Présences du jour J : feuille d'émargement (PDF) et liste de présence (CSV, ouverte par
// Excel). Heures à Douala, comme sur place.
import { downloadCsv } from './csv'

const loadPdf = () => import('jspdf').then((m) => m.jsPDF)

export const arrivalTime = (iso) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : ''

// Invités attendus (hors refus), par ordre alphabétique : nom, service, arrivée, cocktail.
export function attendanceRows(guests) {
  return guests
    .filter((g) => g.status !== 'Absent' || g.checkedInAt)
    .slice()
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'fr'))
    .map((g) => ({
      name: g.fullName,
      service: g.side ?? '',
      arrival: arrivalTime(g.checkedInAt),
      cocktail: g.extra === true ? 'Oui' : g.extra === false ? 'Non' : '',
    }))
}

export function downloadAttendanceCsv(eventName, guests) {
  const rows = attendanceRows(guests)
  downloadCsv(
    `presences-${slugOf(eventName)}.csv`,
    ['Nom', 'Service', 'Arrivée', 'Cocktail'],
    rows.map((r) => [r.name, r.service, r.arrival || 'Pas encore arrivé', r.cocktail]),
  )
  return rows.length
}

const slugOf = (text) =>
  String(text ?? 'evenement')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'evenement'

// Feuille d'émargement A4 : une ligne par invité attendu, avec l'heure d'arrivée scannée
// et une case pour la signature.
export async function downloadAttendancePdf(eventName, guests) {
  const JsPdf = await loadPdf()
  const doc = new JsPdf({ unit: 'mm', format: 'a4' })
  const rows = attendanceRows(guests)
  const cols = [
    { title: 'Nom', x: 14, w: 64 },
    { title: 'Service', x: 78, w: 46 },
    { title: 'Arrivée', x: 124, w: 20 },
    { title: 'Signature', x: 144, w: 52 },
  ]
  let y = 0
  const header = () => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text("Feuille d'émargement", 14, 18)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(String(eventName ?? ''), 14, 25)
    doc.text(`${rows.length} invités attendus · ${rows.filter((r) => r.arrival).length} présents`, 196, 25, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    y = 34
    cols.forEach((c) => doc.text(c.title.toUpperCase(), c.x, y))
    doc.setLineWidth(0.3)
    doc.line(14, y + 2, 196, y + 2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    y += 9
  }
  header()
  for (const r of rows) {
    if (y > 282) {
      doc.addPage()
      header()
    }
    doc.text(doc.splitTextToSize(r.name, cols[0].w - 3)[0], cols[0].x, y)
    doc.text(doc.splitTextToSize(r.service, cols[1].w - 3)[0] ?? '', cols[1].x, y)
    doc.text(r.arrival || '—', cols[2].x, y)
    doc.setDrawColor(200)
    doc.line(14, y + 3, 196, y + 3)
    doc.setDrawColor(0)
    y += 9
  }
  doc.save(`emargement-${slugOf(eventName)}.pdf`)
  return rows.length
}
