import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AllIncluded from '../components/home/AllIncluded'
import Faq from '../components/home/Faq'
import FinalCta from '../components/home/FinalCta'
import Hero from '../components/home/Hero'
import HomeEventBanner from '../components/home/HomeEventBanner'
import HowItWorks from '../components/home/HowItWorks'
import PopularTemplates from '../components/home/PopularTemplates'
import PricingTeaser from '../components/home/PricingTeaser'
import Souvenirs from '../components/home/Souvenirs'
import Testimonials from '../components/home/Testimonials'
import Universes from '../components/home/Universes'
import { routeSeo } from '../data/seoRoutes'
import { siteUrl, useSeo } from '../utils/seo'

export default function Home() {
  useSeo(routeSeo('/', siteUrl()))
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  return (
    <>
      <HomeEventBanner />
      <Hero />
      <Universes />
      <HowItWorks />
      <PopularTemplates />
      <AllIncluded />
      <Testimonials />
      <Souvenirs />
      <PricingTeaser />
      <Faq />
      <FinalCta />
    </>
  )
}
