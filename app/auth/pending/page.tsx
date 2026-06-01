import Link from "next/link"
import { Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function PendingPage() {
  const cookieStore = await cookies()

  const role = (cookieStore.get("ec_role")?.value || "").toLowerCase()
  const status = (cookieStore.get("ec_status")?.value || "").toLowerCase()
  const fullName = cookieStore.get("ec_full_name")?.value || "there"

  if (status === "approved") {
    if (role === "admin") redirect("/admin")
    redirect("/dashboard")
  }

  const isSuspended = status === "suspended"

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-semibold">
              {isSuspended ? "Account Suspended" : "Awaiting Approval"}
            </CardTitle>
            <CardDescription>
              {isSuspended
                ? "Your account has been suspended. Please contact the cooperative administrator."
                : `Hi ${fullName.split(" ")[0]}, your registration was received successfully.`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!isSuspended && (
              <div className="rounded border border-amber-100 bg-amber-50 p-4 text-sm">
                <strong>What happens next?</strong>
                <ul className="mt-2 list-inside list-disc">
                  <li>An admin will review your application</li>
                  <li>You will receive an email once approved</li>
                  <li>You can then log in and access your dashboard</li>
                </ul>
              </div>
            )}

            <p className="text-sm">
              Questions? Contact us at{" "}
              <a className="text-gold hover:underline" href="mailto:epicentercooperative@gmail.com">
                epicentercooperative@gmail.com
              </a>
            </p>

            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/auth/member-login">Back to login</Link>
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await fetch("/api/auth/logout", {
                    method: "POST",
                    cache: "no-store",
                  })
                  window.location.href = "/auth/member-login"
                }}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}