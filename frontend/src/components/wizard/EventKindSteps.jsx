import {
  Award,
  Baby,
  Briefcase,
  Cake,
  Church,
  Flower2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Moon,
  Music,
  PartyPopper,
  School,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react'
import { EVENT_TYPES, EVENT_UNIVERSES, LOGO_POLICY } from '../../data/eventTypes'

const ICONS = {
  heart: Heart,
  cap: GraduationCap,
  briefcase: Briefcase,
  gift: Gift,
  cake: Cake,
  baby: Baby,
  church: Church,
  users: Users,
  home: Home,
  party: PartyPopper,
  flower: Flower2,
  school: School,
  award: Award,
  sparkle: Sparkles,
  music: Music,
  trophy: Trophy,
  moon: Moon,
  star: Star,
}

export function StepTitle({ title, lead }) {
  return (
    <>
      <h1 className="text-[clamp(1.6rem,3.6vw,2.2rem)] leading-tight font-bold tracking-tight text-ink">{title}</h1>
      {lead && <p className="mt-1.5 mb-6 text-sm text-muted">{lead}</p>}
    </>
  )
}

// Carte à choisir (bouton radio stylé) : icône, titre et une ligne d'aide.
function Choice({ name, value, checked, onChange, icon, title, children }) {
  const Icon = ICONS[icon] ?? Sparkles
  return (
    <div className="relative">
      <input
        type="radio"
        name={name}
        id={`${name}-${value}`}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer absolute h-px w-px opacity-0"
      />
      <label
        htmlFor={`${name}-${value}`}
        className="grid h-full cursor-pointer grid-cols-[auto_1fr] items-center gap-x-3 gap-y-0.5 rounded-2xl border border-border-soft bg-surface p-4 transition peer-checked:border-brand-purple peer-checked:bg-surface-2 peer-checked:ring-1 peer-checked:ring-brand-purple peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold hover:border-brand-purple/70"
      >
        <span className="row-span-2 grid h-[42px] w-[42px] place-items-center rounded-xl bg-brand-purple/20 text-gold">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <b className="text-[0.98rem] text-ink">{title}</b>
        {children}
      </label>
    </div>
  )
}

const grid = 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))] gap-3'

export function UniversStep({ value, onChange }) {
  return (
    <div>
      <StepTitle
        title="Quel type d'événement organisez-vous ?"
        lead="Choisissez un univers : les types, les modèles et les champs s'adaptent ensuite."
      />
      <div className={grid} role="radiogroup" aria-label="Univers">
        {EVENT_UNIVERSES.map((u) => (
          <Choice key={u.id} name="univers" value={u.id} checked={value === u.id} onChange={onChange} icon={u.icon} title={u.label}>
            <small className="text-[0.8rem] text-muted">{u.hint}</small>
          </Choice>
        ))}
      </div>
    </div>
  )
}

export function TypeStep({ univers, value, onChange }) {
  const u = EVENT_UNIVERSES.find((x) => x.id === univers)
  return (
    <div>
      <StepTitle
        title={`${u?.label ?? 'Événement'} : précisez le type`}
        lead="Le type décide des modules proposés (réponse, billetterie, plan de table…) et de la place du logo."
      />
      <div className={grid} role="radiogroup" aria-label="Type d'événement">
        {EVENT_TYPES.filter((t) => t.univers === univers).map((t) => (
          <Choice key={t.id} name="type" value={t.id} checked={value === t.id} onChange={onChange} icon={t.icon} title={t.label}>
            <span className="mt-0.5 font-mono text-[0.66rem] tracking-[0.06em] text-gold uppercase">
              Logo : {LOGO_POLICY[t.logo].toLowerCase()}
            </span>
          </Choice>
        ))}
      </div>
    </div>
  )
}
