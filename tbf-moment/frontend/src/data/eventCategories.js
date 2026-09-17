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

const DEFAULT_MODULES = ['RSVP', 'Galerie', 'Localisation', 'FAQ']

export const EVENT_CATEGORIES = [
  {
    label: 'Mariage et fiançailles',
    icon: Heart,
    templateCategory: 'Mariage',
    modules: ['Témoins', 'Cérémonie et réception', 'Plan de table', 'Liste de mariage'],
  },
  {
    label: 'Anniversaire',
    icon: Cake,
    templateCategory: 'Anniversaire',
    modules: ['Cadeaux', 'Galerie', 'RSVP', "Livre d'or"],
  },
  { label: 'Baptême', icon: Baby, templateCategory: null, modules: DEFAULT_MODULES },
  {
    label: 'Graduation',
    icon: GraduationCap,
    templateCategory: 'Graduation',
    modules: ['Diplômé', 'Établissement', 'Promotion', 'Félicitations'],
  },
  {
    label: 'Obsèques / commémoration / hommage',
    icon: Flower2,
    templateCategory: 'Hommage',
    modules: ['Biographie', 'Veillée', 'Condoléances', 'Souvenirs'],
  },
  { label: 'Soirée privée', icon: PartyPopper, templateCategory: null, modules: DEFAULT_MODULES },
  {
    label: 'Conférence / séminaire / atelier',
    icon: Briefcase,
    templateCategory: 'Conférence',
    modules: ['Speakers', 'Sessions', 'Sponsors', 'Certificats'],
  },
  {
    label: 'Événement scolaire ou universitaire',
    icon: Building2,
    templateCategory: null,
    modules: DEFAULT_MODULES,
  },
  {
    label: 'Événement religieux',
    icon: Church,
    templateCategory: null,
    modules: DEFAULT_MODULES,
  },
  {
    label: 'Concert / spectacle',
    icon: Music,
    templateCategory: 'Concert',
    modules: ['Artistes', 'Programme', 'Catégories de billets', "Contrôle d'accès"],
  },
  {
    label: 'Compétition sportive',
    icon: Trophy,
    templateCategory: null,
    modules: DEFAULT_MODULES,
  },
  {
    label: 'Événement familial',
    icon: Users,
    templateCategory: null,
    modules: DEFAULT_MODULES,
  },
  {
    label: 'Événement professionnel',
    icon: Award,
    templateCategory: 'Professionnel',
    modules: DEFAULT_MODULES,
  },
  {
    label: 'Événement personnalisé',
    icon: Sparkles,
    templateCategory: null,
    modules: DEFAULT_MODULES,
  },
]
