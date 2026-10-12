export function formatFcfa(amount) {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

// Montants enregistrés en centimes (champs *Cents côté serveur) : 990000 -> « 9 900 FCFA ».
export function formatCents(cents) {
  return formatFcfa(Math.round((cents ?? 0) / 100))
}
