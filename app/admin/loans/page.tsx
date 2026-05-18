import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HandCoins, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { LoansTable } from "@/components/admin/loans-table"

export const metadata: Metadata = {
  title: "Loans | Admin - Epicenter Cooperative Society",
  description: "Manage loan applications.",
}

export default async function AdminLoansPage() {
  const supabase = await createClient()

  const { data: loans } = await supabase
    .from("loans")
    .select(`
      *,
      profiles:user_id (full_name, email, phone)
    `)
    .order("created_at", { ascending: false })

  const allLoans = loans || []
  const pendingLoans   = allLoans.filter(l => l.status === "pending")
  const approvedLoans  = allLoans.filter(l => l.status === "approved")
  const activeLoans    = allLoans.filter(l => ["disbursed", "repaying"].includes(l.status))
  const completedLoans = allLoans.filter(l => l.status === "completed")
  const rejectedLoans  = allLoans.filter(l => l.status === "rejected")

  const pendingAmount = pendingLoans.reduce((sum, l) => sum + Number(l.amount), 0)
  const activeAmount  = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0)

  const stats = [
    {
      title: "Pending Review",
      value: pendingLoans.length,
      sub: formatNaira(pendingAmount),
      icon: Clock,
      color: "bg-yellow-100 text-yellow-700",
      urgent: pendingLoans.length > 0,
    },
    {
      title: "Approved (Awaiting Disbursement)",
      value: approvedLoans.length,
      sub: formatNaira(approvedLoans.reduce((s, l) => s + Number(l.amount), 0)),
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-700",
      urgent: false,
    },
    {
      title: "Active (Disbursed / Repaying)",
      value: activeLoans.length,
      sub: formatNaira(activeAmount),
      icon: HandCoins,
      color: "bg-green-100 text-green-700",
      urgent: false,
    },
    {
      title: "Completed / Rejected",
      value: completedLoans.length + rejectedLoans.length,
      sub: `${completedLoans.length} done · ${rejectedLoans.length} rejected`,
      icon: XCircle,
      color: "bg-gray-100 text-gray-600",
      urgent: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Loans Management</h1>
        <p className="text-muted-foreground mt-1">
          Review, approve, disburse, and track all loan applications
        </p>
      </div>

      {/* Urgent banner */}
      {pendingLoans.length > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{pendingLoans.length} loan application{pendingLoans.length > 1 ? "s" : ""}</strong> pending
            review — totalling <strong>{formatNaira(pendingAmount)}</strong>.
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={stat.urgent ? "border-yellow-300" : ""}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.title}</p>
                {stat.sub && (
                  <p className="text-xs font-medium text-foreground/70 mt-0.5">{stat.sub}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Loan Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <LoansTable loans={allLoans} />
        </CardContent>
      </Card>
    </div>
  )
}