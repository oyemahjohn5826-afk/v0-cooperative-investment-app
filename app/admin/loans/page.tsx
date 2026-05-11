import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HandCoins, Clock, CheckCircle, XCircle } from "lucide-react"
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
      profiles:user_id (full_name, email)
    `)
    .order("created_at", { ascending: false })

  const totalLoans = loans?.length || 0
  const pendingLoans = loans?.filter(l => l.status === "pending") || []
  const approvedLoans = loans?.filter(l => ["approved", "disbursed", "repaying"].includes(l.status)) || []
  const completedLoans = loans?.filter(l => l.status === "completed") || []

  const totalAmount = loans?.reduce((sum, l) => sum + Number(l.amount), 0) || 0
  const pendingAmount = pendingLoans.reduce((sum, l) => sum + Number(l.amount), 0)

  const stats = [
    { title: "Total Applications", value: totalLoans, icon: HandCoins, color: "bg-blue-100 text-blue-600" },
    { title: "Pending Review", value: pendingLoans.length, icon: Clock, color: "bg-yellow-100 text-yellow-600", sub: formatNaira(pendingAmount) },
    { title: "Active Loans", value: approvedLoans.length, icon: CheckCircle, color: "bg-green-100 text-green-600" },
    { title: "Completed", value: completedLoans.length, icon: XCircle, color: "bg-gray-100 text-gray-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-epic-black">Loans Management</h1>
        <p className="text-muted-foreground">Review, approve, and track loan applications</p>
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
                  <p className="text-2xl font-bold text-epic-black">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  {stat.sub && <p className="text-xs text-gold">{stat.sub}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loans Table */}
      <Card className="card-gold">
        <CardHeader>
          <CardTitle>All Loan Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <LoansTable loans={loans || []} />
        </CardContent>
      </Card>
    </div>
  )
}
