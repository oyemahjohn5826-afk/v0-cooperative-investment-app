"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  isPublished: z.boolean().default(true),
})

type AnnouncementFormData = z.infer<typeof announcementSchema>

export function AnnouncementForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      isPublished: true,
    },
  })

  const isPublished = watch("isPublished")

  const onSubmit = async (data: AnnouncementFormData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("announcements")
        .insert({
          title: data.title,
          content: data.content,
          is_published: data.isPublished,
          created_by: userId,
        })

      if (error) throw error

      toast.success("Announcement created successfully!")
      reset()
      router.refresh()
    } catch (error) {
      console.error("Announcement error:", error)
      toast.error("Failed to create announcement")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Announcement title"
          {...register("title")}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Write your announcement..."
          rows={6}
          {...register("content")}
          className={errors.content ? "border-destructive" : ""}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="isPublished"
            checked={isPublished}
            onCheckedChange={(checked) => setValue("isPublished", checked)}
          />
          <Label htmlFor="isPublished" className="cursor-pointer">
            Publish immediately
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gold hover:bg-gold-dark text-epic-black font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Create Announcement
          </>
        )}
      </Button>
    </form>
  )
}
