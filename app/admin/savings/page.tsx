import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, Users, Calendar } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { AddDepositForm } from "@/components/admin/add-deposit-form"

type Deposit = {
  id: string
  amount?: number | string
  created_at?: string
  reference?: string
  user_id?: string
  profiles?: {
    full_name?: string
    email?: string
  }
}

function DepositsTable({ deposits }: { deposits: Deposit[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] divide-y divide-border">
        <thead>
          <tr className="text-sm font-medium text-muted-foreground">
            <th className="px-4 py-3 text-left">Member</th>
            <th className="px-4 py-3 text-left">Amount</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Reference</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {deposits.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-sm text-muted-foreground">
                No deposits found.
              </td>
            </tr>
          ) : (
            deposits.map((deposit) => (
              <tr key={deposit.id} className="text-sm">
                <td className="px-4 py-3">
                  {deposit.profiles?.full_name ?? deposit.profiles?.email ?? "Unknown member"}
                </td>
                <td className="px-4 py-3 font-medium">{formatNaira(Number(deposit.amount) || 0)}</td>
                <td className="px-4 py-3">
                  {deposit.created_at ? new Date(deposit.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">{deposit.reference ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export const metadata: Metadata = {
  title: "Deposits | Admin - Epicenter Cooperative Society",
  description: "Manage member deposits and contributions.",
}

export default async function AdminDepositsPage() {
  const supabase = await createClient()

  const { data: deposits } = await supabase
    .from("deposits")
    .select(`*, profiles:user_id (full_name, email)`)
    .order("created_at", { ascending: false })

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("status", "approved")

  const totalDeposits = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0
  const totalTransactions = deposits?.length || 0
  const uniqueMembers = new Set(deposits?.map((d) => d.user_id)).size
  const thisYear = new Date().getFullYear()
  const thisYearDeposits = deposits
    ?.filter((d) => d.year === thisYear)
    .reduce((sum, d) => sum + Number(d.amount), 0) || 0

  const stats = [
    { title: "Total Deposits", value: formatNaira(totalDeposits), icon: Wallet, color: "bg-gold/20 text-gold-dark" },
    { title: `${thisYear} Deposits`, value: formatNaira(thisYearDeposits), icon: Calendar, color: "bg-blue-100 text-blue-600" },
    { title: "Total Transactions", value: totalTransactions, icon: TrendingUp, color: "bg-green-100 text-green-600" },
    { title: "Contributing Members", value: uniqueMembers, icon: Users, color: "bg-purple-100 text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deposit Management</h1>
        <p className="text-muted-foreground">Track and record member deposits</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className={`inline-flex p-2 rounded-lg mb-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add Deposit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Record Deposit</CardTitle>
          </CardHeader>
          <CardContent>
            <AddDepositForm members={members || []} />
          </CardContent>
        </Card>

        {/* Deposits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <DepositsTable deposits={deposits || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}