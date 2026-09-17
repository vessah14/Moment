import { useState } from 'react'
import CertificatesTab from '../../components/conference/CertificatesTab'
import SessionsTab from '../../components/conference/SessionsTab'
import SpeakersTab from '../../components/conference/SpeakersTab'
import SponsorsTab from '../../components/conference/SponsorsTab'
import DashboardLayout from '../../components/layout/DashboardLayout'
import {
  INITIAL_SESSIONS,
  INITIAL_SPEAKERS,
  INITIAL_SPONSORS,
} from '../../data/conference'

const TABS = ['Intervenants', 'Sessions', 'Sponsors', 'Certificats']
const EVENT_TITLE = 'TBF Summit 2027'

export default function Conference() {
  const [tab, setTab] = useState('Intervenants')
  const [speakers, setSpeakers] = useState(INITIAL_SPEAKERS)
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [sponsors, setSponsors] = useState(INITIAL_SPONSORS)

  const addSpeaker = (speaker) =>
    setSpeakers((prev) => [...prev, { id: Date.now(), ...speaker }])
  const removeSpeaker = (id) => {
    setSpeakers((prev) => prev.filter((s) => s.id !== id))
    setSessions((prev) =>
      prev.map((s) => (s.speakerId === id ? { ...s, speakerId: null } : s)),
    )
  }

  const addSession = (session) =>
    setSessions((prev) => [...prev, { id: Date.now(), ...session }])
  const removeSession = (id) =>
    setSessions((prev) => prev.filter((s) => s.id !== id))

  const addSponsor = (sponsor) =>
    setSponsors((prev) => [...prev, { id: Date.now(), ...sponsor }])
  const removeSponsor = (id) =>
    setSponsors((prev) => prev.filter((s) => s.id !== id))

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-ink">{EVENT_TITLE}</h1>
        <p className="mt-1.5 text-sm text-muted">
          Speakers, sessions, sponsors et certificats de votre conférence.
        </p>
      </div>

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

      <div className="mt-6">
        {tab === 'Intervenants' && (
          <SpeakersTab speakers={speakers} onAdd={addSpeaker} onRemove={removeSpeaker} />
        )}
        {tab === 'Sessions' && (
          <SessionsTab
            sessions={sessions}
            speakers={speakers}
            onAdd={addSession}
            onRemove={removeSession}
          />
        )}
        {tab === 'Sponsors' && (
          <SponsorsTab sponsors={sponsors} onAdd={addSponsor} onRemove={removeSponsor} />
        )}
        {tab === 'Certificats' && <CertificatesTab eventTitle={EVENT_TITLE} />}
      </div>
    </DashboardLayout>
  )
}
