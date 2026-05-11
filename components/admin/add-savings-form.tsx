"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

const savingsSchema = z.object({
  userId: z.string().min(1, "Please select a member"),
  amount: z.number().min(100, "Minimum amount is N100"),
  month: z.string().min(1, "Please select a month"),
  year: z.number().min(2021),
  description: z.string().optional(),
})

type SavingsFormData = z.infer<typeof savingsSchema>

interface Member {
  id: string
  full_name: string | null
  email: string | null
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function AddSavingsForm({ members }: { members: Member[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentYear = new Date().getFullYear()
  const currentMonth = months[new Date().getMonth()]

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SavingsFormData>({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      year: currentYear,
      month: currentMonth,
    },
  })

  const onSubmit = async (data: SavingsFormData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("savings")
        .insert({
          user_id: data.userId,
          amount: data.amount,
          month: data.month,
          year: data.year,
          description: data.description || "Monthly contribution",
        })

      if (error) throw error

      toast.success("Savings recorded successfully!")
      reset({ year: currentYear, month: currentMonth })
      router.refresh()
    } catch (error) {
      console.error("Savings error:", error)
      toast.error("Failed to record savings")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userId">Member</Label>
        <Select onValueChange={(value) => setValue("userId", value)}>
          <SelectTrigger className={errors.userId ? "border-destructive" : ""}>
            <SelectValue placeholder="Select member" />
          </SelectTrigger>
          <SelectContent>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.full_name || member.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.userId && (
          <p className="text-sm text-destructive">{errors.userId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (N)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          {...register("amount", { valueAsNumber: true })}
          className={errors.amount ? "border-destructive" : ""}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <Select defaultValue={currentMonth} onValueChange={(value) => setValue("month", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select defaultValue={currentYear.toString()} onValueChange={(value) => setValue("year", parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2021, 2022, 2023, 2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="e.g., Monthly contribution"
          {...register("description")}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gold hover:bg-gold-dark text-epic-black font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recording...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Record Savings
          </>
        )}
      </Button>
    </form>
  )
}
