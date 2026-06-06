import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, HandCoins, Gift } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { DepositsHistory } from "@/components/dashboard/deposits-history"
import { AnnouncementsFeed } from "@/components/dashboard/announcements-feed"

export const metadata: Metadata = {
  title: "Dashboard | Epicenter Cooperative Society",
  description: "View your deposits, contributions, and investment performance.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single()

  // Get user's deposits
  const { data: deposits } = await supabase
    .from("deposits")
    .select("*")
    .eq("user_id", user?.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false })

  // Get user's loans
  const { data: loans } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", user?.id)

  // Calculate totals
  const totalDeposits = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0
  const activeLoans = loans?.filter(l => ["approved", "disbursed", "repaying"].includes(l.status)) || []
  const totalActiveLoans = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0)

  // Estimate dividends (simplified - in production this would be more complex)
  const estimatedDividends = totalDeposits * 0.15 // 15% estimated return

  const stats = [
    {
      title: "Total Deposits",
      value: formatNaira(totalDeposits),
      icon: Wallet,
      description: "Your total contributions",
    },
    {
      title: "Total Contributions",
      value: deposits?.length || 0,
      icon: TrendingUp,
      description: "Number of deposits",
    },
    {
      title: "Active Loans",
      value: formatNaira(totalActiveLoans),
      icon: HandCoins,
      description: `${activeLoans.length} active loan(s)`,
    },
    {
      title: "Est. Dividends",
      value: formatNaira(estimatedDividends),
      icon: Gift,
      description: "Projected returns",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.full_name?.split(" ")[0] || "Member"}!
        </h1>
        <p className="text-muted-foreground">
          Track your investments and grow your wealth with Epicenter Cooperative.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Deposit History */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit History</CardTitle>
          </CardHeader>
          <CardContent>
            <DepositsHistory deposits={deposits || []} />
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementsFeed />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}