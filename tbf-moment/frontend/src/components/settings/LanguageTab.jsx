import { useState } from 'react'
import Button from '../ui/Button'

const LANGUAGES = ['Français', 'English', 'Wolof']
const TIMEZONES = ['GMT · Dakar', 'GMT+1 · Douala', 'GMT+0 · UTC', 'CET · Paris']
const DATE_FORMATS = ['JJ/MM/AAAA', 'MM/JJ/AAAA', 'AAAA-MM-JJ']

export default function LanguageTab() {
  const [saved, setSaved] = useState(false)
  const [language, setLanguage] = useState('Français')
  const [timezone, setTimezone] = useState('GMT · Dakar')
  const [dateFormat, setDateFormat] = useState('JJ/MM/AAAA')

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Langue et fuseau</h2>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-success">Enregistré</span>}
          <Button variant="solid" onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">
        Ces réglages s'appliquent à votre interface et aux e-mails envoyés en
        votre nom.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-ink">Langue</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Fuseau horaire</span>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          >
            {TIMEZONES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Format de date</span>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          >
            {DATE_FORMATS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-5 text-xs text-faint">
        Aperçu : {new Date().toLocaleDateString('fr-FR')} · {timezone}
      </p>
    </div>
  )
}
