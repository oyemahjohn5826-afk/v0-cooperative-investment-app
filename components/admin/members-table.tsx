"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  MoreHorizontal, UserCheck, UserX,
  Loader2, Eye, Phone, MapPin, Users,
} from "lucide-react"
import { formatShortDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

interface Member {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  status: string
  role: string
  created_at: string
  address: string | null
  next_of_kin_name: string | null
  next_of_kin_phone: string | null
  next_of_kin_relationship: string | null
}

const statusStyles: Record<string, { variant: "secondary" | "default" | "destructive" | "outline"; label: string; className: string }> = {
  pending:   { variant: "secondary",    label: "Pending",   className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  approved:  { variant: "default",      label: "Approved",  className: "bg-green-100 text-green-800 border-green-300" },
  suspended: { variant: "destructive",  label: "Suspended", className: "bg-red-100 text-red-800 border-red-300" },
}

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [search, setSearch] = useState("")

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.status?.toLowerCase().includes(q)
    )
  })

  const updateMemberStatus = async (memberId: string, status: string) => {
    setLoadingId(memberId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", memberId)

      if (error) throw error

      const label = status === "approved" ? "approved" : status === "suspended" ? "suspended" : "updated"
      toast.success(`Member ${label} successfully`)
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
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>No members found.</p>
      </div>
    )
  }

  return (
    <>
      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search by name, email, phone or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => {
              const initials = member.full_name
                ?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "ME"
              const status = statusStyles[member.status] || statusStyles.pending

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">{member.phone || "N/A"}</TableCell>

                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                      {status.label}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs capitalize text-muted-foreground">{member.role}</span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatShortDate(member.created_at)}
                  </TableCell>

                  <TableCell className="text-right">
                    {loadingId === member.id ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedMember(member)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {member.status !== "approved" && (
                            <DropdownMenuItem
                              onClick={() => updateMemberStatus(member.id, "approved")}
                              className="text-green-600 focus:text-green-600"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Approve Member
                            </DropdownMenuItem>
                          )}
                          {member.status !== "suspended" && (
                            <DropdownMenuItem
                              onClick={() => updateMemberStatus(member.id, "suspended")}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend Member
                            </DropdownMenuItem>
                          )}
                          {member.status === "suspended" && (
                            <DropdownMenuItem
                              onClick={() => updateMemberStatus(member.id, "pending")}
                            >
                              Revert to Pending
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

      {filtered.length === 0 && search && (
        <p className="text-center text-sm text-muted-foreground py-6">
          No members match &quot;{search}&quot;
        </p>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Member Profile</DialogTitle>
            <DialogDescription>Full KYC details for this member</DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4 text-sm">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                    {selectedMember.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "ME"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-base">{selectedMember.full_name || "Unknown"}</p>
                  <p className="text-muted-foreground text-xs">{selectedMember.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border rounded-lg p-3 bg-muted/30">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${(statusStyles[selectedMember.status] || statusStyles.pending).className}`}>
                    {(statusStyles[selectedMember.status] || statusStyles.pending).label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium capitalize mt-1">{selectedMember.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium mt-1">{formatShortDate(selectedMember.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium mt-1">{selectedMember.phone || "N/A"}</p>
                </div>
              </div>

              {selectedMember.address && (
                <div className="border rounded-lg p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" /> Address
                  </p>
                  <p>{selectedMember.address}</p>
                </div>
              )}

              {(selectedMember.next_of_kin_name || selectedMember.next_of_kin_phone) && (
                <div className="border rounded-lg p-3 bg-muted/30 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium mb-2">Next of Kin</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedMember.next_of_kin_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedMember.next_of_kin_phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Relationship</p>
                      <p className="font-medium">{selectedMember.next_of_kin_relationship || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick action buttons inside dialog */}
              <div className="flex gap-2 pt-2">
                {selectedMember.status !== "approved" && (
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      updateMemberStatus(selectedMember.id, "approved")
                      setSelectedMember(null)
                    }}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                {selectedMember.status !== "suspended" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      updateMemberStatus(selectedMember.id, "suspended")
                      setSelectedMember(null)
                    }}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}