import { formatFcfa } from '../../utils/formatCurrency'

export default function CagnottePanel({ cagnotte, children }) {
  const percent = Math.min((cagnotte.raised / cagnotte.target) * 100, 100)

  return (
    <div className="rounded-2xl border border-border-soft bg-panel p-5">
      <h2 className="font-semibold text-ink">{cagnotte.label}</h2>
      <div className="mt-3 flex items-end justify-between">
        <span className="font-mono text-2xl font-bold text-ink">
          {formatFcfa(cagnotte.raised)}
        </span>
        <span className="text-xs text-faint">
          objectif {formatFcfa(cagnotte.target)}
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-border-soft">
        <div
          className="bg-brand-gradient h-full rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-faint">{Math.round(percent)}% de l'objectif</p>

      {cagnotte.contributions.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {cagnotte.contributions.map((c, index) => (
            <div
              key={`${c.name}-${index}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted">{c.name}</span>
              <span className="font-mono text-ink">{formatFcfa(c.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  )
}
