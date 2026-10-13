// Opérateurs Mobile Money proposés pour la cagnotte, avec leur pastille (couleurs de marque).
export const MOBILE_MONEY_OPERATORS = {
  'Orange Money': { short: 'OM', bg: '#FF7900', fg: '#FFFFFF' },
  'MTN MoMo': { short: 'MoMo', bg: '#FFCB05', fg: '#1A1A1A' },
  Wave: { short: 'W', bg: '#1DC8F2', fg: '#062B36' },
  'Moov Money': { short: 'Moov', bg: '#0066B3', fg: '#FFFFFF' },
  Autre: { short: '€', bg: '#6C4BF4', fg: '#FFFFFF' },
}

export const operatorStyle = (operator) => MOBILE_MONEY_OPERATORS[operator] ?? MOBILE_MONEY_OPERATORS.Autre

// Comptes affichables : un numéro est indispensable (le reste est facultatif).
export const usableAccounts = (accounts) =>
  (Array.isArray(accounts) ? accounts : []).filter((a) => (a?.number ?? '').replace(/\D/g, '').length >= 6)

export const usableColors = (colors) =>
  (Array.isArray(colors) ? colors : []).filter((c) => /^#[0-9a-fA-F]{6}$/.test(c?.hex ?? ''))

// Lien d'invitation personnel (/e/slug?invite=<id de l'invité>) : un identifiant GUID.
export const isInviteCode = (value) =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
