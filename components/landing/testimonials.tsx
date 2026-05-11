import { Quote, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "John O.",
    role: "Member since 2021",
    content: "Joining Epicenter Cooperative was one of the best financial decisions I ever made. The consistent returns and transparent management give me peace of mind.",
    initials: "JO",
  },
  {
    name: "Sarah A.",
    role: "Member since 2022",
    content: "As a young professional, this cooperative has helped me develop a saving and investment culture. The community support is amazing.",
    initials: "SA",
  },
  {
    name: "Michael E.",
    role: "Member since 2021",
    content: "The faith-based approach combined with sound financial principles makes this cooperative unique. I have seen my investment grow significantly.",
    initials: "ME",
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-epic-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-4">
              <Quote className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold font-medium">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Members Say
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Hear from our community of shareholders who are building wealth together.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:border-gold/30 transition-colors">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white/80 mb-6 leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-gold">
                      <AvatarFallback className="bg-gold text-epic-black font-semibold">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">{testimonial.name}</div>
                      <div className="text-sm text-white/60">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
