import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Benefits from '../components/home/Benefits'
import CreateConnectCelebrate from '../components/home/CreateConnectCelebrate'
import EventTypeTabs from '../components/home/EventTypeTabs'
import Faq from '../components/home/Faq'
import Hero from '../components/home/Hero'
import PopularTemplates from '../components/home/PopularTemplates'
import PricingTeaser from '../components/home/PricingTeaser'
import Testimonials from '../components/home/Testimonials'
import { EVENT_TYPES } from '../data/eventTypes'

export default function Home() {
  const [eventType, setEventType] = useState(EVENT_TYPES[0])
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  return (
    <>
      <Hero />
      <EventTypeTabs active={eventType} onChange={setEventType} />
      <Benefits />
      <PopularTemplates category={eventType} />
      <CreateConnectCelebrate />
      <Testimonials />
      <PricingTeaser />
      <Faq />
    </>
  )
}
