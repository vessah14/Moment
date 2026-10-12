import Footer from './Footer'
import Header from './Header'
import { routeSeo } from '../../data/seoRoutes'
import { siteUrl, useSeo } from '../../utils/seo'

// Métadonnées SEO lues dans data/seoRoutes.js (source unique, reprise au build).
export default function InfoPage({ title, path, children }) {
  useSeo(routeSeo(path, siteUrl()))
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold text-ink">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
