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
  description: "Manage members, deposits, and loans.",
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

  // Deposits
  const { data: depositsData, error: depositsError } = await supabase
    .from("deposits")
    .select("amount")

  const deposits = depositsError ? [] : depositsData || []
  const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0)

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
      value: formatNaira(totalDeposits),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage members, track finances, and oversee cooperative operations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/members">Manage Members</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/loans">Review Loans</Link>
          </Button>
        </div>
      </div>

      {totalPendingItems > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Items need attention</p>
              <p className="text-sm text-yellow-700">
                {pendingMembers} pending member approval
                {pendingMembers !== 1 ? "s" : ""} and {pendingLoans.length} pending
                loan application{pendingLoans.length !== 1 ? "s" : ""}.
              </p>
            </div>
            <div className="flex gap-2">
              {pendingMembers > 0 && (
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/members?filter=pending">Review Members</Link>
                </Button>
              )}
              {pendingLoans.length > 0 && (
                <Button asChild size="sm">
                  <Link href="/admin/loans?filter=pending">Review Loans</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative">
            {stat.urgent && (
              <Badge className="absolute top-2 right-2 bg-yellow-500 text-white text-xs">
                Action needed
              </Badge>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Approved Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedLoans.length + activeLoans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Suspended Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspendedMembers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminChart data={reports} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Members</CardTitle>
              {pendingMembers > 0 && (
                <Badge className="bg-yellow-500 text-white">{pendingMembers} pending</Badge>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/members">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <RecentMembers members={recentMembers} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Loan Applications</CardTitle>
              <Badge
                className={
                  pendingLoans.length > 0
                    ? "bg-orange-100 text-orange-800"
                    : "bg-muted text-muted-foreground"
                }
              >
                {pendingLoans.length}
              </Badge>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/loans">
                  Open loans <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <PendingLoans loans={pendingLoans} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}