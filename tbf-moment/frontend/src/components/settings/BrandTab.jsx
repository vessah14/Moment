import { useRef, useState } from 'react'
import Button from '../ui/Button'

const PALETTE = ['#6549e8', '#ec4ec2', '#ff7a3d', '#f6c945', '#c026d3', '#22c55e']

export default function BrandTab() {
  const [color, setColor] = useState(PALETTE[0])
  const [domain, setDomain] = useState('')
  const [logoUrl, setLogoUrl] = useState(null)
  const fileInputRef = useRef(null)
  const [verifyState, setVerifyState] = useState('idle')

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    setLogoUrl(URL.createObjectURL(file))
  }

  const handleVerifyDomain = () => {
    if (!domain.trim()) return
    setVerifyState('checking')
    setTimeout(() => {
      setVerifyState(/\.[a-z]{2,}$/i.test(domain.trim()) ? 'valid' : 'invalid')
    }, 900)
  }

  return (
    <div className="space-y-6">
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

      <div className="rounded-2xl border border-[color:var(--color-gold)]/30 bg-surface p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">Domaine personnalisé</h3>
          <span className="text-xs font-semibold tracking-wider text-[color:var(--color-gold)] uppercase">
            Business
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Remplacez tbfmoment.com/votre-slug par votre propre domaine.
        </p>
        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value)
              setVerifyState('idle')
            }}
            placeholder="invitations.votredomaine.com"
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
          />
          <Button
            variant="outline"
            onClick={handleVerifyDomain}
            disabled={verifyState === 'checking'}
          >
            {verifyState === 'checking' ? 'Vérification...' : 'Vérifier'}
          </Button>
        </div>
        {verifyState === 'valid' && (
          <p className="mt-2 text-xs text-success">
            Domaine valide. Ajoutez l'enregistrement CNAME fourni pour l'activer.
          </p>
        )}
        {verifyState === 'invalid' && (
          <p className="mt-2 text-xs text-danger">
            Ce domaine ne semble pas valide.
          </p>
        )}
      </div>
    </div>
  )
}
