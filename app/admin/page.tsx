import Link from "next/link"
import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Wallet,
  TrendingUp,
  PiggyBank,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Clock,
} from "lucide-react"
import { formatNaira } from "@/lib/format"
import { AdminChart } from "@/components/admin/admin-chart"
import { RecentMembers } from "@/components/admin/recent-members"
import { PendingLoans } from "@/components/admin/pending-loans"

export const metadata: Metadata = {
  title: "Admin Dashboard | Epicenter Cooperative Society",
  description: "Manage members, savings, and loans.",
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Profiles
  const { data: membersData, error: membersError } = await supabase
    .from("profiles")
    .select("id, full_name, email, status, created_at")
    .order("created_at", { ascending: false })

  const members = membersError ? [] : membersData || []

  const totalMembers = members.length
  const approvedMembers = members.filter((m) => m.status === "approved").length
  const pendingMembers = members.filter((m) => m.status === "pending").length
  const suspendedMembers = members.filter((m) => m.status === "suspended").length
  const recentMembers = members.slice(0, 5)

  // Savings
  const { data: savingsData, error: savingsError } = await supabase
    .from("savings")
    .select("amount")

  const savings = savingsError ? [] : savingsData || []
  const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount || 0), 0)

  // Loans
  const { data: loansData, error: loansError } = await supabase
    .from("loans")
    .select("id, amount, purpose, duration_months, status, created_at")
    .order("created_at", { ascending: false })

  const loans = loansError ? [] : loansData || []

  const pendingLoans = loans.filter((l) => l.status === "pending")
  const approvedLoans = loans.filter((l) => l.status === "approved")
  const activeLoans = loans.filter((l) => ["disbursed", "repaying"].includes(l.status))
  const pendingLoansAmount = pendingLoans.reduce(
    (sum, l) => sum + Number(l.amount || 0),
    0
  )

  // Reports
  const { data: reportsData, error: reportsError } = await supabase
    .from("financial_reports")
    .select(
      "month, year, total_assets, deposit_ytd, profit_ytd, monthly_deposit, monthly_profit"
    )
    .order("year", { ascending: true })
    .order("month", { ascending: true })

  const reports = reportsError ? [] : reportsData || []

  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null
  const totalAssets = Number(latestReport?.total_assets || 0)
  const totalProfit = Number(latestReport?.profit_ytd || 0)

  const stats = [
    {
      title: "Total Members",
      value: totalMembers,
      icon: Users,
      description: `${approvedMembers} approved`,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending Approvals",
      value: pendingMembers,
      icon: UserCheck,
      description:
        pendingMembers > 0
          ? `${pendingMembers} member${pendingMembers > 1 ? "s" : ""} awaiting review`
          : "No pending member approvals",
      color: "bg-yellow-100 text-yellow-700",
      urgent: pendingMembers > 0,
    },
    {
      title: "Pending Loans",
      value: pendingLoans.length,
      icon: Clock,
      description:
        pendingLoans.length > 0
          ? formatNaira(pendingLoansAmount)
          : "No pending loan applications",
      color: "bg-orange-100 text-orange-700",
      urgent: pendingLoans.length > 0,
    },
    {
      title: "Total Deposits",
      value: formatNaira(totalSavings),
      icon: Wallet,
      description: "All member contributions",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Assets",
      value: formatNaira(totalAssets),
      icon: PiggyBank,
      description: "Cooperative total assets",
      color: "bg-sky-100 text-sky-700",
    },
    {
      title: "Profit YTD",
      value: formatNaira(totalProfit),
      icon: TrendingUp,
      description: "Latest reported year-to-date profit",
      color: "bg-purple-100 text-purple-600",
    },
  ]

  const totalPendingItems = pendingMembers + pendingLoans.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage members, track finances, and oversee cooperative operations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/members">Manage Members</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/loans">Review Loans</Link>
          </Button>
        </div>
      </div>

      {totalPendingItems > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Items need attention</p>
                <p>
                  {pendingMembers} pending member approval
                  {pendingMembers !== 1 ? "s" : ""} and {pendingLoans.length} pending
                  loan application{pendingLoans.length !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {pendingMembers > 0 && (
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/members">
                    Review Members
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
              {pendingLoans.length > 0 && (
                <Button asChild size="sm">
                  <Link href="/admin/loans">
                    Review Loans
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={stat.urgent ? "border-yellow-300" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.urgent && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Action needed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Approved Members</p>
            <p className="text-2xl font-bold mt-1">{approvedMembers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Loans</p>
            <p className="text-2xl font-bold mt-1">
              {approvedLoans.length + activeLoans.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Suspended Members</p>
            <p className="text-2xl font-bold mt-1">{suspendedMembers}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminChart data={reports} />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CardTitle>Recent Members</CardTitle>
              {pendingMembers > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingMembers} pending
                </Badge>
              )}
            </div>

            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/members">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentMembers members={recentMembers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CardTitle>Pending Loan Applications</CardTitle>
              <Badge
                variant="secondary"
                className={
                  pendingLoans.length > 0
                    ? "bg-orange-100 text-orange-800"
                    : "bg-muted text-muted-foreground"
                }
              >
                {pendingLoans.length}
              </Badge>
            </div>

            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/loans">Open loans</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <PendingLoans loans={pendingLoans.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}