import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"
import { AnnouncementForm } from "@/components/admin/announcement-form"
import { AnnouncementsList } from "@/components/admin/announcements-list"

export const metadata: Metadata = {
  title: "Announcements | Admin - Epicenter Cooperative Society",
  description: "Manage announcements for members.",
}

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-epic-black">Announcements</h1>
        <p className="text-muted-foreground">Create and manage announcements for members</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create Announcement */}
        <Card className="card-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gold" />
              Create Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementForm userId={user?.id || ""} />
          </CardContent>
        </Card>

        {/* Announcements List */}
        <Card className="card-gold">
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementsList announcements={announcements || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
