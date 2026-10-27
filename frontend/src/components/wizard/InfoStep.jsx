import { useState } from 'react'
import { LOGO_POLICY } from '../../data/eventTypes'
import { LOGO_TYPES, prepareLogo } from '../../utils/logoFile'
import { eventRequiresAge } from '../../utils/eventTitle'
import { StepTitle } from './EventKindSteps'

const inputClass =
  'min-h-[46px] w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30 aria-[invalid=true]:border-danger'

export const initialsOf = (s) =>
  String(s || '')
    .split(/[\s&-]+/)
    .filter((w) => w.length > 1)
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join('') || 'TB'

// Champs obligatoires de l'étape, dans l'ordre d'affichage : { champ: message }.
export function infoErrors(form, type) {
  if (!type) return {}
  const errors = {}
  if (!form.name.trim()) errors.name = "Donnez un nom à l'événement."
  if (!form.display.trim()) errors.display = 'Indiquez le texte à afficher en grand.'
  if (eventRequiresAge(type.id)) {
    const age = Number(form.birthdayAge)
    if (!form.birthdayAge || !Number.isInteger(age) || age < 1 || age > 120)
      errors.birthdayAge = 'Indiquez un nombre entier compris entre 1 et 120.'
  }
  if (type.logo === 'required' && !form.organizer.trim()) errors.organizer = "Indiquez le nom de l'organisation."
  if (type.logo === 'required' && !form.logo) errors.logo = "Ajoutez le logo de votre organisation : il sera affiché sur la page de l'événement."
  return errors
}

function Req({ must, children }) {
  return (
    <span
      className={`rounded-full border px-1.5 py-px font-mono text-[0.66rem] tracking-[0.06em] uppercase ${
        must ? 'border-brand-purple text-brand-purple' : 'border-border-soft text-muted'
      }`}
    >
      {children}
    </span>
  )
}

