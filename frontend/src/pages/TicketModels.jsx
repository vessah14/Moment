import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import TicketCard from '../components/tickets/TicketCard'
import { getSiteTheme } from '../components/site/themes/themeDefs'
import { routeSeo } from '../data/seoRoutes'
import { TICKET_FORMATS, TICKET_STYLES } from '../utils/ticketStyles'
import { siteUrl, useSeo } from '../utils/seo'
import { t } from '../i18n'

// Les 10 modèles de billets (repris de billets.html du prototype), chacun montré sur un
// événement de démonstration ; le PDF et l'image se téléchargent pour essayer.

const DEMO = {
  fairepart: { theme: 'bloom', for: t("Mariage, baptême, communion, anniversaire de mariage"), accent: '#B5616E', accent2: '#6F8F76',
    event: { title: t("Mariage de Grâce & Junior"), names: ['Grâce', 'Junior'], kicker: 'Mariage', dateText: t("Samedi 24 avril 2027"), dayShort: t("Sam 24 avr"), timeText: t("10h00"), venue: t("Paroisse Saint-Jean"), venueAddr: 'Bonamoussadi, Douala', slug: 'grace-junior' },
    guest: { name: 'Carine Ebelle', n: 2, table: t("Table 2 · Hibiscus") } },
  pagne: { theme: 'toghu', for: t("Dot, mariage coutumier, retrouvailles familiales"), accent: '#E9B526', accent2: '#C8312B',
    event: { title: t("Dot de Mireille & Patrick"), names: ['Mireille', 'Patrick'], kicker: t("Mariage coutumier · Dot · 16 janvier 2027"), dateText: t("Samedi 16 janvier 2027"), dayShort: t("Sam 16 janv"), timeText: t("10h00"), venue: t("Concession Kamdem"), venueAddr: 'Bafoussam', slug: 'mireille-patrick' },
    guest: { name: 'Serge Kamga', n: 3, side: t("Famille Kamdem") } },
  concert: { theme: 'live', for: t("Concert, soirée, réveillon, Saint-Valentin"), accent: '#FF3D7F', accent2: '#2EE6D6',
    event: { title: 'Douala Live Sessions', kicker: 'Concert', dateText: t("Samedi 13 février 2027"), dayShort: t("Sam 13 févr"), timeText: t("20h00"), venue: t("Esplanade du Wouri"), slug: 'douala-live-sessions' },
    guest: { name: 'Brenda Mbappé', n: 2, type: t("Gradins") } },
  stade: { theme: 'arena', for: t("Match, tournoi, compétition sportive"), accent: '#C1121F', accent2: '#1D4ED8',
    event: { title: t("Finale · Coupe des Entreprises"), dateText: t("Samedi 27 mars 2027"), dayShort: t("Sam 27 mars"), timeText: t("15h30"), venue: t("Stade de la Réunification"), slug: 'coupe-entreprises-2027' },
    guest: { name: 'Junior Ewané', n: 2, type: t("Tribune couverte") } },
  badge: { theme: 'campus', for: t("Conférence, séminaire, école, salon, lancement"), accent: '#2F3DCC', accent2: '#FF6B35',
    event: { title: t("Journée culturelle · IUGET"), organizer: 'IUGET de Bonabérie', dateText: t("Vendredi 19 mars 2027"), dayShort: t("Ven 19 mars"), timeText: t("09h00"), venue: 'IUGET de Bonabérie', slug: 'journee-culturelle-iuget' },
    guest: { name: 'Fatou Ndiaye', n: 1, type: t("Étudiant IUGET") } },
  polaroid: { theme: 'fiesta', for: t("Anniversaire, baby shower, crémaillère"), accent: '#6C4BF4', accent2: '#FF7A3D',
    event: { title: t("Les 30 ans de Manuella"), dateText: t("Samedi 21 novembre 2026"), dayShort: t("Sam 21 nov"), timeText: t("18h00"), venue: 'Rooftop Le Phare', slug: 'manuella-30' },
    guest: { name: 'Ange Tchoupo', n: 2 } },
  sobre: { theme: 'souvenir', for: t("Obsèques, retrait de deuil, commémoration"), accent: '#5E5240', accent2: '#4D6A8A',
    event: { title: t("Retrait de deuil de Papa Emmanuel Tchinda"), kicker: t("Retrait de deuil · 27 et 28 février 2027"), pre: t("Célébrons la vie de"), names: ['Papa Emmanuel Tchinda'], monogram: 'ET', dateText: t("Samedi 27 février 2027"), dayShort: t("Sam 27 févr"), timeText: t("10h00"), venue: t("Concession familiale Tchinda · Quartier Tobin"), venueAddr: 'Bangangté', slug: 'retrait-deuil-papa-tchinda' },
    guest: { name: t("Famille Kamga"), n: 1, side: t("Je commande 1 pagne") } },
  classique: { theme: 'noel', for: t("Fêtes et saisons, tous les événements"), accent: '#C8102E', accent2: '#1F7A4D',
    event: { title: t("Arbre de Noël des enfants 2026"), dateText: t("Samedi 19 décembre 2026"), dayShort: t("Sam 19 déc"), timeText: t("14h00"), venue: t("Jardin du Club Wouri"), slug: 'arbre-de-noel-2026' },
    guest: { name: 'Clarisse Ebongue', n: 3 } },
  or: { theme: 'prestige', for: t("Gala, grand anniversaire, soirée prestige"), accent: '#8C6A22', accent2: '#C2A15A',
    event: { title: t("Les 50 ans de Jean-Claude"), dateText: t("Samedi 30 janvier 2027"), dayShort: t("Sam 30 janv"), timeText: t("19h30"), venue: 'Salon Prestige', slug: 'jean-claude-50' },
    guest: { name: 'Serge Nanga', n: 2, table: 'Table 2 · Promotion 99' } },
  minimal: { theme: 'summit', for: t("Conférence, atelier, réunion professionnelle"), accent: '#2346D6', accent2: '#0EA5A0',
    event: { title: t("Forum Tech & IA de Douala 2027"), dateText: t("Mardi 18 mai 2027"), dayShort: t("Mar 18 mai"), timeText: t("08h30"), venue: t("Centre de conférences de Bonanjo"), slug: 'forum-tech-ia-douala' },
    guest: { name: 'Paul Biyong', n: 1, type: t("Pass standard") } },
}

