// Journal d'activité : la requête enregistrée (méthode + adresse) traduite en phrase,
// avec un lien vers la fiche concernée quand il y en a une.
const ID = '([0-9a-f-]{36})'
const RULES = [
  ['PATCH', `organizations/${ID}/status$`, 'Statut d’une organisation modifié (suspension / réactivation)', (id) => `/admin/organisations/${id}`],
  ['POST', `organizations/${ID}/plan/revoke$`, 'Organisation repassée en Free', (id) => `/admin/organisations/${id}`],
  ['POST', `organizations/${ID}/plan$`, 'Offre attribuée à une organisation', (id) => `/admin/organisations/${id}`],
  ['PATCH', `events/${ID}/suspension$`, 'Suspension d’un événement modifiée', null],
  ['POST', `moderation/guestbook/${ID}/resolve$`, 'Message du livre d’or modéré', null],
  ['POST', `moderation/gallery/${ID}/resolve$`, 'Photo modérée', null],
  ['POST', `upgrade-requests/${ID}/approve$`, 'Demande de changement d’offre approuvée', null],
  ['POST', `upgrade-requests/${ID}/reject$`, 'Demande de changement d’offre refusée', null],
  ['PATCH', `reviews/${ID}/status$`, 'Avis client modéré', null],
  ['POST', 'accounts$', 'Compte administrateur créé', null],
  ['PATCH', `accounts/${ID}/deactivate$`, 'Compte administrateur désactivé', null],
  ['DELETE', `accounts/${ID}/mfa$`, 'Double authentification d’un administrateur réinitialisée', null],
]

export function describeActivity(method, route) {
  const path = String(route ?? '').toLowerCase()
  for (const [verb, pattern, label, link] of RULES) {
    const match = verb === method && path.match(new RegExp(pattern))
    if (match) return { label, link: link ? link(match[1]) : null }
  }
  return { label: `${method} ${route}`, link: null }
}
