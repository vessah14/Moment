import { ORGANIZATIONS, PLATFORM_EVENTS } from './adminData'

const PAGES = [
  { label: 'Vue globale', to: '/admin' },
  { label: 'Organisations', to: '/admin/organisations' },
  { label: 'Événements', to: '/admin/evenements' },
  { label: 'Facturation', to: '/admin/facturation' },
  { label: 'Modération', to: '/admin/moderation' },
  { label: 'Paramètres système', to: '/admin/parametres' },
]

export function buildAdminSearchIndex() {
  return [
    ...PAGES.map((page) => ({ type: 'Page', label: page.label, to: page.to })),
    ...ORGANIZATIONS.map((org) => ({
      type: 'Organisation',
      label: org.name,
      sublabel: `${org.plan} · ${org.email}`,
      to: '/admin/organisations',
    })),
    ...PLATFORM_EVENTS.map((event) => ({
      type: 'Événement',
      label: event.name,
      sublabel: `${event.organization} · ${event.category}`,
      to: '/admin/evenements',
    })),
  ]
}
