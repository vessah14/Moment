import { CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'
import {
  createEvent,
  getEvent,
  updateEvent as updateEventApi,
  uploadEventCoverImage
} from '../api/events'
import { mediaUrl } from '../api/client'
import { listEventCategories } from '../api/eventCategories'
import {
  createEventLocation,
  listEventLocations,
  updateEventLocation
} from '../api/eventLocations'
import {
  createEventBlock,
  listEventBlocks,
  updateEventBlock
} from '../api/eventBlocks'
import { createGuestGroup, listGuestGroups } from '../api/guestGroups'
import { createGuest } from '../api/guests'
import { createProgramItem } from '../api/program'
import { createTicketType } from '../api/ticketing'
import DashboardLayout from '../components/layout/DashboardLayout'
import UpgradeDialog from '../components/plan/UpgradeDialog'
import Button from '../components/ui/Button'
import CategoryStep from '../components/wizard/CategoryStep'
import EventPreviewPanel from '../components/wizard/EventPreviewPanel'
import InformationsStep from '../components/wizard/InformationsStep'
import InvitesStep from '../components/wizard/InvitesStep'
import OptionsStep from '../components/wizard/OptionsStep'
import PersonalizationStep from '../components/wizard/PersonalizationStep'
import PublicationStep from '../components/wizard/PublicationStep'
import StepProgress from '../components/wizard/StepProgress'
import TemplateContentStep from '../components/wizard/TemplateContentStep'
import TemplateStep from '../components/wizard/TemplateStep'
import { BLOCK_CONTENT_DEFAULTS } from '../data/blockDefaults'
import {
  blockContentToSave,
  CONTENT_BLOCKS,
  programItemsToCreate,
  ticketTypesToCreate
} from '../utils/templateContent'
import { notifyGuestsChanged } from '../utils/guestEvents'
import { isEventLimitReached, notifyPlanChanged, usePlan } from '../utils/usePlan'
import {
  findTemplate,
  normalizeBlockType,
  templateBlockContent,
  templateBlockHeading,
  templateBlocks,
  templateMatchesCategory
} from '../utils/templateTheme'

const STEPS = [
  "Type d'événement",
  'Informations générales',
  'Choix du template',
  'Contenu du modèle',
  'Personnalisation',
  'Invités',
  'Options',
  'Aperçu & Publication'
]

// Options de l'assistant qui ajoutent leur section au site si le modèle ne l'a pas.
const OPTION_BLOCKS = [
  ['gallery', 'Galerie'],
  ['ticketing', 'Billetterie'],
  ['guestbook', "Livre d'or"]
]

const INITIAL_EVENT = {
  name: '',
  location: '',
  date: '',
  timeStart: '',
  timeEnd: '',
  timezone: 'Europe/Paris (GMT+1)',
  description: '',
  category: '',
  categoryId: null,
  template: null,
  coverImage: null,
  coverImageUrl: null,
  coverImageFile: null,
  coverImageIsLocal: false,
  themeColor: '#6549e8',
  tagline: '',
  birthdayAge: '',
  // Contenu propre au modèle (étape « Contenu du modèle ») : sections du site, accroche
  // et palette de l'en-tête, activités du programme et billets créés à la publication.
  kicker: '',
  palette: null,
  blockContent: {},
  programItems: [],
  ticketTypes: [],
  guests: [],
  options: {
    checkin: true,
    program: true,
    gallery: false,
    ticketing: false,
    guestbook: false,
    // Privé par défaut : le site n'est indexé par les moteurs que sur choix explicite.
    searchable: false
  },
  plan: 'FREE'
}

function parseCustomFields (json) {
  try {
    return JSON.parse(json ?? '{}') ?? {}
  } catch {
    return {}
  }
}

export default function CreateEvent () {
  const { id: eventId } = useParams()
  const isEditMode = Boolean(eventId)
  const navigate = useNavigate()
  const location = useLocation()
  const onboarding = location.state?.onboarding
  // "Utiliser ce modèle" depuis la bibliothèque : /dashboard/evenements/nouveau?modele=Éclat
  const [searchParams] = useSearchParams()
  const presetTemplate = isEditMode
    ? null
    : findTemplate(searchParams.get('modele'))
  // En édition, la catégorie est déjà connue : on saute l'étape 0 pour ne pas
  // forcer une re-sélection inutile à chaque petite modification.
  const [currentStep, setCurrentStep] = useState(isEditMode ? 1 : 0)
  const [event, setEvent] = useState(() => {
    const base = onboarding
      ? {
          ...INITIAL_EVENT,
          ...(onboarding.category && { category: onboarding.category }),
          ...(onboarding.name && { name: onboarding.name }),
          ...(onboarding.date && { date: onboarding.date })
        }
      : INITIAL_EVENT
    return presetTemplate
      ? {
          ...base,
          template: presetTemplate.name,
          // Résolu en categoryId dès que les catégories sont chargées (voir plus bas).
          presetCategoryCode: base.category ? null : presetTemplate.categoryCode
        }
      : base
  })
  const [visibility, setVisibility] = useState('publish')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishedSlug, setPublishedSlug] = useState('')
  const [publishedEventId, setPublishedEventId] = useState('')
  const [publishError, setPublishError] = useState('')
  const [publishWarnings, setPublishWarnings] = useState([])
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [loadingEvent, setLoadingEvent] = useState(isEditMode)
  const [loadError, setLoadError] = useState('')
  const [existingLocation, setExistingLocation] = useState(null)
  const [existingBlocks, setExistingBlocks] = useState([])
  // Limite d'événements de l'offre : prévenir dès le début plutôt qu'à la publication.
  const plan = usePlan()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const limitReached = !isEditMode && isEventLimitReached(plan)

  useEffect(() => {
    listEventCategories()
      .then(data => setCategories(data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false))
  }, [])

  useEffect(() => {
    if (!isEditMode) return
    let cancelled = false
    Promise.all([
      getEvent(eventId),
      listEventLocations(eventId).catch(() => []),
      listEventBlocks(eventId).catch(() => [])
    ])
      .then(([eventData, locations, blocks]) => {
        if (cancelled) return
        const custom = parseCustomFields(eventData.customFields)
        const blockJson = type =>
          parseCustomFields(
            blocks.find(b => normalizeBlockType(b.blockType) === type)?.content
          )
        const heroContent = blockJson('Hero')
        const blockContent = Object.fromEntries(
          CONTENT_BLOCKS.filter(type =>
            blocks.some(b => normalizeBlockType(b.blockType) === type)
          ).map(type => [type, blockJson(type)])
        )
        setEvent(prev => ({
          ...prev,
          name: eventData.name,
          categoryId: eventData.categoryId,
          date: eventData.eventDate ?? '',
          timeStart: eventData.startTime ? eventData.startTime.slice(0, 5) : '',
          themeColor: eventData.themeColor || prev.themeColor,
          coverImage: eventData.coverImageUrl
            ? mediaUrl(eventData.coverImageUrl)
            : null,
          coverImageUrl: eventData.coverImageUrl ?? null,
          coverImageFile: null,
          coverImageIsLocal: false,
          location: locations[0]?.address ?? '',
          description: custom.description ?? '',
          tagline: custom.tagline ?? '',
          birthdayAge: custom.birthdayAge == null ? '' : String(custom.birthdayAge),
          timeEnd: custom.timeEnd ?? '',
          timezone: custom.timezone ?? prev.timezone,
          template: custom.template ?? null,
          kicker: heroContent.kicker ?? '',
          palette: heroContent.palette ?? null,
          blockContent,
          options: { ...prev.options, ...(custom.options ?? {}) }
        }))
        setVisibility(eventData.status === 'Publie' ? 'publish' : 'draft')
        setExistingLocation(locations[0] ?? null)
        setExistingBlocks(blocks)
      })
      .catch(err => {
        if (!cancelled)
          setLoadError(err.message || "Impossible de charger l'événement.")
      })
      .finally(() => {
        if (!cancelled) setLoadingEvent(false)
      })
    return () => {
      cancelled = true
    }
  }, [isEditMode, eventId])

  useEffect(() => {
    if (!isEditMode || categoriesLoading || !event.categoryId) return
    const match = categories.find(c => c.id === event.categoryId)
    if (match && event.category !== match.label) {
      setEvent(prev => ({ ...prev, category: match.label }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, categoriesLoading, categories, event.categoryId])

  // Catégorie connue sans son identifiant (modèle présélectionné → code, onboarding →
  // libellé) : on la retrouve dès que la liste des catégories est chargée.
  useEffect(() => {
    if (isEditMode || categoriesLoading || event.categoryId) return
    if (!event.presetCategoryCode && !event.category) return
    const match =
      categories.find(
        c => event.presetCategoryCode && c.code === event.presetCategoryCode
      ) ??
      categories.find(
        c =>
          event.category &&
          c.label.toLowerCase() === event.category.toLowerCase()
      )
    if (match)
      setEvent(prev => ({
        ...prev,
        categoryId: match.id,
        category: match.label,
        presetCategoryCode: null
      }))
  }, [
    isEditMode,
    categoriesLoading,
    categories,
    event.categoryId,
    event.category,
    event.presetCategoryCode
  ])

  const selectedCategory =
    categories.find(c => c.id === event.categoryId) ?? null
  const selectedCategoryCode = selectedCategory?.code ?? null

  const handleCategorySelect = category => {
    const selectedTemplate = findTemplate(event.template)
    updateEvent({
      categoryId: category.id,
      category: category.label,
      template:
        selectedTemplate &&
        !templateMatchesCategory(
          selectedTemplate,
          category.code,
          category.label
        )
          ? null
          : event.template
    })
  }

  const updateEvent = patch => setEvent(prev => ({ ...prev, ...patch }))

  const canGoBack = currentStep > 0
  const isPublicationStep = currentStep === STEPS.length - 1
  const canContinue = currentStep !== 0 || Boolean(event.categoryId)

  const publishedEventName = event.birthdayAge && selectedCategoryCode === 'anniversaire'
    ? `Les ${event.birthdayAge} ans de ${(event.birthdayName || event.name).replace(/^Les\s+\d+\s+ans\s+de\s*/i, '').trim()}`
    : event.name

  const handlePublish = async targetVisibility => {
    setPublishError('')
    setPublishWarnings([])

    if (!event.categoryId) {
      setPublishError("Sélectionnez d'abord une catégorie d'événement.")
      return
    }

    setVisibility(targetVisibility)
    setPublishing(true)
    const warnings = []
    try {
      const dto = {
        name: publishedEventName,
        categoryId: event.categoryId,
        eventDate: event.date || null,
        startTime: event.timeStart ? `${event.timeStart}:00` : null,
        coverImageUrl: event.coverImageUrl,
        themeColor: event.themeColor || null,
        themeFont: null,
        customFields: JSON.stringify({
          description: event.description,
          tagline: event.tagline,
          birthdayAge: event.birthdayAge ? Number(event.birthdayAge) : null,
          timeEnd: event.timeEnd,
          timezone: event.timezone,
          template: event.template,
          options: event.options
        })
      }

      const targetId = isEditMode ? eventId : (await createEvent(dto)).id

      if (event.coverImageFile) {
        try {
          const { url } = await uploadEventCoverImage(
            targetId,
            event.coverImageFile
          )
          dto.coverImageUrl = url
        } catch {
          warnings.push("L'image de couverture n'a pas pu être envoyée.")
        }
      }

      const updatedEvent = await updateEventApi(targetId, {
        ...dto,
        status: targetVisibility === 'publish' ? 'Publie' : 'Brouillon'
      })
      setPublishedSlug(updatedEvent?.slug ?? '')
      setPublishedEventId(targetId)

      if (event.location) {
        try {
          if (existingLocation) {
            await updateEventLocation(existingLocation.id, {
              label: existingLocation.label,
              address: event.location,
              position: existingLocation.position
            })
          } else {
            await createEventLocation(
              { label: 'Lieu principal', address: event.location, position: 0 },
              targetId
            )
          }
        } catch {
          warnings.push("Le lieu n'a pas pu être enregistré.")
        }
      }

      try {
        const findBlock = type =>
          existingBlocks.find(b => normalizeBlockType(b.blockType) === type)
        // Position unique par événement : le Hero occupe 0, les autres blocs suivent.
        let nextPosition =
          Math.max(0, ...existingBlocks.map(b => b.position)) + 1
        const parseBlockContent = raw => {
          try {
            return JSON.parse(raw || '{}') ?? {}
          } catch {
            return {}
          }
        }
        // Fusionne avec le contenu existant au lieu de l'écraser : le Builder peut avoir
        // enregistré des réglages (couleur, police, sous-titre...) qu'un simple aller-retour
        // dans cet assistant ne doit jamais effacer.
        const upsertBlockMerge = async (type, patch) => {
          const existing = findBlock(type)
          const content = JSON.stringify({
            ...parseBlockContent(existing?.content),
            ...patch
          })
          if (existing) {
            await updateEventBlock(existing.id, {
              blockType: type,
              position: existing.position,
              isVisible: true,
              content
            })
          } else {
            await createEventBlock(
              {
                blockType: type,
                position: type === 'Hero' ? 0 : nextPosition++,
                isVisible: true,
                content
              },
              targetId
            )
          }
        }

        // Le sous-titre affiché publiquement (event.tagline) est déjà persisté au niveau de
        // l'événement (CustomFields) et lu en repli par la page publique — inutile et risqué
        // de le dupliquer ici avec une clé différente ("tagline" vs "subtitle" côté Builder).
        const chosenTemplate = findTemplate(event.template)
        // Modèle premium : accroche et palette de l'en-tête choisies dans l'assistant
        // (laissées telles quelles si rien n'a été choisi, pour ne pas écraser le Builder).
        await upsertBlockMerge('Hero', {
          title: publishedEventName,
          ...(chosenTemplate?.theme && event.kicker?.trim() && { kicker: event.kicker.trim() }),
          ...(chosenTemplate?.theme && event.palette && { palette: event.palette })
        })

        // Page encore vide : on la compose d'après le modèle choisi, avec ses titres de
        // section et le contenu saisi à l'étape « Contenu du modèle ». Les données réelles
        // (programme, galerie...) sont lues depuis leurs tables.
        const pageBlocks = existingBlocks.some(b => b.blockType !== 'Hero')
          ? []
          : [...templateBlocks(chosenTemplate)]
        // Sections demandées par les options mais absentes du modèle : insérées avant le
        // pied de page (jamais après), dans l'ordre habituel.
        if (pageBlocks.length > 0) {
          const footer = pageBlocks.indexOf('Pied de page')
          const insertAt = footer === -1 ? pageBlocks.length : footer
          const extra = [
            event.options?.program && !pageBlocks.includes('Programme') && 'Programme',
            event.options?.checkin && !pageBlocks.includes('RSVP') && 'RSVP',
            ...OPTION_BLOCKS.filter(([key, type]) => event.options?.[key] && !pageBlocks.includes(type)).map(
              ([, type]) => type
            )
          ].filter(Boolean)
          pageBlocks.splice(insertAt, 0, ...extra)
        }
        for (const type of pageBlocks) {
          const defaults = BLOCK_CONTENT_DEFAULTS[type] ?? {}
          await upsertBlockMerge(type, {
            ...templateBlockContent(chosenTemplate, type),
            heading: templateBlockHeading(chosenTemplate, type),
            showHeading: Boolean(defaults.showHeading),
            tinted: Boolean(defaults.tinted),
            ...blockContentToSave(type, event.blockContent?.[type])
          })
        }
        // Page déjà composée (modification) : le contenu modifié est fusionné dans les
        // sections existantes.
        for (const [type, content] of Object.entries(event.blockContent ?? {})) {
          if (!pageBlocks.includes(type) && findBlock(type))
            await upsertBlockMerge(type, blockContentToSave(type, content))
        }
        const pageHas = type => findBlock(type) || pageBlocks.includes(type)
        if (event.options?.program && !pageHas('Programme'))
          await upsertBlockMerge('Programme', {})
        if (event.options?.checkin && !pageHas('RSVP'))
          await upsertBlockMerge('RSVP', {})
        for (const [key, type] of OPTION_BLOCKS)
          if (event.options?.[key] && !pageHas(type)) await upsertBlockMerge(type, {})
      } catch {
        warnings.push(
          "Les sections de la page n'ont pas pu être toutes mises à jour."
        )
      }

      // Programme et billets saisis à l'étape « Contenu du modèle » (création uniquement :
      // en modification, ils se gèrent dans leurs menus du tableau de bord).
      if (!isEditMode) {
        for (const dto of programItemsToCreate(event.programItems, event.date)) {
          try {
            await createProgramItem(dto, targetId)
          } catch {
            warnings.push(`L'activité « ${dto.title} » n'a pas pu être ajoutée au programme.`)
          }
        }
        for (const dto of ticketTypesToCreate(event.ticketTypes)) {
          try {
            await createTicketType(dto, targetId)
          } catch {
            warnings.push(`Le billet « ${dto.name} » n'a pas pu être créé.`)
          }
        }
      }

      if (event.guests?.length) {
        const groupIdByName = new Map()
        const existingGroups = await listGuestGroups(targetId).catch(() => [])
        for (const g of existingGroups) groupIdByName.set(g.name, g.id)

        for (const groupName of new Set(event.guests.map(g => g.group))) {
          if (
            !groupName ||
            groupName === 'Sans groupe' ||
            groupIdByName.has(groupName)
          )
            continue
          try {
            const group = await createGuestGroup({ name: groupName }, targetId)
            groupIdByName.set(groupName, group.id)
          } catch {
            warnings.push(`Le groupe « ${groupName} » n'a pas pu être créé.`)
          }
        }

        for (const guest of event.guests) {
          try {
            await createGuest(
              { fullName: guest.name, phone: guest.phone, email: guest.email, sendInvitation: event.sendInvitations !== false },
              { eventId: targetId, groupId: groupIdByName.get(guest.group) }
            )
          } catch {
            warnings.push(`${guest.name} n'a pas pu être ajouté(e).`)
          }
        }
      }

      if (event.guests?.length) notifyGuestsChanged()
      if (!isEditMode) notifyPlanChanged()
      setPublishWarnings(warnings)
      setPublished(true)
    } catch (err) {
      setPublishError(err.message || 'La publication a échoué.')
    } finally {
      setPublishing(false)
    }
  }

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <CategoryStep
            categories={categories}
            loading={categoriesLoading}
            selectedId={event.categoryId}
            onSelect={handleCategorySelect}
          />
        )
      case 1:
        return <InformationsStep event={event} onChange={setEvent} categoryCode={selectedCategoryCode} selectedTemplate={event.template} />
      case 2:
        return (
          <TemplateStep
            categoryCode={selectedCategoryCode}
            categoryLabel={selectedCategory?.label}
            selected={event.template}
            // Chaque modèle premium a ses propres palettes : on repart de la sienne.
            onSelect={template =>
              updateEvent(template === event.template ? { template } : { template, palette: null })
            }
          />
        )
      case 3:
        return <TemplateContentStep event={event} onChange={setEvent} isEditMode={isEditMode} />
      case 4:
        return <PersonalizationStep event={event} onChange={setEvent} />
      case 5:
        return <InvitesStep event={event} onChange={setEvent} />
      case 6:
        return <OptionsStep event={event} onChange={setEvent} />
      case 7:
        return (
          <PublicationStep
            event={{ ...event, name: publishedEventName }}
            visibility={visibility}
            onChangeVisibility={setVisibility}
            publishing={publishing}
            onPublish={handlePublish}
            error={publishError}
            isEditMode={isEditMode}
          />
        )
      default:
        return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentStep,
    event,
    visibility,
    publishing,
    publishError,
    categories,
    categoriesLoading
  ])

  if (isEditMode && loadingEvent) {
    return (
      <DashboardLayout>
        <p className='rounded-2xl border border-dashed border-border-soft py-20 text-center text-sm text-faint'>
          Chargement de l'événement…
        </p>
      </DashboardLayout>
    )
  }

  if (isEditMode && loadError) {
    return (
      <DashboardLayout>
        <p className='rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger'>
          {loadError}
        </p>
        <Button
          variant='outline'
          className='mt-6'
          onClick={() => navigate('/dashboard/evenements')}
        >
          Retour à mes événements
        </Button>
      </DashboardLayout>
    )
  }

  if (published) {
    return (
      <DashboardLayout>
        <div className='mx-auto flex max-w-lg flex-col items-center py-20 text-center'>
          <span className='flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success'>
            <CheckCircle2 className='h-8 w-8' />
          </span>
          <h1 className='mt-6 text-2xl font-bold text-ink'>
            {isEditMode
              ? 'Événement mis à jour !'
              : visibility === 'publish'
              ? 'Événement publié !'
              : 'Brouillon enregistré !'}
          </h1>
          <p className='mt-2 text-sm text-muted'>
            {visibility === 'publish'
              ? 'Votre mini-site est en ligne et prêt à être partagé à vos invités.'
              : 'Vous pouvez reprendre et publier votre événement à tout moment.'}
          </p>

          {publishWarnings.length > 0 && (
            <div className='mt-4 w-full rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-left text-sm text-brand-orange'>
              <p className='font-medium'>C'est enregistré, mais :</p>
              <ul className='mt-1 list-disc space-y-0.5 pl-5'>
                {publishWarnings.map(w => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className='mt-8 flex flex-wrap justify-center gap-3'>
            {visibility === 'publish' && publishedSlug && (
              <Button
                as='a'
                href={`/e/${publishedSlug}`}
                target='_blank'
                rel='noopener noreferrer'
                variant='gradient'
              >
                Voir mon mini-site
              </Button>
            )}
            {publishedEventId && (
              <Button
                variant={
                  visibility === 'publish' && publishedSlug
                    ? 'outline'
                    : 'gradient'
                }
                onClick={() => navigate(`/builder/${publishedEventId}`)}
              >
                Personnaliser dans le Builder
              </Button>
            )}
            <Button
              variant='outline'
              onClick={() => navigate('/dashboard/evenements')}
            >
              Retour à mes événements
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {limitReached && (
        <div className='mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3'>
          <p className='text-sm text-ink'>
            Votre offre <b>{plan.planLabel}</b> permet {plan.maxEvents} événement{plan.maxEvents > 1 ? 's' : ''} et vous en avez
            déjà {plan.eventsUsed}. Archivez un événement ou passez à une offre supérieure pour publier celui-ci.
          </p>
          <Button variant='gradient' onClick={() => setUpgradeOpen(true)}>
            {plan.pendingRequest ? 'Voir ma demande' : 'Passer en Premium'}
          </Button>
        </div>
      )}
      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} plan={plan} />
      <StepProgress
        currentStep={currentStep}
        totalSteps={STEPS.length}
        stepLabel={STEPS[currentStep]}
      />

      <div className='mt-8'>
        {isPublicationStep ? (
          stepContent
        ) : (
          <div className='grid gap-10 lg:grid-cols-[2fr_1fr]'>
            {stepContent}
            <EventPreviewPanel event={event} />
          </div>
        )}
      </div>

      {!isPublicationStep && (
        <div className='mt-10 flex items-center justify-between border-t border-border-soft pt-6'>
          <Button
            variant='ghost'
            disabled={!canGoBack}
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            className='disabled:pointer-events-none disabled:opacity-40'
          >
            Retour
          </Button>
          <div className='flex items-center gap-4'>
            {currentStep === 0 && (
              <button
                type='button'
                onClick={() => setCurrentStep(1)}
                className='text-sm text-muted hover:text-ink hover:underline'
              >
                Passer cette étape
              </button>
            )}
            <Button
              variant='gradient'
              disabled={!canContinue}
              onClick={() =>
                setCurrentStep(s => Math.min(STEPS.length - 1, s + 1))
              }
              className='disabled:pointer-events-none disabled:opacity-40'
            >
              Continuer
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
