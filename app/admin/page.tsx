import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, TrendingUp, PiggyBank, HandCoins, UserCheck } from "lucide-react"
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

  // Get all members
  const { data: members, count: totalMembers } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })

  // Get approved members count
  const approvedMembers = members?.filter(m => m.status === "approved").length || 0
  const pendingMembers = members?.filter(m => m.status === "pending").length || 0

  // Get total savings
  const { data: savings } = await supabase
    .from("savings")
    .select("amount")

  const totalSavings = savings?.reduce((sum, s) => sum + Number(s.amount), 0) || 0

  // Get loans data
  const { data: loans } = await supabase
    .from("loans")
    .select("*")

  const pendingLoans = loans?.filter(l => l.status === "pending") || []
  const totalLoansAmount = loans?.reduce((sum, l) => sum + Number(l.amount), 0) || 0

  // Get financial reports
  const { data: reports } = await supabase
    .from("financial_reports")
    .select("*")
    .order("year", { ascending: true })
    .order("month", { ascending: true })

  const latestReport = reports?.[reports.length - 1]
  const totalAssets = latestReport?.total_assets || 0
  const totalProfit = latestReport?.profit_ytd || 0

  const stats = [
    {
      title: "Total Members",
      value: totalMembers || 0,
      icon: Users,
      description: `${approvedMembers} approved, ${pendingMembers} pending`,
      color: "bg-blue-100 text-blue-600",
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
      color: "bg-gold/20 text-gold-dark",
    },
    {
      title: "Total Profit",
      value: formatNaira(totalProfit),
      icon: TrendingUp,
      description: "Year-to-date profit",
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-epic-black p-6 md:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-white/70">
            Manage members, track finances, and oversee cooperative operations.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="card-gold">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-epic-black">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Card className="card-gold">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminChart data={reports || []} />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="card-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-gold" />
              Recent Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentMembers members={members?.slice(0, 5) || []} />
          </CardContent>
        </Card>

        <Card className="card-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-gold" />
              Pending Loan Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PendingLoans loans={pendingLoans.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
