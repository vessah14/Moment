import { CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  createEvent,
  getEvent,
  updateEvent as updateEventApi,
  uploadEventCoverImage,
} from '../api/events'
import { API_ORIGIN } from '../api/client'
import { listEventCategories } from '../api/eventCategories'
import {
  createEventLocation,
  listEventLocations,
  updateEventLocation,
} from '../api/eventLocations'
import { createEventBlock, listEventBlocks, updateEventBlock } from '../api/eventBlocks'
import { createGuestGroup, listGuestGroups } from '../api/guestGroups'
import { createGuest } from '../api/guests'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import CategoryStep from '../components/wizard/CategoryStep'
import EventPreviewPanel from '../components/wizard/EventPreviewPanel'
import InformationsStep from '../components/wizard/InformationsStep'
import InvitesStep from '../components/wizard/InvitesStep'
import OptionsStep from '../components/wizard/OptionsStep'
import PersonalizationStep from '../components/wizard/PersonalizationStep'
import PublicationStep from '../components/wizard/PublicationStep'
import StepProgress from '../components/wizard/StepProgress'
import TemplateStep from '../components/wizard/TemplateStep'

const STEPS = [
  "Type d'événement",
  'Informations générales',
  'Choix du template',
  'Personnalisation',
  'Invités',
  'Options',
  'Aperçu & Publication',
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
  guests: [],
  options: {
    checkin: true,
    program: true,
    gallery: true,
    ticketing: false,
    guestbook: false,
  },
  plan: 'FREE',
}

function parseCustomFields(json) {
  try {
    return JSON.parse(json ?? '{}') ?? {}
  } catch {
    return {}
  }
}

