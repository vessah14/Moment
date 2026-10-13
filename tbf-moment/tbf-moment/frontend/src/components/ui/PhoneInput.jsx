import * as Flags from 'country-flag-icons/react/3x2'
import { useState } from 'react'
import {
  applyCountryCode,
  detectCountry,
  searchCountries,
} from '../../utils/phoneCountry'

function FlagIcon({ iso, className }) {
  const Flag = iso && Flags[iso]
  if (!Flag) {
    return <span className={`block rounded-sm bg-surface-2 ${className}`} />
  }
  return <Flag className={`rounded-sm ${className}`} title={iso} />
}

export default function PhoneInput({ value, onChange, className = '', ...props }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const country = detectCountry(value)

  const countries = searchCountries(query)

  const handleSelect = (selected) => {
    onChange(applyCountryCode(value, selected))
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={country?.name ?? 'Choisir un indicatif'}
        className="absolute top-1/2 left-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition hover:bg-surface-2"
      >
        <FlagIcon iso={country?.iso} className="h-3.5 w-5 object-cover" />
      </button>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="+221 77 000 00 00"
        className={`w-full rounded-lg border border-border bg-surface py-3 pr-4 pl-11 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple ${className}`}
        {...props}
      />

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer la liste des indicatifs"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-xl border border-border-soft bg-panel p-2 shadow-xl">
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, code (SN) ou indicatif (221)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
            <div className="mt-2 max-h-56 overflow-y-auto">
              {countries.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-faint">
                  Aucun pays trouvé.
                </p>
              ) : (
                countries.map((c) => (
                  <button
                    key={c.code + c.name}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-surface-2 ${
                      country?.code === c.code && country?.name === c.name
                        ? 'text-brand-purple'
                        : 'text-ink'
                    }`}
                  >
                    <FlagIcon iso={c.iso} className="h-3.5 w-5 shrink-0 object-cover" />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-[11px] text-faint">{c.iso}</span>
                    <span className="w-10 text-right font-mono text-xs text-faint">
                      +{c.code}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
