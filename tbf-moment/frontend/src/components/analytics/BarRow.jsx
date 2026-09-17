export default function BarRow({ label, value, colorClass = 'bg-brand-purple' }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink">{label}</span>
        <span className="font-mono text-muted">{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-border-soft">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
