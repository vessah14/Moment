import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

const INITIAL_MEMBERS = [
  { name: 'Awa Diop', email: 'awa.diop@mail.com', role: 'Propriétaire' },
  { name: 'Fatou Ndiaye', email: 'fatoun@mail.com', role: 'Éditeur' },
]

export default function TeamTab() {
  const [members, setMembers] = useState(INITIAL_MEMBERS)
  const [email, setEmail] = useState('')

  const handleInvite = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setMembers((prev) => [
      ...prev,
      { name: email.trim().split('@')[0], email: email.trim(), role: 'Lecteur' },
    ])
    setEmail('')
  }

  const handleRemove = (memberEmail) =>
    setMembers((prev) => prev.filter((m) => m.email !== memberEmail))

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-xl font-bold text-ink">Équipe</h2>
      <p className="mt-1 text-sm text-muted">
        Invitez des collaborateurs pour co-organiser vos événements.
      </p>

      <form onSubmit={handleInvite} className="mt-6 flex flex-wrap gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemple.com"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-faint outline-none focus:border-brand-purple"
        />
        <Button type="submit" variant="gradient">
          Inviter un membre
        </Button>
      </form>

      <div className="mt-6 space-y-2">
        {members.map((member) => (
          <div
            key={member.email}
            className="flex items-center gap-3 rounded-lg border border-border-soft px-4 py-3"
          >
            <Avatar name={member.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{member.name}</p>
              <p className="truncate text-xs text-faint">{member.email}</p>
            </div>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
              {member.role}
            </span>
            {member.role !== 'Propriétaire' && (
              <button
                type="button"
                onClick={() => handleRemove(member.email)}
                className="rounded-lg p-2 text-faint hover:bg-danger/10 hover:text-danger"
                aria-label={`Retirer ${member.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
