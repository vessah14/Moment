import {
  ChevronDown,
  ChevronUp,
  Images,
  MapPin,
  PlayCircle,
  Quote,
  Trash2,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logoMark from '../../assets/logo-mark.png'

const HERO_FONT_STACKS = {
  'Plus Jakarta Sans + DM Sans': 'var(--font-heading)',
  'Inter + Inter': 'var(--font-sans)',
  'Playfair Display + Inter': 'var(--font-display-premium)',
}

const MENU_OPTIONS = ['Standard', 'Végétarien', 'Végan', 'Sans gluten']

function blockDomId(block) {
  return `builder-block-${block.replace(/\s+/g, '-')}`
}

function useCountdown(targetDateTime) {
  const [remaining, setRemaining] = useState(() => computeRemaining(targetDateTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(computeRemaining(targetDateTime))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDateTime])

  return remaining
}

function computeRemaining(targetDateTime) {
  const diff = Math.max(0, new Date(targetDateTime).getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function SectionHeading({ content, accent }) {
  if (!content?.showHeading || !content?.heading) return null
  return (
    <h2
      className="text-2xl font-bold text-slate-900"
      style={accent ? { color: 'var(--color-brand-purple)' } : undefined}
    >
      {content.heading}
    </h2>
  )
}

function RsvpForm() {
  const [accomp, setAccomp] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-700">
        Merci ! Votre présence a bien été confirmée.
      </p>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
      className="space-y-4"
    >
      <label className="block">
        <span className="text-xs font-medium text-slate-700">Nom complet *</span>
        <input
          required
          placeholder="Entrez votre nom"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[color:var(--color-brand-purple)]"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-slate-700">Adresse email *</span>
        <input
          type="email"
          required
          placeholder="votre@email.com"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[color:var(--color-brand-purple)]"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-slate-700">
          Nombre d'accompagnants *
        </span>
        <div className="mt-1.5 flex w-fit items-center gap-3 rounded-lg border border-slate-300 px-3 py-2">
          <button
            type="button"
            onClick={() => setAccomp((n) => Math.max(0, n - 1))}
            className="text-slate-500 hover:text-slate-900"
          >
            −
          </button>
          <span className="w-6 text-center text-sm text-slate-900">{accomp}</span>
          <button
            type="button"
            onClick={() => setAccomp((n) => Math.min(9, n + 1))}
            className="text-slate-500 hover:text-slate-900"
          >
            +
          </button>
        </div>
      </label>
      <label className="block">
        <span className="text-xs font-medium text-slate-700">
          Préférence de menu *
        </span>
        <select
          required
          defaultValue=""
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[color:var(--color-brand-purple)]"
        >
          <option value="" disabled>
            Sélectionner (Standard / Végétarien / Végan)
          </option>
          {MENU_OPTIONS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-medium text-slate-700">
          Votre message ou contraintes alimentaires
        </span>
        <textarea
          rows={3}
          placeholder="Allergies, mots doux pour les mariés..."
          className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[color:var(--color-brand-purple)]"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-[color:var(--color-brand-purple)] py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        Confirmer ma présence
      </button>
    </form>
  )
}

function GuestbookBlock({ content, onChangeBlockContent }) {
  const entries = content.entries ?? []
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    onChangeBlockContent?.("Livre d'or", {
      entries: [{ name: name.trim(), role: "à l'instant", message: message.trim() }, ...entries],
    })
    setName('')
    setMessage('')
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {entries.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="rounded-xl bg-slate-50 p-4">
            <Quote className="h-4 w-4 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">« {entry.message} »</p>
            <p className="mt-3 text-xs font-semibold text-slate-900">
              {entry.name} <span className="font-normal text-slate-400">· {entry.role}</span>
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_2fr_auto]"
      >
        <label className="block">
          <span className="text-xs font-medium text-slate-700">Votre nom</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[color:var(--color-brand-purple)]"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-700">Votre message</span>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrire quelque chose..."
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[color:var(--color-brand-purple)]"
          />
        </label>
        <button
          type="submit"
          className="mt-1.5 rounded-lg bg-[color:var(--color-brand-purple)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 sm:mt-6"
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}

function FaqBlock({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.question} className="rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-slate-900">{item.question}</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              )}
            </button>
            {isOpen && (
              <p className="px-4 pb-4 text-sm text-slate-500">{item.answer}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function BlockBody({ block, content, onChangeBlockContent }) {
  switch (block) {
    case 'Histoire':
      return (
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <p className="text-sm leading-relaxed text-slate-500">{content.body}</p>
          <div className="flex aspect-4/3 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
            Photo placeholder
          </div>
        </div>
      )
    case 'Programme':
      return (
        <ol className="space-y-6 border-l-2 border-slate-200 pl-6">
          {(content.items ?? []).map((item) => (
            <li key={item.time} className="relative">
              <span
                className="absolute top-1 -left-[1.65rem] h-3 w-3 rounded-full"
                style={{ backgroundColor: 'var(--color-brand-purple)' }}
              />
              <p
                className="font-mono text-sm font-semibold"
                style={{ color: 'var(--color-brand-purple)' }}
              >
                {item.time}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {item.title}{' '}
                <span className="ml-1 text-xs font-normal text-slate-400">
                  · {item.location}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            </li>
          ))}
        </ol>
      )
    case 'Galerie':
      return (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: content.photoCount ?? 8 }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-lg bg-slate-100 text-slate-300"
            >
              <Images className="h-5 w-5" />
            </div>
          ))}
        </div>
      )
    case 'Intervenants':
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(content.people ?? []).map((person) => (
            <div
              key={person.name}
              className="rounded-xl bg-slate-50 p-4 text-center"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                <Users className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900">{person.name}</p>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'var(--color-brand-purple)' }}
              >
                {person.role}
              </p>
            </div>
          ))}
        </div>
      )
    case 'Localisation':
      return (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Adresse de l'événement
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{content.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Moyens de transport
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{content.transport}</p>
              </div>
            </div>
          </div>
          <div className="flex aspect-4/3 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
            Carte interactive (placeholder)
          </div>
        </div>
      )
    case 'RSVP':
      return (
        <div className="mx-auto max-w-md">
          <RsvpForm />
        </div>
      )
    case "Livre d'or":
      return (
        <GuestbookBlock content={content} onChangeBlockContent={onChangeBlockContent} />
      )
    case 'FAQ':
      return <FaqBlock items={content.items} />
    case 'Vidéo':
      return (
        <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <PlayCircle className="h-10 w-10" />
        </div>
      )
    case 'Billetterie':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {(content.tiers ?? []).map((tier) => (
            <div
              key={tier.name}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-5 py-4"
            >
              <span className="text-sm font-semibold text-slate-900">{tier.name}</span>
              <span
                className="text-sm font-bold"
                style={{ color: 'var(--color-brand-purple)' }}
              >
                {tier.price}
              </span>
            </div>
          ))}
        </div>
      )
    case 'Plan de table':
      return (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <p className="text-sm text-slate-500">{content.body}</p>
          <p className="mt-2 text-xs text-slate-400">
            Configurez le plan de table complet depuis le tableau de bord.
          </p>
        </div>
      )
    case 'Pied de page':
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <img src={logoMark} alt="" className="h-8 w-8 opacity-70" />
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/mentions-legales" className="hover:text-slate-900">
              Confidentialité
            </Link>
            <Link to="/mentions-legales" className="hover:text-slate-900">
              Mentions légales
            </Link>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-400">
            Powered by TBF Moment
          </span>
        </div>
      )
    default:
      return content.body ? (
        <p className="text-sm text-slate-500">{content.body}</p>
      ) : null
  }
}

