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
} from "@/components/ui/dialog"
import { formatNaira } from "@/lib/format"
import { Loader2, Save } from "lucide-react"

interface Report {
  id: string
  month: string
  year: number
  total_assets: number
  deposit_ytd: number
  profit_ytd: number
  monthly_deposit: number
  monthly_profit: number
}

interface EditReportFormProps {
  report: Report
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditReportForm({ report, open, onOpenChange }: EditReportFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    total_assets: report.total_assets.toString(),
    deposit_ytd: report.deposit_ytd.toString(),
    profit_ytd: report.profit_ytd.toString(),
    monthly_deposit: report.monthly_deposit.toString(),
    monthly_profit: report.monthly_profit.toString(),
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("financial_reports")
      .update({
        total_assets: parseFloat(formData.total_assets) || 0,
        deposit_ytd: parseFloat(formData.deposit_ytd) || 0,
        profit_ytd: parseFloat(formData.profit_ytd) || 0,
        monthly_deposit: parseFloat(formData.monthly_deposit) || 0,
        monthly_profit: parseFloat(formData.monthly_profit) || 0,
      })
      .eq("id", report.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-epic-black">
            Edit Financial Data - {report.month} {report.year}
          </DialogTitle>
          <DialogDescription>
            Update the financial figures for this period. All values are in Nigerian Naira.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
              <p className="text-xs text-muted-foreground mt-1">
                Current: {formatNaira(report.total_assets)}
              </p>
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
              onClick={() => onOpenChange(false)}
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
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
