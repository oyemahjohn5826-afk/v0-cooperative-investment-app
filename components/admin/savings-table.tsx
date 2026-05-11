"use client"

import { formatNaira, formatShortDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Wallet } from "lucide-react"

interface Saving {
  id: string
  amount: number
  month: string
  year: number
  description: string | null
  created_at: string
  profiles: {
    full_name: string | null
    email: string | null
  } | null
}

export function SavingsTable({ savings }: { savings: Saving[] }) {
  if (savings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No savings recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto max-h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {savings.map((saving) => (
            <TableRow key={saving.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{saving.profiles?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{saving.profiles?.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {saving.month} {saving.year}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-gold">
                {formatNaira(saving.amount)}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {formatShortDate(saving.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
