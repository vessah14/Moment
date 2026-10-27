import { useState } from 'react'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'
import Toggle from '../builder/Toggle'
import { useReducedMotion } from '../../utils/useReducedMotion'
import { useToast } from '../../utils/useToast'
import { LANGUAGES, getCurrentLanguage, setLanguage as applyLanguage } from '../../utils/translation'

export default function LanguageTab() {
  const toast = useToast()
  const [language, setLanguage] = useState(getCurrentLanguage())
  const [reducedMotion, setReducedMotion] = useReducedMotion()

  // Apparence et animations s'appliquent tout de suite ; seule la langue s'enregistre ici
  // (changer de langue recharge la page pour traduire tout le site).
  const handleSave = () => {
    if (language === getCurrentLanguage()) return toast('Langue inchangée')
    toast('Langue enregistrée')
    applyLanguage(language)
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Langue et affichage</h2>
      <p className="mt-1 text-sm text-muted">
        Ces réglages s'appliquent à votre interface sur cet appareil.
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

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="block min-w-56">
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
        </label>
        <Button variant="solid" onClick={handleSave}>
          Appliquer la langue
        </Button>
      </div>
      {language !== 'fr' && (
        <p className="mt-1.5 text-xs text-faint">
          Traduction automatique de l'interface. Les e-mails envoyés à vos
          invités restent en français.
        </p>
      )}
    </div>
  )
}
