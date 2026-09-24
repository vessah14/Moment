import { useState } from 'react'
import Toggle from '../builder/Toggle'
import Button from '../ui/Button'
import { useToast } from '../../utils/useToast'

export default function SecurityTab() {
  const toast = useToast()
  const [twoFactor, setTwoFactor] = useState(false)
  const [managingSessions, setManagingSessions] = useState(false)
  const [passwordFormOpen, setPasswordFormOpen] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setPasswordFormOpen(false)
    setPasswordUpdated(true)
    toast('Mot de passe mis à jour')
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
              {passwordUpdated ? 'Mis à jour' : 'Modifié il y a 3 mois'}
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
            onClick={() => {
              setManagingSessions(true)
              toast('Autres sessions fermées')
            }}
          >
            {managingSessions ? 'Autres sessions fermées' : 'Gérer'}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-xs text-faint">
        Pour supprimer votre compte, rendez-vous dans l'onglet{' '}
        <span className="font-medium text-danger">Supprimer le compte</span>.
      </p>

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
