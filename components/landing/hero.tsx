import Link from "next/link"
import { ArrowRight, Shield, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-epic-black via-epic-black to-epic-black/95">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />

      <div className="container mx-auto px-4 py-20 lg:py-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold font-medium">Faith-Based Investment Cooperative</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            A Pathway to{" "}
            <span className="gold-gradient-text">Financial Freedom</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Empowering members of Epicenter Church to achieve financial independence 
            through consistent, small-scale investments and ethical practices.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              asChild 
              className="bg-gold hover:bg-gold-dark text-epic-black font-semibold px-8"
            >
              <Link href="/auth/register">
                Become a Member
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-gold/30 transition-colors">
              <TrendingUp className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">35.29%</div>
              <div className="text-sm text-white/60">Gross Profit Margin</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-gold/30 transition-colors">
              <Users className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm text-white/60">Active Shareholders</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-gold/30 transition-colors">
              <Shield className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">56%</div>
              <div className="text-sm text-white/60">Shareholder Growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
