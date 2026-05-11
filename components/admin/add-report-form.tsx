"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function AddReportForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  
  const [formData, setFormData] = useState({
    month: "",
    year: currentYear.toString(),
    total_assets: "",
    deposit_ytd: "",
    profit_ytd: "",
    monthly_deposit: "",
    monthly_profit: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      month: "",
      year: currentYear.toString(),
      total_assets: "",
      deposit_ytd: "",
      profit_ytd: "",
      monthly_deposit: "",
      monthly_profit: "",
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.month) {
      setError("Please select a month")
      return
    }
    
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: insertError } = await supabase
      .from("financial_reports")
      .upsert({
        month: formData.month,
        year: parseInt(formData.year),
        total_assets: parseFloat(formData.total_assets) || 0,
        deposit_ytd: parseFloat(formData.deposit_ytd) || 0,
        profit_ytd: parseFloat(formData.profit_ytd) || 0,
        monthly_deposit: parseFloat(formData.monthly_deposit) || 0,
        monthly_profit: parseFloat(formData.monthly_profit) || 0,
      }, {
        onConflict: "month,year"
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    resetForm()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      setOpen(value)
      if (!value) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gold hover:bg-gold-dark text-epic-black">
          <Plus className="w-4 h-4 mr-2" />
          Add Monthly Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-epic-black">Add Monthly Financial Report</DialogTitle>
          <DialogDescription>
            Enter the financial data for a specific month. If data exists for the selected period, it will be updated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month" className="text-sm font-medium">
                Month <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.month}
                onValueChange={(value) => handleChange("month", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year" className="text-sm font-medium">
                Year <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.year}
                onValueChange={(value) => handleChange("year", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="total_assets" className="text-sm font-medium">
                Total Assets
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₦
                </span>
                <Input
                  id="total_assets"
                  type="number"
                  step="0.01"
                  value={formData.total_assets}
                  onChange={(e) => handleChange("total_assets", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deposit_ytd" className="text-sm font-medium">
                Deposit YTD
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₦
                </span>
                <Input
                  id="deposit_ytd"
                  type="number"
                  step="0.01"
                  value={formData.deposit_ytd}
                  onChange={(e) => handleChange("deposit_ytd", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profit_ytd" className="text-sm font-medium">
                Profit YTD
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₦
                </span>
                <Input
                  id="profit_ytd"
                  type="number"
                  step="0.01"
                  value={formData.profit_ytd}
                  onChange={(e) => handleChange("profit_ytd", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="monthly_deposit" className="text-sm font-medium">
                Monthly Deposit
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₦
                </span>
                <Input
                  id="monthly_deposit"
                  type="number"
                  step="0.01"
                  value={formData.monthly_deposit}
                  onChange={(e) => handleChange("monthly_deposit", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="monthly_profit" className="text-sm font-medium">
                Monthly Profit
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₦
                </span>
                <Input
                  id="monthly_profit"
                  type="number"
                  step="0.01"
                  value={formData.monthly_profit}
                  onChange={(e) => handleChange("monthly_profit", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Can be negative for losses
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gold hover:bg-gold-dark text-epic-black"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
