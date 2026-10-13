import { useEffect, useMemo, useState } from 'react'
import CertificatesTab from '../../components/conference/CertificatesTab'
import SessionsTab from '../../components/conference/SessionsTab'
import SpeakersTab from '../../components/conference/SpeakersTab'
import SponsorsTab from '../../components/conference/SponsorsTab'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { listEvents } from '../../api/events'
import { listGuests } from '../../api/guests'
import {
  createSession,
  createSpeaker,
  createSponsor,
  deleteSession,
  deleteSpeaker,
  deleteSponsor,
  listSessions,
  listSpeakers,
  listSponsors,
} from '../../api/conference'

const TABS = ['Intervenants', 'Sessions', 'Sponsors', 'Certificats']

export default function Conference() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [tab, setTab] = useState('Intervenants')
  const [speakers, setSpeakers] = useState([])
  const [sessions, setSessions] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listEvents()
      .then((data) => {
        setEvents(data ?? [])
        if (data?.length) setSelectedEventId(data[0].id)
        else setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Impossible de charger vos événements.')
        setLoading(false)
      })
  }, [])

  const reload = (eventId) => {
    setLoading(true)
    Promise.all([listSpeakers(eventId), listSessions(eventId), listSponsors(eventId), listGuests(eventId)])
      .then(([speakersData, sessionsData, sponsorsData, guestsData]) => {
        setSpeakers(speakersData ?? [])
        setSessions(sessionsData ?? [])
        setSponsors(sponsorsData ?? [])
        setAttendees((guestsData ?? []).filter((g) => g.status === 'Present'))
        setError('')
      })
      .catch((err) => setError(err.message || 'Impossible de charger la conférence.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedEventId) return
    reload(selectedEventId)
  }, [selectedEventId])

  const speakerOptions = useMemo(
    () => speakers.map((s) => ({ id: s.id, name: s.fullName, role: s.title, topic: s.topic })),
    [speakers],
  )
  const sessionRows = useMemo(
    () =>
      sessions.map((s) => ({
        id: s.id,
        title: s.title,
        room: s.room,
        speakerId: s.speakerId,
        time: s.startTime ? s.startTime.slice(11, 16) : '',
      })),
    [sessions],
  )

  const addSpeaker = async (speaker) => {
    setError('')
    try {
      await createSpeaker({ fullName: speaker.name, title: speaker.role, topic: speaker.topic }, selectedEventId)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'ajout a échoué.")
    }
  }

  const removeSpeaker = async (id) => {
    setError('')
    try {
      await deleteSpeaker(id)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const addSession = async (session) => {
    setError('')
    try {
      const today = new Date().toISOString().slice(0, 10)
      await createSession(
        {
          title: session.title,
          room: session.room,
          speakerId: session.speakerId || null,
          startTime: session.time ? `${today}T${session.time}:00Z` : null,
        },
        selectedEventId,
      )
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'ajout a échoué.")
    }
  }

  const removeSession = async (id) => {
    setError('')
    try {
      await deleteSession(id)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const addSponsor = async (sponsor) => {
    setError('')
    try {
      await createSponsor(sponsor, selectedEventId)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || "L'ajout a échoué.")
    }
  }

  const removeSponsor = async (id) => {
    setError('')
    try {
      await deleteSponsor(id)
      reload(selectedEventId)
    } catch (err) {
      setError(err.message || 'La suppression a échoué.')
    }
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  if (!loading && events.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-ink">Conférence</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border-soft py-10 text-center text-sm text-faint">
          Créez d'abord un événement.
        </p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{selectedEvent?.name ?? 'Conférence'}</h1>
          <p className="mt-1.5 text-sm text-muted">
            Speakers, sessions, sponsors et certificats de votre conférence.
          </p>
        </div>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-purple"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-1 rounded-lg bg-surface p-1 text-sm sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 font-medium transition sm:flex-none ${
              tab === t ? 'bg-surface-2 text-ink' : 'text-faint hover:text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {!loading && (
        <div className="mt-6">
          {tab === 'Intervenants' && (
            <SpeakersTab speakers={speakerOptions} onAdd={addSpeaker} onRemove={removeSpeaker} />
          )}
          {tab === 'Sessions' && (
            <SessionsTab
              sessions={sessionRows}
              speakers={speakerOptions}
              onAdd={addSession}
              onRemove={removeSession}
            />
          )}
          {tab === 'Sponsors' && (
            <SponsorsTab sponsors={sponsors} onAdd={addSponsor} onRemove={removeSponsor} />
          )}
          {tab === 'Certificats' && (
            <CertificatesTab eventTitle={selectedEvent?.name ?? ''} attendees={attendees.map((a) => a.fullName)} />
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
