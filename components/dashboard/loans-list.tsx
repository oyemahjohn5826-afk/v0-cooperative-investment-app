"use client"

import { formatNaira, formatShortDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { HandCoins } from "lucide-react"

interface Loan {
  id: string
  amount: number
  purpose: string
  duration_months: number
  status: string
  created_at: string
}

const statusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  pending: { variant: "secondary", label: "Pending" },
  approved: { variant: "outline", label: "Approved" },
  rejected: { variant: "destructive", label: "Rejected" },
  disbursed: { variant: "default", label: "Disbursed" },
  repaying: { variant: "default", label: "Repaying" },
  completed: { variant: "outline", label: "Completed" },
}

export function LoansList({ loans }: { loans: Loan[] }) {
  if (loans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HandCoins className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No loan applications yet.</p>
        <p className="text-sm">Apply for a loan using the form.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => {
        const status = statusStyles[loan.status] || statusStyles.pending
        return (
          <div 
            key={loan.id} 
            className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-epic-black">{formatNaira(loan.amount)}</p>
                <p className="text-xs text-muted-foreground">{loan.duration_months} months</p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {loan.purpose}
            </p>
            <p className="text-xs text-gold">
              Applied: {formatShortDate(loan.created_at)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
