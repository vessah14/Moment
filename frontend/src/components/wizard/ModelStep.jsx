import { Check, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TEMPLATES } from '../../data/templates'
import { templatesForCategory } from '../../utils/templateTheme'
import TemplatePreview, { TemplateBadge } from '../templates/TemplatePreview'
import { StepTitle } from './EventKindSteps'

// Modèles proposés pour un type : ceux conçus pour lui (premium), puis les modèles
// gratuits de sa catégorie, utilisables avec l'offre Free.
export function modelsForType(type) {
  if (!type) return []
  const premium = type.templates.map((theme) => TEMPLATES.find((t) => t.theme === theme)).filter(Boolean)
  const free = templatesForCategory(type.categoryCode).filter((t) => !t.premium && !premium.includes(t))
  return [...premium, ...free]
}

export default function ModelStep({
  type,
  selected,
  onSelect,
  canUsePremium,
  onUpgrade,
  consent,
  onConsent,
  consentError,
  searchable,
  onSearchable,
}) {
  const models = modelsForType(type)
  const designed = type.templates.length
  const chosen = models.find((t) => t.name === selected)
  const locked = chosen?.premium && !canUsePremium

  return (
    <div>
      <StepTitle
        title="Choisissez un modèle"
        lead={`${
          designed > 1 ? `${designed} modèles conviennent à ce type d'événement.` : "Le modèle conçu pour ce type d'événement."
        } Les couleurs et le motif se changent ensuite depuis « Personnaliser ».`}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-3" role="radiogroup" aria-label="Modèle">
        {models.map((tpl) => {
          const on = tpl.name === selected
          return (
            <div key={tpl.name} className="relative">
              <input
                type="radio"
                name="tpl"
                id={`m-${tpl.name}`}
                value={tpl.name}
                checked={on}
                onChange={() => onSelect(tpl.name)}
                className="peer absolute h-px w-px opacity-0"
              />
              <label
                htmlFor={`m-${tpl.name}`}
                className="block cursor-pointer overflow-hidden rounded-2xl border border-border-soft bg-surface transition peer-checked:border-brand-purple peer-checked:ring-1 peer-checked:ring-brand-purple peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold hover:border-brand-purple/70"
              >
                <span className="relative block aspect-4/5 bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-panel))]">
                  <TemplatePreview preview={tpl.preview} minimal={tpl.minimal} template={tpl} />
                  <TemplateBadge badge={tpl.badge} />
                  {on && (
                    <span className="absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand-purple text-white">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="flex items-center justify-between gap-2 px-3.5 py-3 font-semibold text-ink">
                  <span className="flex items-center gap-1.5">
                    {tpl.premium && !canUsePremium && <Lock className="h-3.5 w-3.5 text-gold" aria-label="Offre Premium" />}
                    {tpl.name}
                  </span>
                  <small className="font-mono text-xs text-gold">{on ? 'Choisi' : ''}</small>
                </span>
              </label>
            </div>
          )
        })}
      </div>

      {locked && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/50 bg-gold/10 px-4 py-3">
          <p className="text-sm text-ink">
            <b className="block">Le modèle {chosen.name} fait partie des modèles premium.</b>
            <span className="text-muted">Passez à l'offre Premium pour le publier, ou choisissez un modèle gratuit.</span>
          </p>
          <button
            type="button"
            onClick={onUpgrade}
            className="min-h-11 rounded-xl bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-4 text-sm font-bold text-white"
          >
            Activer Premium
          </button>
        </div>
      )}

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-border-soft bg-surface p-4 text-[0.88rem] text-muted">
        <input
          type="checkbox"
          checked={searchable}
          onChange={(e) => onSearchable(e.target.checked)}
          className="mt-0.5 h-5 w-5 flex-none accent-brand-purple"
        />
        <span>
          <b className="text-ink">Visible sur Google.</b> Sans cette option, seules les personnes qui ont le lien voient la page.
        </span>
      </label>

      <label
        htmlFor="f-consent"
        className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-border-soft bg-surface p-4 text-[0.88rem] text-muted"
      >
        <input
          type="checkbox"
          id="f-consent"
          checked={consent}
          onChange={(e) => onConsent(e.target.checked)}
          aria-invalid={Boolean(consentError) || undefined}
          aria-describedby={consentError ? 'e-consent' : undefined}
          className="mt-0.5 h-5 w-5 flex-none accent-brand-purple aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-offset-2 aria-[invalid=true]:outline-danger"
        />
        <span>
          J'accepte les{' '}
          <Link to="/cgu" target="_blank" rel="noopener" className="text-brand-purple underline">
            conditions d'utilisation et de vente
          </Link>{' '}
          et la{' '}
          <Link to="/confidentialite" target="_blank" rel="noopener" className="text-brand-purple underline">
            politique de confidentialité
          </Link>
          . Je confirme avoir le droit de publier les textes, photos et logos de cet événement.
        </span>
      </label>
      {consentError && (
        <p id="e-consent" className="mt-1.5 text-[0.82rem] text-danger" role="alert">
          {consentError}
        </p>
      )}
    </div>
  )
}
