import { useEffect, useRef, useState } from 'react'

const HEIGHT = 200
const PAD = { top: 12, right: 12, bottom: 26, left: 40 }

const dayLabel = (iso, withYear = false) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) })
    .format(new Date(y, m - 1, d))
}

// Graduation « ronde » au-dessus du maximum (1, 2, 5 × 10^n).
function niceMax(value) {
  if (value <= 4) return 4
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 5, 10].find((s) => s * power >= value / 4) * power
  return step * 4
}

function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(600)
  useEffect(() => {
    if (!ref.current) return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

// Évolution jour par jour d'une ou deux mesures de même unité (un seul axe).
// kind : « line » (courbes) ou « bar » (une seule série). format : affichage des valeurs.
export default function TrendChart({ title, subtitle, data, series, kind = 'line', bucket = 'day', format = (v) => v.toLocaleString('fr-FR') }) {
  const [ref, width] = useWidth()
  const [hover, setHover] = useState(null)
  const innerW = width - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const max = niceMax(Math.max(0, ...data.flatMap((d) => series.map((s) => d[s.key] ?? 0))))
  const n = data.length
  const x = (i) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const band = innerW / Math.max(1, n)
  const xBar = (i) => PAD.left + i * band
  const y = (v) => PAD.top + innerH - (v / max) * innerH
  const totals = series.map((s) => data.reduce((sum, d) => sum + (d[s.key] ?? 0), 0))
  const ticks = [0, 1, 2, 3, 4].map((k) => (max / 4) * k)
  const labelIdx = n > 1 ? [0, Math.floor((n - 1) / 2), n - 1] : [0]

  const pointAt = (clientX, rect) => {
    const px = clientX - rect.left
    const i = kind === 'bar'
      ? Math.floor((px - PAD.left) / band)
      : Math.round(((px - PAD.left) / innerW) * (n - 1))
    return Math.min(n - 1, Math.max(0, i))
  }
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = e.touches?.[0]?.clientX ?? e.clientX
    setHover(pointAt(clientX, rect))
  }

  const hovered = hover != null ? data[hover] : null
  const hx = hover != null ? (kind === 'bar' ? xBar(hover) + band / 2 : x(hover)) : 0

  return (
    <section className="rounded-2xl border border-border-soft bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-faint">{subtitle}</p>}
        </div>
        {/* Total de la période ; avec deux séries, la légende porte aussi l'identité. */}
        <div className="flex flex-wrap gap-4 text-xs text-muted">
          {series.map((s, i) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              {series.length > 1 && <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />}
              {series.length > 1 && <span>{s.label}</span>}
              <b className="font-mono text-sm text-ink">{format(totals[i])}</b>
            </span>
          ))}
        </div>
      </div>

      <div ref={ref} className="relative mt-3">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`${title} : ${series.map((s, i) => `${s.label} ${format(totals[i])}`).join(', ')} sur la période`}
          onMouseMove={onMove}
          onTouchStart={onMove}
          onTouchMove={onMove}
          onMouseLeave={() => setHover(null)}
          className="block touch-pan-y"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-border-soft)" strokeWidth="1" />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--color-faint)">
                {format(t)}
              </text>
            </g>
          ))}
          {labelIdx.map((i) => (
            <text key={i} x={kind === 'bar' ? xBar(i) + band / 2 : x(i)} y={HEIGHT - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize="10" fill="var(--color-faint)">
              {data[i] && dayLabel(data[i].date)}
            </text>
          ))}

          {kind === 'bar'
            ? data.map((d, i) => {
                const v = d[series[0].key] ?? 0
                const w = Math.max(1, band - 2)
                const h = Math.max(0, y(0) - y(v))
                const r = Math.min(4, w / 2, h)
                const x0 = xBar(i) + 1
                const top = y(v)
                // Bout arrondi côté valeur, base droite sur l'axe.
                return h > 0 ? (
                  <path
                    key={d.date}
                    d={`M${x0},${y(0)} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + w - r} Q${x0 + w},${top} ${x0 + w},${top + r} V${y(0)} Z`}
                    fill={series[0].color}
                    opacity={hover == null || hover === i ? 1 : 0.55}
                  />
                ) : null
              })
            : series.map((s) => (
                <path
                  key={s.key}
                  d={data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d[s.key] ?? 0)}`).join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}

          {hovered && (
            <g pointerEvents="none">
              <line x1={hx} x2={hx} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--color-muted)" strokeWidth="1" strokeDasharray="3 3" />
              {kind === 'line' &&
                series.map((s) => (
                  <circle key={s.key} cx={hx} cy={y(hovered[s.key] ?? 0)} r="4.5" fill={s.color} stroke="var(--color-surface)" strokeWidth="2" />
                ))}
            </g>
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-1 z-10 min-w-36 rounded-lg border border-border bg-bg px-3 py-2 text-xs shadow-lg"
            style={{ left: Math.min(Math.max(hx - 72, 0), width - 150) }}
          >
            <p className="font-semibold text-ink">{bucket === 'week' ? 'Semaine du ' : ''}{dayLabel(hovered.date, true)}</p>
            {series.map((s) => (
              <p key={s.key} className="mt-1 flex items-center justify-between gap-3 text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                  {s.label}
                </span>
                <b className="font-mono text-ink">{format(hovered[s.key] ?? 0)}</b>
              </p>
            ))}
          </div>
        )}
      </div>

      <details className="mt-2 text-xs text-muted">
        <summary className="cursor-pointer text-faint hover:text-ink">Voir les chiffres</summary>
        <div className="mt-2 max-h-48 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="text-faint">
              <tr>
                <th className="py-1 font-medium">{bucket === 'week' ? 'Semaine du' : 'Jour'}</th>
                {series.map((s) => <th key={s.key} className="py-1 text-right font-medium">{s.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.date} className="border-t border-border-soft">
                  <td className="py-1">{dayLabel(d.date, true)}</td>
                  {series.map((s) => <td key={s.key} className="py-1 text-right font-mono text-ink">{format(d[s.key] ?? 0)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}
