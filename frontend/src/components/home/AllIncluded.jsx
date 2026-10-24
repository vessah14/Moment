import { Check, Gift, Image, MessageSquare, Music, QrCode, Target, Ticket } from 'lucide-react'
import SectionHeader from './SectionHeader'

// « Tout est inclus » (repris du prototype) : les modules qu'on active sur sa page.
// Chaque phrase décrit ce que le site fait réellement.
const FEATURES = [
  [Check, 'Réponses en ligne', 'Oui, non, peut-être, nombre de places, côté de la famille. Tout arrive dans votre tableau de bord.'],
  [Ticket, 'Billetterie', 'Plusieurs catégories de billets, places restantes affichées, ventes suivies en direct.'],
  [QrCode, 'Pass QR et scanner', "Chaque invité a son pass. L'accueil scanne, les doublons sont refusés."],
  [Target, 'Plan de table', "Chaque invité trouve sa table en tapant son nom. Fini les embouteillages à l'entrée."],
  [MessageSquare, 'Relances WhatsApp', "Un message personnalisé à ceux qui n'ont pas encore répondu."],
  [Gift, 'Cagnotte et cadeaux', 'Numéros Mobile Money de la famille et liste de souhaits.'],
  [Image, "Galerie et livre d'or", 'Photos, souvenirs et messages des invités, sur la même page.'],
  [Music, 'Musique et animations', 'Ouverture en enveloppe, rideau ou cadeau, pétales, confettis, balafon.'],
]

export default function AllIncluded() {
  return (
    <section id="fonctionnalites" className="relative scroll-mt-20" aria-labelledby="included-heading">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader id="included-heading" eyebrow="Tout est inclus" title="Une seule page, tout votre événement">
          Activez seulement les sections dont vous avez besoin.
        </SectionHeader>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([Icon, title, text]) => (
            <div key={title} className="rounded-[18px] border border-border-soft bg-surface p-5">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-purple/20 text-brand-purple">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
