import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { createEvent, getEvent, updateEvent as updateEventApi, uploadEventBlockImage } from '../api/events'
import { getCurrentUser, mediaUrl } from '../api/client'
import { listEventCategories } from '../api/eventCategories'
import { createEventLocation, deleteEventLocation, listEventLocations, updateEventLocation } from '../api/eventLocations'
import { createEventBlock, listEventBlocks, updateEventBlock } from '../api/eventBlocks'
import DashboardLayout from '../components/layout/DashboardLayout'
import UpgradeDialog from '../components/plan/UpgradeDialog'
import Button from '../components/ui/Button'
import { TypeStep, UniversStep } from '../components/wizard/EventKindSteps'
import InfoStep, { infoErrors } from '../components/wizard/InfoStep'
import ContentStep from '../components/wizard/ContentStep'
import LivePreview from '../components/wizard/LivePreview'
import ModelStep, { modelsForType } from '../components/wizard/ModelStep'
import PublishedStep from '../components/wizard/PublishedStep'
import { BLOCK_CONTENT_DEFAULTS } from '../data/blockDefaults'
import { EVENT_TYPES, eventType, eventTypeFor, nextFixedDate } from '../data/eventTypes'
import { invitationStarter } from '../data/invitations'
import { rsvpSidesStarter } from '../data/rsvpSides'
import { displayNameFromTitle, eventRequiresAge, formatEventDisplayTitle } from '../utils/eventTitle'
import { isEventLimitReached, notifyPlanChanged, usePlan } from '../utils/usePlan'
import {
  findTemplate,
  missingEventPageBlocks,
  normalizeBlockType,
  templateBlockContent,
  templateBlockHeading,
  templateBlockDefaults,
} from '../utils/templateTheme'

// Assistant de création en 5 étapes (repris du prototype creer.html) : univers, type,
// informations (logo compris), modèle, puis la page publiée. L'aperçu à droite montre la
// vraie page de l'invité ; le reste (programme, invités, billets…) se règle ensuite dans
// le Builder et le tableau de bord.
const STEPS = ['Univers', 'Type', 'Informations', 'Contenu', 'Modèle', 'Publier']

// Sections ajoutées à une nouvelle page si le modèle ne les a pas (réponse et programme).
const DEFAULT_OPTIONS = { checkin: true, program: true, gallery: false, ticketing: false, guestbook: false, searchable: false }
const DEFAULT_TIMEZONE = 'Africa/Douala (GMT+1)'

const EMPTY_FORM = {
  univers: null,
  type: null,
  template: null,
  name: '',
  display: '',
  organizer: '',
  logo: null,
  birthdayAge: '',
  date: '',
  timeStart: '',
  timeEnd: '',
  venueName: '',
  venueAddr: '',
  description: '',
  consent: false,
  searchable: false,
}

function parseJson(raw) {
  try {
    return JSON.parse(raw || '{}') ?? {}
  } catch {
    return {}
  }
}

