import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Target, Eye, Calendar, Rocket, TrendingUp, Gift, 
  PartyPopper, Users, Shield, Heart 
} from "lucide-react"

export const metadata: Metadata = {
  title: "About Us | Epicenter Cooperative Society",
  description: "Learn about Epicenter Cooperative Society - our history, mission, vision, and the leadership team driving financial empowerment.",
}

const milestones = [
  { date: "Sept 2021", title: "Cooperative Birthed", icon: Rocket },
  { date: "Feb 2022", title: "First Investment", icon: TrendingUp },
  { date: "Dec 2022", title: "First Dividend Payout", icon: Gift },
  { date: "Mar 2023", title: "N5M Equity Goal", icon: Target },
  { date: "Jul 2023", title: "2nd Dividend Payout", icon: Gift },
  { date: "Aug 2023", title: "N10M Equity Unlocked", icon: TrendingUp },
  { date: "Nov 2023", title: "End of Year Dinner", icon: PartyPopper },
]

const leaders = [
  { name: "Board Chairman", role: "Chairman", initials: "BC" },
  { name: "Secretary", role: "Secretary", initials: "SE" },
  { name: "Treasurer", role: "Treasurer", initials: "TR" },
  { name: "Financial Advisor", role: "Advisor", initials: "FA" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-epic-black py-20">
          <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-6">
              <Users className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold font-medium">About Us</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Story of <span className="gold-gradient-text">Faith & Growth</span>
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Founded in September 2021, Epicenter Cooperative Society emerged from a vision 
              to empower members of Epicenter Church with financial freedom through collective investment.
            </p>
          </div>
        </section>

        {/* History Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-4">
                    <Calendar className="w-4 h-4 text-gold" />
                    <span className="text-sm text-gold font-medium">Our History</span>
                  </div>
                  <h2 className="text-3xl font-bold text-epic-black mb-6">
                    From Vision to Reality
                  </h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    In September 2021, a group of visionary members from Epicenter Church came 
                    together with a shared dream: to create a pathway to financial freedom for 
                    every willing participant through the power of collective investment.
                  </p>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    What started as a small group of believers has grown into a thriving 
                    cooperative with over 50 shareholders and total assets exceeding N15 million. 
                    Our journey is a testament to what can be achieved when faith meets financial discipline.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Today, we continue to grow, invest, and empower our members, staying true to 
                    our founding principles of transparency, integrity, and faith-driven excellence.
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-6 card-gold text-center">
                      <div className="text-3xl font-bold text-gold mb-1">2021</div>
                      <div className="text-sm text-muted-foreground">Founded</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 card-gold text-center">
                      <div className="text-3xl font-bold text-gold mb-1">50+</div>
                      <div className="text-sm text-muted-foreground">Members</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 card-gold text-center">
                      <div className="text-3xl font-bold text-gold mb-1">N15M+</div>
                      <div className="text-sm text-muted-foreground">Assets</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 card-gold text-center">
                      <div className="text-3xl font-bold text-gold mb-1">35%</div>
                      <div className="text-sm text-muted-foreground">Profit Margin</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Mission */}
                <Card className="card-gold border-0 bg-white overflow-hidden">
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

                {/* Vision */}
                <Card className="card-gold border-0 bg-epic-black overflow-hidden">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { icon: Shield, label: "Transparency", desc: "Open and honest dealings" },
                  { icon: Heart, label: "Faith-Driven", desc: "Guided by biblical principles" },
                  { icon: Target, label: "Excellence", desc: "Striving for the best" },
                  { icon: Eye, label: "Integrity", desc: "Doing right always" },
                ].map((value, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl p-6 card-gold text-center"
                  >
                    <value.icon className="w-8 h-8 text-gold mx-auto mb-3" />
                    <div className="font-semibold text-epic-black mb-1">{value.label}</div>
                    <div className="text-xs text-muted-foreground">{value.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-4">
                  <Calendar className="w-4 h-4 text-gold" />
                  <span className="text-sm text-gold font-medium">Roadmap</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-epic-black mb-4">
                  Our Journey
                </h2>
              </div>

              {/* Visual Timeline */}
              <div className="relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold via-gold/50 to-gold/20 -translate-x-1/2 hidden md:block" />
                
                <div className="grid gap-8">
                  {milestones.map((milestone, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-4 md:gap-8 ${
                        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                        <div className={`inline-flex items-center gap-3 bg-secondary/50 rounded-xl p-4 ${
                          index % 2 === 0 ? "md:flex-row-reverse" : ""
                        }`}>
                          <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center shrink-0">
                            <milestone.icon className="w-5 h-5 text-epic-black" />
                          </div>
                          <div>
                            <div className="text-xs text-gold font-medium mb-1">{milestone.date}</div>
                            <div className="font-semibold text-epic-black">{milestone.title}</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded-full gold-gradient shrink-0 hidden md:block shadow-lg" />
                      <div className="flex-1 hidden md:block" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-20 bg-epic-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-4">
                  <Users className="w-4 h-4 text-gold" />
                  <span className="text-sm text-gold font-medium">Leadership</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Our Board
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                  Dedicated leaders committed to guiding the cooperative towards financial excellence.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {leaders.map((leader, index) => (
                  <Card key={index} className="bg-white/5 border-white/10 text-center">
                    <CardContent className="p-6">
                      <Avatar className="w-20 h-20 mx-auto mb-4 bg-gold">
                        <AvatarFallback className="bg-gold text-epic-black text-xl font-bold">
                          {leader.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-semibold text-white mb-1">{leader.name}</div>
                      <div className="text-sm text-gold">{leader.role}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
