"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  MoreHorizontal, UserCheck, UserX, Loader2,
  Eye, RefreshCw, Users, Phone, MapPin,
  Briefcase, Calendar, ShieldCheck,
} from "lucide-react"
import { formatShortDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"

interface Member {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  status: string
  role: string
  savings_plan: string | null
  created_at: string
  date_of_birth: string | null
  state_of_origin: string | null
  occupation: string | null
  sponsor_name: string | null
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  approved:  { label: "Approved",  className: "bg-green-100 text-green-800 border-green-300" },
  suspended: { label: "Suspended", className: "bg-red-100 text-red-800 border-red-300" },
}

const statusOrder = ["pending", "approved", "suspended"]

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId]           = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [suspendTarget, setSuspendTarget]   = useState<Member | null>(null)
  const [suspendNote, setSuspendNote]       = useState("")
  const [search, setSearch]                 = useState("")
  const [filterStatus, setFilterStatus]     = useState("all")

  const filtered = members
    .filter((m) => filterStatus === "all" || m.status === filterStatus)
    .filter((m) => {
      const q = search.toLowerCase()
      return (
        m.full_name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.state_of_origin?.toLowerCase().includes(q) ||
        m.occupation?.toLowerCase().includes(q)
      )
    })

  const updateStatus = async (memberId: string, status: string, note?: string) => {
    setLoadingId(memberId)
    try {
      const supabase = createClient()
      const patch: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      }
      if (note) patch.suspension_reason = note

      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", memberId)

      if (error) throw error

      toast.success(
        status === "approved"
          ? "Member approved successfully"
          : status === "suspended"
          ? "Member suspended"
          : "Member status updated"
      )
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Failed to update member status")
    } finally {
      setLoadingId(null)
    }
  }

  const handleSuspend = async () => {
    if (!suspendTarget) return
    await updateStatus(suspendTarget.id, "suspended", suspendNote || undefined)
    setSuspendTarget(null)
    setSuspendNote("")
  }

  const initials = (name: string | null) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "ME"

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>No members yet.</p>
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search by name, email, phone, state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1 flex-wrap">
          {["all", ...statusOrder].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {s === "all" ? "All" : (statusConfig[s]?.label ?? s)}
              {s !== "all" && (
                <span className="ml-1 opacity-60">
                  ({members.filter((m) => m.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Deposit Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => {
              const cfg = statusConfig[member.status] ?? statusConfig.pending
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted">
                          {initials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">{member.phone || "—"}</TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {member.savings_plan || "—"}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}
                    >
                      {cfg.label}
                    </span>
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

                          {member.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => updateStatus(member.id, "approved")}
                                className="text-green-600 focus:text-green-600"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Approve Member
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setSuspendTarget(member)}
                                className="text-destructive focus:text-destructive"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Reject / Suspend
                              </DropdownMenuItem>
                            </>
                          )}

                          {member.status === "approved" && (
                            <DropdownMenuItem
                              onClick={() => setSuspendTarget(member)}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend Member
                            </DropdownMenuItem>
                          )}

                          {member.status === "suspended" && (
                            <DropdownMenuItem
                              onClick={() => updateStatus(member.id, "approved")}
                              className="text-green-600 focus:text-green-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reinstate Member
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

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          No members match your filters.
        </p>
      )}

      {/* ── Member Profile Dialog ── */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Member Profile</DialogTitle>
            <DialogDescription>Full KYC details for this member</DialogDescription>
          </DialogHeader>

          {selectedMember && (() => {
            const cfg = statusConfig[selectedMember.status] ?? statusConfig.pending
            return (
              <div className="space-y-4 text-sm">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="text-lg bg-muted">
                      {initials(selectedMember.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{selectedMember.full_name || "Unknown"}</p>
                    <p className="text-muted-foreground text-xs">{selectedMember.email}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="rounded-lg border p-3 bg-muted/30 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="font-medium">{selectedMember.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> State of Origin
                    </p>
                    <p className="font-medium">{selectedMember.state_of_origin || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date of Birth
                    </p>
                    <p className="font-medium">
                      {selectedMember.date_of_birth
                        ? new Date(selectedMember.date_of_birth).toLocaleDateString("en-NG", {
                            day: "numeric", month: "long", year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Occupation
                    </p>
                    <p className="font-medium">{selectedMember.occupation || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Sponsor
                    </p>
                    <p className="font-medium">{selectedMember.sponsor_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deposit Plan</p>
                    <p className="font-medium">{selectedMember.savings_plan || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{selectedMember.role || "member"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-medium">{formatShortDate(selectedMember.created_at)}</p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 pt-1">
                  {selectedMember.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          updateStatus(selectedMember.id, "approved")
                          setSelectedMember(null)
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          setSuspendTarget(selectedMember)
                          setSelectedMember(null)
                        }}
                      >
                        <UserX className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {selectedMember.status === "approved" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        setSuspendTarget(selectedMember)
                        setSelectedMember(null)
                      }}
                    >
                      <UserX className="h-4 w-4 mr-1" /> Suspend
                    </Button>
                  )}
                  {selectedMember.status === "suspended" && (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        updateStatus(selectedMember.id, "approved")
                        setSelectedMember(null)
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Reinstate
                    </Button>
                  )}
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Suspend Confirmation Dialog ── */}
      <Dialog
        open={!!suspendTarget}
        onOpenChange={() => { setSuspendTarget(null); setSuspendNote("") }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {suspendTarget?.status === "pending" ? "Reject" : "Suspend"} Member
            </DialogTitle>
            <DialogDescription>
              This will{" "}
              {suspendTarget?.status === "pending" ? "reject" : "suspend"}{" "}
              <strong>{suspendTarget?.full_name || "this member"}</strong>.
              They will lose access to the member area.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="suspend-note">Reason (optional)</Label>
            <Textarea
              id="suspend-note"
              placeholder="e.g. Incomplete KYC, policy violation..."
              value={suspendNote}
              onChange={(e) => setSuspendNote(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setSuspendTarget(null); setSuspendNote("") }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              <UserX className="h-4 w-4 mr-1" />
              Confirm {suspendTarget?.status === "pending" ? "Reject" : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}