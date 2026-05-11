"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-epic-black text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-gold",
                  pathname === link.href ? "text-gold" : "text-white/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              asChild 
              className="text-white hover:text-gold hover:bg-white/10"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button 
              asChild 
              className="bg-gold hover:bg-gold-dark text-epic-black font-semibold"
            >
              <Link href="/auth/register">Become a Member</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-epic-black border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-sm font-medium py-2 transition-colors",
                  pathname === link.href ? "text-gold" : "text-white/80"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
              <Button 
                variant="ghost" 
                asChild 
                className="justify-start text-white hover:text-gold hover:bg-white/10"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button 
                asChild 
                className="bg-gold hover:bg-gold-dark text-epic-black font-semibold"
              >
                <Link href="/auth/register">Become a Member</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
