import { useState } from 'react'

const ROLES = ['Propriétaire', 'Éditeur', 'Lecteur']
const PERMISSIONS = [
  'Modifier les informations générales',
  'Gérer les invités',
  'Envoyer des communications',
  'Publier le mini-site',
  'Gérer la facturation',
]

const INITIAL_MATRIX = {
  'Modifier les informations générales': { Propriétaire: true, Éditeur: true, Lecteur: false },
  'Gérer les invités': { Propriétaire: true, Éditeur: true, Lecteur: false },
  'Envoyer des communications': { Propriétaire: true, Éditeur: true, Lecteur: false },
  'Publier le mini-site': { Propriétaire: true, Éditeur: false, Lecteur: false },
  'Gérer la facturation': { Propriétaire: true, Éditeur: false, Lecteur: false },
}

export default function PermissionsTab() {
  const [matrix, setMatrix] = useState(INITIAL_MATRIX)

  const toggle = (permission, role) => {
    if (role === 'Propriétaire') return
    setMatrix((prev) => ({
      ...prev,
      [permission]: { ...prev[permission], [role]: !prev[permission][role] },
    }))
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Permissions</h2>
      <p className="mt-1 text-sm text-muted">
        Définissez ce que chaque rôle peut faire dans votre espace.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-soft text-xs tracking-wider text-faint uppercase">
              <th className="px-3 py-2.5 font-medium">Action</th>
              {ROLES.map((role) => (
                <th key={role} className="px-3 py-2.5 text-center font-medium">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((permission) => (
              <tr key={permission} className="border-b border-border-soft last:border-b-0">
                <td className="px-3 py-3 text-ink">{permission}</td>
                {ROLES.map((role) => (
                  <td key={role} className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={matrix[permission][role]}
                      disabled={role === 'Propriétaire'}
                      onChange={() => toggle(permission, role)}
                      className="h-4 w-4 rounded border-border accent-brand-purple disabled:opacity-50"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
