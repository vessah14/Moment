import { internationalNumber } from './whatsapp'

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

const firstContactValue = (values) =>
  Array.isArray(values) ? String(values.find((value) => String(value ?? '').trim()) ?? '').trim() : ''

// Contacts du sélecteur natif → format attendu par l'import en lot.
export function contactRowsFromPicker(contacts, existingGuests = []) {
  const phones = new Set(existingGuests.map((guest) => internationalNumber(guest.phone)).filter(Boolean))
  const emails = new Set(existingGuests.map((guest) => String(guest.email ?? '').trim().toLowerCase()).filter(Boolean))
  const names = new Set(existingGuests.map((guest) => guest.fullName?.trim().toLowerCase().replace(/\s+/g, ' ')).filter(Boolean))
  const rows = []
  const previewRows = []
  let skipped = 0

  for (const contact of Array.isArray(contacts) ? contacts : []) {
    const fullName = firstContactValue(contact?.name).replace(/\s+/g, ' ').slice(0, 255)
    if (!fullName) {
      skipped++
      continue
    }

    const phone = internationalNumber(firstContactValue(contact?.tel)) ?? ''
    const email = firstContactValue(contact?.email).slice(0, 255)
    const emailKey = email.toLowerCase()
    const nameKey = fullName.toLowerCase()
    const duplicate =
      (phone && phones.has(phone)) ||
      (emailKey && emails.has(emailKey)) ||
      (!phone && !emailKey && names.has(nameKey))
    const row = { fullName, service: '', phone, email, duplicate: Boolean(duplicate) }
    previewRows.push(row)
    if (duplicate) {
      skipped++
      continue
    }

    rows.push({ fullName, service: '', phone, email })
    if (phone) phones.add(phone)
    if (emailKey) emails.add(emailKey)
    if (!phone && !emailKey) names.add(nameKey)
  }

  return { rows, skipped, previewRows }
}

const phoneInText = /(?:\+?237[\s().-]*|00237[\s().-]*)?[26](?:[\s().-]*\d){8}/
const emailInText = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const guestNameKey = (name) => String(name ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

// Une personne par ligne, depuis WhatsApp ou les notes. Les doublons sont signalés avant
// l'envoi ; les numéros seuls restent modifiables pour demander le nom manquant.
export function parsePastedGuestList(text, existingGuests = []) {
  const lines = String(text ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const phoneKeys = new Set(existingGuests.map((guest) => internationalNumber(guest.phone)).filter(Boolean))
  const emailKeys = new Set(existingGuests.map((guest) => String(guest.email ?? '').trim().toLowerCase()).filter(Boolean))
  const nameKeys = new Set(existingGuests.map((guest) => guestNameKey(guest.fullName)).filter(Boolean))
  const rows = lines.slice(0, MAX_IMPORT_ROWS).map((rawLine, index) => {
    const line = rawLine.replace(/^\s*(?:\d+\s*[.)-]|[-*•])\s*/, '')
    const phoneMatch = line.match(phoneInText)
    const emailMatch = line.match(emailInText)
    const phone = internationalNumber(phoneMatch?.[0]) ?? ''
    const email = emailMatch?.[0] ?? ''
    const fullName = line
      .replace(phoneMatch?.[0] ?? '', ' ')
      .replace(email, ' ')
      .replace(/[\s,;|:–—]+/g, ' ')
      .replace(/(^|\s)-(\s|$)/g, ' ')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 255)
    const phoneKey = internationalNumber(phone)
    const emailKey = email.trim().toLowerCase()
    const nameKey = guestNameKey(fullName)
    const duplicate =
      (phoneKey && phoneKeys.has(phoneKey)) ||
      (emailKey && emailKeys.has(emailKey)) ||
      (!phoneKey && !emailKey && nameKey && nameKeys.has(nameKey))

    if (!duplicate) {
      if (phoneKey) phoneKeys.add(phoneKey)
      if (emailKey) emailKeys.add(emailKey)
      if (!phoneKey && !emailKey && nameKey) nameKeys.add(nameKey)
    }

    return { fullName, phone, email, service: '', line: index + 1, duplicate: Boolean(duplicate) }
  })

  return { rows, truncated: lines.length > MAX_IMPORT_ROWS }
}

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
