import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CategoryStep from '../components/wizard/CategoryStep'
import EventPreviewPanel from '../components/wizard/EventPreviewPanel'
import InformationsStep from '../components/wizard/InformationsStep'
import PublicationStep from '../components/wizard/PublicationStep'
import StepProgress from '../components/wizard/StepProgress'
import TemplateStep from '../components/wizard/TemplateStep'
import Button from '../components/ui/Button'

const STEP_LABELS = ['Catégorie', 'Informations', 'Modèle', 'Publication']

const INITIAL_EVENT = {
  name: 'Mariage de Awa & Ibrahim',
  date: '14/03/2027',
  time: '16:00',
  timezone: 'GMT',
  description: '',
  category: 'Mariage et fiançailles',
  template: null,
  coverImage: null,
  locations: [
    { name: 'Grande mosquée · Dakar', type: 'Cérémonie' },
    { name: 'Salle Teranga · Almadies', type: 'Réception' },
  ],
  plan: 'FREE',
}

export default function CreateEvent() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [event, setEvent] = useState(INITIAL_EVENT)
  const [visibility, setVisibility] = useState('publish')
  const [publishing, setPublishing] = useState(false)

  const updateEvent = (patch) => setEvent((prev) => ({ ...prev, ...patch }))

  const canGoBack = currentStep > 0
  const isLastStep = currentStep === STEP_LABELS.length - 1
  const canContinue =
    currentStep !== 0 || Boolean(event.category)

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
        return (
          <PublicationStep
            event={event}
            visibility={visibility}
            onChangeVisibility={setVisibility}
          />
        )
      default:
        return null
    }
  }, [currentStep, event, visibility])

  const handlePrimaryAction = () => {
    if (!isLastStep) {
      setCurrentStep((s) => Math.min(STEP_LABELS.length - 1, s + 1))
      return
    }
    setPublishing(true)
    setTimeout(() => {
      navigate('/builder', { state: { event } })
    }, 700)
  }

  return (
    <div className="min-h-svh">
      <div className="border-b border-border-soft/60 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/dashboard" className="text-sm text-muted hover:text-ink">
            Quitter
          </Link>
          <h1 className="font-semibold text-ink">Nouvel événement</h1>
          <span className="text-sm text-success">Brouillon enregistré</span>
        </div>
        <div className="mx-auto mt-5 max-w-5xl">
          <StepProgress currentStep={currentStep} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          {stepContent}
          <EventPreviewPanel event={event} />
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border-soft pt-6">
          <Button
            variant="ghost"
            disabled={!canGoBack}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            className="disabled:pointer-events-none disabled:opacity-40"
          >
            Retour
          </Button>
          <Button
            variant="gradient"
            disabled={!canContinue || publishing}
            onClick={handlePrimaryAction}
            className="disabled:pointer-events-none disabled:opacity-40"
          >
            {publishing
              ? 'Publication...'
              : isLastStep
                ? visibility === 'publish'
                  ? "Publier l'événement"
                  : 'Enregistrer le brouillon'
                : 'Continuer'}
          </Button>
        </div>
        <p className="mt-3 text-right text-xs text-faint">
          Étape {currentStep + 1} sur {STEP_LABELS.length}
        </p>
      </div>
    </div>
  )
}
