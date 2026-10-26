export function eventRequiresAge(typeId) {
  return typeId === 'anniversaire' || typeId === 'noces'
}

export function displayNameFromTitle(title) {
  return String(title ?? '')
    .replace(/^Les\s+\d+\s+ans(?:\s+de mariage)?\s+de\s+/i, '')
    .trim()
}

export function formatEventDisplayTitle(typeId, age, display, fallback = '') {
  const name = String(display || fallback).trim()
  if (!name) return ''
  if (!eventRequiresAge(typeId) || !age) return name
  if (typeId === 'noces') return `Les ${age} ans de mariage de ${name}`
  return `Les ${age} ans de ${name}`
}
