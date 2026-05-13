"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatNaira } from "@/lib/format"
import { TrendingUp } from "lucide-react"

interface Report {
  month: string
  year: number
  total_assets: number
  deposit_ytd: number
  profit_ytd: number
  monthly_deposit: number
  monthly_profit: number
}

interface TooltipPayloadEntry {
  value: number
  dataKey: string
  color: string
}

const SERIES: {
  key: string
  label: string
  color: string
  strokeDasharray?: string
}[] = [
  { key: "assets",          label: "Total Assets",      color: "#0ea5e9" },
  { key: "deposits",        label: "Deposits YTD",      color: "#22c55e" },
  { key: "profit",          label: "Profit YTD",        color: "#a855f7" },
  { key: "monthlyDeposit",  label: "Monthly Deposit",   color: "#f59e0b", strokeDasharray: "4 2" },
  { key: "monthlyProfit",   label: "Monthly Profit",    color: "#ec4899", strokeDasharray: "4 2" },
]

export function AdminChart({ data }: { data: Report[] }) {
  const chartData = data.map((r) => ({
    name:           `${r.month.slice(0, 3)} ${r.year}`,
    assets:         Number(r.total_assets   || 0),
    deposits:       Number(r.deposit_ytd    || 0),
    profit:         Number(r.profit_ytd     || 0),
    monthlyDeposit: Number(r.monthly_deposit || 0),
    monthlyProfit:  Number(r.monthly_profit  || 0),
  }))

  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000)     return `₦${(value / 1_000).toFixed(0)}K`
    return `₦${value}`
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: TooltipPayloadEntry[]
    label?: string
  }) => {
    if (!active || !payload?.length) return null

    return (
      <div className="rounded-lg border bg-background shadow-md p-3 text-sm min-w-[180px]">
        <p className="font-semibold mb-2 text-foreground">{label}</p>
        {payload.map((entry) => {
          const series = SERIES.find((s) => s.key === entry.dataKey)
          return (
            <div key={entry.dataKey} className="flex justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                {series?.label ?? entry.dataKey}
              </span>
              <span className="font-medium text-foreground">
                {formatNaira(entry.value)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
        <TrendingUp className="h-8 w-8 opacity-30" />
        <p className="text-sm">No financial data available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={s.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0}    />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />

          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.strokeDasharray}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}