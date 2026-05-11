import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 gold-gradient opacity-90" />
            
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A1A1A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            {/* Content */}
            <div className="relative px-8 py-16 md:px-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-epic-black/10 mb-6">
                <Shield className="w-8 h-8 text-epic-black" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-epic-black mb-4">
                Start Your Journey to Financial Freedom
              </h2>
              <p className="text-epic-black/70 max-w-2xl mx-auto mb-8 text-lg">
                Join our community of investors and start building wealth through 
                consistent, faith-driven investments. Your financial future starts today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-epic-black hover:bg-epic-black/90 text-white font-semibold px-8"
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
                  className="border-epic-black/30 text-epic-black hover:bg-epic-black/10"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
