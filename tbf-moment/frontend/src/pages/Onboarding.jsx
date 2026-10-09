import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import BrandBackdrop from '../components/ui/BrandBackdrop'
import Button from '../components/ui/Button'
import CategoryStep from '../components/onboarding/CategoryStep'
import EventBasicsStep from '../components/onboarding/EventBasicsStep'
import ObjectiveStep from '../components/onboarding/ObjectiveStep'
import OnboardingProgress from '../components/onboarding/OnboardingProgress'
import WelcomeStep from '../components/onboarding/WelcomeStep'
import { useSeo } from '../utils/seo'

const TOTAL_STEPS = 4

export default function Onboarding() {
  useSeo({ title: 'Bienvenue', noindex: true })
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState({
    category: '',
    objective: '',
    name: '',
    date: '',
    guestRange: '',
  })

  const isLastStep = step === TOTAL_STEPS - 1
  const canContinue =
    step !== 0 && step !== 1
      ? true
      : step === 0
        ? Boolean(values.category)
        : Boolean(values.objective)

  const handleContinue = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))
  const handleSkip = () => navigate('/dashboard')

  const handleCreateEvent = () => {
    navigate('/dashboard/evenements/nouveau', {
      state: {
        onboarding: {
          category: values.category,
          name: values.name,
          date: values.date,
        },
      },
    })
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <BrandBackdrop />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="mb-6 inline-flex items-center">
          <img src={logo} alt="TBF Moment" className="h-9 w-auto" />
        </Link>

        <OnboardingProgress currentStep={step} total={TOTAL_STEPS} />

        <div className="mt-8 w-full max-w-2xl rounded-2xl border border-border-soft bg-surface p-6 shadow-2xl shadow-black/30 sm:p-8">
          {step === 0 && (
            <CategoryStep
              selected={values.category}
              onSelect={(category) => setValues((v) => ({ ...v, category }))}
            />
          )}
          {step === 1 && (
            <ObjectiveStep
              selected={values.objective}
              onSelect={(objective) => setValues((v) => ({ ...v, objective }))}
            />
          )}
          {step === 2 && (
            <EventBasicsStep
              values={values}
              onChange={(next) => setValues((v) => ({ ...v, ...next }))}
            />
          )}
          {step === 3 && (
            <WelcomeStep values={values} onCreateEvent={handleCreateEvent} />
          )}

          {!isLastStep && (
            <div className="mt-8 flex items-center justify-between border-t border-border-soft pt-6">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-muted hover:text-ink hover:underline"
              >
                Passer
              </button>
              <Button
                variant="gradient"
                disabled={!canContinue}
                onClick={handleContinue}
                className="disabled:pointer-events-none disabled:opacity-40"
              >
                Continuer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
