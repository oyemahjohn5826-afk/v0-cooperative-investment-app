import Link from "next/link"
import { Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, status")
    .eq("id", user.id)
    .single()

  // If somehow approved, send them to dashboard
  if (profile?.status === "approved") redirect("/dashboard")

  const isSuspended = profile?.status === "suspended"

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <div className="flex justify-center mb-3">
            <div className={`p-4 rounded-full ${isSuspended ? "bg-red-100" : "bg-yellow-100"}`}>
              <Clock className={`h-8 w-8 ${isSuspended ? "text-red-600" : "text-yellow-600"}`} />
            </div>
          </div>
          <CardTitle className="text-xl">
            {isSuspended ? "Account Suspended" : "Awaiting Approval"}
          </CardTitle>
          <CardDescription className="mt-2">
            {isSuspended
              ? "Your account has been suspended. Please contact the cooperative administrator."
              : `Hi ${profile?.full_name?.split(" ")[0] || "there"}, your registration was received successfully.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isSuspended && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 text-left space-y-1">
              <p className="font-semibold">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>An admin will review your application</li>
                <li>You will receive an email once approved</li>
                <li>You can then log in and access your dashboard</li>
              </ul>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:epicentercooperative@gmail.com" className="text-primary underline">
              epicentercooperative@gmail.com
            </a>
          </p>

          <form action="/auth/signout" method="post">
            <Button variant="outline" className="w-full gap-2" type="submit">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}