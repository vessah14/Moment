import { ClipboardPaste, Copy, Link2, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { eventShareUrl } from '../../api/client'
import { importGuests, listGuests } from '../../api/guests'
import { contactRowsFromPicker, parsePastedGuestList } from '../../utils/guestImport'
import { useToast } from '../../utils/useToast'
import Button from '../ui/Button'

export default function GuestOnboardingStep({ event }) {
  const toast = useToast()
  const [guests, setGuests] = useState([])
  const [loadingGuests, setLoadingGuests] = useState(true)
  const [guestsReady, setGuestsReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [previewRows, setPreviewRows] = useState([])
  const [truncated, setTruncated] = useState(false)
  const contactsAvailable =
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    typeof navigator.contacts?.select === 'function'

  const registrationUrl = event?.slug
    ? `${eventShareUrl(event.slug)}/inscription`
    : ''
  const importableRows = useMemo(
    () => previewRows
      .filter((row) => !row.duplicate && row.fullName.trim())
      .map(({ fullName, phone, email, service }) => ({ fullName: fullName.trim(), phone, email, service })),
    [previewRows],
  )

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

  const addRows = async (rows, skipped = 0) => {
    if (!rows.length) {
      if (skipped) toast(`${skipped} contact${skipped > 1 ? 's' : ''} déjà présent${skipped > 1 ? 's' : ''} ou sans nom ignoré${skipped > 1 ? 's' : ''}`)
      return false
    }

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
    if (!contactsAvailable || busy || !guestsReady) return
    setError('')
    try {
      const contacts = await navigator.contacts.select(['name', 'tel', 'email'], { multiple: true })
      const { rows, skipped } = contactRowsFromPicker(contacts, guests)
      await addRows(rows, skipped)
    } catch (err) {
      if (err?.name !== 'AbortError') setError(err.message || "Les contacts n'ont pas pu être ajoutés.")
    }
  }

  const previewPaste = () => {
    const result = parsePastedGuestList(pasteText, guests)
    setPreviewRows(result.rows)
    setTruncated(result.truncated)
    setError(result.rows.length ? '' : 'Collez une personne par ligne pour afficher l’aperçu.')
  }

  const importPasted = async () => {
    const added = await addRows(importableRows)
    if (!added) return
    setPasteText('')
    setPreviewRows([])
    setTruncated(false)
  }

  const copyRegistrationLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl)
      toast('Lien d’inscription copié')
    } catch {
      setError('Copie impossible : sélectionnez et copiez le lien affiché.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold tracking-wide text-brand-purple uppercase">Étape 6 · Avant la publication</p>
      <h2 className="mt-2 text-2xl font-bold text-ink">Ajoutez vos invités</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ajoutez-les maintenant ou publiez votre page et revenez plus tard. Les inscriptions par lien seront ouvertes après la publication.
      </p>

      <div className="mt-5 rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-ink" role="status">
        {loadingGuests ? 'Chargement de la liste…' : `${guests.length} invité${guests.length > 1 ? 's' : ''} dans la liste`}
        {!loadingGuests && !guestsReady && (
          <Button type="button" variant="outline" className="ml-3" onClick={() => reloadGuests()} disabled={busy}>
            Réessayer
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-4">
        {contactsAvailable && (
          <section className="rounded-2xl border border-border-soft bg-surface p-5">
            <h3 className="font-semibold text-ink">Choisir dans mes contacts</h3>
            <p className="mt-1 text-sm text-muted">Sélectionnez plusieurs contacts sur votre téléphone. Les doublons sont ignorés.</p>
            <Button type="button" variant="outline" className="mt-4" onClick={chooseContacts} disabled={busy || loadingGuests || !guestsReady}>
              <Users className="h-4 w-4" aria-hidden="true" />
              {busy ? 'Ajout…' : 'Ouvrir mes contacts'}
            </Button>
          </section>
        )}

        <section className="rounded-2xl border border-border-soft bg-surface p-5">
          <h3 className="font-semibold text-ink">Coller une liste</h3>
          <p className="mt-1 text-sm text-muted">Une personne par ligne, par exemple « Paul 675 12 34 72 ». Les lignes sans numéro restent importables.</p>
          <textarea
            className="mt-3 min-h-28 w-full rounded-xl border border-border bg-bg p-3 text-sm text-ink outline-none focus:border-brand-purple"
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value)
              setPreviewRows([])
              setError('')
            }}
            placeholder={'Paul 675 12 34 72\nAïcha +237 690 00 00 01'}
            maxLength={100000}
          />
          <Button type="button" variant="outline" className="mt-3" onClick={previewPaste} disabled={!pasteText.trim() || busy}>
            <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
            Prévisualiser
          </Button>

          {previewRows.length > 0 && (
            <div className="mt-4 grid gap-2">
              <p className="text-sm font-semibold text-ink">
                Aperçu · {importableRows.length} ligne{importableRows.length > 1 ? 's' : ''} prête{importableRows.length > 1 ? 's' : ''} à importer
              </p>
              {truncated && <p className="text-sm text-brand-orange">Seules les 2 000 premières lignes sont affichées.</p>}
              <div className="max-h-64 overflow-y-auto rounded-xl border border-border-soft">
                {previewRows.map((row, index) => (
                  <div key={`${row.line}-${index}`} className="grid gap-2 border-b border-border-soft p-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.8fr)_auto] sm:items-center">
                    <input
                      className="min-h-10 min-w-0 rounded-lg border border-border bg-bg px-2 text-sm text-ink outline-none focus:border-brand-purple"
                      aria-label={`Nom de la ligne ${row.line}`}
                      placeholder={row.phone ? 'Nom requis pour ce numéro' : 'Nom complet'}
                      maxLength={255}
                      required={!row.duplicate}
                      value={row.fullName}
                      onChange={(e) => setPreviewRows((current) => current.map((item, i) => i === index ? { ...item, fullName: e.target.value } : item))}
                    />
                    <span className="truncate text-sm text-muted">{row.phone || row.email || 'Aucun numéro'}</span>
                    <span className={`text-xs font-semibold ${row.duplicate ? 'text-danger' : !row.phone ? 'text-brand-orange' : 'text-success'}`}>
                      {row.duplicate ? 'Doublon · ignoré' : !row.fullName.trim() ? 'Nom requis' : !row.phone ? 'Sans numéro' : 'Prêt'}
                    </span>
                  </div>
                ))}
              </div>
              <Button type="button" onClick={importPasted} disabled={!importableRows.length || busy || loadingGuests || !guestsReady}>
                {busy ? 'Ajout…' : `Ajouter ${importableRows.length} invité${importableRows.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border-soft bg-surface p-5">
          <h3 className="font-semibold text-ink">Partager un lien d’inscription</h3>
          <p className="mt-1 text-sm text-muted">
            Chaque invité pourra s’inscrire lui-même. Le lien fonctionnera dès que votre page sera publiée.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border-soft bg-bg p-2 pl-3">
            <span className="min-w-0 flex-1 break-all font-mono text-xs text-ink">{registrationUrl}</span>
            <button type="button" onClick={copyRegistrationLink} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-ink hover:border-brand-purple">
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copier
            </button>
          </div>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Inscrivez-vous à ${event.name} ici : ${registrationUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Link2 className="h-4 w-4" aria-hidden="true" />
            Préparer le partage WhatsApp
          </a>
        </section>
      </div>

      {error && <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
    </div>
  )
}
