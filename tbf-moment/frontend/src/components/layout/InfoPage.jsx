import Footer from './Footer'
import Header from './Header'

export default function InfoPage({ title, children }) {
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
