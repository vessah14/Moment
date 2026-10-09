import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Benefits from '../components/home/Benefits'
import CreateConnectCelebrate from '../components/home/CreateConnectCelebrate'
import EventTypeTabs from '../components/home/EventTypeTabs'
import Faq from '../components/home/Faq'
import FeatureShowcase from '../components/home/FeatureShowcase'
import FinalCta from '../components/home/FinalCta'
import Hero from '../components/home/Hero'
import PopularTemplates from '../components/home/PopularTemplates'
import PricingTeaser from '../components/home/PricingTeaser'
import StatsBar from '../components/home/StatsBar'
import Testimonials from '../components/home/Testimonials'
import { EVENT_TYPES } from '../data/eventTypes'
import { siteUrl, useSeo } from '../utils/seo'

export default function Home() {
  useSeo({
    path: '/',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'TBF Moment',
        url: siteUrl(),
        logo: `${siteUrl()}/favicon.png`,
        slogan: 'Create. Connect. Celebrate.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'TBF Moment',
        url: siteUrl(),
        inLanguage: 'fr-FR',
      },
    ],
  })
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
      <CreateConnectCelebrate />
      <PopularTemplates category={eventType} />
      <FeatureShowcase />
      <StatsBar />
      <Testimonials />
      <PricingTeaser />
      <Faq />
      <FinalCta />
    </>
  )
}
