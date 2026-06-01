import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  const role = (cookieStore.get("ec_role")?.value || "").toLowerCase()
  const status = (cookieStore.get("ec_status")?.value || "").toLowerCase()

  if (role === "admin") {
    redirect("/admin")
  }

  if (!status) {
    redirect("/auth/member-login")
  }

  if (status !== "approved") {
    redirect("/auth/pending")
  }

  const profile = {
    id: cookieStore.get("ec_user_id")?.value || "",
    email: cookieStore.get("ec_email")?.value || "",
    full_name: cookieStore.get("ec_full_name")?.value || "Member",
    role,
    status,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar profile={profile as any} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader profile={profile as any} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}