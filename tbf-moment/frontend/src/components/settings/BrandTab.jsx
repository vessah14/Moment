import { useRef, useState } from 'react'
import Button from '../ui/Button'

const PALETTE = ['#6549e8', '#ec4ec2', '#ff7a3d', '#f6c945', '#c026d3', '#22c55e']

export default function BrandTab() {
  const [color, setColor] = useState(PALETTE[0])
  const [logoUrl, setLogoUrl] = useState(null)
  const fileInputRef = useRef(null)

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    setLogoUrl(URL.createObjectURL(file))
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Marque</h2>
      <p className="mt-1 text-sm text-muted">
        Personnalisez l'identité visuelle de vos pages d'événements.
      </p>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-xs text-faint">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            'Logo'
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml,image/jpeg"
          className="hidden"
          onChange={handleLogoChange}
        />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          Téléverser un logo
        </Button>
      </div>

      <div className="mt-6">
        <span className="text-sm font-medium text-ink">Couleur de marque</span>
        <div className="mt-3 flex gap-2">
          {PALETTE.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              style={{ backgroundColor: swatch }}
              className={`h-9 w-9 rounded-full transition ${
                color === swatch
                  ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface'
                  : ''
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-faint">
          Utilisée sur les boutons et accents de vos sites d'événements.
        </p>
      </div>
    </div>
  )
}
