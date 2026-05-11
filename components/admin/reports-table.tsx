"use client"

import { useState } from "react"
import { formatNaira } from "@/lib/format"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Pencil } from "lucide-react"
import { EditReportForm } from "./edit-report-form"

interface Report {
  id: string
  month: string
  year: number
  total_assets: number
  deposit_ytd: number
  profit_ytd: number
  monthly_deposit: number
  monthly_profit: number
}

export function ReportsTable({ reports }: { reports: Report[] }) {
  const [editingReport, setEditingReport] = useState<Report | null>(null)

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No financial data available.
      </div>
    )
  }

  // Reverse to show most recent first
  const sortedReports = [...reports].reverse()

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Total Assets</TableHead>
              <TableHead className="text-right hidden md:table-cell">Deposit YTD</TableHead>
              <TableHead className="text-right hidden md:table-cell">Profit YTD</TableHead>
              <TableHead className="text-right">Monthly Deposit</TableHead>
              <TableHead className="text-right">Monthly Profit</TableHead>
              <TableHead className="text-center w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports.map((report) => {
              const profitTrend = report.monthly_profit > 0 ? "up" : report.monthly_profit < 0 ? "down" : "neutral"
              
              return (
                <TableRow key={report.id} className="group">
                  <TableCell className="font-medium">
                    {report.month} {report.year}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gold">
                    {formatNaira(report.total_assets)}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    {formatNaira(report.deposit_ytd)}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    {formatNaira(report.profit_ytd)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNaira(report.monthly_deposit)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {profitTrend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {profitTrend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                      {profitTrend === "neutral" && <Minus className="w-4 h-4 text-gray-400" />}
                      <span className={
                        profitTrend === "up" ? "text-green-600" : 
                        profitTrend === "down" ? "text-red-600" : ""
                      }>
                        {formatNaira(report.monthly_profit)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingReport(report)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold/10"
                    >
                      <Pencil className="w-4 h-4 text-gold" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {editingReport && (
        <EditReportForm
          report={editingReport}
          open={!!editingReport}
          onOpenChange={(open) => {
            if (!open) setEditingReport(null)
          }}
        />
      )}
    </>
  )
}
