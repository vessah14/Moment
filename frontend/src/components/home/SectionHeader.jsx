// En-tête commun des sections de l'accueil : même surtitre, même taille de titre, même
// alignement partout (lisible en thème clair comme en sombre).
export default function SectionHeader({ id, eyebrow, title, children, action, className = '' }) {
  return (
    <div className={`mx-auto max-w-3xl text-center ${className}`}>
      <span className="text-xs font-semibold tracking-widest text-brand-purple uppercase">{eyebrow}</span>
      <h2 id={id} className="mt-3 text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08] font-bold tracking-tight text-ink">
        {title}
      </h2>
      {children && <p className="mt-3 text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
