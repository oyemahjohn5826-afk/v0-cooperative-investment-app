import { Target, Eye, Heart, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function Mission() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold font-medium">Our Purpose</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-epic-black mb-4">
              Mission & Vision
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Guided by faith, driven by purpose, committed to your financial success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <Card className="card-gold border-0 bg-gradient-to-br from-white to-secondary/30 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center">
                    <Target className="w-7 h-7 text-epic-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-epic-black">Our Mission</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  At Epicenter Cooperative, our mission is to empower individuals to become 
                  financially astute and self-reliant by offering a systematic, enduring, 
                  and accessible investment strategy. We believe in the transformative 
                  potential of consistent, small-scale investments over the long term. 
                  Our commitment to transparency and ethical practices ensures that we 
                  provide a reliable path to financial independence, helping people achieve 
                  their dreams and secure their financial futures.
                </p>
              </CardContent>
            </Card>

            {/* Vision Card */}
            <Card className="card-gold border-0 bg-gradient-to-br from-epic-black to-epic-black/90 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center">
                    <Eye className="w-7 h-7 text-epic-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Our Vision</h3>
                </div>
                <p className="text-white/80 leading-relaxed">
                  We see a great business empire coming out of Epicenter Church, investing 
                  tens of millions in five years, making shareholders millionaires within 
                  five years, with massive involvement in missions, governance, nation and 
                  capacity building, empowering our sons and daughters to stand tall, firm 
                  and strong in Christlikeness on the Seven Mountains of influence in Nigeria 
                  and beyond in the Name of the Lord Jesus Christ.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { icon: Shield, label: "Transparency" },
              { icon: Heart, label: "Faith-Driven" },
              { icon: Target, label: "Excellence" },
              { icon: Eye, label: "Integrity" },
            ].map((value, index) => (
              <div 
                key={index}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary/50 hover:bg-gold/10 transition-colors"
              >
                <value.icon className="w-8 h-8 text-gold" />
                <span className="font-medium text-epic-black">{value.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
