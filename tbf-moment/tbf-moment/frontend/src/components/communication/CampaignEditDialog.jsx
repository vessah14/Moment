import { useState } from 'react'
import { AUDIENCES } from '../../data/communicationChannels'
import Dialog from '../ui/Dialog'

// Modification d'une campagne pas encore envoyée : nom, audience, message ; une campagne
// e-mail peut partir aussitôt après l'enregistrement.
const TAGS = ['{prénom}', '{nom}', '{date}', '{lieu}', '{lien}']
const fieldClass =
  'mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-purple'

export default function CampaignEditDialog({ campaign, onClose, onSave }) {
  const [name, setName] = useState(campaign.name)
  const [audience, setAudience] = useState(campaign.audience)
  const [body, setBody] = useState(campaign.body ?? '')
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const isEmail = campaign.channel === 'E-mail'

  const save = async (sendNow) => {
    if (!name.trim() || !body.trim()) {
      setError('Le nom et le message sont obligatoires.')
      return
    }
    setError('')
    setSaving(sendNow ? 'send' : 'save')
    try {
      await onSave({ name: name.trim(), audience, body: body.trim(), sendNow })
      onClose()
    } catch (err) {
      setError(err.message || "La campagne n'a pas pu être enregistrée.")
    } finally {
      setSaving('')
    }
  }

  return (
    <Dialog
      open
      title="Modifier la campagne"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink">
            Annuler
          </button>
          <button
            type="button"
            onClick={() => save(false)}
            disabled={Boolean(saving)}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:border-brand-purple disabled:opacity-50"
          >
            {saving === 'save' ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {isEmail && (
            <button
              type="button"
              onClick={() => save(true)}
              disabled={Boolean(saving)}
              className="rounded-xl bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
            >
              {saving === 'send' ? 'Envoi…' : 'Enregistrer et envoyer'}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-ink">Nom de la campagne</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} required className={fieldClass} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink">Audience</span>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className={fieldClass}>
            {[...new Set([audience, ...AUDIENCES])].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink">Message</span>
          <textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} required className={`${fieldClass} resize-y`} />
          <span className="mt-2 flex flex-wrap gap-1.5">
            {TAGS.map((tag) => (
              <span key={tag} className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-xs text-muted">
                {tag}
              </span>
            ))}
          </span>
        </label>
        <p className="text-xs text-faint">Canal : {campaign.channel}. Le canal d’une campagne ne se change pas.</p>
        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  )
}
