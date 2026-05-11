import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, Users, Calendar } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { SavingsTable } from "@/components/admin/savings-table"
import { AddSavingsForm } from "@/components/admin/add-savings-form"

export const metadata: Metadata = {
  title: "Savings | Admin - Epicenter Cooperative Society",
  description: "Manage member savings and deposits.",
}

export default async function AdminSavingsPage() {
  const supabase = await createClient()

  const { data: savings } = await supabase
    .from("savings")
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .order("created_at", { ascending: false })

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("status", "approved")

  const totalSavings = savings?.reduce((sum, s) => sum + Number(s.amount), 0) || 0
  const totalTransactions = savings?.length || 0
  const uniqueMembers = new Set(savings?.map(s => s.user_id)).size
  
  const thisYear = new Date().getFullYear()
  const thisYearSavings = savings
    ?.filter((s) => s.year === thisYear)
    .reduce((sum, s) => sum + Number(s.amount), 0) || 0

  const stats = [
    { title: "Total Savings", value: formatNaira(totalSavings), icon: Wallet, color: "bg-gold/20 text-gold-dark" },
    { title: `${thisYear} Deposits`, value: formatNaira(thisYearSavings), icon: Calendar, color: "bg-blue-100 text-blue-600" },
    { title: "Total Transactions", value: totalTransactions, icon: TrendingUp, color: "bg-green-100 text-green-600" },
    { title: "Contributing Members", value: uniqueMembers, icon: Users, color: "bg-purple-100 text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-epic-black">Savings Management</h1>
        <p className="text-muted-foreground">Track and record member savings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="card-gold">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-epic-black">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add Savings Form */}
        <Card className="card-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gold" />
              Record Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddSavingsForm members={members || []} />
          </CardContent>
        </Card>

        {/* Savings Table */}
        <div className="lg:col-span-2">
          <Card className="card-gold">
            <CardHeader>
              <CardTitle>Recent Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsTable savings={savings || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