export default function CreateEvent() {
  const { id: eventId } = useParams()
  const isEditMode = Boolean(eventId)
  const navigate = useNavigate()
  const location = useLocation()
  const onboarding = location.state?.onboarding
  // En édition, la catégorie est déjà connue : on saute l'étape 0 pour ne pas
  // forcer une re-sélection inutile à chaque petite modification.
  const [currentStep, setCurrentStep] = useState(isEditMode ? 1 : 0)
  const [event, setEvent] = useState(() =>
    onboarding
      ? {
          ...INITIAL_EVENT,
          ...(onboarding.category && { category: onboarding.category }),
          ...(onboarding.name && { name: onboarding.name }),
          ...(onboarding.date && { date: onboarding.date }),
        }
      : INITIAL_EVENT,
  )
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

  useEffect(() => {
    listEventCategories()
      .then((data) => setCategories(data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false))
  }, [])

  useEffect(() => {
    if (!isEditMode) return
    let cancelled = false
    Promise.all([
      getEvent(eventId),
      listEventLocations(eventId).catch(() => []),
      listEventBlocks(eventId).catch(() => []),
    ])
      .then(([eventData, locations, blocks]) => {
        if (cancelled) return
        const custom = parseCustomFields(eventData.customFields)
        setEvent((prev) => ({
          ...prev,
          name: eventData.name,
          categoryId: eventData.categoryId,
          date: eventData.eventDate ?? '',
          timeStart: eventData.startTime ? eventData.startTime.slice(0, 5) : '',
          themeColor: eventData.themeColor || prev.themeColor,
          coverImage: eventData.coverImageUrl ? `${API_ORIGIN}${eventData.coverImageUrl}` : null,
          coverImageUrl: eventData.coverImageUrl ?? null,
          coverImageFile: null,
          coverImageIsLocal: false,
          location: locations[0]?.address ?? '',
          description: custom.description ?? '',
          tagline: custom.tagline ?? '',
          timeEnd: custom.timeEnd ?? '',
          timezone: custom.timezone ?? prev.timezone,
          template: custom.template ?? null,
          options: { ...prev.options, ...(custom.options ?? {}) },
        }))
        setVisibility(eventData.status === 'Publie' ? 'publish' : 'draft')
        setExistingLocation(locations[0] ?? null)
        setExistingBlocks(blocks)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Impossible de charger l'événement.")
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
    const match = categories.find((c) => c.id === event.categoryId)
    if (match && event.category !== match.label) {
      setEvent((prev) => ({ ...prev, category: match.label }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, categoriesLoading, categories, event.categoryId])

  const updateEvent = (patch) => setEvent((prev) => ({ ...prev, ...patch }))

  const canGoBack = currentStep > 0
  const isPublicationStep = currentStep === STEPS.length - 1
  const canContinue = currentStep !== 0 || Boolean(event.categoryId)

  const handlePublish = async (targetVisibility) => {
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
        name: event.name,
        categoryId: event.categoryId,
        eventDate: event.date || null,
        startTime: event.timeStart ? `${event.timeStart}:00` : null,
        coverImageUrl: event.coverImageUrl,
        themeColor: event.themeColor || null,
        themeFont: null,
        customFields: JSON.stringify({
          description: event.description,
          tagline: event.tagline,
          timeEnd: event.timeEnd,
          timezone: event.timezone,
          template: event.template,
          options: event.options,
        }),
      }

      const targetId = isEditMode ? eventId : (await createEvent(dto)).id

      if (event.coverImageFile) {
        try {
          const { url } = await uploadEventCoverImage(targetId, event.coverImageFile)
          dto.coverImageUrl = url
        } catch {
          warnings.push("L'image de couverture n'a pas pu être envoyée.")
        }
      }

      const updatedEvent = await updateEventApi(targetId, {
        ...dto,
        status: targetVisibility === 'publish' ? 'Publie' : 'Brouillon',
      })
      setPublishedSlug(updatedEvent?.slug ?? '')
      setPublishedEventId(targetId)

      if (event.location) {
        try {
          if (existingLocation) {
            await updateEventLocation(existingLocation.id, {
              label: existingLocation.label,
              address: event.location,
              position: existingLocation.position,
            })
          } else {
            await createEventLocation(
              { label: 'Lieu principal', address: event.location, position: 0 },
              targetId,
            )
          }
        } catch {
          warnings.push("Le lieu n'a pas pu être enregistré.")
        }
      }

      try {
        const findBlock = (type) => existingBlocks.find((b) => b.blockType === type)
        const parseBlockContent = (raw) => {
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
          const content = JSON.stringify({ ...parseBlockContent(existing?.content), ...patch })
          if (existing) {
            await updateEventBlock(existing.id, {
              blockType: type,
              position: existing.position,
              isVisible: true,
              content,
            })
          } else {
            await createEventBlock(
              { blockType: type, position: existingBlocks.length, isVisible: true, content },
              targetId,
            )
          }
        }

        // Le sous-titre affiché publiquement (event.tagline) est déjà persisté au niveau de
        // l'événement (CustomFields) et lu en repli par la page publique — inutile et risqué
        // de le dupliquer ici avec une clé différente ("tagline" vs "subtitle" côté Builder).
        await upsertBlockMerge('Hero', { title: event.name })
        if (event.options?.program) await upsertBlockMerge('Programme', {})
        if (event.options?.checkin) await upsertBlockMerge('Rsvp', {})
      } catch {
        warnings.push("Les sections de la page n'ont pas pu être toutes mises à jour.")
      }

      if (event.guests?.length) {
        const groupIdByName = new Map()
        const existingGroups = await listGuestGroups(targetId).catch(() => [])
        for (const g of existingGroups) groupIdByName.set(g.name, g.id)

        for (const groupName of new Set(event.guests.map((g) => g.group))) {
          if (!groupName || groupName === 'Sans groupe' || groupIdByName.has(groupName)) continue
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
              { fullName: guest.name, phone: guest.phone, email: guest.email },
              { eventId: targetId, groupId: groupIdByName.get(guest.group) },
            )
          } catch {
            warnings.push(`${guest.name} n'a pas pu être ajouté(e).`)
          }
        }
      }

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
            onSelect={(category) =>
              updateEvent({ categoryId: category.id, category: category.label })
            }
          />
        )
      case 1:
        return <InformationsStep event={event} onChange={setEvent} />
      case 2:
        return (
          <TemplateStep
            category={event.category}
            selected={event.template}
            onSelect={(template) => updateEvent({ template })}
          />
        )
      case 3:
        return <PersonalizationStep event={event} onChange={setEvent} />
      case 4:
        return <InvitesStep event={event} onChange={setEvent} />
      case 5:
        return <OptionsStep event={event} onChange={setEvent} />
      case 6:
        return (
          <PublicationStep
            event={event}
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
  }, [currentStep, event, visibility, publishing, publishError, categories, categoriesLoading])

  if (isEditMode && loadingEvent) {
    return (
      <DashboardLayout>
        <p className="rounded-2xl border border-dashed border-border-soft py-20 text-center text-sm text-faint">
          Chargement de l'événement…
        </p>
      </DashboardLayout>
    )
  }

  if (isEditMode && loadError) {
    return (
      <DashboardLayout>
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {loadError}
        </p>
        <Button variant="outline" className="mt-6" onClick={() => navigate('/dashboard/evenements')}>
          Retour à mes événements
        </Button>
      </DashboardLayout>
    )
  }

  if (published) {
    return (
      <DashboardLayout>
        <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-ink">
            {isEditMode
              ? 'Événement mis à jour !'
              : visibility === 'publish'
                ? 'Événement publié !'
                : 'Brouillon enregistré !'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {visibility === 'publish'
              ? 'Votre mini-site est en ligne et prêt à être partagé à vos invités.'
              : 'Vous pouvez reprendre et publier votre événement à tout moment.'}
          </p>

          {publishWarnings.length > 0 && (
            <div className="mt-4 w-full rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-left text-sm text-brand-orange">
              <p className="font-medium">C'est enregistré, mais :</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {publishWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {visibility === 'publish' && publishedSlug && (
              <Button as="a" href={`/e/${publishedSlug}`} target="_blank" rel="noopener noreferrer" variant="gradient">
                Voir mon mini-site
              </Button>
            )}
            {publishedEventId && (
              <Button
                variant={visibility === 'publish' && publishedSlug ? 'outline' : 'gradient'}
                onClick={() => navigate(`/builder/${publishedEventId}`)}
              >
                Personnaliser dans le Builder
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/dashboard/evenements')}>
              Retour à mes événements
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <StepProgress currentStep={currentStep} totalSteps={STEPS.length} stepLabel={STEPS[currentStep]} />

      <div className="mt-8">
        {isPublicationStep ? (
          stepContent
        ) : (
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            {stepContent}
            <EventPreviewPanel event={event} />
          </div>
        )}
      </div>

      {!isPublicationStep && (
        <div className="mt-10 flex items-center justify-between border-t border-border-soft pt-6">
          <Button
            variant="ghost"
            disabled={!canGoBack}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            className="disabled:pointer-events-none disabled:opacity-40"
          >
            Retour
          </Button>
          <div className="flex items-center gap-4">
            {currentStep === 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-sm text-muted hover:text-ink hover:underline"
              >
                Passer cette étape
              </button>
            )}
            <Button
              variant="gradient"
              disabled={!canContinue}
              onClick={() =>
                setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))
              }
              className="disabled:pointer-events-none disabled:opacity-40"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