const dayMonthYear = (iso) =>
  iso
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${iso}T12:00:00`))
    : ''

// Surtitre de la page : le type d'événement, puis la date.
const kickerFor = (type, date) => (type ? [type.label, dayMonthYear(date)].filter(Boolean).join(' · ') : '')
const isGeneratedKicker = (kicker) => !kicker?.trim() || EVENT_TYPES.some((t) => kicker.startsWith(t.label))
const displayTitleFor = (form, type) => {
  return formatEventDisplayTitle(type?.id, form.birthdayAge, form.display, form.name)
}

// Formulaire de départ : « Utiliser ce modèle » (?modele=) ou l'accueil du tableau de bord.
function initialForm(presetTemplate, onboarding) {
  const form = { ...EMPTY_FORM, name: onboarding?.name ?? '', date: onboarding?.date ?? '' }
  const type = presetTemplate
    ? (EVENT_TYPES.find((t) => t.templates.includes(presetTemplate.theme)) ??
      EVENT_TYPES.find((t) => t.categoryCode === presetTemplate.categoryCode))
    : onboarding?.category
      ? EVENT_TYPES.find((t) => t.label.toLowerCase() === String(onboarding.category).toLowerCase())
      : null
  if (!type) return form
  return { ...form, univers: type.univers, type: type.id, template: presetTemplate?.name ?? modelsForType(type)[0]?.name ?? null }
}

export default function CreateEvent() {
  const { id: eventId } = useParams()
  const isEditMode = Boolean(eventId)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [presetTemplate] = useState(() => (isEditMode ? null : findTemplate(searchParams.get('modele'))))
  const [form, setForm] = useState(() => (isEditMode ? EMPTY_FORM : initialForm(presetTemplate, location.state?.onboarding)))
  const [pageContent, setPageContent] = useState(() => templateBlockDefaults(findTemplate(form.template)))
  const [step, setStep] = useState(() => (isEditMode || form.type ? 2 : form.univers ? 1 : 0))
  const [errors, setErrors] = useState({})
  const [nudge, setNudge] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const [categories, setCategories] = useState([])
  const [loadingEvent, setLoadingEvent] = useState(isEditMode)
  const [loadError, setLoadError] = useState('')
  const [existing, setExisting] = useState({ custom: {}, location: null, blocks: [], categoryId: null })

  const [publishing, setPublishing] = useState('')
  const [publishError, setPublishError] = useState('')
  const [result, setResult] = useState(null)

  const { plan } = usePlan()
  const [upgrade, setUpgrade] = useState(null)
  const limitReached = !isEditMode && isEventLimitReached(plan)
  const canUsePremium = plan?.features?.premiumTemplates !== false
  const stepRef = useRef(null)

  const type = eventType(form.type)
  const template = findTemplate(form.template) ?? (type ? modelsForType(type)[0] : null)
  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }))

  useEffect(() => {
    listEventCategories()
      .then((data) => setCategories(data ?? []))
      .catch(() => setCategories([]))
  }, [])

  // Modification : on repart de l'événement enregistré, directement aux informations.
  useEffect(() => {
    if (!isEditMode) return
    let cancelled = false
    Promise.all([
      getEvent(eventId),
      listEventLocations(eventId).catch(() => []),
      listEventBlocks(eventId).catch(() => []),
      listEventCategories().catch(() => []),
    ])
      .then(([ev, locations, blocks, cats]) => {
        if (cancelled) return
        const custom = parseJson(ev.customFields)
        const hero = parseJson(blocks.find((b) => normalizeBlockType(b.blockType) === 'Hero')?.content)
        const loc = locations[0] ?? null
        const t = eventTypeFor(custom.eventType, cats.find((c) => c.id === ev.categoryId)?.code) ?? EVENT_TYPES.at(-1)
        const logoUrl = custom.organizer?.logoUrl
        setExisting({ custom, location: loc, blocks, categoryId: ev.categoryId, hero, event: ev })
        setForm({
          ...EMPTY_FORM,
          univers: t.univers,
          type: t.id,
          template: custom.template ?? null,
          name: ev.name ?? '',
          display: custom.display ?? (
            eventRequiresAge(t.id)
              ? displayNameFromTitle(hero.title) || (ev.name ?? '').replace(/^anniversaire(?:\s+de)?\s*/i, '').trim()
              : hero.title ?? ev.name ?? ''
          ),
          organizer: custom.organizer?.name ?? '',
          logo: logoUrl ? { url: logoUrl, preview: mediaUrl(logoUrl), label: 'Logo actuel' } : null,
          birthdayAge: custom.birthdayAge ? String(custom.birthdayAge) : '',
          date: ev.eventDate ?? '',
          timeStart: ev.startTime ? ev.startTime.slice(0, 5) : '',
          timeEnd: custom.timeEnd ?? '',
          venueName: loc?.label && loc.label !== 'Lieu principal' ? loc.label : '',
          venueAddr: loc?.address ?? '',
          description: custom.description ?? '',
          consent: true,
          searchable: Boolean(custom.options?.searchable),
        })
        setPageContent({
          ...templateBlockDefaults(findTemplate(custom.template)),
          ...Object.fromEntries(blocks.map((block) => [normalizeBlockType(block.blockType), parseJson(block.content)])),
        })
      })
      .catch((err) => !cancelled && setLoadError(err.message || "Impossible de charger l'événement."))
      .finally(() => !cancelled && setLoadingEvent(false))
    return () => {
      cancelled = true
    }
  }, [isEditMode, eventId])

  const draft = useMemo(
    () => ({
      title: displayTitleFor(form, type),
      kicker: kickerFor(type, form.date),
      description: form.description,
      eventDateTime: form.date && form.timeStart ? `${form.date}T${form.timeStart}:00` : '',
      locationLabel: form.venueName,
      locationAddress: form.venueAddr,
      organizer: form.organizer || form.logo ? { name: form.organizer, logoSrc: form.logo?.dataUrl ?? '' } : null,
    }),
    [form, type],
  )

  const infoValid = type && Object.keys(infoErrors(form, type)).length === 0
  const maxReachable = result ? 5 : !form.univers ? 0 : !form.type ? 1 : !infoValid ? 2 : 4

  const goTo = (n) => {
    setNudge('')
    setStep(n)
    requestAnimationFrame(() => {
      stepRef.current?.focus({ preventScroll: true })
      document.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const chooseUnivers = (univers) => {
    setForm((prev) => (prev.univers === univers ? prev : { ...prev, univers, type: null, template: null }))
    goTo(1)
  }
  const chooseType = (id) => {
    const t = eventType(id)
    const chosenTemplate = modelsForType(t)[0] ?? null
    setPageContent(templateBlockDefaults(chosenTemplate))
    setForm((prev) => ({
      ...prev,
      type: id,
      template: chosenTemplate?.name ?? null,
      birthdayAge: eventRequiresAge(id) && eventRequiresAge(prev.type) ? prev.birthdayAge : '',
      // Fête à date fixe (Noël, 20 mai…) : la prochaine date est proposée.
      date: prev.date || nextFixedDate(t.date),
    }))
    setNudge('')
  }

  const chooseTemplate = (name) => {
    const selected = findTemplate(name)
    update({ template: name })
    setPageContent((current) => ({ ...templateBlockDefaults(selected), ...current }))
  }

  const next = () => {
    if (step === 0 && !form.univers) return setNudge('Choisissez un univers pour continuer.')
    if (step === 1 && !form.type) return setNudge("Choisissez un type d'événement pour continuer.")
    if (step === 2) {
      const errs = infoErrors(form, type)
      setErrors(errs)
      const first = Object.keys(errs)[0]
      if (first) return document.getElementById(first === 'logo' ? 'f-logo' : `f-${first}`)?.focus()
    }
    if (step === 4) return publish('publish')
    goTo(Math.min(4, step + 1))
  }

  // Champ corrigé : son erreur disparaît.
  const updateInfo = (patch) => {
    update(patch)
    setErrors((prev) => {
      const nextErrors = { ...prev }
      for (const key of Object.keys(patch)) delete nextErrors[key]
      return nextErrors
    })
  }

  const publish = async (requested) => {
    setPublishError('')
    // Adresse pas encore confirmée : l'API refuserait la publication. On enregistre le
    // brouillon (sinon un nouvel essai créerait un second événement) et on explique pourquoi.
    const mustConfirmEmail = requested === 'publish' && getCurrentUser()?.emailVerified === false
    const status = mustConfirmEmail ? 'draft' : requested
    if (status === 'publish' && !form.date) {
      setPublishError('Ajoutez la date de votre événement avant de le publier. Vous pouvez enregistrer le brouillon sans date.')
      document.getElementById('f-date')?.focus()
      return
    }
    if (!form.consent) return setErrors({ consent: 'Cochez la case pour publier votre événement.' })
    if (template?.premium && !canUsePremium)
      return setPublishError('Ce modèle demande l’offre Premium. Activez-la ou choisissez un modèle gratuit.')
    const category = categories.find((c) => c.code === type.categoryCode) ?? categories.find((c) => c.code === 'autre')
    const categoryId = category?.id ?? existing.categoryId
    if (!categoryId) return setPublishError('Les catégories ne sont pas disponibles. Rechargez la page et réessayez.')

    setPublishing(requested)
    const warnings = mustConfirmEmail
      ? ["Confirmez votre adresse e-mail (lien reçu à l'inscription) pour publier : votre page est enregistrée en brouillon en attendant."]
      : []
    try {
      const hero = existing.hero ?? {}
      const customFields = (logoUrl) =>
        JSON.stringify({
          ...existing.custom,
          eventType: type.id,
          template: template?.name ?? null,
          display: form.display.trim(),
          birthdayAge: eventRequiresAge(type.id) && form.birthdayAge ? Number(form.birthdayAge) : null,
          description: form.description.trim(),
          timeEnd: form.timeEnd,
          timezone: existing.custom.timezone ?? DEFAULT_TIMEZONE,
          organizer: form.organizer.trim() || logoUrl ? { name: form.organizer.trim(), logoUrl: logoUrl ?? null } : null,
          options: { ...DEFAULT_OPTIONS, ...existing.custom.options, searchable: form.searchable },
        })
      const dto = {
        name: form.name.trim(),
        categoryId,
        eventDate: form.date || null,
        startTime: form.timeStart ? `${form.timeStart}:00` : null,
        // En modification, la couverture et les couleurs réglées ailleurs sont gardées.
        themeColor: existing.event?.themeColor ?? template?.preview?.accent ?? null,
        themeFont: existing.event?.themeFont ?? null,
        coverImageUrl: existing.event?.coverImageUrl ?? null,
        customFields: customFields(form.logo?.url),
      }

      const targetId = isEditMode ? eventId : (await createEvent(dto)).id

      let logoUrl = form.logo?.url ?? null
      if (form.logo?.file) {
        try {
          logoUrl = (await uploadEventBlockImage(targetId, form.logo.file)).url
          setForm((prev) => (prev.logo?.file === form.logo.file ? { ...prev, logo: { ...prev.logo, url: logoUrl, file: null } } : prev))
        } catch {
          logoUrl = null
          warnings.push("Le logo n'a pas pu être envoyé.")
        }
      }

      const saved = await updateEventApi(targetId, {
        ...dto,
        customFields: customFields(logoUrl),
        status: status === 'publish' ? 'Publie' : 'Brouillon',
      })

      try {
        const label = form.venueName.trim() || 'Lieu principal'
        if (existing.location && !form.venueName.trim() && !form.venueAddr.trim()) {
          await deleteEventLocation(existing.location.id)
        } else if (existing.location) {
          await updateEventLocation(existing.location.id, { label, address: form.venueAddr.trim(), position: existing.location.position })
        } else if (form.venueName.trim() || form.venueAddr.trim()) {
          await createEventLocation({ label, address: form.venueAddr.trim(), position: 0 }, targetId)
        }
      } catch {
        warnings.push("Le lieu n'a pas pu être enregistré.")
      }

      try {
        await composePage({ targetId, blocks: existing.blocks, template, hero, title: displayTitleFor(form, type), kicker: kickerFor(type, form.date), pageContent })
      } catch {
        warnings.push("Les sections de la page n'ont pas pu être toutes mises à jour.")
      }

      if (!isEditMode) notifyPlanChanged()
      setResult({ id: targetId, slug: saved?.slug ?? '', published: status === 'publish', warnings })
      goTo(4)
    } catch (err) {
      setPublishError(err.message || 'La publication a échoué.')
    } finally {
      setPublishing('')
    }
  }

  const restart = () => {
    setForm(EMPTY_FORM)
    setExisting({ custom: {}, location: null, blocks: [], categoryId: null })
    setResult(null)
    setErrors({})
    setPublishError('')
    if (isEditMode) navigate('/dashboard/evenements/nouveau')
    else goTo(0)
  }

  if (isEditMode && (loadingEvent || loadError)) {
    return (
      <DashboardLayout>
        {loadError ? (
          <>
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{loadError}</p>
            <Button variant="outline" className="mt-6" onClick={() => navigate('/dashboard/evenements')}>
              Retour à mes événements
            </Button>
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-border-soft py-20 text-center text-sm text-faint">
            Chargement de l'événement…
          </p>
        )}
      </DashboardLayout>
    )
  }

  const view =
    step === 0 ? (
      <UniversStep value={form.univers} onChange={chooseUnivers} />
    ) : step === 1 ? (
      <TypeStep univers={form.univers} value={form.type} onChange={chooseType} />
    ) : step === 2 && type ? (
      <InfoStep form={form} type={type} onChange={updateInfo} errors={errors} />
    ) : step === 3 && type ? (
      <ContentStep
        template={template}
        content={pageContent}
        onChange={(block, patch) => setPageContent((prev) => ({ ...prev, [block]: { ...(prev[block] ?? {}), ...patch } }))}
      />
    ) : step === 4 && type ? (
      <ModelStep
        type={type}
        selected={template?.name}
        onSelect={chooseTemplate}
        canUsePremium={canUsePremium}
        onUpgrade={() => setUpgrade('premium')}
        consent={form.consent}
        onConsent={(consent) => updateInfo({ consent })}
        consentError={errors.consent}
        searchable={form.searchable}
        onSearchable={(searchable) => update({ searchable })}
      />
    ) : step === 5 && result && type ? (
      <PublishedStep
        form={form}
        type={type}
        template={template}
        plan={plan}
        published={result.published}
        slug={result.slug}
        warnings={result.warnings}
        isEditMode={isEditMode}
        onUpgrade={() => setUpgrade('business')}
        onBuilder={() => navigate(`/builder/${result.id}`)}
        onRestart={restart}
        onEvents={() => navigate('/dashboard/evenements')}
      />
    ) : null

  return (
    <DashboardLayout>
      {limitReached && !result && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3">
          <p className="text-sm text-ink">
            Votre offre <b>{plan.planLabel}</b> permet {plan.maxEvents} événement{plan.maxEvents > 1 ? 's' : ''} et vous en avez
            déjà {plan.eventsUsed}. Archivez un événement ou passez à une offre supérieure pour publier celui-ci.
          </p>
          <Button variant="gradient" onClick={() => setUpgrade('premium')}>
            {plan.pendingRequest ? 'Voir ma demande' : 'Passer en Premium'}
          </Button>
        </div>
      )}
      <UpgradeDialog open={Boolean(upgrade)} onClose={() => setUpgrade(null)} plan={plan} initialPlanCode={upgrade} />

      <div className="mx-auto grid max-w-295 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="mb-5 flex items-start gap-3">
            <ol className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]" aria-label="Étapes de création">
              {STEPS.map((label, i) => (
                <li key={label} className="min-w-22 flex-1">
                  <button
                    type="button"
                    disabled={i > maxReachable || (result && i < 5) || i === 5}
                    aria-current={i === step ? 'step' : undefined}
                    onClick={() => goTo(i)}
                    className={`grid w-full gap-1.5 text-left disabled:cursor-default ${i === step ? 'text-ink' : 'text-muted'}`}
                  >
                    <span
                      className={`h-1 rounded-full ${
                        i <= step ? 'bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)]' : 'bg-border-soft'
                      }`}
                    />
                    <small className="font-mono text-[0.68rem] tracking-[0.06em] uppercase">Étape {i + 1}</small>
                    <span className="text-[0.85rem] font-semibold">{label}</span>
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              aria-controls="wizard-preview"
              aria-expanded={showPreview}
              onClick={() => setShowPreview((v) => !v)}
              className="min-h-9.5 flex-none rounded-xl border border-border-soft px-3.5 text-[0.85rem] font-semibold text-ink lg:hidden"
            >
              {showPreview ? "Masquer l'aperçu" : "Voir l'aperçu"}
            </button>
          </div>

          <div ref={stepRef} tabIndex={-1} className="outline-none">
            {view}
            {nudge && (
              <p className="mt-4 text-[0.82rem] text-danger" role="alert">
                {nudge}
              </p>
            )}
          </div>

          {step < 5 && (
            <div className="mt-7 border-t border-border-soft pt-5">
              {publishError && (
                <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
                  {publishError}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" onClick={() => goTo(Math.max(0, step - 1))} className={step === 0 ? 'invisible' : ''}>
                  Retour
                </Button>
                <div className="flex flex-wrap items-center gap-3">
                  {step === 4 && (
                    <Button variant="ghost" onClick={() => publish('draft')} disabled={Boolean(publishing)}>
                      {publishing === 'draft' ? 'Enregistrement…' : 'Enregistrer en brouillon'}
                    </Button>
                  )}
                  <Button variant="gradient" onClick={next} disabled={Boolean(publishing) || (step === 4 && limitReached)}>
                    {step === 4 ? (publishing === 'publish' ? 'Publication…' : isEditMode ? 'Enregistrer et publier' : 'Publier') : 'Continuer'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div id="wizard-preview" className="contents">
      <LivePreview template={template} draft={{ ...draft, blockContent: pageContent }} shown={showPreview} />
        </div>
      </div>
    </DashboardLayout>
  )
}

// Compose la page : le Hero (titre en grand, surtitre) et les sections manquantes du modèle.
// Le contenu déjà réglé dans le Builder est conservé.
async function composePage({ targetId, blocks, template, hero, title, kicker, pageContent = {} }) {
  const findBlock = (type) => blocks.find((b) => normalizeBlockType(b.blockType) === type)
  let nextPosition = Math.max(0, ...blocks.map((b) => b.position ?? 0)) + 1
  const upsert = async (type, patch) => {
    const found = findBlock(type)
    const content = JSON.stringify({ ...parseJson(found?.content), ...(pageContent[type] ?? {}), ...patch })
    if (found) {
      await updateEventBlock(found.id, { blockType: type, position: found.position, isVisible: found.isVisible, content })
    } else {
      await createEventBlock({ blockType: type, position: type === 'Hero' ? 0 : nextPosition++, isVisible: true, content }, targetId)
    }
  }

  // Surtitre réécrit seulement s'il vient de l'assistant (vide ou « Type · date ») :
  // celui choisi dans le Builder est gardé.
  await upsert('Hero', { title, ...(isGeneratedKicker(hero.kicker) && kicker && { kicker }) })

  for (const type of Object.keys(pageContent)) {
    if (type !== 'Hero' && findBlock(type)) await upsert(type, {})
  }

  const missingBlocks = missingEventPageBlocks(template, blocks)
  for (const type of missingBlocks.filter((block) => block !== 'Pied de page')) {
    const defaults = BLOCK_CONTENT_DEFAULTS[type] ?? {}
    await createEventBlock({
      blockType: type,
      position: nextPosition++,
      isVisible: true,
      content: JSON.stringify({
        ...templateBlockContent(template, type),
        ...(type === 'Invitation' && invitationStarter(template, title)),
        ...(type === 'RSVP' && rsvpSidesStarter(template?.theme)),
        ...(pageContent[type] ?? {}),
        heading: templateBlockHeading(template, type),
        showHeading: Boolean(defaults.showHeading),
        tinted: Boolean(defaults.tinted),
      }),
    }, targetId)
  }

  const existingRsvp = findBlock('RSVP')
  if (existingRsvp && !existingRsvp.isVisible) {
    await updateEventBlock(existingRsvp.id, {
      blockType: 'RSVP',
      position: existingRsvp.position,
      isVisible: true,
      content: JSON.stringify({ ...parseJson(existingRsvp.content), ...(pageContent.RSVP ?? {}) }),
    })
  }

  const footer = findBlock('Pied de page')
  if (footer) {
    await updateEventBlock(footer.id, {
      blockType: footer.blockType,
      position: nextPosition++,
      isVisible: footer.isVisible,
      content: footer.content,
    })
  } else if (missingBlocks.includes('Pied de page')) {
    const defaults = BLOCK_CONTENT_DEFAULTS['Pied de page']
    await createEventBlock({
      blockType: 'Pied de page',
      position: nextPosition,
      isVisible: true,
      content: JSON.stringify({
        ...templateBlockContent(template, 'Pied de page'),
        heading: templateBlockHeading(template, 'Pied de page'),
        showHeading: Boolean(defaults.showHeading),
        tinted: Boolean(defaults.tinted),
      }),
    }, targetId)
  }
}
