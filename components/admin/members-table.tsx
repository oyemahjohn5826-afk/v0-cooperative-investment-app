"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserCheck, UserX, Loader2 } from "lucide-react"
import { formatShortDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"

interface Member {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  status: string
  role: string
  created_at: string
}

const statusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  pending: { variant: "secondary", label: "Pending" },
  approved: { variant: "default", label: "Approved" },
  suspended: { variant: "destructive", label: "Suspended" },
}

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const updateMemberStatus = async (memberId: string, status: string) => {
    setLoadingId(memberId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", memberId)

      if (error) throw error

      toast.success(`Member ${status === "approved" ? "approved" : "suspended"} successfully`)
      router.refresh()
    } catch (error) {
      console.error("Error updating member:", error)
      toast.error("Failed to update member status")
    } finally {
      setLoadingId(null)
    }
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No members found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Joined</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const initials = member.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "ME"
            const status = statusStyles[member.status] || statusStyles.pending

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-gold">
                      <AvatarFallback className="bg-gold text-epic-black font-semibold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {member.phone || "N/A"}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatShortDate(member.created_at)}
                </TableCell>
                <TableCell>
                  {loadingId === member.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.status !== "approved" && (
                          <DropdownMenuItem 
                            onClick={() => updateMemberStatus(member.id, "approved")}
                            className="text-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {member.status !== "suspended" && (
                          <DropdownMenuItem 
                            onClick={() => updateMemberStatus(member.id, "suspended")}
                            className="text-destructive"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
