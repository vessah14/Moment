import { describe, expect, it } from 'vitest'
import { renderRouteHtml } from '../../seo.build.js'
import { HOME_FAQ } from '../data/homeFaq'
import { PUBLIC_ROUTES, routeSeo } from '../data/seoRoutes'
import { TEMPLATES } from '../data/templates'

const SITE = 'https://tbfmoment.com'
const INDEX = `<!doctype html><html lang="fr"><head>
    <title>TBF Moment — Créez le site de votre événement</title>
    <meta
      name="description"
      content="Par défaut"
    />
    <meta property="og:url" content="%VITE_SITE_URL%/" />
    <meta property="og:site_name" content="TBF Moment" />
    <link rel="canonical" href="%VITE_SITE_URL%/" />
    <script type="module" src="/assets/index.js"></script>
  </head><body><div id="root"></div></body></html>`

describe('routes publiques', () => {
  it('couvrent les pages publiques et toutes les démos de modèles premium', () => {
    const paths = PUBLIC_ROUTES.map((r) => r.path)
    expect(paths).toContain('/tarifs')
    for (const t of TEMPLATES.filter((t) => t.theme)) expect(paths).toContain(`/modeles/${t.theme}`)
    expect(new Set(paths).size).toBe(paths.length)
    for (const r of PUBLIC_ROUTES) expect(r.description, r.path).toBeTruthy()
  })

  it('publient la FAQ et les offres en données structurées', () => {
    const home = routeSeo('/', SITE).jsonLd
    const faq = home.find((ld) => ld['@type'] === 'FAQPage')
    expect(faq.mainEntity).toHaveLength(HOME_FAQ.length)
    const pricing = routeSeo('/tarifs', SITE).jsonLd.find((ld) => ld['@type'] === 'SoftwareApplication')
    expect(pricing.offers.map((o) => o.price)).toEqual(['0', '5000', '15000', '30000'])
  })
})

describe('renderRouteHtml', () => {
  it('remplace les balises par défaut par celles de la route', () => {
    const route = PUBLIC_ROUTES.find((r) => r.path === '/tarifs')
    const html = renderRouteHtml(INDEX, route, SITE)
    expect(html).toContain('<title>Tarifs · TBF Moment</title>')
    expect(html).toContain('<link rel="canonical" href="https://tbfmoment.com/tarifs" />')
    expect(html).toContain('<meta property="og:url" content="https://tbfmoment.com/tarifs" />')
    expect(html).not.toContain('Par défaut')
    expect(html).not.toContain('%VITE_SITE_URL%')
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html.match(/og:site_name/g)).toHaveLength(1)
    expect(html).toContain('id="seo-jsonld"')
    expect(html).toContain('<script type="module" src="/assets/index.js"></script>')
  })

  it('échappe le texte des balises', () => {
    const html = renderRouteHtml(INDEX, { path: '/x', title: 'A "B" <C>', description: 'D & E' }, SITE)
    expect(html).toContain('<title>A &quot;B&quot; &lt;C&gt; · TBF Moment</title>')
    expect(html).toContain('content="D &amp; E"')
  })
})
