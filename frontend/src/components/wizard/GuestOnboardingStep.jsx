import QRCode from 'qrcode'
import { ArrowLeft, ClipboardPaste, Copy, Link2, Share2, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { eventShareUrl } from '../../api/client'
import { importGuests, listGuests } from '../../api/guests'
import { contactRowsFromPicker, parsePastedGuestList } from '../../utils/guestImport'
import { useToast } from '../../utils/useToast'
import Button from '../ui/Button'

function displayPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('237')) {
    return `+237 ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`
  }
  return phone || 'Aucun numéro trouvé'
}

export default function GuestOnboardingStep({ event, onSkip, isPublishing = false }) {
  const toast = useToast()
  const [guests, setGuests] = useState([])
  const [loadingGuests, setLoadingGuests] = useState(true)
  const [guestsReady, setGuestsReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('choose')
  const [pasteText, setPasteText] = useState('')
  const [reviewRows, setReviewRows] = useState([])
  const [reviewSkipped, setReviewSkipped] = useState(0)
  const [truncated, setTruncated] = useState(false)
  const [qr, setQr] = useState('')
  const [qrError, setQrError] = useState('')
  const contactsAvailable =
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    typeof navigator.contacts?.select === 'function'

  const registrationUrl = event?.slug
    ? `${eventShareUrl(event.slug)}/inscription`
    : ''
  const importableRows = useMemo(
    () => reviewRows
      .filter((row) => row.selected && !row.duplicate && row.fullName.trim())
      .map(({ fullName, phone, email, service }) => ({ fullName: fullName.trim(), phone, email, service })),
    [reviewRows],
  )
  const actionBusy = busy || isPublishing

  const fetchGuests = useCallback(async (isCancelled = () => false) => {
    try {
      const data = await listGuests(event.id)
      if (isCancelled()) return false
      setGuests(data ?? [])
      setGuestsReady(true)
      setError('')
      return true
    } catch (err) {
      if (!isCancelled()) {
        setGuestsReady(false)
        setError(err.message || 'Impossible de charger la liste des invités.')
      }
      return false
    } finally {
      if (!isCancelled()) setLoadingGuests(false)
    }
  }, [event.id])

  const reloadGuests = async () => {
    setLoadingGuests(true)
    return fetchGuests()
  }

  useEffect(() => {
    let cancelled = false
    fetchGuests(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [fetchGuests])

  useEffect(() => {
    if (!registrationUrl) return undefined
    let cancelled = false
    setQr('')
    setQrError('')
    QRCode.toDataURL(registrationUrl, { margin: 1, width: 360, color: { dark: '#111111', light: '#ffffff' } })
      .then((data) => {
        if (!cancelled) setQr(data)
      })
      .catch(() => {
        if (!cancelled) setQrError('Le QR code n’a pas pu être généré. Le lien reste disponible.')
      })
    return () => {
      cancelled = true
    }
  }, [registrationUrl])

  const addRows = async (rows, skipped = 0) => {
    if (!rows.length || actionBusy) return false

    setBusy(true)
    setError('')
    try {
      const result = await importGuests(event.id, rows)
      const added = result.added ?? 0
      const refreshed = await reloadGuests()
      if (!refreshed) setError('Les invités ont été ajoutés, mais la liste n’a pas pu être actualisée.')
      const skippedCount = (result.skipped ?? 0) + skipped
      toast(`${added} invité${added > 1 ? 's' : ''} ajouté${added > 1 ? 's' : ''}${skippedCount ? ` · ${skippedCount} doublon${skippedCount > 1 ? 's' : ''} ou contact sans nom ignoré${skippedCount > 1 ? 's' : ''}` : ''}`)
      if (result.limitReached) setError(result.limitReached)
      return true
    } catch (err) {
      setError(err.message || "L'ajout des invités a échoué.")
      return false
    } finally {
      setBusy(false)
    }
  }

  const chooseContacts = async () => {
    if (!contactsAvailable || actionBusy || !guestsReady) return
    setError('')
    try {
      const contacts = await navigator.contacts.select(['name', 'tel', 'email'], { multiple: true })
      const result = contactRowsFromPicker(contacts, guests)
      if (!result.previewRows.length) {
        setError(result.skipped ? 'Les contacts sélectionnés sont déjà dans la liste ou sans nom.' : 'Aucun contact sélectionné.')
        return
      }
      setReviewRows(result.previewRows.map((row) => ({ ...row, selected: !row.duplicate })))
      setReviewSkipped(result.skipped)
      setMode('contacts-review')
    } catch (err) {
      if (err?.name !== 'AbortError') setError(err.message || "Les contacts n'ont pas pu être lus.")
    }
  }

  const previewPaste = () => {
    const result = parsePastedGuestList(pasteText, guests)
    if (!result.rows.length) {
      setError('Collez une personne par ligne pour afficher l’aperçu.')
      return
    }
    setReviewRows(result.rows.map((row) => ({ ...row, selected: !row.duplicate })))
    setReviewSkipped(result.rows.filter((row) => row.duplicate).length)
    setTruncated(result.truncated)
    setError('')
    setMode('paste-review')
  }

  const importReviewedRows = async () => {
    const added = await addRows(importableRows, reviewSkipped)
    if (!added) return
    setReviewRows([])
    setReviewSkipped(0)
    setTruncated(false)
    if (mode === 'paste-review') setPasteText('')
    setMode('choose')
  }

  const copyRegistrationLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl)
      toast('Lien d’inscription copié')
    } catch {
      setError('Copie impossible : sélectionnez et copiez le lien affiché.')
    }
  }

  const shareRegistrationLink = async () => {
    if (typeof navigator.share !== 'function') {
      setError('Le partage direct n’est pas disponible. Copiez le lien ou partagez-le sur WhatsApp.')
      return
    }
    try {
      await navigator.share({
        title: `Inscription · ${event.name}`,
        text: `Inscrivez-vous à ${event.name}`,
        url: registrationUrl,
      })
    } catch (err) {
      if (err?.name !== 'AbortError') setError(err.message || 'Le partage du lien a échoué.')
    }
  }

  const backToChoices = () => {
    setError('')
    setMode('choose')
  }

  const toggleReviewRow = (index) => {
    setReviewRows((current) => current.map((row, i) => (
      i === index && !row.duplicate ? { ...row, selected: !row.selected } : row
    )))
  }

  const review = mode === 'contacts-review' || mode === 'paste-review'

  return (
    <div className="mx-auto max-w-3xl">
      {mode === 'choose' ? (
        <>
          <p className="text-sm font-semibold tracking-wide text-brand-purple uppercase">Étape 6 · Avant la publication</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Ajoutez vos invités</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {event?.name ? <>« {event.name} » est créé. </> : null}
            Ajoutez vos invités maintenant ou publiez votre page et revenez plus tard.
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-ink" role="status">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-purple/10 font-semibold text-brand-purple">
              {loadingGuests ? '…' : guests.length}
            </span>
            <span>{loadingGuests ? 'Chargement de la liste…' : `invité${guests.length > 1 ? 's' : ''} dans la liste`}</span>
            {!loadingGuests && !guestsReady && (
              <Button type="button" variant="outline" className="ml-auto px-4 py-2" onClick={() => reloadGuests()} disabled={actionBusy}>
                Réessayer
              </Button>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            {contactsAvailable && (
              <button
                type="button"
                onClick={chooseContacts}
                disabled={actionBusy || loadingGuests || !guestsReady}
                className="flex min-h-24 w-full items-center gap-4 rounded-2xl border border-border-soft bg-surface p-4 text-left transition hover:border-brand-purple disabled:cursor-not-allowed disabled:opacity-60 sm:p-5"
              >
                <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-brand-purple/10 text-brand-purple">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    Choisir dans mes contacts
                    <span className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-xs text-brand-purple">Le plus rapide</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">Cochez les personnes dans le répertoire. Vérifiez les noms et numéros avant de les ajouter.</span>
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMode('link')}
              disabled={!registrationUrl || actionBusy}
              className="flex min-h-24 w-full items-center gap-4 rounded-2xl border border-border-soft bg-surface p-4 text-left transition hover:border-brand-purple disabled:cursor-not-allowed disabled:opacity-60 sm:p-5"
            >
              <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-brand-pink/10 text-brand-pink">
                <Link2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-ink">Partager un lien d’inscription</span>
                <span className="mt-1 block text-sm text-muted">Un seul lien dans vos groupes WhatsApp : chaque invité s’inscrit lui-même.</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError('')
                setMode('paste')
              }}
              className="flex min-h-24 w-full items-center gap-4 rounded-2xl border border-border-soft bg-surface p-4 text-left transition hover:border-brand-purple sm:p-5"
              disabled={actionBusy}
            >
              <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <ClipboardPaste className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-ink">Coller une liste</span>
                <span className="mt-1 block text-sm text-muted">Copiée depuis WhatsApp ou vos notes : un nom et un numéro par ligne.</span>
              </span>
            </button>
          </div>

          {!contactsAvailable && (
            <p className="mt-4 text-sm text-muted">
              « Choisir dans mes contacts » apparaît sur Android (Chrome). Sur iPhone, utilisez le lien ou collez une liste.
            </p>
          )}

          {onSkip && (
            <button type="button" onClick={onSkip} disabled={actionBusy} className="mt-5 text-sm font-semibold text-muted underline underline-offset-4 hover:text-ink">
              Je le ferai plus tard
            </button>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={review ? () => setMode(mode === 'contacts-review' ? 'choose' : 'paste') : backToChoices}
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour
          </button>

          {mode === 'paste' ? (
            <>
              <h2 className="mt-3 text-2xl font-bold text-ink">Coller une liste</h2>
              <p className="mt-2 text-sm text-muted">Un invité par ligne, le nom et le numéro dans l’ordre que vous voulez.</p>
              <textarea
                className="mt-4 min-h-36 w-full rounded-xl border border-border bg-surface p-3 text-sm text-ink outline-none focus:border-brand-purple"
                value={pasteText}
                onChange={(e) => {
                  setPasteText(e.target.value)
                  setError('')
                }}
                placeholder={'Paul Ewane 675 12 34 72\nMireille - 677 00 11 22\nJean-Paul Mbarga, 699.11.22.33'}
                maxLength={100000}
                aria-label="Un invité par ligne, le nom et le numéro dans l’ordre que vous voulez."
              />
              <Button type="button" className="mt-4 w-full sm:w-auto" onClick={previewPaste} disabled={!pasteText.trim() || actionBusy || loadingGuests || !guestsReady}>
                Prévisualiser la liste
              </Button>
            </>
          ) : mode === 'link' ? (
            <>
              <h2 className="mt-3 text-2xl font-bold text-ink">Lien d’inscription</h2>
              <p className="mt-2 text-sm text-muted">Partagez-le dans vos groupes, votre statut ou par SMS. Chaque inscrit apparaît dans votre liste d’invités en attente.</p>
              <div className="mt-5 grid justify-items-center gap-4 rounded-2xl border border-border-soft bg-surface p-5 text-center sm:p-7">
                <div className="grid h-48 w-48 place-items-center rounded-xl bg-white p-2 shadow-sm">
                  {qr ? <img src={qr} alt="QR du lien d’inscription" className="h-full w-full" /> : <span className="text-sm text-muted">Génération du QR…</span>}
                </div>
                {qrError && <p className="text-sm text-brand-orange" role="status">{qrError}</p>}
                <p className="w-full break-all font-mono text-sm text-ink">{registrationUrl}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button type="button" variant="outline" onClick={copyRegistrationLink}>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copier
                  </Button>
                  <Button type="button" variant="outline" onClick={shareRegistrationLink}>
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    Partager
                  </Button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Inscrivez-vous à ${event.name} ici : ${registrationUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-white hover:opacity-90"
                  >
                    <Link2 className="h-4 w-4" aria-hidden="true" />
                    WhatsApp
                  </a>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">Le formulaire sera accessible dès que la page de l’événement sera publiée.</p>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-2xl font-bold text-ink">
                {mode === 'contacts-review' ? 'Vérifiez avant d’ajouter' : 'Vérifiez votre liste'}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {mode === 'contacts-review'
                  ? `${reviewRows.length} contact${reviewRows.length > 1 ? 's' : ''} choisi${reviewRows.length > 1 ? 's' : ''} dans le répertoire.`
                  : 'Cochez les personnes à ajouter et complétez les noms manquants.'}
              </p>
              {truncated && <p className="mt-2 text-sm text-brand-orange">Seules les 2 000 premières lignes sont affichées.</p>}
              <div className="mt-4 grid gap-2">
                {reviewRows.map((row, index) => (
                  <div key={`${row.line ?? row.fullName}-${index}`} className="flex items-start gap-3 rounded-xl border border-border-soft bg-surface p-3">
                    <input
                      type="checkbox"
                      checked={Boolean(row.selected)}
                      disabled={row.duplicate}
                      aria-label={`Ajouter ${row.fullName || `la ligne ${row.line}`}`}
                      onChange={() => toggleReviewRow(index)}
                      className="mt-3 h-4 w-4 accent-brand-purple"
                    />
                    <div className="min-w-0 flex-1">
                      <input
                        className="min-h-10 w-full rounded-lg border border-border bg-bg px-2 text-sm font-semibold text-ink outline-none focus:border-brand-purple"
                        aria-label={`Nom de ${row.fullName || `la ligne ${row.line}`}`}
                        placeholder="Nom complet"
                        maxLength={255}
                        value={row.fullName}
                        onChange={(e) => setReviewRows((current) => current.map((item, i) => i === index ? { ...item, fullName: e.target.value } : item))}
                      />
                      <p className="mt-1 text-sm text-muted">{displayPhone(row.phone || row.email)}</p>
                    </div>
                    {row.duplicate && <span className="mt-2 shrink-0 text-xs font-semibold text-muted">Déjà dans la liste</span>}
                    {!row.duplicate && !row.fullName.trim() && <span className="mt-2 shrink-0 text-xs font-semibold text-brand-orange">Nom requis</span>}
                  </div>
                ))}
              </div>
              {reviewSkipped > 0 && (
                <p className="mt-3 text-sm text-muted">{reviewSkipped} doublon{reviewSkipped > 1 ? 's' : ''} ou contact sans nom ignoré{reviewSkipped > 1 ? 's' : ''}.</p>
              )}
              <Button
                type="button"
                className="mt-4 w-full sm:w-auto"
                onClick={importReviewedRows}
                disabled={!importableRows.length || actionBusy || loadingGuests || !guestsReady}
              >
                {busy ? 'Ajout…' : `Ajouter ${importableRows.length} invité${importableRows.length > 1 ? 's' : ''}`}
              </Button>
            </>
          )}
        </>
      )}

      {error && <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
    </div>
  )
}
