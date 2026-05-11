import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | Epicenter Cooperative Society",
  description: "Get in touch with Epicenter Cooperative Society. We are here to answer your questions about membership, investments, and more.",
}

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["Epicenter Church", "Lagos, Nigeria"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+234 XXX XXX XXXX", "+234 XXX XXX XXXX"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@epicentercoop.org", "support@epicentercoop.org"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: ["Mon - Fri: 9am - 5pm", "Sat: 10am - 2pm"],
  },
]

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-epic-black py-20">
          <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-6">
              <Mail className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold font-medium">Contact Us</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get In <span className="gold-gradient-text">Touch</span>
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Have questions about membership, investments, or our cooperative? 
              We would love to hear from you. Reach out and let us help you on your journey to financial freedom.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-6">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="card-gold">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                            <info.icon className="w-6 h-6 text-epic-black" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-epic-black mb-2">{info.title}</h3>
                            {info.details.map((detail, i) => (
                              <p key={i} className="text-muted-foreground text-sm">{detail}</p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Social Links */}
                  <Card className="card-gold bg-epic-black">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-white mb-4">Follow Us</h3>
                      <div className="flex gap-3">
                        {socialLinks.map((social, index) => (
                          <a
                            key={index}
                            href={social.href}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-epic-black transition-colors text-white"
                            aria-label={social.label}
                          >
                            <social.icon size={18} />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <Card className="card-gold">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-epic-black mb-6">Send Us a Message</h2>
                      <ContactForm />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="h-80 bg-secondary/30 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gold mx-auto mb-4" />
              <p className="text-muted-foreground">Map location coming soon</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
