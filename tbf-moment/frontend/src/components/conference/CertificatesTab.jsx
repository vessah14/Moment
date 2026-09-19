import { Download } from 'lucide-react'
import { useState } from 'react'
import { INITIAL_GUESTS } from '../../data/guests'
import { useLocalStorageState } from '../../utils/useLocalStorageState'
import Toggle from '../builder/Toggle'
import Button from '../ui/Button'

function generateCertificate(name, eventTitle) {
  const canvas = document.createElement('canvas')
  canvas.width = 1000
  canvas.height = 700
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, 1000, 700)
  gradient.addColorStop(0, '#0b1020')
  gradient.addColorStop(1, '#1e2540')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1000, 700)

  ctx.strokeStyle = '#6c4bf4'
  ctx.lineWidth = 6
  ctx.strokeRect(30, 30, 940, 640)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#9ba3c2'
  ctx.font = '24px sans-serif'
  ctx.fillText('CERTIFICAT DE PARTICIPATION', 500, 180)

  ctx.fillStyle = '#f8f9fc'
  ctx.font = 'bold 56px sans-serif'
  ctx.fillText(name, 500, 300)

  ctx.fillStyle = '#9ba3c2'
  ctx.font = '22px sans-serif'
  ctx.fillText(`a participé à`, 500, 360)

  ctx.fillStyle = '#ec4ec2'
  ctx.font = 'bold 32px sans-serif'
  ctx.fillText(eventTitle, 500, 420)

  ctx.fillStyle = '#6b7290'
  ctx.font = '18px sans-serif'
  ctx.fillText('TBF Moment', 500, 610)

  return canvas.toDataURL('image/png')
}

export default function CertificatesTab({ eventTitle }) {
  const [guests] = useLocalStorageState('tbf_guests_v2', INITIAL_GUESTS)
  const attendees = guests.map((g) => g.name)
  const [autoGenerate, setAutoGenerate] = useState(false)
  const [issued, setIssued] = useState([])

  const handleDownload = (name) => {
    const dataUrl = generateCertificate(name, eventTitle)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `certificat-${name.toLowerCase().replace(/\s+/g, '-')}.png`
    link.click()
    if (!issued.includes(name)) setIssued((prev) => [...prev, name])
  }

  const handleGenerateAll = () => {
    attendees.forEach((name) => handleDownload(name))
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-ink">Certificats</h2>
          <p className="mt-1 text-sm text-muted">
            {issued.length}/{attendees.length} certificat(s) téléchargé(s)
          </p>
        </div>
        <Button variant="gradient" onClick={handleGenerateAll}>
          Générer tous les certificats
        </Button>
      </div>

      <div className="mt-5 rounded-2xl border border-border-soft bg-surface p-5">
        <Toggle
          label="Génération automatique après check-in"
          checked={autoGenerate}
          onChange={setAutoGenerate}
        />
        <p className="mt-2 text-xs text-faint">
          Chaque participant validé à l'entrée reçoit son certificat par
          e-mail dans les minutes qui suivent.
        </p>
      </div>

      <div className="mt-5 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface">
        {attendees.map((name) => (
          <div key={name} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-ink">{name}</span>
            <div className="flex items-center gap-3">
              {issued.includes(name) && (
                <span className="text-xs text-success">Téléchargé</span>
              )}
              <button
                type="button"
                onClick={() => handleDownload(name)}
                className="flex items-center gap-1.5 rounded-lg border border-border-soft px-3 py-1.5 text-xs font-medium text-ink transition hover:border-faint"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
