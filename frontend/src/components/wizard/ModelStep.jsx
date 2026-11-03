import { Check, ChevronDown, Lock } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TEMPLATES } from '../../data/templates'
import { templatesForEventType } from '../../utils/templateTheme'
import TemplatePreview, { TemplateBadge } from '../templates/TemplatePreview'
import { StepTitle } from './EventKindSteps'

// Modèles proposés pour un type : ceux conçus pour lui (premium), puis les modèles
// gratuits de sa catégorie, utilisables avec l'offre Free.
export function modelsForType(type) {
  if (!type) return []
  return templatesForEventType(type.id, type.categoryCode)
}

const gridClass = 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-3'

function CatalogHeading({ badge, text, premium = false }) {
  return (
    <p className="mt-5 mb-3 flex flex-wrap items-center gap-2 text-sm text-muted">
      <span
        className={`rounded-full px-2.5 py-0.5 font-mono text-[0.68rem] font-bold tracking-[0.06em] uppercase ${
          premium ? 'bg-gold/20 text-gold' : 'bg-success/15 text-success'
        }`}
      >
        {badge}
      </span>
      {text}
    </p>
  )
}

// Carte de modèle (bouton radio stylé). category : affichée pour un modèle d'une autre catégorie.
function ModelCard({ tpl, on, onSelect, lockedPremium, category }) {
  return (
    <div className="relative">
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
          <span className="flex min-w-0 items-center gap-1.5">
            {lockedPremium && <Lock className="h-3.5 w-3.5 flex-none text-gold" aria-label="Offre Premium" />}
            <span className="truncate">{tpl.name}</span>
            {category && <small className="truncate font-normal text-muted">· {category}</small>}
          </span>
          <small className="font-mono text-xs text-gold">{on ? 'Choisi' : ''}</small>
        </span>
      </label>
    </div>
  )
}

export default function ModelStep({
  type,
  selected,
  onSelect,
  canUsePremium,
  onUpgrade,
  searchable,
  onSearchable,
}) {
  // Sans l'offre Premium, les modèles utilisables d'abord ; les modèles premium suivent.
  const all = modelsForType(type)
  const models = canUsePremium ? all : [...all.filter((t) => !t.premium), ...all.filter((t) => t.premium)]
  // Le reste du catalogue, toutes catégories confondues, à la demande : gratuits puis premium.
  const others = TEMPLATES.filter((t) => !all.includes(t))
  const otherFree = others.filter((t) => !t.premium)
  const otherPremium = others.filter((t) => t.premium)
  const pickedOther = others.some((t) => t.name === selected)
  const [showOthers, setShowOthers] = useState(pickedOther)
  const open = showOthers || pickedOther
  const designed = type.templates.length
  const chosen = TEMPLATES.find((t) => t.name === selected)
  const locked = chosen?.premium && !canUsePremium
  const card = (tpl, withCategory) => (
    <ModelCard
      key={tpl.name}
      tpl={tpl}
      on={tpl.name === selected}
      onSelect={onSelect}
      lockedPremium={tpl.premium && !canUsePremium}
      category={withCategory ? tpl.category : null}
    />
  )

  return (
    <div>
      <StepTitle
        title="Choisissez un modèle"
        lead={`${
          designed > 1 ? `${designed} modèles conviennent à ce type d'événement.` : "Le modèle conçu pour ce type d'événement."
        } Les couleurs et le motif se changent ensuite depuis « Personnaliser ».`}
      />
      <div role="radiogroup" aria-label="Modèle">
        <div className={gridClass}>{models.map((tpl) => card(tpl, false))}</div>

        {others.length > 0 && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowOthers((v) => !v || pickedOther)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-left text-sm font-semibold text-ink hover:border-brand-purple"
            >
              <span>
                {open ? 'Tous les modèles' : `Voir tous les modèles (+${others.length})`}
                <small className="block font-normal text-muted">
                  {otherFree.length} gratuits et {otherPremium.length} premium, adaptés ensuite à votre événement.
                </small>
              </span>
              <ChevronDown className={`h-4 w-4 flex-none transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {open && (
              <>
                <CatalogHeading badge="Gratuit" text="Utilisables avec toutes les offres" />
                <div className={gridClass}>{otherFree.map((tpl) => card(tpl, true))}</div>
                <CatalogHeading
                  badge="Premium"
                  text={canUsePremium ? 'Inclus dans votre offre' : 'Avec l’offre Premium : choisissez-le, vous pourrez l’activer avant de publier'}
                  premium
                />
                <div className={gridClass}>{otherPremium.map((tpl) => card(tpl, true))}</div>
              </>
            )}
          </div>
        )}
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

      {/* Acceptation par le bouton final (au lieu d'une case de plus) : elle couvre aussi les
          comptes créés avec Google, qui ne passent pas par la case du formulaire d'inscription. */}
      <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
        En enregistrant ou en publiant cette page, vous acceptez les{' '}
        <Link to="/cgu" target="_blank" rel="noopener" className="text-brand-purple underline">
          conditions d'utilisation et de vente
        </Link>{' '}
        et la{' '}
        <Link to="/confidentialite" target="_blank" rel="noopener" className="text-brand-purple underline">
          politique de confidentialité
        </Link>
        , et confirmez avoir le droit de publier les textes, photos et logos de cet événement.
      </p>
    </div>
  )
}
