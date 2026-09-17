import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toggle from '../builder/Toggle'
import Button from '../ui/Button'

export default function SecurityTab() {
  const navigate = useNavigate()
  const [twoFactor, setTwoFactor] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [managingSessions, setManagingSessions] = useState(false)
  const [passwordFormOpen, setPasswordFormOpen] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const handleDeleteAccount = () => {
    navigate('/')
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setPasswordFormOpen(false)
    setPasswordSaved(true)
    setTimeout(() => setPasswordSaved(false), 3000)
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Sécurité</h2>
      <p className="mt-1 text-sm text-muted">
        Protégez l'accès à votre compte et à vos événements.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-ink">Mot de passe</p>
            <p className="text-xs text-faint">
              {passwordSaved ? 'Mis à jour' : 'Modifié il y a 3 mois'}
            </p>
          </div>
          <Button variant="outline" onClick={() => setPasswordFormOpen((v) => !v)}>
            Modifier
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-ink">
              Double authentification
            </p>
            <p className={`text-xs ${twoFactor ? 'text-success' : 'text-brand-orange'}`}>
              {twoFactor ? 'Activée' : 'Non activée'}
            </p>
          </div>
          <Toggle checked={twoFactor} onChange={setTwoFactor} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-soft px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-ink">Sessions actives</p>
            <p className="text-xs text-faint">
              {managingSessions ? '1 appareil connecté' : '3 appareils connectés'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setManagingSessions(true)}
          >
            {managingSessions ? 'Autres sessions fermées' : 'Gérer'}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-danger/30 px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-danger">
              Supprimer le compte
            </p>
            <p className="text-xs text-faint">
              {confirmingDelete ? 'Confirmez pour continuer' : 'Action irréversible'}
            </p>
          </div>
          {confirmingDelete ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:border-faint"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-full bg-danger px-4 py-2 text-xs font-semibold text-white"
              >
                Confirmer
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-full border border-danger/40 px-6 py-3 text-sm font-semibold text-danger transition hover:bg-danger/10"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      {passwordFormOpen && (
        <form
          onSubmit={handlePasswordSubmit}
          className="mt-4 space-y-3 rounded-lg border border-brand-purple/40 p-4"
        >
          <label className="block">
            <span className="text-xs font-medium text-ink">
              Mot de passe actuel
            </span>
            <input
              type="password"
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">
              Nouveau mot de passe
            </span>
            <input
              type="password"
              required
              minLength={8}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
            />
          </label>
          <Button type="submit" variant="solid">
            Enregistrer le mot de passe
          </Button>
        </form>
      )}
    </div>
  )
}
