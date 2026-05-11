import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/landing/hero"
import { Mission } from "@/components/landing/mission"
import { Stats } from "@/components/landing/stats"
import { Timeline } from "@/components/landing/timeline"
import { Testimonials } from "@/components/landing/testimonials"
import { CTA } from "@/components/landing/cta"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Mission />
        <Stats />
        <Timeline />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
