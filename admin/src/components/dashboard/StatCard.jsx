const VALUE_STYLES = {
  default: 'text-ink',
  success: 'text-success',
  brand: 'text-brand-gradient',
}

export default function StatCard({ label, value, hint, hintColor, valueStyle = 'default' }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-5">
      <p className="text-xs font-semibold tracking-wider text-faint uppercase">
        {label}
      </p>
      <p className={`mt-3 font-mono text-3xl font-bold ${VALUE_STYLES[valueStyle]}`}>
        {value}
      </p>
      {hint && (
        <p className={`mt-1.5 text-xs ${hintColor === 'success' ? 'text-success' : 'text-faint'}`}>
          {hint}
        </p>
      )}
    </div>
  )
}
