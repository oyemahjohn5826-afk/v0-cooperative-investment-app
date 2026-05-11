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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { formatNaira } from "@/lib/format"

const loanSchema = z.object({
  amount: z.number().min(10000, "Minimum loan amount is N10,000"),
  purpose: z.string().min(10, "Please describe the loan purpose"),
  duration: z.string().min(1, "Please select a duration"),
  guarantorName: z.string().min(2, "Guarantor name is required"),
  guarantorPhone: z.string().min(10, "Please enter a valid phone number"),
})

type LoanFormData = z.infer<typeof loanSchema>

interface LoanApplicationFormProps {
  maxAmount: number
  userId: string
}

export function LoanApplicationForm({ maxAmount, userId }: LoanApplicationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
  })

  const watchAmount = watch("amount")

  const onSubmit = async (data: LoanFormData) => {
    if (data.amount > maxAmount) {
      toast.error(`Maximum loan amount is ${formatNaira(maxAmount)}`)
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("loans")
        .insert({
          user_id: userId,
          amount: data.amount,
          purpose: data.purpose,
          duration_months: parseInt(data.duration),
          guarantor_name: data.guarantorName,
          guarantor_phone: data.guarantorPhone,
        })

      if (error) throw error

      toast.success("Loan application submitted successfully!")
      reset()
      router.refresh()
    } catch (error) {
      console.error("Loan application error:", error)
      toast.error("Failed to submit loan application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Loan Amount (Max: {formatNaira(maxAmount)})</Label>
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
        {watchAmount > maxAmount && (
          <p className="text-sm text-destructive">Amount exceeds maximum allowed</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea
          id="purpose"
          placeholder="Describe the purpose of this loan..."
          {...register("purpose")}
          className={errors.purpose ? "border-destructive" : ""}
        />
        {errors.purpose && (
          <p className="text-sm text-destructive">{errors.purpose.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Repayment Duration</Label>
        <Select onValueChange={(value) => setValue("duration", value)}>
          <SelectTrigger className={errors.duration ? "border-destructive" : ""}>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Months</SelectItem>
            <SelectItem value="6">6 Months</SelectItem>
            <SelectItem value="12">12 Months</SelectItem>
            <SelectItem value="18">18 Months</SelectItem>
            <SelectItem value="24">24 Months</SelectItem>
          </SelectContent>
        </Select>
        {errors.duration && (
          <p className="text-sm text-destructive">{errors.duration.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guarantorName">Guarantor Name</Label>
          <Input
            id="guarantorName"
            placeholder="Full name"
            {...register("guarantorName")}
            className={errors.guarantorName ? "border-destructive" : ""}
          />
          {errors.guarantorName && (
            <p className="text-sm text-destructive">{errors.guarantorName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guarantorPhone">Guarantor Phone</Label>
          <Input
            id="guarantorPhone"
            type="tel"
            placeholder="+234..."
            {...register("guarantorPhone")}
            className={errors.guarantorPhone ? "border-destructive" : ""}
          />
          {errors.guarantorPhone && (
            <p className="text-sm text-destructive">{errors.guarantorPhone.message}</p>
          )}
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
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Application
          </>
        )}
      </Button>
    </form>
  )
}
