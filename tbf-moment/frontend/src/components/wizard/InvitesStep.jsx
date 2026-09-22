import { Trash2, UploadCloud } from 'lucide-react'
import { useRef } from 'react'
import StatusBadge from '../ui/StatusBadge'
import Button from '../ui/Button'

export default function InvitesStep({ event, onChange }) {
  const importInputRef = useRef(null)
  const guests = event.guests ?? []

  const update = (patch) => onChange({ ...event, ...patch })

  const handleAdd = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const name = form.get('name')?.toString().trim()
    const email = form.get('email')?.toString().trim()
    const phone = form.get('phone')?.toString().trim()
    const group = form.get('group')?.toString().trim() || 'Sans groupe'
    if (!name || !email || !phone) return
    update({
      guests: [...guests, { id: Date.now(), name, email, phone, group, status: 'Prêt' }],
    })
    e.target.reset()
  }

  const handleDelete = (id) =>
    update({ guests: guests.filter((g) => g.id !== id) })

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const lines = String(reader.result)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      const dataLines = /nom|name/i.test(lines[0]) ? lines.slice(1) : lines
      const imported = dataLines
        .map((line) => {
          const [name, email, phone, group] = line.split(',').map((v) => v?.trim())
          if (!name || !email || !phone) return null
          return {
            id: Date.now() + Math.random(),
            name,
            email,
            phone,
            group: group || 'Importés',
            status: 'Prêt',
          }
        })
        .filter(Boolean)
      update({ guests: [...guests, ...imported] })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">Ajoutez vos invités</h2>
      <p className="mt-2 text-sm text-muted">
        Constituez votre liste de participants en les saisissant
        individuellement ou en important directement un fichier CSV/Excel.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <form
          onSubmit={handleAdd}
          className="space-y-4 rounded-2xl border border-border-soft bg-surface p-5"
        >
          <p className="text-sm font-semibold text-ink">Ajouter manuellement</p>
          <label className="block">
            <span className="text-xs font-medium text-ink">Nom complet</span>
            <input
              name="name"
              required
              placeholder="Ex: Alice Bernard"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Adresse email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="Ex: alice@exemple.com"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Téléphone</span>
            <input
              name="phone"
              required
              placeholder="Ex: +221 77 000 00 00"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Groupe d'invités</span>
            <select
              name="group"
              defaultValue=""
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            >
              <option value="">Sélectionner un groupe...</option>
              <option value="Famille">Famille</option>
              <option value="Amis">Amis</option>
              <option value="Collègues">Collègues</option>
            </select>
          </label>
          <Button type="submit" variant="gradient" className="w-full">
            Ajouter à la liste
          </Button>
        </form>

        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <p className="text-sm font-semibold text-ink">Importer un fichier</p>
          <p className="mt-1 text-xs text-faint">
            Importez des listes volumineuses d'invités instantanément.
          </p>
          <div
            onClick={() => importInputRef.current?.click()}
            className="mt-4 flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand-purple/40 py-10 text-center"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple/15 text-brand-purple">
              <UploadCloud className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-brand-purple">
              Glissez-déposez votre fichier ici
            </span>
            <span className="text-xs text-faint">
              Colonnes attendues : nom, email, téléphone, groupe (CSV, max 5 Mo)
            </span>
            <span className="mt-2 rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-ink">
              Parcourir les fichiers
            </span>
          </div>
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-sm font-semibold text-ink">Invités ajoutés</p>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
            {guests.length} invité{guests.length > 1 ? 's' : ''}
          </span>
        </div>
        {guests.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-faint">
            Aucun invité pour le moment — vous pourrez toujours en ajouter
            depuis le tableau de bord.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-y border-border-soft text-xs tracking-wider text-faint uppercase">
                  <th className="px-5 py-2 font-medium">Nom complet</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Téléphone</th>
                  <th className="px-3 py-2 font-medium">Groupe</th>
                  <th className="px-3 py-2 font-medium">Statut</th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.id} className="border-b border-border-soft last:border-b-0">
                    <td className="px-5 py-3 font-medium text-ink">{g.name}</td>
                    <td className="px-3 py-3 text-muted">{g.email}</td>
                    <td className="px-3 py-3 text-muted">{g.phone}</td>
                    <td className="px-3 py-3 text-muted">{g.group}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(g.id)}
                        className="text-faint hover:text-danger"
                        aria-label={`Supprimer ${g.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
