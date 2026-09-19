import { CheckCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { INITIAL_GUESTS } from '../data/guests'
import { INITIAL_EVENTS } from '../data/myEvents'
import { formatEventDate } from '../utils/formatDate'
import { slugify } from '../utils/slugify'
import { useLocalStorageState } from '../utils/useLocalStorageState'

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
  name: 'Mariage de Awa & Ibrahim',
  location: 'Grande mosquée · Dakar',
  date: '2027-03-14',
  timeStart: '16:00',
  timeEnd: '23:00',
  timezone: 'Europe/Paris (GMT+1)',
  description: '',
  category: 'Mariage et fiançailles',
  template: null,
  coverImage: null,
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

export default function CreateEvent() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [event, setEvent] = useState(INITIAL_EVENT)
  const [visibility, setVisibility] = useState('publish')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [, setSharedGuests] = useLocalStorageState('tbf_guests_v2', INITIAL_GUESTS)
  const [, setMyEvents] = useLocalStorageState('tbf_myevents', INITIAL_EVENTS)

  const updateEvent = (patch) => setEvent((prev) => ({ ...prev, ...patch }))

  const canGoBack = currentStep > 0
  const isPublicationStep = currentStep === STEPS.length - 1
  const canContinue = currentStep !== 0 || Boolean(event.category)

  const handlePublish = () => {
    setPublishing(true)
    setTimeout(() => {
      if (event.guests?.length) {
        setSharedGuests((prev) => [
          ...prev,
          ...event.guests.map((g) => ({
            id: `g-${g.id}`,
            name: g.name,
            role: 'Invité',
            contact: g.email,
            group: g.group,
            status: 'En attente',
            accomp: '–',
            invitation: 'Non envoyée',
          })),
        ])
      }
      const guestCount = event.guests?.length ?? 0
      setMyEvents((prev) => [
        {
          id: `${slugify(event.name)}-${Date.now()}`,
          name: event.name,
          status: visibility === 'publish' ? 'Publié' : 'Brouillon',
          category: event.category,
          date: formatEventDate(event.date),
          location: event.location,
          progressLabel: 'RSVP',
          confirmed: 0,
          total: Math.max(1, guestCount),
          barColor: visibility === 'publish' ? 'bg-success' : 'bg-brand-gradient',
        },
        ...prev,
      ])
      setPublishing(false)
      setPublished(true)
    }, 700)
  }

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <CategoryStep
            selected={event.category}
            onSelect={(category) => updateEvent({ category })}
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
          />
        )
      default:
        return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, event, visibility, publishing])

  if (published) {
    return (
      <DashboardLayout>
        <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-ink">
            {visibility === 'publish'
              ? 'Événement publié !'
              : 'Brouillon enregistré !'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {visibility === 'publish'
              ? 'Votre mini-site est en ligne et prêt à être partagé à vos invités.'
              : 'Vous pouvez reprendre et publier votre événement à tout moment.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              variant="gradient"
              onClick={() => navigate('/builder', { state: { event } })}
            >
              Voir mon mini-site
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Retour au dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <StepProgress currentStep={currentStep} stepLabel={STEPS[currentStep]} />

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
