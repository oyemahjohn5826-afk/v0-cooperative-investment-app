import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Clock, AlertCircle } from "lucide-react"
import { MembersTable } from "@/components/admin/members-table"

export const metadata: Metadata = {
  title: "Members | Admin - Epicenter Cooperative Society",
  description: "Manage cooperative members.",
}

export default async function AdminMembersPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, status, role, savings_plan, created_at, date_of_birth, state_of_origin, occupation, sponsor_name")
    .order("created_at", { ascending: false })

  const allMembers      = members || []
  const totalMembers    = allMembers.length
  const approvedMembers = allMembers.filter((m) => m.status === "approved").length
  const pendingMembers  = allMembers.filter((m) => m.status === "pending").length
  const suspendedMembers = allMembers.filter((m) => m.status === "suspended").length

  const stats = [
    {
      title: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      urgent: false,
    },
    {
      title: "Pending Approval",
      value: pendingMembers,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-700",
      urgent: pendingMembers > 0,
    },
    {
      title: "Approved",
      value: approvedMembers,
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
      urgent: false,
    },
    {
      title: "Suspended",
      value: suspendedMembers,
      icon: UserX,
      color: "bg-red-100 text-red-600",
      urgent: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Members Management</h1>
        <p className="text-muted-foreground mt-1">
          View, approve, suspend, and manage all cooperative members
        </p>
      </div>

      {/* Pending banner */}
      {pendingMembers > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{pendingMembers} member{pendingMembers > 1 ? "s" : ""}</strong> awaiting
            approval. Review and approve them below.
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={stat.urgent ? "border-yellow-300" : ""}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
        </CardHeader>
        <CardContent>
          <MembersTable members={allMembers} />
        </CardContent>
      </Card>
    </div>
  )
}