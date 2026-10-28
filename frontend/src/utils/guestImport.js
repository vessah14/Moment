// Import d'une liste d'invités (Excel ou CSV) : colonnes nom, service, téléphone. Le
// fichier est lu dans le navigateur ; le serveur ignore les doublons et range chaque
// service dans un groupe d'invités.

export const MAX_IMPORT_ROWS = 2000

const plain = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const HEADERS = {
  fullName: ['nom', 'noms', 'nom complet', 'nom et prenom', 'nom et prenoms', 'prenom et nom', 'name', 'full name', 'invite', 'invites', 'participant'],
  service: ['service', 'services', 'filiere', 'departement', 'direction', 'groupe', 'department', 'classe', 'agence', 'unite'],
  phone: ['telephone', 'tel', 'phone', 'numero', 'numero de telephone', 'mobile', 'whatsapp', 'contact', 'portable'],
}

function columnsOf(row) {
  const cells = (row ?? []).map(plain)
  const find = (keys) => cells.findIndex((c) => keys.includes(c))
  const columns = { fullName: find(HEADERS.fullName), service: find(HEADERS.service), phone: find(HEADERS.phone) }
  return columns.fullName >= 0 ? columns : null
}

const cellText = (value) => (value === null || value === undefined ? '' : String(value).trim())

// Lignes du tableau → [{ fullName, service, phone }]. La ligne d'en-tête (cherchée dans
// les 5 premières) donne l'ordre des colonnes ; sans en-tête : nom, service, téléphone.
export function guestRowsFromSheet(rows) {
  const data = Array.isArray(rows) ? rows : []
  const headerIndex = data.slice(0, 5).findIndex((row) => columnsOf(row))
  const columns = headerIndex >= 0 ? columnsOf(data[headerIndex]) : { fullName: 0, service: 1, phone: 2 }
  const at = (row, i) => (i >= 0 ? cellText(row?.[i]) : '')
  return data
    .slice(headerIndex + 1)
    .map((row) => ({
      fullName: at(row, columns.fullName).replace(/\s+/g, ' ').slice(0, 255),
      service: at(row, columns.service).slice(0, 100),
      phone: at(row, columns.phone).slice(0, 40),
    }))
    .filter((row) => row.fullName)
    .slice(0, MAX_IMPORT_ROWS)
}

// CSV d'un tableur (séparateur « ; » ou « , », guillemets doublés).
export function parseCsv(text) {
  const source = String(text ?? '').replace(/^﻿/, '')
  const firstLine = source.split(/\r?\n/, 1)[0] ?? ''
  const separator = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < source.length; i++) {
    const c = source[i]
    if (quoted) {
      if (c === '"' && source[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"' && cell === '') quoted = true
    else if (c === separator) {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && source[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

// Lit le fichier choisi par l'organisateur (.xlsx ou .csv) et renvoie les lignes d'invités.
export async function readGuestFile(file) {
  if (/\.csv$/i.test(file.name) || file.type === 'text/csv') return guestRowsFromSheet(parseCsv(await file.text()))
  const { readSheet } = await import('read-excel-file/browser')
  return guestRowsFromSheet(await readSheet(file))
}

// Téléphone affiché dans l'espace organisateur : indicatif et deux derniers chiffres
// seulement (« 677 •• •• 56 »).
export function maskPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length < 6) return phone ? String(phone) : ''
  const national = digits.length > 9 ? digits.slice(-9) : digits
  return `${national.slice(0, 3)} •• •• ${national.slice(-2)}`
}
