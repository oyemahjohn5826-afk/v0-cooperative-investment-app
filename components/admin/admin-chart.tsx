"use client"

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { formatNaira } from "@/lib/format"

interface Report {
  month: string
  year: number
  total_assets: number
  deposit_ytd: number
  profit_ytd: number
  monthly_deposit: number
  monthly_profit: number
}

export function AdminChart({ data }: { data: Report[] }) {
  const chartData = data.map((report) => ({
    name: `${report.month.slice(0, 3)} ${report.year}`,
    assets: report.total_assets,
    deposits: report.deposit_ytd,
    profit: report.profit_ytd,
  }))

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === "assets" && "Total Assets: "}
              {entry.dataKey === "deposits" && "Deposits YTD: "}
              {entry.dataKey === "profit" && "Profit YTD: "}
              {formatNaira(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No financial data available
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4A017" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#D4A017" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#87CEEB" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#87CEEB" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="assets" 
            name="Total Assets"
            stroke="#D4A017" 
            fill="url(#colorAssets)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="deposits" 
            name="Deposits YTD"
            stroke="#87CEEB" 
            fill="url(#colorDeposits)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="profit" 
            name="Profit YTD"
            stroke="#1A1A1A" 
            fill="url(#colorProfit)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
