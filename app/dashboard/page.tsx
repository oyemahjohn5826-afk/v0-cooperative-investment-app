import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, HandCoins, Gift } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { SavingsHistory } from "@/components/dashboard/savings-history"
import { AnnouncementsFeed } from "@/components/dashboard/announcements-feed"

export const metadata: Metadata = {
  title: "Dashboard | Epicenter Cooperative Society",
  description: "View your savings, contributions, and investment performance.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single()

  // Get user's savings
  const { data: savings } = await supabase
    .from("savings")
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
  const totalSavings = savings?.reduce((sum, s) => sum + Number(s.amount), 0) || 0
  const activeLoans = loans?.filter(l => ["approved", "disbursed", "repaying"].includes(l.status)) || []
  const totalActiveLoans = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0)
  
  // Estimate dividends (simplified - in production this would be more complex)
  const estimatedDividends = totalSavings * 0.15 // 15% estimated return

  const stats = [
    {
      title: "Total Savings",
      value: formatNaira(totalSavings),
      icon: Wallet,
      description: "Your total contributions",
    },
    {
      title: "Total Contributions",
      value: savings?.length || 0,
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
      <div className="relative rounded-2xl overflow-hidden gold-gradient p-6 md:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-epic-black mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Member"}!
          </h1>
          <p className="text-epic-black/70">
            Track your investments and grow your wealth with Epicenter Cooperative.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
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
                <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-epic-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Savings History */}
        <div className="lg:col-span-2">
          <Card className="card-gold">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gold" />
                Savings History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsHistory savings={savings || []} />
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <div>
          <Card className="card-gold">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-gold" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnnouncementsFeed />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
