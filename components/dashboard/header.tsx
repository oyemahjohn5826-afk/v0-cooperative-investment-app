"use client"

import { Bell, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: string
}

export function DashboardHeader({ profile }: { profile: Profile }) {
  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "ME"

  return (
    <header className="sticky top-0 z-30 bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search - hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 bg-secondary/50 border-0"
            />
          </div>
        </div>

        {/* Spacer for mobile */}
        <div className="md:hidden flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-epic-black text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-gold">
              <AvatarFallback className="bg-gold text-epic-black font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{profile.full_name || "Member"}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
