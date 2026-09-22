import {
  Award,
  Baby,
  Briefcase,
  Building2,
  Cake,
  Church,
  Flower2,
  GraduationCap,
  Heart,
  Music,
  PartyPopper,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'

const KEYWORD_ICONS = [
  [/mariage|fian/i, Heart],
  [/anniversaire/i, Cake],
  [/bapt/i, Baby],
  [/graduation|diplom/i, GraduationCap],
  [/obs|comm[ée]moration|hommage|fun[ée]raille/i, Flower2],
  [/conf[ée]rence|s[ée]minaire|atelier/i, Briefcase],
  [/scolaire|universitaire|[ée]cole/i, Building2],
  [/religieux|[ée]glise|mosqu[ée]/i, Church],
  [/concert|spectacle/i, Music],
  [/sport|comp[ée]tition|tournoi/i, Trophy],
  [/famil/i, Users],
  [/professionnel|entreprise/i, Award],
  [/soir[ée]e|f[êe]te/i, PartyPopper],
]

export function iconForCategory(label = '') {
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(label))
  return match ? match[1] : Sparkles
}
