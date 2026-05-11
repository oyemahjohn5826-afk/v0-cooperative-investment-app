"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter your full address"),
  nextOfKinName: z.string().min(2, "Next of kin name is required"),
  nextOfKinPhone: z.string().min(10, "Please enter a valid phone number"),
  nextOfKinRelationship: z.string().min(2, "Please specify the relationship"),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  next_of_kin_name: string | null
  next_of_kin_phone: string | null
  next_of_kin_relationship: string | null
}

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      nextOfKinName: profile?.next_of_kin_name || "",
      nextOfKinPhone: profile?.next_of_kin_phone || "",
      nextOfKinRelationship: profile?.next_of_kin_relationship || "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          phone: data.phone,
          address: data.address,
          next_of_kin_name: data.nextOfKinName,
          next_of_kin_phone: data.nextOfKinPhone,
          next_of_kin_relationship: data.nextOfKinRelationship,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile?.id)

      if (error) throw error

      toast.success("Profile updated successfully!")
      router.refresh()
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-epic-black border-b pb-2">Personal Information</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Next of Kin */}
      <div className="space-y-4">
        <h3 className="font-semibold text-epic-black border-b pb-2">Next of Kin Information</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nextOfKinName">Full Name</Label>
            <Input
              id="nextOfKinName"
              {...register("nextOfKinName")}
              className={errors.nextOfKinName ? "border-destructive" : ""}
            />
            {errors.nextOfKinName && (
              <p className="text-sm text-destructive">{errors.nextOfKinName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextOfKinPhone">Phone Number</Label>
            <Input
              id="nextOfKinPhone"
              type="tel"
              {...register("nextOfKinPhone")}
              className={errors.nextOfKinPhone ? "border-destructive" : ""}
            />
            {errors.nextOfKinPhone && (
              <p className="text-sm text-destructive">{errors.nextOfKinPhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextOfKinRelationship">Relationship</Label>
            <Input
              id="nextOfKinRelationship"
              {...register("nextOfKinRelationship")}
              className={errors.nextOfKinRelationship ? "border-destructive" : ""}
            />
            {errors.nextOfKinRelationship && (
              <p className="text-sm text-destructive">{errors.nextOfKinRelationship.message}</p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-gold hover:bg-gold-dark text-epic-black font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  )
}
