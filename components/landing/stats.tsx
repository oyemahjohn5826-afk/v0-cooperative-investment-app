import { TrendingUp, Users, Percent, ArrowUpRight } from "lucide-react"
import { formatNaira } from "@/lib/format"

const stats = [
  {
    icon: TrendingUp,
    value: 15055028.20,
    label: "Total Assets",
    format: "currency",
    suffix: "",
  },
  {
    icon: Users,
    value: 50,
    label: "Shareholders",
    format: "number",
    suffix: "+",
  },
  {
    icon: Percent,
    value: 35.29,
    label: "Gross Profit Margin",
    format: "percent",
    suffix: "%",
  },
  {
    icon: ArrowUpRight,
    value: 56,
    label: "Shareholder Growth",
    format: "percent",
    suffix: "%",
  },
]

export function Stats() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-epic-black mb-4">
              Our Performance
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real results that demonstrate our commitment to building wealth for our members.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="relative bg-white rounded-2xl p-6 card-gold group hover:scale-105 transition-transform duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-epic-black" />
                </div>

                {/* Value */}
                <div className="text-2xl md:text-3xl font-bold text-epic-black mb-1">
                  {stat.format === "currency" 
                    ? formatNaira(stat.value)
                    : `${stat.value}${stat.suffix}`
                  }
                </div>

                {/* Label */}
                <div className="text-sm text-muted-foreground">{stat.label}</div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 -translate-y-1/2 translate-x-1/2 rounded-full group-hover:bg-gold/10 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
