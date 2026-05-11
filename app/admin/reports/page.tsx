import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, TrendingUp, PiggyBank, Percent } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { AdminChart } from "@/components/admin/admin-chart"
import { ReportsTable } from "@/components/admin/reports-table"
import { AddReportForm } from "@/components/admin/add-report-form"

export const metadata: Metadata = {
  title: "Reports | Admin - Epicenter Cooperative Society",
  description: "View and manage financial reports and analytics.",
}

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from("financial_reports")
    .select("*")
    .order("year", { ascending: true })
    .order("month", { ascending: true })

  const latestReport = reports?.[reports.length - 1]
  const totalAssets = latestReport?.total_assets || 0
  const totalDeposits = latestReport?.deposit_ytd || 0
  const totalProfit = latestReport?.profit_ytd || 0
  const profitMargin = totalAssets > 0 ? ((totalProfit / totalAssets) * 100).toFixed(2) : 0

  const stats = [
    { title: "Total Assets", value: formatNaira(totalAssets), icon: PiggyBank, color: "bg-gold/20 text-gold-dark" },
    { title: "Total Deposits YTD", value: formatNaira(totalDeposits), icon: TrendingUp, color: "bg-blue-100 text-blue-600" },
    { title: "Total Profit YTD", value: formatNaira(totalProfit), icon: BarChart3, color: "bg-green-100 text-green-600" },
    { title: "Profit Margin", value: `${profitMargin}%`, icon: Percent, color: "bg-purple-100 text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-epic-black">Financial Reports</h1>
          <p className="text-muted-foreground">View and manage financial performance data</p>
        </div>
        <AddReportForm />
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

      {/* Chart */}
      <Card className="card-gold">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold" />
            Financial Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminChart data={reports || []} />
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="card-gold">
        <CardHeader>
          <CardTitle>Monthly Financial Data</CardTitle>
          <CardDescription>
            Click on any row to edit the financial figures. Hover over a row to see the edit button.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsTable reports={reports || []} />
        </CardContent>
      </Card>
    </div>
  )
}
