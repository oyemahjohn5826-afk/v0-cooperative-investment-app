import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Calendar } from "lucide-react"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "Announcements | Epicenter Cooperative Society",
  description: "Stay updated with the latest news and announcements.",
}

export default async function AnnouncementsPage() {
  const supabase = await createClient()

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-epic-black">Announcements</h1>
        <p className="text-muted-foreground">Stay updated with the latest news</p>
      </div>

      {announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="card-gold">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-epic-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-epic-black text-lg mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-wrap mb-4">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gold">
                      <Calendar className="w-4 h-4" />
                      {formatDate(announcement.created_at)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-gold">
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-epic-black mb-2">No Announcements</h3>
            <p className="text-muted-foreground">
              Check back later for updates and news from the cooperative.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