// Début des identifiants de démonstration : chaque billet affiche un code différent.
const DEMO_CODES = ['3f9a2c71', 'b84e0d5a', '7c21e9f4', 'e05b8a3d', '9d6c41b2', '42af7e19', 'c7d3905e', '18e6fb4c', 'a5b2c8d0', '6e9f13a7']

// Pied du billet : « Modèle · Palette » du modèle de page de démonstration.
const demoBrand = (id) => {
  const theme = getSiteTheme(id)
  return theme ? theme.name + ' · ' + t(theme.palettes[0].label) : ''
}

// Surtitre du billet : type d'événement du modèle, puis la date sans le jour de la semaine.
const demoKicker = (d) => [t(getSiteTheme(d.theme)?.kicker), d.event.dateText.replace(/^\S+\s/, '')].filter(Boolean).join(' · ')

const STEPS = [
  [t("01 · Choisir"), t("L'organisateur choisit le modèle dans le Builder. Le plus adapté est proposé automatiquement.")],
  [t("02 · Recevoir"), t("L'invité confirme sa présence et reçoit aussitôt son billet nominatif.")],
  [t("03 · Garder"), t("Sur le téléphone, en PDF à imprimer ou en image pour WhatsApp.")],
  [t("04 · Entrer"), t("L'équipe d'accueil scanne le QR code. Une photocopie est refusée.")],
]

export default function TicketModels() {
  useSeo(routeSeo('/billets', siteUrl()))
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <section className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold tracking-widest text-brand-purple uppercase">{t("Billets")}</span>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] leading-[1.06] font-bold tracking-tight text-ink">
            {t("Une carte, un billet ou un badge à l'image de votre événement")}
          </h1>
          <p className="mt-4 text-muted">
            {t("Pour un mariage ou une dot, vos invités reçoivent une carte d'invitation. Pour un concert ou un match, chaque acheteur reçoit un billet d'entrée. Pour une conférence, un badge. Tout se garde sur le téléphone, s'imprime en PDF ou s'envoie en image sur WhatsApp, et le QR code ne passe qu'une fois au scanner.")}
          </p>
        </section>

        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([k, text]) => (
            <li key={k} className="rounded-2xl border border-border-soft bg-surface p-4 text-sm text-muted">
              <b className="mb-1 block font-mono text-xs tracking-widest text-brand-purple uppercase">{k}</b>
              {text}
            </li>
          ))}
        </ol>

        {TICKET_FORMATS.map((f) => (
        <section key={f.id} className="mt-14" aria-labelledby={`format-${f.id}`} data-no-reveal>
          <h2 id={`format-${f.id}`} className="text-2xl font-bold text-ink">{t(f.label)}</h2>
          <p className="mt-1 text-muted">{t(f.hint)}</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
          {TICKET_STYLES.filter((s) => s.format === f.id).map((s) => {
            const d = DEMO[s.id]
            return (
              <article key={s.id} id={`billet-${s.id}`} className={`${f.id === 'billet' ? 'md:col-span-2' : ''} grid grid-rows-[auto_1fr] overflow-hidden rounded-3xl border border-border-soft bg-surface`}>
                <div className="bg-[radial-gradient(70%_70%_at_50%_40%,#2b2266,#100c2c)] px-4 py-6">
                  <TicketCard
                    style={s.id}
                    themeId={d.theme}
                    accent={d.accent}
                    event={{ brand: demoBrand(d.theme), kicker: demoKicker(d), ...d.event }}
                    guest={{ id: `${DEMO_CODES[TICKET_STYLES.indexOf(s)]}-0000-4000-8000-000000000000`, ...d.guest }}
                    localized
                  />
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <h3 className="text-xl font-bold text-ink">{t(s.label)}</h3>
                  <p className="text-sm text-ink">
                    <span className="block text-[11px] font-semibold tracking-widest text-faint uppercase">{t("Idéal pour")}</span>
                    {d.for}
                  </p>
                  <p className="text-sm text-muted">{t(s.description)}</p>
                  <Link to={`/modeles/${d.theme}`} className="mt-1 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-purple hover:underline">
                    {t('Voir le modèle de page')} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            )
          })}
          </div>
        </section>
        ))}

        <p className="mt-12 text-center">
          <Link to="/inscription" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[linear-gradient(100deg,#FF7A3D_0%,#E2337E_50%,#6C4BF4_100%)] px-6 text-sm font-semibold text-white">
            {t('Créer mon événement')} <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
