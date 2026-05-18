"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  MoreHorizontal, CheckCircle, XCircle, Loader2,
  Eye, Banknote, RefreshCw, HandCoins, Phone,
} from "lucide-react"
import { formatNaira, formatShortDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Loan {
  id: string
  amount: number
  purpose: string | null
  duration_months: number
  interest_rate: number
  status: string
  notes: string | null
  created_at: string
  approved_at: string | null
  disbursed_at: string | null
  due_date: string | null
  profiles: {
    full_name: string | null
    email: string | null
    phone: string | null
  } | null
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pending",    className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  approved:  { label: "Approved",   className: "bg-blue-100 text-blue-800 border-blue-300" },
  rejected:  { label: "Rejected",   className: "bg-red-100 text-red-800 border-red-300" },
  disbursed: { label: "Disbursed",  className: "bg-purple-100 text-purple-800 border-purple-300" },
  repaying:  { label: "Repaying",   className: "bg-green-100 text-green-800 border-green-300" },
  completed: { label: "Completed",  className: "bg-gray-100 text-gray-700 border-gray-300" },
}

const statusOrder = ["pending", "approved", "disbursed", "repaying", "completed", "rejected"]

export function LoansTable({ loans }: { loans: Loan[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId]         = useState<string | null>(null)
  const [selectedLoan, setSelectedLoan]   = useState<Loan | null>(null)
  const [rejectLoan, setRejectLoan]       = useState<Loan | null>(null)
  const [rejectNote, setRejectNote]       = useState("")
  const [search, setSearch]               = useState("")
  const [filterStatus, setFilterStatus]   = useState("all")

  const filtered = loans
    .filter(l => filterStatus === "all" || l.status === filterStatus)
    .filter(l => {
      const q = search.toLowerCase()
      return (
        l.profiles?.full_name?.toLowerCase().includes(q) ||
        l.profiles?.email?.toLowerCase().includes(q) ||
        l.purpose?.toLowerCase().includes(q) ||
        l.status?.toLowerCase().includes(q)
      )
    })

  const updateStatus = async (loanId: string, status: string, notes?: string) => {
    setLoadingId(loanId)
    try {
      const supabase = createClient()
      const now = new Date().toISOString()

      const patch: Record<string, unknown> = { status, updated_at: now }
      if (status === "approved")  patch.approved_at  = now
      if (status === "disbursed") patch.disbursed_at = now
      if (notes)                  patch.notes        = notes

      const { error } = await supabase
        .from("loans")
        .update(patch)
        .eq("id", loanId)

      if (error) throw error

      toast.success(`Loan marked as ${statusConfig[status]?.label ?? status}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Failed to update loan status")
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectLoan) return
    await updateStatus(rejectLoan.id, "rejected", rejectNote || undefined)
    setRejectLoan(null)
    setRejectNote("")
  }

  const monthlyRepayment = (loan: Loan) => {
    const principal = Number(loan.amount)
    const rate = Number(loan.interest_rate) / 100
    const total = principal + principal * rate
    return total / loan.duration_months
  }

  if (loans.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <HandCoins className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>No loan applications yet.</p>
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search by name, email, purpose..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1 flex-wrap">
          {["all", ...statusOrder].map(s => (
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
                  ({loans.filter(l => l.status === s).length})
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
              <TableHead>Applicant</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(loan => {
              const cfg = statusConfig[loan.status] ?? statusConfig.pending
              return (
                <TableRow key={loan.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{loan.profiles?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{loan.profiles?.email}</p>
                    </div>
                  </TableCell>

                  <TableCell className="font-semibold text-sm">
                    {formatNaira(loan.amount)}
                  </TableCell>

                  <TableCell className="text-sm max-w-[160px] truncate">
                    {loan.purpose || "—"}
                  </TableCell>

                  <TableCell className="text-sm">
                    {loan.duration_months}mo
                  </TableCell>

                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatShortDate(loan.created_at)}
                  </TableCell>

                  <TableCell className="text-right">
                    {loadingId === loan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedLoan(loan)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {loan.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => updateStatus(loan.id, "approved")}
                                className="text-green-600 focus:text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Loan
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setRejectLoan(loan)}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Loan
                              </DropdownMenuItem>
                            </>
                          )}

                          {loan.status === "approved" && (
                            <DropdownMenuItem
                              onClick={() => updateStatus(loan.id, "disbursed")}
                              className="text-purple-600 focus:text-purple-600"
                            >
                              <Banknote className="h-4 w-4 mr-2" />
                              Mark as Disbursed
                            </DropdownMenuItem>
                          )}

                          {loan.status === "disbursed" && (
                            <DropdownMenuItem
                              onClick={() => updateStatus(loan.id, "repaying")}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Mark as Repaying
                            </DropdownMenuItem>
                          )}

                          {loan.status === "repaying" && (
                            <DropdownMenuItem
                              onClick={() => updateStatus(loan.id, "completed")}
                              className="text-green-600 focus:text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </DropdownMenuItem>
                          )}

                          {loan.status === "rejected" && (
                            <DropdownMenuItem
                              onClick={() => updateStatus(loan.id, "pending")}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
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

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          No loans match your filters.
        </p>
      )}

      {/* ── Loan Detail Dialog ── */}
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Loan Application Details</DialogTitle>
            <DialogDescription>Full breakdown of this loan request</DialogDescription>
          </DialogHeader>

          {selectedLoan && (() => {
            const cfg = statusConfig[selectedLoan.status] ?? statusConfig.pending
            const monthly = monthlyRepayment(selectedLoan)
            const total = Number(selectedLoan.amount) * (1 + Number(selectedLoan.interest_rate) / 100)

            return (
              <div className="space-y-4 text-sm">
                {/* Applicant */}
                <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Applicant</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedLoan.profiles?.full_name || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedLoan.profiles?.email || "—"}</p>
                    </div>
                    {selectedLoan.profiles?.phone && (
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone
                        </p>
                        <p className="font-medium">{selectedLoan.profiles.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Loan breakdown */}
                <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Loan Breakdown</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Principal</p>
                      <p className="font-semibold text-base">{formatNaira(selectedLoan.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">{selectedLoan.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">{selectedLoan.duration_months} months</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Repayable</p>
                      <p className="font-semibold">{formatNaira(total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Payment</p>
                      <p className="font-semibold text-green-700">{formatNaira(monthly)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Applied On</p>
                      <p className="font-medium">{formatShortDate(selectedLoan.created_at)}</p>
                    </div>
                    {selectedLoan.approved_at && (
                      <div>
                        <p className="text-xs text-muted-foreground">Approved On</p>
                        <p className="font-medium">{formatShortDate(selectedLoan.approved_at)}</p>
                      </div>
                    )}
                    {selectedLoan.disbursed_at && (
                      <div>
                        <p className="text-xs text-muted-foreground">Disbursed On</p>
                        <p className="font-medium">{formatShortDate(selectedLoan.disbursed_at)}</p>
                      </div>
                    )}
                    {selectedLoan.due_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p className="font-medium">{selectedLoan.due_date}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                {selectedLoan.purpose && (
                  <div className="rounded-lg border p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Purpose</p>
                    <p>{selectedLoan.purpose}</p>
                  </div>
                )}

                {/* Admin notes */}
                {selectedLoan.notes && (
                  <div className="rounded-lg border p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                    <p className="text-muted-foreground">{selectedLoan.notes}</p>
                  </div>
                )}

                {/* Quick actions inside dialog */}
                <div className="flex gap-2 pt-1">
                  {selectedLoan.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          updateStatus(selectedLoan.id, "approved")
                          setSelectedLoan(null)
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          setRejectLoan(selectedLoan)
                          setSelectedLoan(null)
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {selectedLoan.status === "approved" && (
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        updateStatus(selectedLoan.id, "disbursed")
                        setSelectedLoan(null)
                      }}
                    >
                      <Banknote className="h-4 w-4 mr-1" /> Mark Disbursed
                    </Button>
                  )}
                  {selectedLoan.status === "repaying" && (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        updateStatus(selectedLoan.id, "completed")
                        setSelectedLoan(null)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Reject Confirmation Dialog ── */}
      <Dialog open={!!rejectLoan} onOpenChange={() => { setRejectLoan(null); setRejectNote("") }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Loan Application</DialogTitle>
            <DialogDescription>
              This will reject the loan for{" "}
              <strong>{rejectLoan?.profiles?.full_name || "this member"}</strong> of{" "}
              <strong>{rejectLoan ? formatNaira(rejectLoan.amount) : ""}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject-note">Reason (optional)</Label>
            <Textarea
              id="reject-note"
              placeholder="e.g. Insufficient savings balance, incomplete documentation..."
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setRejectLoan(null); setRejectNote("") }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-1" />
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}