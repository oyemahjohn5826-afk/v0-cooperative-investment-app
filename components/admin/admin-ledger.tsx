"use client"

import { useState, useEffect, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Loader2, SlidersHorizontal } from "lucide-react"

const MONTHS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

type Member = {
  id: string
  full_name: string | null
  email: string | null
  status: string | null
}

type LedgerRow = {
  member_id: string
  full_name: string
  deposits: number
  profits: number
  fees: number
  withdrawals: number
  adjustments: number
  net: number
}

type AdjustmentForm = {
  member_id: string
  member_name: string
  amount: string
  description: string
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function AdminLedger({ members }: { members: Member[] }) {
  const supabase = createClient()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [ledger, setLedger] = useState<LedgerRow[]>([])
  const [loading, setLoading] = useState(false)
  const [showAdjModal, setShowAdjModal] = useState(false)
  const [adjForm, setAdjForm] = useState<AdjustmentForm>({
    member_id: "", member_name: "", amount: "", description: "",
  })
  const [saving, startSaving] = useTransition()

  useEffect(() => {
    fetchLedger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  async function fetchLedger() {
    setLoading(true)

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`
    const endDate = new Date(year, month, 0).toISOString().split("T")[0]

    const [
      { data: deposits },
      { data: profits },
      { data: fees },
      { data: withdrawals },
      { data: adjustments },
    ] = await Promise.all([
      supabase.from("deposits").select("member_id, amount")
        .gte("deposit_date", startDate).lte("deposit_date", endDate),
      supabase.from("profits").select("member_id, amount")
        .gte("profit_date", startDate).lte("profit_date", endDate),
      supabase.from("fees").select("member_id, amount")
        .gte("fee_date", startDate).lte("fee_date", endDate),
      supabase.from("withdrawals").select("member_id, amount")
        .gte("withdrawal_date", startDate).lte("withdrawal_date", endDate)
        .eq("status", "approved"),
      supabase.from("manual_adjustments").select("member_id, amount")
        .eq("year", year).eq("month_number", month),
    ])

    const sum = (rows: { member_id: string; amount: number }[] | null, id: string) =>
      (rows || []).filter((r) => r.member_id === id)
        .reduce((acc, r) => acc + Number(r.amount), 0)

    const rows: LedgerRow[] = members.map((m) => {
      const d = sum(deposits, m.id)
      const p = sum(profits, m.id)
      const f = sum(fees, m.id)
      const w = sum(withdrawals, m.id)
      const a = sum(adjustments, m.id)
      return {
        member_id: m.id,
        full_name: m.full_name || m.email || "Unknown",
        deposits: d,
        profits: p,
        fees: f,
        withdrawals: w,
        adjustments: a,
        net: d + p + a - f - w,
      }
    })

    setLedger(rows)
    setLoading(false)
  }

  function openAdjModal(row: LedgerRow) {
    setAdjForm({
      member_id: row.member_id,
      member_name: row.full_name,
      amount: "",
      description: "",
    })
    setShowAdjModal(true)
  }

  function handleSaveAdjustment() {
    startSaving(async () => {
      const { error } = await supabase.from("manual_adjustments").insert({
        member_id: adjForm.member_id,
        amount: parseFloat(adjForm.amount),
        description: adjForm.description,
        year,
        month_number: month,
      })
      if (!error) {
        setShowAdjModal(false)
        fetchLedger()
      } else {
        alert("Error saving adjustment: " + error.message)
      }
    })
  }

  const totals = ledger.reduce(
    (acc, r) => ({
      deposits: acc.deposits + r.deposits,
      profits: acc.profits + r.profits,
      fees: acc.fees + r.fees,
      withdrawals: acc.withdrawals + r.withdrawals,
      adjustments: acc.adjustments + r.adjustments,
      net: acc.net + r.net,
    }),
    { deposits: 0, profits: 0, fees: 0, withdrawals: 0, adjustments: 0, net: 0 }
  )

  const monthLabel = MONTHS.find((m) => m.value === month)?.label

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Monthly Ledger</h1>
        <p className="text-muted-foreground text-sm">
          Transaction-driven member ledger. All figures pulled live from transaction records.
        </p>
      </div>

      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label>Year</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label>Month</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="ml-auto">
            {monthLabel} {year}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Member Ledger — {monthLabel} {year}
          </CardTitle>
          <CardDescription>
            Click the + button on any row to add a manual adjustment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-right">Deposits</TableHead>
                    <TableHead className="text-right">Profits</TableHead>
                    <TableHead className="text-right">Fees</TableHead>
                    <TableHead className="text-right">Withdrawals</TableHead>
                    <TableHead className="text-right">Adjustments</TableHead>
                    <TableHead className="text-right font-bold">Net</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((row) => (
                    <TableRow key={row.member_id}>
                      <TableCell className="font-medium">{row.full_name}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {row.deposits > 0 ? formatNaira(row.deposits) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-blue-600">
                        {row.profits > 0 ? formatNaira(row.profits) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-orange-500">
                        {row.fees > 0 ? formatNaira(row.fees) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        {row.withdrawals > 0 ? formatNaira(row.withdrawals) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.adjustments !== 0 ? (
                          <span className={row.adjustments > 0 ? "text-green-600" : "text-red-500"}>
                            {formatNaira(row.adjustments)}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${row.net >= 0 ? "text-green-700" : "text-red-600"}`}>
                        {formatNaira(row.net)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openAdjModal(row)}
                          title="Add manual adjustment"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow className="bg-muted/50 font-bold border-t-2">
                    <TableCell>TOTALS</TableCell>
                    <TableCell className="text-right text-green-600">{formatNaira(totals.deposits)}</TableCell>
                    <TableCell className="text-right text-blue-600">{formatNaira(totals.profits)}</TableCell>
                    <TableCell className="text-right text-orange-500">{formatNaira(totals.fees)}</TableCell>
                    <TableCell className="text-right text-red-500">{formatNaira(totals.withdrawals)}</TableCell>
                    <TableCell className="text-right">{formatNaira(totals.adjustments)}</TableCell>
                    <TableCell className={`text-right ${totals.net >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {formatNaira(totals.net)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdjModal} onOpenChange={setShowAdjModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Adjustment — {adjForm.member_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Amount (use negative for debit, e.g. -5000)</Label>
              <Input
                type="number"
                placeholder="e.g. 5000 or -5000"
                value={adjForm.amount}
                onChange={(e) => setAdjForm({ ...adjForm, amount: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Reason / Description</Label>
              <Input
                placeholder="e.g. Correction for March error"
                value={adjForm.description}
                onChange={(e) => setAdjForm({ ...adjForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjModal(false)}>Cancel</Button>
            <Button
              onClick={handleSaveAdjustment}
              disabled={saving || !adjForm.amount}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}