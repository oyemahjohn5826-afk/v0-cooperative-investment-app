"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { MoreHorizontal, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { formatNaira, formatShortDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"

interface Loan {
  id: string
  amount: number
  purpose: string
  duration_months: number
  status: string
  created_at: string
  profiles: {
    full_name: string | null
    email: string | null
  } | null
}

const statusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  pending: { variant: "secondary", label: "Pending" },
  approved: { variant: "outline", label: "Approved" },
  rejected: { variant: "destructive", label: "Rejected" },
  disbursed: { variant: "default", label: "Disbursed" },
  repaying: { variant: "default", label: "Repaying" },
  completed: { variant: "outline", label: "Completed" },
}

export function LoansTable({ loans }: { loans: Loan[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const updateLoanStatus = async (loanId: string, status: string) => {
    setLoadingId(loanId)
    try {
      const supabase = createClient()
      const updateData: Record<string, unknown> = { 
        status, 
        updated_at: new Date().toISOString() 
      }

      if (status === "approved") {
        updateData.approved_at = new Date().toISOString()
      } else if (status === "disbursed") {
        updateData.disbursed_at = new Date().toISOString()
      } else if (status === "completed") {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("loans")
        .update(updateData)
        .eq("id", loanId)

      if (error) throw error

      toast.success(`Loan ${status} successfully`)
      router.refresh()
    } catch (error) {
      console.error("Error updating loan:", error)
      toast.error("Failed to update loan status")
    } finally {
      setLoadingId(null)
    }
  }

  if (loans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No loan applications found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="hidden md:table-cell">Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => {
            const status = statusStyles[loan.status] || statusStyles.pending

            return (
              <TableRow key={loan.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{loan.profiles?.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{loan.profiles?.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-gold">
                  {formatNaira(loan.amount)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {loan.duration_months} months
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatShortDate(loan.created_at)}
                </TableCell>
                <TableCell>
                  {loadingId === loan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {loan.status === "pending" && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => updateLoanStatus(loan.id, "approved")}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateLoanStatus(loan.id, "rejected")}
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {loan.status === "approved" && (
                          <DropdownMenuItem 
                            onClick={() => updateLoanStatus(loan.id, "disbursed")}
                          >
                            Mark as Disbursed
                          </DropdownMenuItem>
                        )}
                        {loan.status === "disbursed" && (
                          <DropdownMenuItem 
                            onClick={() => updateLoanStatus(loan.id, "repaying")}
                          >
                            Mark as Repaying
                          </DropdownMenuItem>
                        )}
                        {loan.status === "repaying" && (
                          <DropdownMenuItem 
                            onClick={() => updateLoanStatus(loan.id, "completed")}
                            className="text-green-600"
                          >
                            Mark as Completed
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
