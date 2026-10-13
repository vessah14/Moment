import { mergeClasses } from '../../utils/mergeClasses'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../utils/useTheme'

const OPTIONS = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'auto', label: 'Auto', icon: Monitor },
]

export default function ThemeToggle({ className = '', showLabels = true }) {
  const [mode, setMode] = useTheme()

  return (
    <div className={mergeClasses('inline-flex gap-1 rounded-full bg-surface-2 p-1', className)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setMode(opt.value)}
          title={opt.label}
          aria-label={opt.label}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
            mode === opt.value
              ? 'bg-brand-indigo text-white'
              : 'text-muted hover:text-ink'
          }`}
        >
          <opt.icon className="h-3.5 w-3.5 shrink-0" />
          {showLabels && <span className="hidden sm:inline">{opt.label}</span>}
        </button>
      ))}
    </div>
  )
}
