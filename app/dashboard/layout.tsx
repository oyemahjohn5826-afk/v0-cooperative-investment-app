import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/auth/login")
  }

  // ✅ Admins should not be in /dashboard — send them to /admin
  if (profile.role === "admin") {
    redirect("/admin")
  }

  // ✅ Block pending or suspended members
  if (profile.status === "pending" || profile.status === "suspended") {
    redirect("/auth/pending")
  }

  return (
    <div>
      <DashboardSidebar />
      <DashboardHeader />
      {children}
    </div>
  )
}