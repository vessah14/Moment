import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

// Barre d'outils d'un bloc sélectionné dans le Builder (monter, descendre, supprimer).
// Partagée par le rendu classique (SitePage) et les modèles premium (ThemedSitePage).
export default function BlockToolbar({ block, index, count, editor }) {
  return (
    <div
      className="absolute top-3 right-3 left-3 z-10 flex items-center justify-between"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="rounded-full bg-[color:var(--color-brand-purple)] px-2.5 py-1 text-[11px] font-semibold text-white">
        {block}
      </span>
      <div className="flex items-center gap-1 rounded-full border border-border-soft bg-bg p-1 shadow-sm">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => editor.onReorderBlock(block, -1)}
          className="rounded-full p-1 text-muted hover:bg-surface-2 disabled:opacity-30"
          aria-label="Monter le bloc"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={index === count - 1}
          onClick={() => editor.onReorderBlock(block, 1)}
          className="rounded-full p-1 text-muted hover:bg-surface-2 disabled:opacity-30"
          aria-label="Descendre le bloc"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.onRemoveBlock(block)}
          className="rounded-full p-1 text-danger hover:bg-danger/10"
          aria-label="Supprimer le bloc"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
