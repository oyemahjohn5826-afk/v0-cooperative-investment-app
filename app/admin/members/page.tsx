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
    .select("*")
    .order("created_at", { ascending: false })

  const totalMembers = members?.length || 0
  const approvedMembers = members?.filter(m => m.status === "approved").length || 0
  const pendingMembers = members?.filter(m => m.status === "pending").length || 0
  const suspendedMembers = members?.filter(m => m.status === "suspended").length || 0

  const stats = [
    { title: "Total Members", value: totalMembers, icon: Users, color: "bg-blue-100 text-blue-600" },
    { title: "Approved", value: approvedMembers, icon: UserCheck, color: "bg-green-100 text-green-600" },
    { title: "Pending", value: pendingMembers, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
    { title: "Suspended", value: suspendedMembers, icon: UserX, color: "bg-red-100 text-red-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-epic-black">Members Management</h1>
        <p className="text-muted-foreground">View, approve, and manage cooperative members</p>
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members Table */}
      <Card className="card-gold">
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
