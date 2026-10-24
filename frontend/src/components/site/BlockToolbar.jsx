import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

// Barre d'outils d'un bloc sélectionné dans le Builder (monter, descendre, supprimer).
// Partagée par le rendu classique (SitePage) et les modèles premium (ThemedSitePage).
export default function BlockToolbar({ block, index, count, editor }) {
  return (
    <div
      className="absolute top-3 right-3 left-3 z-10 flex items-center justify-between"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="rounded-full bg-violet-700 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
        {block}
      </span>
      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-md">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => editor.onReorderBlock(block, -1)}
          className="grid h-8 w-8 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-700"
          aria-label="Monter le bloc"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={index === count - 1}
          onClick={() => editor.onReorderBlock(block, 1)}
          className="grid h-8 w-8 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-700"
          aria-label="Descendre le bloc"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.onRemoveBlock(block)}
          className="grid h-8 w-8 place-items-center rounded-full text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-700"
          aria-label="Supprimer le bloc"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
