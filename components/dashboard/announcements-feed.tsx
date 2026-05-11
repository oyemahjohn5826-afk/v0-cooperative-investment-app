"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatShortDate } from "@/lib/format"

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
}

export function AnnouncementsFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      const supabase = createClient()
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5)

      setAnnouncements(data || [])
      setLoading(false)
    }

    fetchAnnouncements()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
            <div className="h-3 bg-secondary rounded w-1/2" />
          </div>
        ))}
      </div>
    )
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
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div 
          key={announcement.id} 
          className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <h4 className="font-medium text-sm text-epic-black mb-1">
            {announcement.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
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
