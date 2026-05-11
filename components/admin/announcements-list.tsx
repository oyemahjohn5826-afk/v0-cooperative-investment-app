"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Trash2, Loader2 } from "lucide-react"
import { formatShortDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"

interface Announcement {
  id: string
  title: string
  content: string
  is_published: boolean
  created_at: string
}

export function AnnouncementsList({ announcements }: { announcements: Announcement[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteAnnouncement = async (id: string) => {
    setDeletingId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast.success("Announcement deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast.error("Failed to delete announcement")
    } finally {
      setDeletingId(null)
    }
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No announcements yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto">
      {announcements.map((announcement) => (
        <div 
          key={announcement.id} 
          className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-epic-black">{announcement.title}</h4>
            <div className="flex items-center gap-2">
              <Badge variant={announcement.is_published ? "default" : "secondary"}>
                {announcement.is_published ? "Published" : "Draft"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteAnnouncement(announcement.id)}
                disabled={deletingId === announcement.id}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                {deletingId === announcement.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {announcement.content}
          </p>
          <p className="text-xs text-gold">
            {formatShortDate(announcement.created_at)}
          </p>
        </div>
      ))}
    </div>
  )
}
