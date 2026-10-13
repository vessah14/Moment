import { mergeClasses } from '../../utils/mergeClasses'

const VARIANTS = {
  gradient:
    'bg-brand-gradient text-white shadow-lg shadow-brand-pink/20 hover:opacity-90',
  solid: 'bg-brand-indigo text-white hover:bg-brand-purple',
  outline: 'border border-border text-ink hover:border-faint',
  ghost: 'text-ink hover:bg-surface-2',
  white: 'bg-white text-brand-purple shadow-lg hover:opacity-90',
}

export default function Button({
  as: Component = 'button',
  variant = 'gradient',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={mergeClasses(
        `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${VARIANTS[variant]}`,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
