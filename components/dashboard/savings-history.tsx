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
  description: string | null
  created_at: string
}

export function SavingsHistory({ savings }: { savings: Saving[] }) {
  if (savings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No savings records yet.</p>
        <p className="text-sm">Your contributions will appear here.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="hidden sm:table-cell">Description</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {savings.map((saving) => (
            <TableRow key={saving.id}>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {saving.month} {saving.year}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-gold">
                {formatNaira(saving.amount)}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">
                {saving.description || "Monthly contribution"}
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
