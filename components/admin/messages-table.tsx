"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Eye, Loader2 } from "lucide-react"
import { formatShortDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export function MessagesTable({ messages }: { messages: Message[] }) {
  const router = useRouter()
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const markAsRead = async (message: Message) => {
    setLoadingId(message.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", message.id)

      if (error) throw error

      setSelectedMessage(message)
      router.refresh()
    } catch (error) {
      console.error("Error marking message as read:", error)
      toast.error("Failed to mark message as read")
    } finally {
      setLoadingId(null)
    }
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No messages yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id} className={!message.is_read ? "bg-gold/5" : ""}>
                <TableCell>
                  <div>
                    <p className="font-medium">{message.name}</p>
                    <p className="text-xs text-muted-foreground">{message.email}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {message.subject}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatShortDate(message.created_at)}
                </TableCell>
                <TableCell>
                  <Badge variant={message.is_read ? "secondary" : "default"}>
                    {message.is_read ? "Read" : "New"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markAsRead(message)}
                    disabled={loadingId === message.id}
                  >
                    {loadingId === message.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{selectedMessage?.name}</p>
                <p className="text-muted-foreground">{selectedMessage?.email}</p>
              </div>
              <p className="text-muted-foreground">
                {selectedMessage && formatShortDate(selectedMessage.created_at)}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject}`)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Reply via Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
