import { Camera, Check, CheckCircle2, Heart, Sparkles, Star } from 'lucide-react'
import campusShot from '../../assets/home/campus.webp'
import toghuShot from '../../assets/home/toghu.webp'
import SectionHeader from './SectionHeader'

// « Comment ça marche » (repris du prototype) : trois étapes, texte d'un côté et visuel
// de l'autre (alternés). Les visuels sont dessinés en HTML : assistant de création,
// conversation WhatsApp, tableau de bord et scanner.

function Ticks({ items }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((t) => (
        <li key={t} className="grid grid-cols-[22px_1fr] gap-2.5 text-[0.95rem] text-ink">
          <Check aria-hidden="true" className="mt-0.5 h-5 w-5 text-[#3DD68C]" strokeWidth={2.4} />
          {t}
        </li>
      ))}
    </ul>
  )
}

function Step({ n, label, title, text, ticks, visual, reverse }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
      <div className={reverse ? 'lg:order-2' : ''}>
        <span className="font-mono text-[0.78rem] font-semibold tracking-widest text-brand-purple">
          {n} · {label}
        </span>
        <h3 className="mt-2 mb-3.5 text-[clamp(1.6rem,3.4vw,2.3rem)] leading-[1.1] font-bold tracking-tight text-ink">{title}</h3>
        <p className="mb-4 text-[1.02rem] text-muted">{text}</p>
        <Ticks items={ticks} />
      </div>
      <div
        aria-hidden="true"
        className="relative grid min-h-[380px] place-items-center overflow-hidden rounded-3xl border border-border-soft p-6"
        style={{ background: 'linear-gradient(160deg, var(--color-surface-2), var(--color-surface))' }}
      >
        {visual}
      </div>
    </div>
  )
}

function PhoneShot({ src, className = '' }) {
  return (
    <div className={`relative w-[230px] rounded-[38px] bg-[linear-gradient(145deg,#2A2360,#120E33)] p-[9px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.7),inset_0_0_0_1px_#3A3176] ${className}`}>
      <img src={src} alt="" className="block aspect-[390/844] w-full rounded-[30px] object-cover object-top" loading="lazy" />
    </div>
  )
}

// 01 · Créer : téléphone et assistant « Type d'événement »
function CreateVisual() {
  const options = [
    [Heart, 'Mariage', false],
    [Sparkles, 'Journée culturelle', true],
    [Star, 'Remise des diplômes', false],
  ]
  return (
    <>
      <PhoneShot src={campusShot} className="-rotate-3" />
      <div className="absolute right-[6%] top-[12%] w-[210px] rounded-2xl bg-white p-3.5 text-[0.78rem] text-[#17123A] shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)] max-sm:top-auto max-sm:right-[3%] max-sm:bottom-[5%] max-sm:w-[180px]">
        <p className="mb-2 font-bold">Type d'événement</p>
        {options.map(([Icon, label, on]) => (
          <div
            key={label}
            className={`mt-1.5 flex items-center gap-2 rounded-[10px] border px-2 py-1.5 ${on ? 'border-[#6C4BF4] bg-[#F1EDFF]' : 'border-[#E5E1F7]'}`}
          >
            <span className="grid h-[22px] w-[22px] place-items-center rounded-[7px] bg-[#EDE9FE] text-[#6C4BF4]">
              <Icon className="h-3 w-3" />
            </span>
            {label}
          </div>
        ))}
      </div>
    </>
  )
}

// 02 · Partager : conversation WhatsApp avec l'aperçu du lien
function ShareVisual() {
  return (
    <div className="w-full max-w-[360px] overflow-hidden rounded-[22px] bg-[#0B141A] shadow-[0_30px_70px_-30px_rgba(0,0,0,.8)]">
      <div className="flex items-center gap-2.5 bg-[#1F2C34] px-3.5 py-3 text-[0.86rem] text-[#E9EDEF]">
        <span className="h-8 w-8 rounded-full bg-[linear-gradient(100deg,#FF7A3D,#E2337E,#6C4BF4)]" />
        <div>
          <b>Famille Kamdem</b>
          <small className="block text-[0.72rem] text-[#8696A0]">Tata Odile, Serge, Brenda, vous…</small>
        </div>
      </div>
      <div className="grid gap-2 px-3 pt-4 pb-5 text-[0.84rem] leading-snug text-[#E9EDEF]">
        <div className="max-w-[88%] justify-self-end rounded-xl rounded-tr bg-[#005C4B] p-1.5 pb-2">
          <div className="mb-1.5 overflow-hidden rounded-lg bg-[#025144]">
            <img src={toghuShot} alt="" className="block aspect-[1200/630] w-full object-cover object-top" loading="lazy" />
            <div className="px-2.5 py-2">
              <b className="block text-[0.82rem]">Dot de Mireille &amp; Patrick</b>
              <small className="text-[0.72rem] text-[#B6D8CF]">Samedi 16 janvier 2027 · Bafoussam</small>
            </div>
          </div>
          <span className="px-1.5">
            Bonjour la famille, voici l'invitation officielle pour la dot. Merci de confirmer votre venue avant le 5 janvier.
          </span>
          <span className="block pr-1 text-right text-[0.66rem] text-[#C6E4DC]">10:42 ✓✓</span>
        </div>
        <div className="max-w-[88%] rounded-xl rounded-tl bg-[#1F2C34] px-3 py-2">
          C'est trop beau ! J'ai confirmé pour 3 personnes.
          <span className="block text-right text-[0.66rem] text-[#B7C7CF]">10:44</span>
        </div>
        <div className="max-w-[88%] rounded-xl rounded-tl bg-[#1F2C34] px-3 py-2">
          Même la musique 😍 On arrive en force.
          <span className="block text-right text-[0.66rem] text-[#B7C7CF]">10:51</span>
        </div>
      </div>
    </div>
  )
}