export default function BuilderCanvas({
  slug,
  blocks,
  blockContent,
  selectedBlock,
  onSelectBlock,
  onChangeBlockContent,
  onReorderBlock,
  onRemoveBlock,
  device,
  heroStyle,
  eventDateTime,
  readOnly = false,
}) {
  const countdown = useCountdown(eventDateTime)

  useEffect(() => {
    if (!selectedBlock) return
    const el = document.getElementById(blockDomId(selectedBlock))
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedBlock])

  return (
    <div className="flex-1 overflow-y-auto bg-surface px-8 py-6">
      <p className="text-center font-mono text-xs text-faint">
        tbfmoment.com/{slug}
      </p>

      <div
        className={`mx-auto mt-4 overflow-hidden rounded-xl bg-white shadow-xl transition-all ${
          device === 'mobile' ? 'max-w-xs' : 'max-w-2xl'
        }`}
      >
        <div
          id={blockDomId('Hero')}
          onClick={readOnly ? undefined : () => onSelectBlock('Hero')}
          className={`relative flex flex-col items-center justify-center gap-3 px-6 py-16 text-center ${
            readOnly ? '' : 'cursor-pointer'
          } ${selectedBlock === 'Hero' ? 'ring-2 ring-inset ring-[color:var(--color-brand-purple)]' : ''}`}
          style={{
            background: heroStyle.darkOverlay
              ? `linear-gradient(160deg, ${heroStyle.color}22, #f8fafc)`
              : '#f8fafc',
          }}
        >
          {selectedBlock === 'Hero' && !readOnly && (
            <span className="absolute top-3 left-3 rounded-full bg-[color:var(--color-brand-purple)] px-2.5 py-1 text-[11px] font-semibold text-white">
              Hero
            </span>
          )}
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
            Invitation d'exception
          </span>
          <p
            className="text-3xl font-bold text-slate-900"
            style={{ fontFamily: HERO_FONT_STACKS[heroStyle.font] }}
          >
            {heroStyle.title}
          </p>
          <p className="text-sm text-slate-500">{heroStyle.subtitle}</p>
        </div>

        {countdown && (
          <div className="grid grid-cols-4 gap-3 px-6 py-6">
            {[
              ['Jours', countdown.days],
              ['Heures', countdown.hours],
              ['Minutes', countdown.minutes],
              ['Secondes', countdown.seconds],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg bg-slate-50 py-3 text-center"
              >
                <p className="text-xl font-bold text-slate-900">
                  {String(value).padStart(2, '0')}
                </p>
                <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div>
          {blocks.map((block, index) => {
            const content = blockContent[block]
            const isSelected = selectedBlock === block
            return (
              <div
                key={block}
                id={blockDomId(block)}
                onClick={readOnly ? undefined : () => onSelectBlock(block)}
                className={`relative border-t border-slate-100 px-6 py-8 ${
                  readOnly ? '' : 'cursor-pointer'
                } ${isSelected ? 'ring-2 ring-inset ring-[color:var(--color-brand-purple)]' : ''} ${
                  content?.tinted ? 'bg-slate-50' : 'bg-white'
                }`}
              >
                {isSelected && !readOnly && (
                  <div
                    className="absolute top-3 right-3 left-3 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="rounded-full bg-[color:var(--color-brand-purple)] px-2.5 py-1 text-[11px] font-semibold text-white">
                      {block}
                    </span>
                    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => onReorderBlock(block, -1)}
                        className="rounded-full p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                        aria-label="Monter le bloc"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === blocks.length - 1}
                        onClick={() => onReorderBlock(block, 1)}
                        className="rounded-full p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                        aria-label="Descendre le bloc"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveBlock(block)}
                        className="rounded-full p-1 text-danger hover:bg-danger/10"
                        aria-label="Supprimer le bloc"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className={isSelected && !readOnly ? 'mt-8' : ''}>
                  <SectionHeading content={content} accent />
                  <div className={content?.showHeading && content?.heading ? 'mt-4' : ''}>
                    <BlockBody
                      block={block}
                      content={content ?? {}}
                      onChangeBlockContent={onChangeBlockContent}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {blocks.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            Cliquez un bloc à gauche pour l'ajouter à votre page.
          </p>
        )}
      </div>
    </div>
  )
}
