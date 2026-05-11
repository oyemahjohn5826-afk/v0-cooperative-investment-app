import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HandCoins, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { LoansList } from "@/components/dashboard/loans-list"
import { LoanApplicationForm } from "@/components/dashboard/loan-application-form"

export const metadata: Metadata = {
  title: "Loans | Epicenter Cooperative Society",
  description: "Apply for loans and track your loan status.",
}

export default async function LoansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: loans } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  const { data: savings } = await supabase
    .from("savings")
    .select("amount")
    .eq("user_id", user?.id)

  const totalSavings = savings?.reduce((sum, s) => sum + Number(s.amount), 0) || 0
  const maxLoanAmount = totalSavings * 2 // Can borrow up to 2x savings

  const pendingLoans = loans?.filter(l => l.status === "pending") || []
  const activeLoans = loans?.filter(l => ["approved", "disbursed", "repaying"].includes(l.status)) || []
  const completedLoans = loans?.filter(l => l.status === "completed") || []

  const totalActiveAmount = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-epic-black">Loans</h1>
        <p className="text-muted-foreground">Apply for loans and track your repayments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-gold">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
                <HandCoins className="w-5 h-5 text-epic-black" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Loan Amount</p>
                <p className="text-lg font-bold text-epic-black">{formatNaira(maxLoanAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gold">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-bold text-epic-black">{pendingLoans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gold">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-lg font-bold text-epic-black">{formatNaira(totalActiveAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gold">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-lg font-bold text-epic-black">{completedLoans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Loan Application */}
        <Card className="card-gold">
          <CardHeader>
            <CardTitle>Apply for a Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <LoanApplicationForm maxAmount={maxLoanAmount} userId={user?.id || ""} />
          </CardContent>
        </Card>

        {/* Loans List */}
        <Card className="card-gold">
          <CardHeader>
            <CardTitle>Your Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <LoansList loans={loans || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
