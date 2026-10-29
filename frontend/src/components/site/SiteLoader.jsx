// Chargement du site public : silhouette de la page (barre, en-tête, boutons) plutôt
// qu'un simple texte, pour que l'arrivée du vrai contenu ne fasse pas « sauter » l'écran.
const bone = 'rounded-full bg-surface-2 animate-pulse motion-reduce:animate-none'

export default function SiteLoader() {
  return (
    <main className="min-h-svh bg-bg" role="status" aria-label="Chargement de la page de l'événement">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
        <span className={`h-9 w-9 shrink-0 ${bone}`} />
        <span className={`h-4 w-40 ${bone}`} />
        <span className={`ml-auto hidden h-9 w-40 sm:block ${bone}`} />
      </div>
      <div className="flex min-h-[75svh] flex-col items-center justify-center gap-5 px-6">
        <span className={`h-3 w-24 ${bone}`} />
        <span className={`h-10 w-80 max-w-full rounded-2xl ${bone}`} />
        <span className={`h-4 w-56 max-w-full ${bone}`} />
        <div className="mt-4 flex gap-3">
          <span className={`h-12 w-44 ${bone}`} />
          <span className={`hidden h-12 w-32 sm:block ${bone}`} />
        </div>
      </div>
      <span className="sr-only">Chargement…</span>
    </main>
  )
}
