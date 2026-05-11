"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatShortDate } from "@/lib/format"
import { Users } from "lucide-react"

interface Member {
  id: string
  full_name: string | null
  email: string | null
  status: string
  created_at: string
}

const statusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  pending: { variant: "secondary", label: "Pending" },
  approved: { variant: "default", label: "Approved" },
  suspended: { variant: "destructive", label: "Suspended" },
}

export function RecentMembers({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No members yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {members.map((member) => {
        const initials = member.full_name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "ME"
        const status = statusStyles[member.status] || statusStyles.pending

        return (
          <div 
            key={member.id} 
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <Avatar className="h-10 w-10 bg-gold">
              <AvatarFallback className="bg-gold text-epic-black font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-epic-black truncate">
                {member.full_name || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {member.email}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={status.variant} className="mb-1">{status.label}</Badge>
              <p className="text-xs text-muted-foreground">
                {formatShortDate(member.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
