const PAGES = [
  { label: 'Vue globale', to: '/dashboard' },
  { label: 'Mes événements', to: '/dashboard/evenements' },
  { label: 'Invitations', to: '/dashboard/invitations' },
  { label: 'Messages aux invités', to: '/dashboard/communication' },
  { label: 'Participants', to: '/dashboard/participants' },
  { label: 'Billetterie', to: '/dashboard/billetterie' },
  { label: 'Check-in', to: '/dashboard/checkin' },
  { label: 'Galerie', to: '/dashboard/galerie' },
  { label: "Livre d'or", to: '/dashboard/livre-dor' },
  { label: 'Programme', to: '/dashboard/programme' },
  { label: 'Plan de table', to: '/dashboard/plan-de-table' },
  { label: 'Liste de cadeaux', to: '/dashboard/liste-mariage' },
  { label: 'Conférence', to: '/dashboard/conference' },
  { label: 'Statistiques', to: '/dashboard/statistiques' },
  { label: 'Paramètres', to: '/dashboard/parametres' },
]

export function buildDashboardSearchIndex(events = [], guests = []) {
  return [
    ...PAGES.map((page) => ({
      type: 'Page',
      label: page.label,
      to: page.to,
    })),
    ...events.map((event) => ({
      type: 'Événement',
      label: event.name,
      sublabel: event.eventDate ?? undefined,
      to: '/dashboard/evenements',
    })),
    ...guests.map((guest) => ({
      type: 'Invité',
      label: guest.fullName,
      sublabel: guest.email,
      to: '/dashboard/participants',
    })),
  ]
}
