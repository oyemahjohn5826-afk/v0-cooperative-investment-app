"use client"
import { useState, useEffect, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Loader2, TrendingUp, Users, Wallet, Percent } from "lucide-react"

const MONTHS = [
  { label: "January", value: 1, short: "Jan" },
  { label: "February", value: 2, short: "Feb" },
  { label: "March", value: 3, short: "Mar" },
  { label: "April", value: 4, short: "Apr" },
  { label: "May", value: 5, short: "May" },
  { label: "June", value: 6, short: "Jun" },
  { label: "July", value: 7, short: "Jul" },
  { label: "August", value: 8, short: "Aug" },
  { label: "September", value: 9, short: "Sep" },
  { label: "October", value: 10, short: "Oct" },
  { label: "November", value: 11, short: "Nov" },
  { label: "December", value: 12, short: "Dec" },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatPct(value: number) {
  return (value * 100).toFixed(2) + "%"
}

type Member = {
  id: string
  full_name: string | null
  email: string | null
}

type LedgerRow = {
  member_id: string
  full_name: string
  membership_type: "Core" | "Sponsored"  // The "Hidden Column" logic
  active_status: string
  registration_fee: number
  yearly_fee: number
  monthly_fees: Record<number, number>
  total_fees_paid: number
  total_fees_due: number
  total_fees_outstanding: number
  net_worth: number
  total_deposit: number
  shareholder_pct: number
  ranking: number
  referrals: number
}

// Row shapes returned by the untyped Supabase client (no generated DB types).
// These mirror the columns the ledger actually reads; adjust if the live
// schema differs.
type ShareholderRow = {
  user_id: string
  registration_fee?: number | null
  membership_type?: string | null
  active_status?: string | null
  yearly_fee?: number | null
  net_worth?: number | null
  total_deposit?: number | null
  shareholder_pct?: number | null
  ranking?: number | null
  referrals?: number | null
}

type MemberFeeRow = {
  user_id: string
  month: number
  amount?: number | null
  paid?: boolean | null
}

export function AdminLedger({ members }: { members: Member[] }) {
  const supabase = createClient()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [ledger, setLedger] = useState<LedgerRow[]>([])
  const [loading, setLoading] = useState(false)
  const [showAdjModal, setShowAdjModal] = useState(false)
  const [adjForm, setAdjForm] = useState({ id: "", name: "", amount: "", reason: "" })
  const [isSaving, startSaving] = useTransition()

  useEffect(() => { fetchLedger() }, [year, month])

  async function fetchLedger() {
    setLoading(true)
    const { data: shareholdersData } = await supabase.from("shareholders").select("*")
    const { data: feesData } = await supabase.from("member_fees").select("*").eq("year", year)

    const shareholders = shareholdersData as ShareholderRow[] | null
    const fees = feesData as MemberFeeRow[] | null

    const rows: LedgerRow[] = members.map((m) => {
      const sh = shareholders?.find((s) => s.user_id === m.id)
      const mFees = fees?.filter((f) => f.user_id === m.id) || []

      const monthly_fees: Record<number, number> = {}
      MONTHS.forEach((mo) => {
        const amt = mFees.find((f) => f.month === mo.value)?.amount || 0
        monthly_fees[mo.value] = Number(amt)
      })

      const paid = mFees.filter(f => f.paid).reduce((s, f) => s + Number(f.amount), 0)
      const reg = sh?.registration_fee || 0
      const yr = sh?.yearly_fee || 0
      const due = reg + yr + Object.values(monthly_fees).reduce((a, b) => a + b, 0)

      return {
        member_id: m.id,
        full_name: m.full_name || m.email || "Unknown Member",
        membership_type: (sh?.membership_type ?? "Core") as "Core" | "Sponsored", // Defaulting to Core
        active_status: sh?.active_status || "ACTIVE",
        registration_fee: reg,
        yearly_fee: yr,
        monthly_fees,
        total_fees_paid: paid,
        total_fees_due: due,
        total_fees_outstanding: due - paid,
        net_worth: sh?.net_worth || 0,
        total_deposit: sh?.total_deposit || 0,
        shareholder_pct: sh?.shareholder_pct || 0,
        ranking: sh?.ranking || 0,
        referrals: sh?.referrals || 0,
      }
    })

    setLedger(rows.sort((a, b) => (a.ranking || 999) - (b.ranking || 999)))
    setLoading(false)
  }

  // Summary Totals
  const totalAssets = ledger.reduce((s, r) => s + r.net_worth, 0)
  const totalDeposits = ledger.reduce((s, r) => s + r.total_deposit, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Monthly Ledger</h1>
          <p className="text-muted-foreground">Detailed financial records by Member Name</p>
        </div>
        <div className="flex gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>{MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-gold-dark">{formatNaira(totalAssets)}</div><p className="text-xs text-muted-foreground uppercase">Total Net Worth</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{formatNaira(totalDeposits)}</div><p className="text-xs text-muted-foreground uppercase">Total Deposits</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{formatNaira(ledger.reduce((s, r) => s + r.total_fees_paid, 0))}</div><p className="text-xs text-muted-foreground uppercase">Fees Collected</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-500">{formatNaira(ledger.reduce((s, r) => s + r.total_fees_outstanding, 0))}</div><p className="text-xs text-muted-foreground uppercase">Total Arrears</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-[10px] uppercase font-bold">
                <TableHead className="min-w-[180px] sticky left-0 bg-muted/50">Member Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reg Fee</TableHead>
                <TableHead>Yearly</TableHead>
                {MONTHS.map(m => (
                  <TableHead key={m.value} className={m.value === month ? "bg-gold/5" : ""}>{m.short}</TableHead>
                ))}
                <TableHead className="bg-green-50">Total Paid</TableHead>
                <TableHead className="bg-red-50">Arrears</TableHead>
                <TableHead>Net Worth</TableHead>
                <TableHead>Rank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={20} className="text-center py-10"><Loader2 className="animate-spin inline mr-2" /> Loading ledger...</TableCell></TableRow>
              ) : (
                ledger.map((row) => (
                  <TableRow key={row.member_id} className="text-xs">
                    <TableCell className="sticky left-0 bg-white font-medium border-r">
                      <div className="font-bold">{row.full_name}</div>
                      <div className="text-[10px] text-muted-foreground flex gap-1 items-center">
                        <span className={row.membership_type === "Core" ? "text-gold-dark" : "text-blue-500"}>
                          {row.membership_type}
                        </span>
                        • {row.referrals} Ref
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={row.active_status === "ACTIVE" ? "text-green-600 border-green-200" : ""}>
                        {row.active_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatNaira(row.registration_fee)}</TableCell>
                    <TableCell>{formatNaira(row.yearly_fee)}</TableCell>
                    {MONTHS.map(m => (
                      <TableCell key={m.value} className={m.value === month ? "bg-gold/5 font-bold" : "text-muted-foreground"}>
                        {row.monthly_fees[m.value] ? formatNaira(row.monthly_fees[m.value]) : "—"}
                      </TableCell>
                    ))}
                    <TableCell className="bg-green-50 font-bold text-green-700">{formatNaira(row.total_fees_paid)}</TableCell>
                    <TableCell className="bg-red-50 font-bold text-red-600">{formatNaira(row.total_fees_outstanding)}</TableCell>
                    <TableCell className="font-bold">{formatNaira(row.net_worth)}</TableCell>
                    <TableCell><Badge variant="secondary">#{row.ranking}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}