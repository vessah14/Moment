import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

const MAX_ITEMS = 20

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple'

// Questions / réponses du bloc FAQ, rangées dans le contenu du bloc (content.items) et
// enregistrées avec la page (bouton Enregistrer du Builder).
export default function FaqEditor({ items = [], onChange }) {
  const update = (index, patch) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const move = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Questions fréquentes</span>
        <span className="text-xs text-faint">
          {items.length}/{MAX_ITEMS}
        </span>
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-faint">
          Aucune question pour l'instant. Ajoutez-en une ci-dessous.
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-border-soft bg-surface-2/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-faint">Question {index + 1}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded p-1 text-muted hover:bg-surface-2 disabled:opacity-30"
                aria-label="Monter la question"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                className="rounded p-1 text-muted hover:bg-surface-2 disabled:opacity-30"
                aria-label="Descendre la question"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="rounded p-1 text-danger hover:bg-danger/10"
                aria-label="Supprimer la question"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <input
            type="text"
            value={item.question ?? ''}
            maxLength={200}
            placeholder="Ex. : Y a-t-il un parking ?"
            onChange={(e) => update(index, { question: e.target.value })}
            className={inputClass}
          />
          <textarea
            rows={3}
            value={item.answer ?? ''}
            maxLength={1000}
            placeholder="Votre réponse…"
            onChange={(e) => update(index, { answer: e.target.value })}
            className={`${inputClass} resize-none`}
          />
        </div>
      ))}

      <button
        type="button"
        disabled={items.length >= MAX_ITEMS}
        onClick={() => onChange([...items, { question: '', answer: '' }])}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted transition hover:border-brand-purple hover:text-brand-purple disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
        Ajouter une question
      </button>
    </div>
  )
}
