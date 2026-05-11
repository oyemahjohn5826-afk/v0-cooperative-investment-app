"use client"

import { Shield, Crown } from "lucide-react"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { shield: 24, crown: 12, text: "text-lg" },
    md: { shield: 32, crown: 16, text: "text-xl" },
    lg: { shield: 48, crown: 24, text: "text-2xl" },
  }

  const { shield, crown, text } = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Shield 
          size={shield} 
          className="text-gold fill-gold/20" 
          strokeWidth={2}
        />
        <Crown 
          size={crown} 
          className="absolute -top-1 left-1/2 -translate-x-1/2 text-gold fill-gold" 
          strokeWidth={2}
        />
        <span 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 font-bold text-gold"
          style={{ fontSize: shield * 0.3 }}
        >
          EC
        </span>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold ${text} text-foreground`}>
            Epicenter
          </span>
          <span className="text-xs text-muted-foreground tracking-wider uppercase">
            Cooperative Society
          </span>
        </div>
      )}
    </div>
  )
}
