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

interface Saving {
  id: string
  amount: number
  month: string
  year: number
  created_at: string
}

export function SavingsHistory({ savings }: { savings: Saving[] }) {
  if (savings.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="font-medium">No savings records yet.</p>
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
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {savings.map((saving) => (
          <TableRow key={saving.id}>
            <TableCell>
              <Badge variant="outline">
                {saving.month} {saving.year}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">
              {formatNaira(saving.amount)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatShortDate(saving.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
