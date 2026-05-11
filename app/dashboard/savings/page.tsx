import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, Calendar } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { SavingsHistory } from "@/components/dashboard/savings-history"

export const metadata: Metadata = {
  title: "Savings | Epicenter Cooperative Society",
  description: "View your savings history and contributions.",
}

export default async function SavingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: savings } = await supabase
    .from("savings")
    .select("*")
    .eq("user_id", user?.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false })

  const totalSavings = savings?.reduce((sum, s) => sum + Number(s.amount), 0) || 0
  const thisYear = new Date().getFullYear()
  const thisYearSavings = savings
    ?.filter((s) => s.year === thisYear)
    .reduce((sum, s) => sum + Number(s.amount), 0) || 0
  
  const monthlyAverage = savings?.length 
    ? totalSavings / savings.length 
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-epic-black">Savings & Contributions</h1>
        <p className="text-muted-foreground">Track your savings history and contributions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-gold">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                <Wallet className="w-6 h-6 text-epic-black" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-xl font-bold text-epic-black">{formatNaira(totalSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gold">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                <Calendar className="w-6 h-6 text-epic-black" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{thisYear} Savings</p>
                <p className="text-xl font-bold text-epic-black">{formatNaira(thisYearSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gold">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-epic-black" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Average</p>
                <p className="text-xl font-bold text-epic-black">{formatNaira(monthlyAverage)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings History */}
      <Card className="card-gold">
        <CardHeader>
          <CardTitle>Contribution History</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsHistory savings={savings || []} />
        </CardContent>
      </Card>
    </div>
  )
}
