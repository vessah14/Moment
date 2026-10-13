// Pages publiques du site : métadonnées SEO, place dans le sitemap et données structurées.
// Source unique pour les pages (useSeo, dans le navigateur) et pour le build
// (vite.config.js : sitemap.xml et une page HTML par route, lisible sans JavaScript).
// Importé par Node au build : pas de JSX, pas d'import.meta.env, imports avec extension.
import { HOME_FAQ } from './homeFaq.js'
import { TEMPLATES } from './templates.js'

// ---------- Données structurées (schema.org) ----------
export function organizationLd(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TBF Moment',
    url: site,
    logo: `${site}/favicon.png`,
    slogan: 'Create. Connect. Celebrate.',
    email: 'contact@tbfmoment.com',
  }
}

export function websiteLd(site) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'TBF Moment', url: site, inLanguage: 'fr-FR' }
}

export function faqLd(questions = HOME_FAQ) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
}

// Offres de la page Tarifs (prix mensuels en FCFA), identiques aux offres en base.
export const PRICE_OFFERS = [
  { name: 'Free', price: 0 },
  { name: 'Premium', price: 9900 },
  { name: 'Business', price: 24900 },
  { name: 'Event Pro', price: 49900 },
]

export function pricingLd(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TBF Moment',
    url: site,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: "Création de sites d'événement : invitations, confirmations de présence, programme, billetterie et livre d'or.",
    offers: PRICE_OFFERS.map((o) => ({
      '@type': 'Offer',
      name: o.name,
      price: String(o.price),
      priceCurrency: 'XAF',
      url: `${site}/tarifs`,
    })),
  }
}

function breadcrumbLd(site, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${site}${path}` })),
  }
}

// ---------- Pages ----------
// jsonLd(site) : données structurées de la page (facultatif).
export const STATIC_ROUTES = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'weekly',
    description:
      "Créez en quelques minutes le site de votre événement (mariage, anniversaire, conférence, concert…) : invitations, confirmations de présence, programme, billetterie et livre d'or.",
    jsonLd: (site) => [organizationLd(site), websiteLd(site), faqLd()],
  },
  {
    path: '/modeles',
    priority: '0.9',
    changefreq: 'weekly',
    title: "Modèles de sites d'événement",
    description: `${TEMPLATES.length} modèles prêts à publier pour votre mariage, anniversaire, baptême, conférence, concert… Personnalisez-les en quelques clics.`,
    jsonLd: (site) => breadcrumbLd(site, [['Accueil', '/'], ['Modèles', '/modeles']]),
  },
  {
    path: '/tarifs',
    priority: '0.8',
    changefreq: 'monthly',
    title: 'Tarifs',
    description:
      'Gratuit pour commencer, Premium pour aller plus loin : comparez les offres TBF Moment pour créer le site de votre événement.',
    jsonLd: (site) => [pricingLd(site), breadcrumbLd(site, [['Accueil', '/'], ['Tarifs', '/tarifs']])],
  },
  {
    path: '/ecosysteme',
    priority: '0.6',
    changefreq: 'monthly',
    title: "L'écosystème TBF",
    description: "Découvrez l'écosystème TBF : les services qui accompagnent l'organisation de vos événements.",
  },
  {
    path: '/support',
    priority: '0.5',
    changefreq: 'monthly',
    title: 'Support',
    description: "Besoin d'aide pour créer le site de votre événement ? Questions fréquentes et contact de l'équipe TBF Moment.",
  },
  {
    path: '/inscription',
    priority: '0.5',
    changefreq: 'yearly',
    title: 'Créer un compte',
    description: 'Créez gratuitement votre compte TBF Moment et publiez le site de votre événement en quelques minutes.',
  },
  {
    path: '/mentions-legales',
    priority: '0.2',
    changefreq: 'yearly',
    title: 'Mentions légales',
    description: 'Mentions légales de TBF Moment : éditeur, hébergement et contact.',
  },
  {
    path: '/cgu',
    priority: '0.2',
    changefreq: 'yearly',
    title: "Conditions générales d'utilisation",
    description: "Conditions générales d'utilisation de TBF Moment, la plateforme de création de sites d'événements.",
  },
  {
    path: '/confidentialite',
    priority: '0.2',
    changefreq: 'yearly',
    title: 'Politique de confidentialité',
    description: 'Comment TBF Moment collecte, utilise et protège vos données personnelles et celles de vos invités.',
  },
  {
    path: '/cookies',
    priority: '0.2',
    changefreq: 'yearly',
    title: 'Politique relative aux cookies',
    description: 'Les cookies utilisés par TBF Moment et la façon de gérer vos préférences.',
  },
]

// Démos des modèles premium (/modeles/<thème>) : de vraies pages, utiles pour la recherche
// « modèle site mariage », « invitation baptême en ligne »…
export function templateDemoRoute(template) {
  return {
    path: `/modeles/${template.theme}`,
    priority: '0.7',
    changefreq: 'monthly',
    title: `Modèle ${template.name} · ${template.subtitle ?? template.category}`,
    description: template.description,
    jsonLd: (site) =>
      breadcrumbLd(site, [
        ['Accueil', '/'],
        ['Modèles', '/modeles'],
        [template.name, `/modeles/${template.theme}`],
      ]),
  }
}

export const PUBLIC_ROUTES = [...STATIC_ROUTES, ...TEMPLATES.filter((t) => t.theme).map(templateDemoRoute)]

// Configuration useSeo d'une page publique, pour l'adresse du site donnée.
export function routeSeo(path, site) {
  const route = PUBLIC_ROUTES.find((r) => r.path === path)
  if (!route) return { path }
  return { title: route.title, description: route.description, path: route.path, jsonLd: route.jsonLd?.(site) ?? null }
}
