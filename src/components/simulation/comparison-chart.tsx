
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ComparisonChartProps {
  data: {
    metric: string
    traditional: number
    cafs: number
    unit: string
  }[]
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  const chartConfig = {
    traditional: {
      label: "Traditional Routing",
      color: "hsl(var(--muted-foreground))",
    },
    cafs: {
      label: "CAFS Optimization",
      color: "hsl(var(--accent))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="metric" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
          />
          <Bar 
            dataKey="traditional" 
            fill="hsl(var(--muted-foreground)/0.3)" 
            radius={[4, 4, 0, 0]} 
            name="Traditional"
          />
          <Bar 
            dataKey="cafs" 
            fill="hsl(var(--accent))" 
            radius={[4, 4, 0, 0]} 
            name="CAFS"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
