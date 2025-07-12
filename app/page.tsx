import { Hero } from '@/components/hero'
import { HowItWorks } from '@/components/how-it-works'
import { FeaturedIdeas } from '@/components/featured-ideas'
import { Testimonials } from '@/components/testimonials'
import { CTA } from '@/components/cta'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturedIdeas />
      {/* <Testimonials /> */}
      <CTA />
      <Footer />
    </div>
  )
}