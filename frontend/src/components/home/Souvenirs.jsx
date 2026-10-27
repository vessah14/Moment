import BrandBackdrop from '../ui/BrandBackdrop'
import SectionHeader from './SectionHeader'
import invitationPhoto from '../../assets/home/souvenir-invitation.jpeg'
import studioPhoto from '../../assets/home/souvenir-studio.jpeg'
import portraitPhoto from '../../assets/home/souvenir-portrait.jpeg'
import framePhoto from '../../assets/home/souvenir-frame.jpeg'
import printPhoto from '../../assets/home/souvenir-print.jpeg'
import mugPhoto from '../../assets/home/souvenir-mug.jpeg'

// « Et après la fête ? » : souvenirs imprimés par TBF DIGITAL, commandés sur WhatsApp.
const WHATSAPP = '237680264060'
const orderUrl = (product) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Bonjour TBF DIGITAL, je souhaite commander : ${product}. Pouvez-vous m'indiquer le prix et le délai ?`,
  )}`

const ACCENT = '#6C4BF4'
const ACCENT_2 = '#FF7A3D'

const PRODUCTS = [
  {
    name: 'Photo sur bois',
    text: 'Votre plus belle photo de ce jour, imprimée sur bois. Chaleureux, prêt à poser.',
    image: portraitPhoto,
    art: (
      <>
        <rect x="8" y="10" width="48" height="40" rx="3" fill="#C9935B" />
        <path d="M8 20h48M8 32h48M8 42h48" stroke="#A8743F" strokeWidth="1.4" />
        <rect x="14" y="16" width="36" height="28" rx="2" fill={ACCENT} opacity=".85" />
        <circle cx="24" cy="25" r="4" fill="#fff" opacity=".9" />
        <path d="M14 44l12-12 8 8 6-5 10 9z" fill="#fff" opacity=".75" />
      </>
    ),
  },
  {
    name: 'Photo sur plexiglas',
    text: 'Rendu brillant, effet galerie, à accrocher au salon.',
    image: printPhoto,
    art: (
      <>
        <rect x="10" y="8" width="44" height="44" rx="3" fill={ACCENT_2} opacity=".9" />
        <path d="M10 8l18 0-18 22z" fill="#fff" opacity=".35" />
        <circle cx="23" cy="22" r="5" fill="#fff" opacity=".9" />
        <path d="M10 52l16-16 10 10 6-5 12 11z" fill="#fff" opacity=".7" />
      </>
    ),
  },
  {
    name: 'Tasse personnalisée',
    text: 'Avec la photo, les prénoms et la date. Un cadeau parfait pour les témoins et les proches.',
    image: mugPhoto,
    art: (
      <>
        <path d="M14 16h30v30a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" fill="#fff" />
        <path d="M44 22h4a6 6 0 0 1 0 12h-4" fill="none" stroke="#fff" strokeWidth="4" />
        <rect x="18" y="24" width="22" height="16" rx="2" fill={ACCENT} />
        <path d="M22 10c0-3 3-3 3-6M30 10c0-3 3-3 3-6" stroke="#A8A1D1" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    name: 'Cadre photo connecté',
    text: 'Un cadre avec puce NFC : on approche le téléphone et la page souvenir s’ouvre, avec photos et messages.',
    image: framePhoto,
    art: (
      <>
        <rect x="8" y="8" width="48" height="48" rx="4" fill="#2A2245" />
        <rect x="14" y="14" width="36" height="30" rx="2" fill={ACCENT} opacity=".9" />
        <path d="M14 44l10-10 7 7 5-4 14 7z" fill="#fff" opacity=".7" />
        <path d="M38 50c1.5-1.5 4.5-1.5 6 0M36 52.5c3-3 7-3 10 0" stroke={ACCENT_2} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    name: 'Cartons et faire-part',
    text: 'Les invitations papier, chacune avec le QR code de l’invité.',
    image: invitationPhoto,
    art: (
      <>
        <rect x="12" y="14" width="34" height="42" rx="2" fill="#fff" transform="rotate(-8 29 35)" />
        <rect x="18" y="10" width="34" height="42" rx="2" fill="#fff" />
        <rect x="18" y="10" width="34" height="9" rx="2" fill={ACCENT} />
        <rect x="28" y="30" width="14" height="14" fill="#222" />
        <rect x="30" y="32" width="4" height="4" fill="#fff" />
        <rect x="36" y="38" width="4" height="4" fill="#fff" />
        <path d="M23 24h24" stroke="#bbb" strokeWidth="1.4" />
      </>
    ),
  },
]

export default function Souvenirs() {
  return (
    <section id="souvenirs" className="relative overflow-hidden" aria-labelledby="souvenirs-heading">
      <BrandBackdrop side="left" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <SectionHeader id="souvenirs-heading" eyebrow="Souvenirs · TBF Digital" title="Et après la fête ? On imprime vos souvenirs.">
          Plus besoin de chercher un imprimeur : photos sur bois ou plexiglas, tasses, cadre connecté et
          cartons d’invitation, commandés en un message et livrés à Douala.
        </SectionHeader>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
          {PRODUCTS.map((product) => (
            <li key={product.name} className="flex min-w-0 flex-col rounded-2xl border border-border-soft bg-surface p-3 sm:p-4">
              <span className="mb-3 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-[#f4f1fa] p-2 sm:h-44">
                <img src={product.image} alt={`Exemple de ${product.name.toLowerCase()}`} loading="lazy" className="h-full w-full object-contain" />
              </span>
              <h3 className="text-sm font-semibold text-ink sm:text-base">{product.name}</h3>
              <p className="mt-1 flex-1 text-xs text-muted sm:text-sm">{product.text}</p>
              <a
                href={orderUrl(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm font-semibold text-brand-purple hover:underline"
              >
                Commander sur <span className="whitespace-nowrap">WhatsApp →</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