// 03 · Accueillir : tableau de bord et scanner
const GUESTS = [
  ['TE', 'Thierry Éwané', 'Peut-être', '#5A8CF0', 4, 'Famille Fokou'],
  ['RM', 'Rose Mballa', 'Confirmé', '#25A86A', 6, 'Famille Tsafack'],
  ['MD', 'Mireille Djomo', 'Confirmé', '#25A86A', 5, 'Famille Tsafack'],
  ['SE', 'Sandrine Etoundi', 'Confirmé', '#25A86A', 4, 'Famille Tsafack'],
  ['UE', 'Ulrich Eyenga', 'En attente', '#BF850F', 1, 'Famille Fokou'],
]

function WelcomeVisual() {
  return (
    <div className="relative w-full pb-6">
      <div className="w-[84%] overflow-hidden rounded-[14px] max-sm:w-full border border-[#2E2663] bg-[#0F0B2E] p-4 text-[#F2EFFF] shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]">
        <div className="flex items-center gap-2 text-[0.7rem] font-bold">
          <span className="text-[#E2337E]">M</span> TBF MOMENT
          <span className="ml-auto rounded-md bg-[#6C4BF4] px-2 py-1 text-[0.62rem]">Scanner les entrées</span>
        </div>
        <p className="mt-3 font-mono text-[0.58rem] tracking-widest text-[#A8A1D1] uppercase">Mariage coutumier</p>
        <p className="text-lg font-bold">Dot de Rosine &amp; Arnaud</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            ['Personnes attendues', '155'],
            ['Sans réponse', '12'],
            ['Taux de réponse', '83 %'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-[#2E2663] bg-[#19133F] p-2">
              <p className="font-mono text-[0.52rem] tracking-wider text-[#A8A1D1] uppercase">{k}</p>
              <p className="text-xl font-bold">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-[#2E2663] bg-[#19133F]">
          {GUESTS.map(([ini, name, st, color, n, side]) => (
            <div key={name} className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] items-center gap-2 border-b border-[#2E2663] px-2.5 py-1.5 text-[0.66rem] last:border-0 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_30px_minmax(0,1fr)]">
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#211A52] text-[0.55rem] font-bold text-[#D9CFFF]">{ini}</span>
                <span className="truncate font-semibold">{name}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                {st}
              </span>
              <span className="text-right">{n}</span>
              <span className="hidden truncate text-[#A8A1D1] sm:block">{side}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-0 bottom-0 w-[130px] rounded-[30px] max-sm:hidden bg-[linear-gradient(145deg,#2A2360,#120E33)] p-[7px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] sm:w-[160px]">
        <div className="overflow-hidden rounded-[24px] bg-[#06041A] text-[#F2EFFF]">
          <div className="grid aspect-square place-items-center text-[#8F89BD]">
            <Camera className="h-7 w-7" />
          </div>
          <div className="flex items-center gap-2 bg-[#1E8F59] px-2.5 py-2 text-[0.66rem] font-bold">
            <CheckCircle2 className="h-4 w-4" /> Pass valide
          </div>
          <div className="px-2.5 py-2">
            <p className="text-[0.78rem] font-bold">Laure Ndjock</p>
            <p className="text-[0.6rem] text-[#A8A1D1]">4 places · Famille Tsafack</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="comment" className="relative scroll-mt-20" aria-labelledby="how-heading">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader id="how-heading" eyebrow="Comment ça marche" title="De l'idée à l'accueil, en trois temps" className="mb-12">
          Pas besoin de graphiste ni de développeur. Tout se fait depuis votre téléphone.
        </SectionHeader>

        <div className="grid gap-20">
          <Step
            n="01"
            label="CRÉER"
            title="Votre page est prête en 5 minutes"
            text="Répondez à quelques questions : le type d'événement, la date, le lieu. Choisissez un modèle, ajoutez votre logo si vous êtes une école ou une entreprise, et voyez le résultat se construire en direct."
            ticks={['Ouverture animée, musique, motifs et couleurs', 'Programme, lieux, plan de table, cagnotte, livre d’or', 'Léger, même sur les petits téléphones et en 3G']}
            visual={<CreateVisual />}
          />
          <Step
            reverse
            n="02"
            label="PARTAGER"
            title="Un lien qui donne envie de cliquer"
            text="Sur WhatsApp, votre lien s'affiche avec une belle image, le titre et la date. Chaque invité peut recevoir son propre lien : il ouvre, il répond en 10 secondes, il reçoit son pass."
            ticks={['Aperçu WhatsApp soigné pour chaque événement', 'Invitation personnalisée avec le prénom de l’invité', 'Relance de ceux qui n’ont pas répondu, en un geste']}
            visual={<ShareVisual />}
          />
          <Step
            n="03"
            label="ACCUEILLIR"
            title="Vous savez qui vient. Et qui est là."
            text="Le tableau de bord compte les réponses, les places et les billets vendus. Le jour J, votre équipe scanne les pass à l'entrée avec un simple téléphone."
            ticks={['Réponses par famille, par catégorie de billet', 'Liste des invités exportable', 'Pass déjà utilisé ? Le scanner le signale tout de suite']}
            visual={<WelcomeVisual />}
          />
        </div>
      </div>
    </section>
  )
}
