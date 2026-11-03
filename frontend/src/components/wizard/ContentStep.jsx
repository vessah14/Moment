import { StepTitle } from './EventKindSteps'
import { GalleryPicker, PhotoSlot, WIZARD_GALLERY_MAX } from './PhotoSlot'
import { invitationHasPicture } from '../../data/invitations'
import { newEventPageBlocks } from '../../utils/templateTheme'
import {
  AdditionalVenuesEditor,
  DressCodeEditor,
  FamiliesEditor,
  GiftAccountsEditor,
  InvitationEditor,
  PartnersEditor,
  HonoursEditor,
  PeopleEditor,
} from '../builder/ModuleEditors'

const inputClass = 'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30'

function Field({ label, value, onChange, multiline = false, placeholder = '' }) {
  const Control = multiline ? 'textarea' : 'input'
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink">
      {label}
      <Control className={inputClass} rows={multiline ? 4 : undefined} maxLength={multiline ? 3000 : 200} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function Panel({ title, children }) {
  return <section className="grid gap-4 rounded-2xl border border-border-soft bg-surface p-4 sm:p-5"><h3 className="text-base font-bold text-ink">{title}</h3>{children}</section>
}

// onSkip : tout est facultatif ici ; on peut passer au modèle sans faire défiler l'étape.
// photos / onPhotos : photos choisies sur l'appareil (création seulement), envoyées à la
// création de l'événement ; elles se modifient ensuite dans le Builder et dans Galerie.
// invitationDefaults : texte d'invitation que la création posera, montré tel quel et modifiable.
export default function ContentStep({ template, content, onChange, onSkip, photos, onPhotos, invitationDefaults = {} }) {
  const blocks = new Set(newEventPageBlocks(template))
  const edit = (type, patch) => onChange(type, patch)
  const value = (type) => content[type] ?? {}
  const setPhoto = (key) => (photo) => onPhotos((prev) => ({ ...prev, [key]: photo }))
  const invitationPicture = blocks.has('Invitation') && invitationHasPicture(template?.theme)

  return (
    <div className="grid gap-5">
      <div>
        <StepTitle title="Ajoutez les informations de votre événement" lead="Les sections du modèle sont déjà prévues. Renseignez ici ce que vos invités verront ; vous pourrez tout modifier ensuite dans le Builder." />
        {onSkip && (
          <p className="-mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-muted">
            Tout est facultatif sur cette étape.
            <button type="button" onClick={onSkip} className="font-semibold text-brand-purple hover:underline">
              Passer et choisir le modèle →
            </button>
          </p>
        )}
      </div>

      {photos && (
        <Panel title="Vos photos">
          <p className="-mt-2 text-xs text-muted">Facultatif. Vous pourrez les changer ensuite dans « Personnaliser » et dans « Galerie ».</p>
          <div className={`grid gap-4 ${invitationPicture ? 'sm:grid-cols-2' : ''}`}>
            <PhotoSlot
              id="photo-cover"
              label="Photo de couverture"
              hint="En haut de votre page et dans l’aperçu WhatsApp."
              photo={photos.cover}
              onChange={setPhoto('cover')}
              wide
            />
            {invitationPicture && (
              <PhotoSlot
                id="photo-invitation"
                label="Photo de l’invitation"
                hint="À côté de votre message, à la place de l’illustration du modèle."
                photo={photos.invitation}
                onChange={setPhoto('invitation')}
              />
            )}
          </div>
          {blocks.has('Galerie') && (
            <div className="grid gap-2">
              <div>
                <p className="text-sm font-semibold text-ink">Premières photos de la galerie</p>
                <p className="text-xs text-muted">Jusqu’à {WIZARD_GALLERY_MAX} ici. Ajoutez-en d’autres ou masquez-les ensuite dans « Galerie ».</p>
              </div>
              <GalleryPicker photos={photos.gallery} onChange={setPhoto('gallery')} />
            </div>
          )}
        </Panel>
      )}

      {blocks.has('Invitation') && (
        <Panel title="Message d’invitation">
          <InvitationEditor content={{ ...invitationDefaults, ...value('Invitation') }} onChange={(patch) => edit('Invitation', patch)} withBody />
        </Panel>
      )}
      {blocks.has('Histoire') && (
        <Panel title="Votre histoire">
          <Field label="Texte de présentation" multiline value={value('Histoire').body} onChange={(body) => edit('Histoire', { body })} placeholder="Racontez votre événement ou son histoire…" />
          {photos && (
            <PhotoSlot
              id="photo-story"
              label="Photo de l’histoire"
              hint="Affichée à côté de votre texte."
              photo={photos.story}
              onChange={setPhoto('story')}
            />
          )}
        </Panel>
      )}
      {blocks.has('Familles') && <Panel title="Les familles"><FamiliesEditor content={value('Familles')} onChange={(patch) => edit('Familles', patch)} /></Panel>}
      {blocks.has('Dress code') && <Panel title="Tenue et couleurs"><DressCodeEditor content={value('Dress code')} onChange={(patch) => edit('Dress code', patch)} /></Panel>}
      {blocks.has('Localisation') && <Panel title="Autres lieux"><AdditionalVenuesEditor content={value('Localisation')} onChange={(patch) => edit('Localisation', patch)} /></Panel>}
      {blocks.has('Cadeaux') && <Panel title="Contributions"><Field label="Message affiché aux invités" multiline value={value('Cadeaux').body} onChange={(body) => edit('Cadeaux', { body })} placeholder="Expliquez comment participer, si les invités le souhaitent." /><GiftAccountsEditor content={value('Cadeaux')} onChange={(patch) => edit('Cadeaux', patch)} /><p className="text-xs text-muted">Les coordonnées sont affichées pour permettre un transfert direct. Aucun paiement n’est déclenché depuis cette page.</p></Panel>}
      {blocks.has('Intervenants') && <Panel title="Intervenants, artistes ou témoins"><PeopleEditor content={value('Intervenants')} onChange={(patch) => edit('Intervenants', patch)} /></Panel>}
      {blocks.has('Distinctions') && <Panel title="Distinctions"><HonoursEditor content={value('Distinctions')} onChange={(patch) => edit('Distinctions', patch)} /></Panel>}
      {blocks.has('Partenaires') && <Panel title="Partenaires"><PartnersEditor content={value('Partenaires')} onChange={(patch) => edit('Partenaires', patch)} /></Panel>}
      {blocks.has('Programme') && <Panel title="Programme"><Field label="Introduction du programme" multiline value={value('Programme').body} onChange={(body) => edit('Programme', { body })} placeholder="Présentez brièvement les temps forts. Les horaires se complètent ensuite dans l’onglet Programme." /></Panel>}
      {blocks.has('FAQ') && <Panel title="Questions fréquentes"><Field label="Introduction" multiline value={value('FAQ').body} onChange={(body) => edit('FAQ', { body })} placeholder="Ajoutez les questions et réponses dans le Builder." /></Panel>}

      <p className="text-xs leading-relaxed text-muted">Les invitations, confirmations de présence, photos, billets, plan de table, cadeaux à réserver et horaires détaillés se gèrent après publication dans le Builder ou le tableau de bord.</p>
    </div>
  )
}
