import { UploadCloud } from 'lucide-react'

const TIMEZONES = [
  'Europe/Paris (GMT+1)',
  'Africa/Dakar (GMT+0)',
  'Africa/Abidjan (GMT+0)',
  'Africa/Casablanca (GMT+1)',
  'America/New_York (GMT-5)',
]

export default function InformationsStep({ event, onChange, categoryCode, selectedTemplate }) {
  const update = (patch) => onChange({ ...event, ...patch })
  const isBirthday = categoryCode === 'anniversaire' || event.category?.toLowerCase().includes('anniversaire')
  const updateBirthdayAge = (age) => {
    const oldAge = event.birthdayAge
    const currentName = event.name.trim()
    const person = event.birthdayName || currentName.replace(/^Les\s+\d+\s+ans\s+de\s*/i, '').trim()
    const generated = !currentName || (oldAge && currentName === `Les ${oldAge} ans de ${person}`)
    if (!generated) return update({ birthdayAge: age })
    update({ birthdayAge: age, birthdayName: person, name: person ? `Les ${age} ans de ${person}` : '' })
  }
  const updateBirthdayName = (name) => {
    const age = event.birthdayAge
    const isGenerated = age && event.name === `Les ${age} ans de ${event.birthdayName || ''}`.trim()
    if (isBirthday && age && (isGenerated || !event.name.trim())) {
      update({ birthdayName: name, name: name.trim() ? `Les ${age} ans de ${name.trim()}` : '' })
      return
    }
    update({ name })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">Informations générales</h2>
      <p className="mt-2 text-sm text-muted">
        Renseignez les détails logistiques essentiels de votre événement.
      </p>

      <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">
              Nom de l'événement <span className="text-danger">*</span>
            </span>
            <input
              type="text"
              required
              value={event.name}
              onChange={(e) => updateBirthdayName(e.target.value)}
              placeholder="Ex: Mariage de Sophie & Matthieu"
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">
              Lieu / Adresse <span className="text-danger">*</span>
            </span>
            <input
              type="text"
              required
              value={event.location}
              onChange={(e) => update({ location: e.target.value })}
              placeholder="Ex: Château de la Loire, Blois"
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
        </div>

        {isBirthday && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink">Âge célébré</span>
              <input
                type="number"
                min="1"
                max="120"
                inputMode="numeric"
                value={event.birthdayAge ?? ''}
                onChange={(e) => updateBirthdayAge(e.target.value)}
                placeholder="Ex. 30"
                className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
              />
              <span className="mt-1.5 block text-xs text-faint">Cet âge pourra être repris sur le titre de votre invitation.</span>
            </label>
          </div>
        )}

        {isBirthday && selectedTemplate && ['Fiesta', 'Prestige'].includes(selectedTemplate) && (
          <p className="rounded-lg border border-brand-purple/20 bg-brand-purple/5 px-4 py-3 text-sm text-muted">
            Le modèle {selectedTemplate} met l’âge célébré en avant. Indiquez-le pour personnaliser le titre de votre invitation.
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">
              Date de l'événement <span className="text-danger">*</span>
            </span>
            <input
              type="date"
              required
              value={event.date}
              onChange={(e) => update({ date: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">
              Description de l'événement
            </span>
            <textarea
              rows={1}
              value={event.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Décrivez le programme, le thème ou toute information utile pour vos invités..."
              className="mt-2 w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-ink">
              Heure de début <span className="text-danger">*</span>
            </span>
            <input
              type="time"
              required
              value={event.timeStart}
              onChange={(e) => update({ timeStart: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">
              Heure de fin <span className="text-danger">*</span>
            </span>
            <input
              type="time"
              required
              value={event.timeEnd}
              onChange={(e) => update({ timeEnd: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Fuseau horaire</span>
            <select
              value={event.timezone}
              onChange={(e) => update({ timezone: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-purple focus:ring-3 focus:ring-brand-purple/30"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-ink">
            Image de couverture
          </span>
          <div
            className="relative mt-2 flex aspect-21/9 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed border-brand-purple/40 bg-[linear-gradient(160deg,_var(--color-surface-2),_var(--color-surface))] bg-cover bg-center text-center"
            style={
              event.coverImage
                ? { backgroundImage: `url(${event.coverImage})` }
                : undefined
            }
          >
            {!event.coverImage && (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple/15 text-brand-purple">
                  <UploadCloud className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-brand-purple">
                  Cliquez pour uploader
                </span>
                <span className="text-xs text-faint">
                  PNG, JPG jusqu'à 5 Mo (recommandé 16:9)
                </span>
              </>
            )}
            {event.coverImage && (
              <span className="w-full bg-black/40 px-4 py-2 text-xs text-white">
                Changer l'image
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (event.coverImageIsLocal && event.coverImage) URL.revokeObjectURL(event.coverImage)
                update({
                  coverImage: URL.createObjectURL(file),
                  coverImageIsLocal: true,
                  coverImageFile: file,
                })
              }}
            />
          </div>
        </label>
      </form>
    </div>
  )
}
