import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { getCurrentUser } from '../../api/client'
import { formatEventDisplayTitle } from '../../utils/eventTitle'
import ShareKit from '../share/ShareKit'
import Button from '../ui/Button'
import { StepTitle } from './EventKindSteps'

const longDate = (iso) =>
  iso
    ? new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(`${iso}T12:00:00`),
      )
    : ''

// Dernière étape : récapitulatif de la page publiée (ou du brouillon), lien à partager,
// et offre conseillée aux écoles et entreprises (page sans la mention TBF MOMENT).
export default function PublishedStep({
  form,
  type,
  template,
  plan,
  published,
  slug,
  warnings,
  isEditMode,
  onUpgrade,
  onBuilder,
  onRestart,
  onEvents,
  onGuests,
}) {
  const [copied, setCopied] = useState('')
  const me = getCurrentUser()
  const url = slug ? `${window.location.origin}/e/${slug}` : ''
  const shownUrl = url.replace(/^https?:\/\//, '')
  const hasFeature = (key) => plan?.features?.[key] !== false
  // École ou entreprise sans Business : la page garde la mention TBF MOMENT (le logo, lui,
  // s'affiche sur toutes les offres).
  const needsBusiness = ['ecoles', 'entreprises'].includes(type.univers) && plan && !hasFeature('branding')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied('Copié')
    } catch {
      setCopied('Copiez le lien ci-contre')
    }
    setTimeout(() => setCopied(''), 2000)
  }

  const rows = [
    ['Événement', form.name],
    ['Type', type.label],
    ['Organisateur', `${form.organizer || '—'}${form.logo ? ' · logo ajouté' : ''}`],
    ['Date', `${longDate(form.date)} · ${form.timeStart}${form.timeEnd ? ` – ${form.timeEnd}` : ''}`],
    ['Lieu', [form.venueName, form.venueAddr].filter(Boolean).join(' · ')],
    ['Modèle', template?.name ?? '—'],
    ['Publié par', me ? [me.fullName, me.email].filter(Boolean).join(' · ') || '—' : '—'],
    ['Offre', plan ? `${plan.planLabel}${plan.endsAt ? ` · jusqu'au ${new Date(plan.endsAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : ''}` : '—'],
  ]

  return (
    <div>
      <StepTitle
        title={published ? (isEditMode ? 'Votre page est à jour' : 'Votre page est prête') : 'Brouillon enregistré'}
        lead={
          published
            ? 'Vérifiez le récapitulatif, puis partagez le lien.'
            : 'Votre page n’est pas encore visible. Publiez-la depuis « Mes événements » quand vous êtes prêt.'
        }
      />
      <div className="grid gap-4 rounded-[18px] border border-border-soft bg-surface p-5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{k}</dt>
              <dd className="min-w-0 font-semibold [overflow-wrap:anywhere] text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        {warnings.length > 0 && (
          <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange">
            <p className="font-medium">C'est enregistré, mais :</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {needsBusiness && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/50 bg-gold/10 px-4 py-3.5">
            <div>
              <b className="block text-[0.92rem] text-ink">
                Votre page porte encore la mention « Créé avec TBF MOMENT ». L’offre Business la retire.
              </b>
              <span className="text-[0.84rem] text-muted">Business · 15 000 FCFA pour un mois, sans engagement.</span>
            </div>
            <Button variant="gradient" onClick={onUpgrade}>
              Activer Business
            </Button>
          </div>
        )}

        {published && url && (
          <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border-soft bg-bg px-4 py-3 font-mono text-sm break-all text-ink">
            <span>{shownUrl}</span>
            <button
              type="button"
              onClick={copy}
              className="ml-auto min-h-9 rounded-lg border border-border-soft px-3 font-sans text-[0.82rem] font-semibold hover:border-brand-purple"
            >
              {copied || 'Copier le lien'}
            </button>
          </div>
        )}

        {!isEditMode && onGuests && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-purple/30 bg-brand-purple/10 px-4 py-3.5">
            <div>
              <b className="block text-[0.95rem] text-ink">Prochaine étape : vos invités</b>
              <span className="text-[0.84rem] text-muted">
                Ajoutez-les (ou importez votre liste Excel), puis envoyez à chacun son invitation sur WhatsApp.
              </span>
            </div>
            <Button variant="gradient" onClick={onGuests}>
              Ajouter mes invités
            </Button>
          </div>
        )}

        {published && slug && (
          <div className="rounded-2xl border border-border-soft bg-bg p-4">
            <h3 className="mb-3 text-[0.95rem] font-bold text-ink">Ou partagez le lien à tout le monde sur WhatsApp</h3>
            <ShareKit
              slug={slug}
              title={formatEventDisplayTitle(type.id, form.birthdayAge, form.display, form.name)}
              date={form.date}
              time={form.timeStart}
              location={[form.venueName, form.venueAddr].filter(Boolean).join(', ')}
              intro={type.shareIntro}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          {published && url && (
            <Button as="a" href={`/e/${slug}`} target="_blank" rel="noopener noreferrer" variant="outline">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Ouvrir ma page
            </Button>
          )}
          <Button variant="outline" onClick={onBuilder}>
            Personnaliser
          </Button>
          {isEditMode ? (
            <Button variant="outline" onClick={onEvents}>
              Retour à mes événements
            </Button>
          ) : (
            <Button variant="outline" onClick={onRestart}>
              Créer un autre événement
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
