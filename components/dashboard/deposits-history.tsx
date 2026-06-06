"use client"

import { formatNaira, formatShortDate } from "@/lib/format"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Deposit {
  id: string
  amount: number
  month: string
  year: number
  description: string | null
  created_at: string
}

export function DepositsHistory({ deposits }: { deposits: Deposit[] }) {
  if (deposits.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="font-medium">No deposit records yet.</p>
        <p className="text-sm">Your contributions will appear here.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deposits.map((deposit) => (
          <TableRow key={deposit.id}>
            <TableCell>
              <Badge variant="outline">
                {deposit.month} {deposit.year}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">
              {formatNaira(deposit.amount)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {deposit.description || "Monthly deposit"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatShortDate(deposit.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}