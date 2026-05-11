import { Calendar, Rocket, TrendingUp, Gift, Target, PartyPopper } from "lucide-react"

const milestones = [
  {
    date: "Sept 2021",
    title: "Cooperative Birthed",
    description: "The vision of Epicenter Cooperative Society was born out of faith and purpose.",
    icon: Rocket,
  },
  {
    date: "Feb 2022",
    title: "First Investment",
    description: "Made our first strategic investment in the financial market.",
    icon: TrendingUp,
  },
  {
    date: "Dec 2022",
    title: "First Dividend Payout",
    description: "Celebrated our first dividend distribution to shareholders.",
    icon: Gift,
  },
  {
    date: "Mar 2023",
    title: "N5M Equity Goal",
    description: "Achieved our first major milestone of N5,000,000 in equity.",
    icon: Target,
  },
  {
    date: "Jul 2023",
    title: "2nd Dividend Payout",
    description: "Continued rewarding our faithful shareholders with second dividend.",
    icon: Gift,
  },
  {
    date: "Aug 2023",
    title: "N10M Equity Unlocked",
    description: "Doubled our equity milestone, reaching N10,000,000.",
    icon: TrendingUp,
  },
  {
    date: "Nov 2023",
    title: "End of Year Dinner",
    description: "Celebrated our growth and community at the annual dinner.",
    icon: PartyPopper,
  },
]

export function Timeline() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-4">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold font-medium">Our Journey</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-epic-black mb-4">
              Milestones & Achievements
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A journey of faith, growth, and financial empowerment.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold via-gold/50 to-gold/20 md:-translate-x-1/2" />

            {/* Timeline Items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`relative flex items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 pl-12 md:pl-0 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="inline-block bg-gold/10 text-gold text-sm font-medium px-3 py-1 rounded-full mb-2">
                      {milestone.date}
                    </div>
                    <h3 className="text-xl font-bold text-epic-black mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>

                  {/* Icon Node */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full gold-gradient flex items-center justify-center shadow-lg z-10">
                    <milestone.icon className="w-4 h-4 text-epic-black" />
                  </div>

                  {/* Empty space for alignment */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
