import { useEffect } from 'react'
import { getPublicInvitation } from '../api/guests'
import { eventStartIso, ticketLiveState } from './ticketLive'

// Le jour J, le billet de l'invité relit son invitation toutes les 20 s tant qu'il n'est pas
// entré : le tampon « Entré » apparaît dès que l'accueil scanne son QR code.
export function useCheckInWatch(invitation, onChange, enabled = true) {
  const guestId = invitation?.guestId
  const start = eventStartIso(invitation?.eventDate, invitation?.eventStartTime)
  const waiting = Boolean(enabled && guestId && onChange && invitation?.rsvpConfirmed && !invitation?.checkedInAt)
  const today = waiting && ticketLiveState({ start })?.kind === 'today'
  useEffect(() => {
    if (!today) return
    let cancelled = false
    const id = setInterval(() => {
      if (document.hidden) return
      getPublicInvitation(guestId)
        .then((data) => !cancelled && data?.checkedInAt && onChange(data))
        .catch(() => {})
    }, 20000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [today, guestId, onChange])
}
