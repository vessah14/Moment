// Export CSV sûr pour Excel / LibreOffice.
// - Chaque valeur est entre guillemets (une virgule ou un retour à la ligne ne décale rien).
// - Une valeur qui commence par = + - @ (ou tabulation / retour chariot) serait exécutée
//   comme une formule à l'ouverture du fichier (« injection CSV ») : on la préfixe d'une
//   apostrophe. Exception : les numéros de téléphone (+237…), qui restent intacts.
// - BOM UTF-8 en tête : Excel affiche correctement les accents.
export function csvCell(value) {
  const text = String(value ?? '')
  const isPhone = /^\+\d[\d\s]*$/.test(text)
  const safe = /^[=+\-@\t\r]/.test(text) && !isPhone ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

export function toCsv(header, rows) {
  return '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}

export function downloadCsv(filename, header, rows) {
  const blob = new Blob([toCsv(header, rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
