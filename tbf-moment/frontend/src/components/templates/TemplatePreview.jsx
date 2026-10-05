// Miniature d'un site d'événement, dessinée à partir des couleurs du modèle. Utilisée
// quand un modèle n'a pas de capture d'écran (`image`).
export default function TemplatePreview({ preview, minimal = false }) {
  if (!preview) return null
  const { bg, ink, accent, serif, eyebrow, title, date } = preview
  const titleFont = serif ? 'Georgia, "Times New Roman", serif' : 'inherit'

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ backgroundColor: bg, color: ink }}
    >
      {/* Couverture */}
      <div
        className="relative flex h-[46%] flex-col items-center justify-center px-5 text-center"
        style={{
          background: minimal
            ? `linear-gradient(180deg, ${accent}1f, transparent)`
            : `radial-gradient(120% 90% at 50% 0%, ${accent}55, transparent 70%), linear-gradient(180deg, ${accent}26, transparent)`,
        }}
      >
        <span className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: accent }}>
          {eyebrow}
        </span>
        <span className="mt-2 text-xl leading-tight font-bold" style={{ fontFamily: titleFont }}>
          {title}
        </span>
        <span className="mt-1.5 h-px w-10" style={{ backgroundColor: accent }} />
        <span className="mt-1.5 text-[10px] opacity-70">{date}</span>
      </div>

      {/* Blocs de contenu */}
      <div className="flex flex-1 flex-col gap-2.5 px-6 pt-3">
        <div className="mx-auto h-1.5 w-3/4 rounded-full opacity-20" style={{ backgroundColor: ink }} />
        <div className="mx-auto h-1.5 w-2/3 rounded-full opacity-15" style={{ backgroundColor: ink }} />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square rounded-md" style={{ backgroundColor: accent, opacity: 0.12 + i * 0.08 }} />
          ))}
        </div>
        <div
          className="mx-auto mt-auto mb-14 rounded-full px-4 py-1.5 text-[10px] font-semibold sm:mb-6"
          style={{ backgroundColor: accent, color: bg }}
        >
          Confirmer ma présence
        </div>
      </div>
    </div>
  )
}

export function TemplateBadge({ badge }) {
  return (
    <span
      className={`absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide shadow-sm ${
        badge === 'PREMIUM'
          ? 'bg-[color:var(--color-gold)] text-[#1a1406]'
          : 'bg-white/90 text-[#1c1c28] backdrop-blur'
      }`}
    >
      {badge}
    </span>
  )
}
