import { Check, Languages } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LANGUAGES, getCurrentLanguage, setLanguage } from '../../utils/translation'
import { mergeClasses } from '../../utils/mergeClasses'

// Bouton de traduction du site. `floating` : pastille fixe en bas de page, pour les
// pages publiques d'événement qui n'ont pas d'en-tête (mini-site, invitation, cadeaux).
export default function LanguageSwitcher({ className = '', floating = false, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const current = getCurrentLanguage()
  const currentLang = LANGUAGES.find((l) => l.code === current)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const menuPosition = floating
    ? 'bottom-full mb-2 right-0'
    : `top-full mt-2 ${align === 'left' ? 'left-0' : 'right-0'}`

  return (
    // "notranslate" : le sélecteur lui-même ne doit jamais être traduit (noms des langues).
    <div
      ref={rootRef}
      translate="no"
      className={mergeClasses(
        `notranslate ${floating ? 'fixed right-4 bottom-4 z-50' : 'relative inline-flex'}`,
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Traduire le site (langue actuelle : ${currentLang?.label})`}
        title="Traduire le site"
        className={
          floating
            ? 'flex items-center gap-1.5 rounded-full border border-border-soft bg-surface/90 px-3.5 py-2 text-xs font-semibold text-ink shadow-lg backdrop-blur transition hover:border-brand-purple'
            : 'flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-2 text-xs font-semibold text-muted transition hover:border-faint hover:text-ink'
        }
      >
        <Languages className="h-4 w-4" />
        {currentLang?.short}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Langue du site"
          className={`absolute ${menuPosition} z-50 w-48 overflow-hidden rounded-xl border border-border-soft bg-surface py-1 shadow-xl`}
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === current}
                onClick={() => {
                  setOpen(false)
                  setLanguage(lang.code)
                }}
                className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm text-ink transition hover:bg-surface-2"
              >
                <span>{lang.label}</span>
                {lang.code === current && <Check className="h-4 w-4 text-brand-purple" />}
              </button>
            </li>
          ))}
          <li className="border-t border-border-soft px-3.5 py-2 text-[11px] leading-snug text-faint">
            Traduction automatique (Google). Version d'origine : français.
          </li>
        </ul>
      )}
    </div>
  )
}