function Field({ id, label, must, optional, hint, error, children }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="flex flex-wrap items-center gap-2 text-[0.88rem] font-semibold text-ink">
        {label}
        {must && <Req must>Obligatoire</Req>}
        {optional && <Req>Facultatif</Req>}
      </label>
      {children}
      {hint && <p className="text-[0.8rem] text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="text-[0.82rem] text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

const SectionTitle = ({ children }) => (
  <p className="mt-2 border-t border-border-soft pt-4 font-mono text-[0.72rem] tracking-[0.1em] text-muted uppercase">{children}</p>
)

function LogoField({ form, type, onChange, error }) {
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState('')
  const [over, setOver] = useState(false)
  const policy = type.logo
  const shown = localError || error

  const handle = async (file) => {
    if (!file) return
    setBusy(true)
    setLocalError('')
    try {
      const logo = await prepareLogo(file)
      onChange({ logo })
    } catch (err) {
      setLocalError(err.message)
    } finally {
      setBusy(false)
    }
  }
  const input = (
    <input
      type="file"
      id="f-logo"
      accept={LOGO_TYPES}
      aria-describedby="h-logo"
      aria-invalid={Boolean(shown) || undefined}
      onChange={(e) => {
        handle(e.target.files?.[0])
        e.target.value = ''
      }}
      className="absolute inset-0 cursor-pointer opacity-0"
    />
  )
  const src = form.logo?.dataUrl || form.logo?.preview

  return (
    <div className="grid gap-1.5">
      <span className="flex flex-wrap items-center gap-2 text-[0.88rem] font-semibold text-ink" id="l-logo">
        Logo de l'organisateur <Req must={policy === 'required'}>{LOGO_POLICY[policy]}</Req>
      </span>
      <p className="text-[0.8rem] text-muted" id="h-logo">
        {policy === 'required'
          ? "Il apparaîtra en haut de la page de l'événement, sur toutes les offres."
          : policy === 'suggested'
            ? 'Recommandé pour que les invités reconnaissent votre organisation.'
            : "Pour un événement privé, vos initiales seront utilisées si vous n'en mettez pas."}
      </p>
      {src ? (
        <>
          <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-dashed border-border bg-surface p-4">
            <span className="grid h-[76px] place-items-center rounded-lg border border-border-soft bg-white">
              <img src={src} alt="Logo sur fond clair" className="max-h-[54px] max-w-[80%] object-contain" />
            </span>
            <span className="grid h-[76px] place-items-center rounded-lg border border-border-soft bg-[#0F0B2E]">
              <img src={src} alt="Logo sur fond sombre" className="max-h-[54px] max-w-[80%] object-contain" />
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-[0.8rem] text-muted">
            <span>{form.logo.label}</span>
            <span className="flex gap-2">
              <label className="relative inline-flex min-h-9 cursor-pointer items-center overflow-hidden rounded-lg border border-border-soft px-3 text-[0.82rem] font-semibold text-ink hover:border-brand-purple">
                Remplacer
                {input}
              </label>
              <button
                type="button"
                onClick={() => onChange({ logo: null })}
                className="min-h-9 rounded-lg border border-border-soft px-3 text-[0.82rem] font-semibold text-ink hover:border-brand-purple"
              >
                Retirer
              </button>
            </span>
          </div>
        </>
      ) : (
        <label
          className={`relative block cursor-pointer rounded-2xl border-[1.5px] border-dashed p-4 transition ${
            over ? 'border-brand-purple bg-surface-2' : 'border-border bg-surface hover:border-brand-purple hover:bg-surface-2'
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            handle(e.dataTransfer.files?.[0])
          }}
        >
          {input}
          <span className="flex items-center gap-3.5">
            <span className="grid h-[52px] w-[52px] flex-none place-items-center rounded-xl bg-brand-purple font-extrabold text-white" aria-hidden="true">
              {initialsOf(form.organizer || form.display || form.name)}
            </span>
            <span>
              <b className="text-sm text-ink">{busy ? 'Préparation du logo…' : 'Glissez votre logo ici'}</b>
              <small className="block text-[0.78rem] text-muted">ou cliquez pour choisir · PNG, JPG, WebP, SVG · 2 Mo maximum</small>
            </span>
          </span>
        </label>
      )}
      {shown && (
        <p className="text-[0.82rem] text-danger" role="alert">
          {shown}
        </p>
      )}
      {(form.logo?.tips ?? []).map((tip) => (
        <p key={tip} className="text-[0.82rem] text-gold">
          {tip}
        </p>
      ))}
    </div>
  )
}

export default function InfoStep({ form, type, onChange, errors = {} }) {
  const orgRequired = type.logo === 'required'
  const needsAge = eventRequiresAge(type.id)
  const isWeddingAnniversary = type.id === 'noces'
  const text = (key, extra = {}) => ({
    id: `f-${key}`,
    value: form[key],
    onChange: (e) => onChange({ [key]: e.target.value }),
    'aria-invalid': Boolean(errors[key]) || undefined,
    'aria-describedby': errors[key] ? `f-${key}-err` : undefined,
    className: inputClass,
    ...extra,
  })

  return (
    <div>
      <StepTitle
        title="Informations générales"
        lead={`${type.label} · ces informations apparaissent sur la page, l'invitation, le pass d'entrée et l'aperçu WhatsApp.`}
      />
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-4" noValidate>
        <Field
          id="f-name"
          label="Nom de l'événement"
          must
          hint="Le titre affiché en grand est réglé séparément juste en dessous."
          error={errors.name}
        >
          <input type="text" autoComplete="off" placeholder="Ex. Journée culturelle 2027" maxLength={150} {...text('name')} />
        </Field>
        <Field
          id="f-display"
          label={needsAge ? (isWeddingAnniversary ? 'Noms du couple' : 'Nom de la personne fêtée') : 'Texte affiché en grand'}
          must
          hint={needsAge
            ? (isWeddingAnniversary ? 'Les années de mariage et les prénoms composeront le titre.' : 'Son âge et son prénom composeront le titre.')
            : 'Pour un couple, séparez les prénoms par « & ».'}
          error={errors.display}
        >
          <input
            type="text"
            placeholder={needsAge ? (isWeddingAnniversary ? 'Ex. Awa & Ibrahim' : 'Ex. Awa') : 'Ex. Awa & Ibrahim, ou le nom de l’école'}
            maxLength={120}
            {...text('display')}
          />
        </Field>
        {needsAge && (
          <Field
            id="f-birthdayAge"
            label={isWeddingAnniversary ? 'Années de mariage célébrées' : 'Âge célébré'}
            must
            error={errors.birthdayAge}
          >
            <input
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              placeholder="Ex. 30"
              {...text('birthdayAge')}
            />
          </Field>
        )}

        <SectionTitle>Organisateur</SectionTitle>
        <Field id="f-organizer" label="Nom de l'organisateur" must={orgRequired} optional={!orgRequired} error={errors.organizer}>
          <input
            type="text"
            autoComplete="organization"
            maxLength={80}
            placeholder={
              type.univers === 'ecoles' ? 'Ex. IUGET de Bonabéri' : type.univers === 'entreprises' ? 'Ex. Wouri Logistics' : 'Ex. Famille Ekambi'
            }
            {...text('organizer')}
          />
        </Field>
        <LogoField form={form} type={type} onChange={onChange} error={errors.logo} />

        <SectionTitle>Date et lieu</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-4">
          <Field id="f-date" label="Date" optional>
            <input type="date" {...text('date')} />
          </Field>
          <Field id="f-timeStart" label="Début" optional>
            <input type="time" {...text('timeStart')} />
          </Field>
          <Field id="f-timeEnd" label="Fin">
            <input type="time" {...text('timeEnd')} />
          </Field>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-4">
          <Field id="f-venueName" label="Lieu">
            <input type="text" placeholder="Ex. Amphithéâtre 600" maxLength={120} {...text('venueName')} />
          </Field>
          <Field id="f-venueAddr" label="Quartier et ville" optional>
            <input type="text" placeholder="Ex. Bonabéri · Douala" maxLength={200} {...text('venueAddr')} />
          </Field>
        </div>
        <Field id="f-description" label="Message d'accueil">
          <textarea
            placeholder="Une ou deux phrases pour présenter l'événement"
            maxLength={600}
            {...text('description', { className: `${inputClass} min-h-[84px] resize-y` })}
          />
        </Field>
      </form>
    </div>
  )
}
