import { useMemo } from 'react'

export default function PasswordStrengthBar({ password }) {
  const strength = useMemo(() => {
    if (password.length === 0) return 0
    if (password.length < 6) return 1
    if (password.length < 10) return 2
    return 3
  }, [password])

  const colors = ['bg-border', 'bg-danger', 'bg-brand-orange', 'bg-success']

  return (
    <div className="mt-2 flex gap-1.5">
      {[1, 2, 3].map((segment) => (
        <span
          key={segment}
          className={`h-1 flex-1 rounded-full transition-colors ${
            segment <= strength ? colors[strength] : 'bg-border'
          }`}
        />
      ))}
    </div>
  )
}
