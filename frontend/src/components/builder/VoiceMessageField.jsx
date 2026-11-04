import { Mic, Square, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { voiceUrl } from '../../api/client'

// Message vocal des hôtes, joint au billet de chaque invité (« Brenda, on a hâte de te
// voir ! »). Enregistré ici en une minute au plus, ou choisi depuis un fichier du téléphone.
// voice = { url, from } est rangé dans customFields.ticket.voice avec l'événement.

const MAX_SECONDS = 60
const MAX_BYTES = 3 * 1024 * 1024
const ACCEPT = '.m4a,.mp3,.ogg,.webm,audio/mp4,audio/mpeg,audio/ogg,audio/webm'

// MP4 d'abord : c'est le seul format lu partout, iPhone compris.
const RECORD_TYPES = [
  ['audio/mp4', '.m4a'],
  ['audio/webm;codecs=opus', '.webm'],
  ['audio/webm', '.webm'],
  ['audio/ogg;codecs=opus', '.ogg'],
]

function recordType() {
  if (typeof MediaRecorder === 'undefined') return null
  return RECORD_TYPES.find(([type]) => MediaRecorder.isTypeSupported?.(type)) ?? null
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function VoiceMessageField({ voice, onChange, onUpload }) {
  const [phase, setPhase] = useState('idle') // idle | recording | review | uploading
  const [seconds, setSeconds] = useState(0)
  const [draft, setDraft] = useState(null) // { file, url } en attente de validation
  const [error, setError] = useState('')
  const recorder = useRef(null)
  const fileInput = useRef(null)
  const canRecord = Boolean(recordType()) && Boolean(navigator.mediaDevices?.getUserMedia)

  useEffect(() => () => draft && URL.revokeObjectURL(draft.url), [draft])
  // Arrêt du micro si on quitte l'onglet Billet en plein enregistrement.
  useEffect(() => () => recorder.current?.state === 'recording' && recorder.current.stop(), [])

  useEffect(() => {
    if (phase !== 'recording') return
    const startedAt = Date.now()
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      setSeconds(Math.min(elapsed, MAX_SECONDS))
      if (elapsed >= MAX_SECONDS && recorder.current?.state === 'recording') recorder.current.stop()
    }, 250)
    return () => clearInterval(id)
  }, [phase])

  const start = async () => {
    setError('')
    const [type, extension] = recordType() ?? []
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Micro inaccessible : autorisez le micro pour ce site, ou choisissez un fichier audio.')
      return
    }
    const chunks = []
    const rec = new MediaRecorder(stream, { mimeType: type, audioBitsPerSecond: 64000 })
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunks, { type: rec.mimeType || type })
      if (!blob.size) {
        setPhase('idle')
        setError("L'enregistrement est vide. Réessayez.")
        return
      }
      const file = new File([blob], `message${extension}`, { type: blob.type })
      setDraft({ file, url: URL.createObjectURL(blob) })
      setPhase('review')
    }
    recorder.current = rec
    rec.start()
    setSeconds(0)
    setPhase('recording')
  }

  const pickFile = (file) => {
    setError('')
    if (!file) return
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!['.m4a', '.mp3', '.ogg', '.webm'].includes(extension)) {
      setError('Format non pris en charge : M4A, MP3, OGG ou WebM.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Fichier trop lourd (3 Mo maximum, environ une minute).')
      return
    }
    setDraft({ file, url: URL.createObjectURL(file) })
    setPhase('review')
  }

  const save = async () => {
    if (!draft) return
    setPhase('uploading')
    setError('')
    try {
      const url = await onUpload(draft.file)
      onChange({ voice: { url, from: voice?.from ?? '' } })
      setDraft(null)
      setPhase('idle')
    } catch (err) {
      setError(err.message || "L'envoi a échoué. Réessayez.")
      setPhase('review')
    }
  }

  const current = voice?.url ? voiceUrl(voice.url) : ''
  return (
    <div className="rounded-xl border border-border-soft p-4">
      <p className="text-sm font-medium text-ink">Message vocal des hôtes</p>
      <p className="mt-1 text-xs text-muted">
        Un petit mot à votre voix, que chaque invité écoute depuis son billet : « On a hâte de vous voir ! ». Une minute au plus.
      </p>

      {phase === 'recording' && (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-danger/10 px-3 py-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger" aria-hidden="true" />
          <span className="flex-1 text-sm font-semibold text-ink tabular-nums" aria-live="polite">
            {mmss(seconds)} / {mmss(MAX_SECONDS)}
          </span>
          <button type="button" onClick={() => recorder.current?.state === 'recording' && recorder.current.stop()} className="inline-flex items-center gap-1.5 rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white">
            <Square className="h-3.5 w-3.5" aria-hidden="true" /> Arrêter
          </button>
        </div>
      )}

      {(phase === 'review' || phase === 'uploading') && draft && (
        <div className="mt-3 space-y-2">
          <audio src={draft.url} controls className="w-full" />
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={phase === 'uploading'} className="flex-1 rounded-lg bg-brand-purple px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
              {phase === 'uploading' ? 'Envoi…' : 'Utiliser ce message'}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(null)
                setPhase('idle')
              }}
              disabled={phase === 'uploading'}
              className="rounded-lg border border-border-soft px-3 py-2 text-xs font-semibold text-ink"
            >
              Recommencer
            </button>
          </div>
        </div>
      )}

      {phase === 'idle' && current && (
        <div className="mt-3 space-y-2">
          <audio src={current} controls preload="none" className="w-full" />
          <button type="button" onClick={() => onChange({ voice: null })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger hover:underline">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Retirer le message
          </button>
        </div>
      )}

      {phase === 'idle' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {canRecord && (
            <button type="button" onClick={start} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-purple px-3 py-2 text-xs font-semibold text-white">
              <Mic className="h-3.5 w-3.5" aria-hidden="true" /> {current ? 'Réenregistrer ma voix' : 'Enregistrer ma voix'}
            </button>
          )}
          <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft px-3 py-2 text-xs font-semibold text-ink">
            <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Choisir un fichier
          </button>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      )}

      {voice?.url && (
        <label className="mt-3 block">
          <span className="text-xs font-medium text-ink">Signé</span>
          <input
            type="text"
            maxLength={60}
            value={voice.from || ''}
            onChange={(e) => onChange({ voice: { ...voice, from: e.target.value } })}
            placeholder="Shanice et sa famille"
            className="mt-1 w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm text-ink"
          />
        </label>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-faint">Pensez à enregistrer la page pour l'envoyer aux invités.</p>
    </div>
  )
}
