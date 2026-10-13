import { useState } from 'react'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'
import Toggle from '../builder/Toggle'
import { useReducedMotion } from '../../utils/useReducedMotion'
import { useToast } from '../../utils/useToast'
import { LANGUAGES, getCurrentLanguage, setLanguage as applyLanguage } from '../../utils/translation'
const TIMEZONES = ['GMT · Dakar', 'GMT+1 · Douala', 'GMT+0 · UTC', 'CET · Paris']
const DATE_FORMATS = ['JJ/MM/AAAA', 'MM/JJ/AAAA', 'AAAA-MM-JJ']

export default function LanguageTab() {
  const toast = useToast()
  const [language, setLanguage] = useState(getCurrentLanguage())
  const [timezone, setTimezone] = useState('GMT · Dakar')
  const [dateFormat, setDateFormat] = useState('JJ/MM/AAAA')
  const [reducedMotion, setReducedMotion] = useReducedMotion()

  const handleSave = () => {
    toast('Préférences enregistrées')
    // Changer de langue recharge la page pour traduire tout le site.
    if (language !== getCurrentLanguage()) applyLanguage(language)
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Langue et fuseau</h2>
        <Button variant="solid" onClick={handleSave}>
          Enregistrer
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted">
        Ces réglages s'appliquent à votre interface et aux e-mails envoyés en
        votre nom.
      </p>

      <div className="mt-6">
        <span className="text-sm font-medium text-ink">Apparence</span>
        <div className="mt-2">
          <ThemeToggle />
        </div>
        <p className="mt-1.5 text-xs text-faint">
          "Auto" suit le réglage clair/sombre de votre appareil.
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border-soft px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">
              Réduire les animations
            </p>
            <p className="text-xs text-faint">
              Désactive les transitions et animations dans toute l'app.
            </p>
          </div>
          <Toggle checked={reducedMotion} onChange={setReducedMotion} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-ink">Langue</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="notranslate">
                {l.label}
              </option>
            ))}
          </select>
          {language !== 'fr' && (
            <span className="mt-1.5 block text-xs text-faint">
              Traduction automatique de l'interface. Les e-mails envoyés à vos
              invités restent en français.
            </span>
          )}
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
