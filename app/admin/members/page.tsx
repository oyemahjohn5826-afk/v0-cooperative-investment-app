import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Clock } from "lucide-react"
import { MembersTable } from "@/components/admin/members-table"

export const metadata: Metadata = {
  title: "Members | Admin - Epicenter Cooperative Society",
  description: "Manage cooperative members.",
}

export default async function AdminMembersPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, status, role, created_at, address, next_of_kin_name, next_of_kin_phone, next_of_kin_relationship")
    .order("created_at", { ascending: false })

  const totalMembers = members?.length || 0
  const approvedMembers = members?.filter(m => m.status === "approved").length || 0
  const pendingMembers = members?.filter(m => m.status === "pending").length || 0
  const suspendedMembers = members?.filter(m => m.status === "suspended").length || 0

  const stats = [
    { title: "Total Members", value: totalMembers, icon: Users, color: "bg-blue-100 text-blue-600" },
    { title: "Approved", value: approvedMembers, icon: UserCheck, color: "bg-green-100 text-green-600" },
    { title: "Pending Approval", value: pendingMembers, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
    { title: "Suspended", value: suspendedMembers, icon: UserX, color: "bg-red-100 text-red-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Members Management</h1>
        <p className="text-muted-foreground mt-1">
          View, approve, and manage cooperative members
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending alert banner */}
      {pendingMembers > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800 text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            <strong>{pendingMembers} member{pendingMembers > 1 ? "s" : ""}</strong> waiting for approval.
            Review and approve them below.
          </span>
        </div>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
        </CardHeader>
        <CardContent>
          <MembersTable members={members || []} />
        </CardContent>
      </Card>
    </div>
  )
}