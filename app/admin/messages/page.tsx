import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MailOpen } from "lucide-react"
import { MessagesTable } from "@/components/admin/messages-table"

export const metadata: Metadata = {
  title: "Messages | Admin - Epicenter Cooperative Society",
  description: "View contact form messages.",
}

export default async function AdminMessagesPage() {
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })

  const totalMessages = messages?.length || 0
  const unreadMessages = messages?.filter(m => !m.is_read).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-epic-black">Contact Messages</h1>
        <p className="text-muted-foreground">View and respond to contact form submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Card className="card-gold">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-epic-black">{totalMessages}</p>
                <p className="text-xs text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gold">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                <MailOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-epic-black">{unreadMessages}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      <Card className="card-gold">
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <MessagesTable messages={messages || []} />
        </CardContent>
      </Card>
    </div>
  )
}
