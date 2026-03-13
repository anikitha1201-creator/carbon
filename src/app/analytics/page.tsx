"use client"

import { useState } from "react"
import DashboardLayout from "../(dashboard)/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Leaf, 
  Star, 
  ChevronRight, 
  BarChart3, 
  ArrowDownRight,
  ShieldCheck,
  Clock,
  Wallet
} from "lucide-react"
import { genAISustainabilityReport, GenAISustainabilityReportOutput } from "@/ai/flows/gen-ai-sustainability-report-flow"
import { ComparisonChart } from "@/components/simulation/comparison-chart"
import dynamic from "next/dynamic"

const RouteComparison = dynamic(() => import("@/components/route-comparison"), { 
  ssr: false,
  loading: () => <div className="h-[450px] w-full bg-muted animate-pulse rounded-xl flex items-center justify-center text-muted-foreground font-medium italic">Generating Strategic Comparison Maps...</div>
})

const PERFORMANCE_METRICS = [
  { 
    title: "CO₂ per Delivery", 
    traditional: "4.5 kg", 
    cafs: "2.79 kg", 
    savings: "38%", 
    icon: Leaf,
    color: "text-accent"
  },
  { 
    title: "Avg Fuel Cost", 
    traditional: "₹213", 
    cafs: "₹166", 
    savings: "22%", 
    icon: Wallet,
    color: "text-blue-500"
  },
  { 
    title: "Delivery Time", 
    traditional: "45 min", 
    cafs: "35 min", 
    savings: "22%", 
    icon: Clock,
    color: "text-orange-500"
  },
]

const CHART_DATA = [
  { metric: "CO₂ / Delivery (kg)", traditional: 4.5, cafs: 2.79, unit: "kg" },
  { metric: "Fuel Cost / Order (₹/10)", traditional: 21.3, cafs: 16.6, unit: "₹" },
  { metric: "Avg. Time (min/10)", traditional: 4.5, cafs: 3.5, unit: "min" },
]

export default function AnalyticsPage() {
  const [report, setReport] = useState<GenAISustainabilityReportOutput | null>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const result = await genAISustainabilityReport({
        totalCO2Emissions: 12480,
        co2PerDelivery: 8.4,
        emissionTrend: "decreasing by 4.2%",
        evUsagePercentage: 45,
        fleetSize: 32,
        periodDescription: "March 2026",
        previousPeriodData: {
          totalCO2Emissions: 13200,
          co2PerDelivery: 9.1
        }
      })
      setReport(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Sustainability Analytics</h1>
            <p className="text-muted-foreground">Strategic impact assessment: Traditional vs CAFS routing (March 2026).</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export All Data
            </Button>
            <Button className="gap-2" onClick={generateReport} disabled={loading}>
              {loading ? "Generating..." : <><FileText className="h-4 w-4" /> Generate ESG Report</>}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
           {PERFORMANCE_METRICS.map((metric, i) => (
             <Card key={i} className="relative overflow-hidden group">
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform`}>
                   <metric.icon className={`h-16 w-16 ${metric.color}`} />
                </div>
                <CardHeader className="pb-2">
                   <CardDescription className="text-xs uppercase font-bold tracking-wider">{metric.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Traditional</p>
                        <p className="text-lg font-bold text-muted-foreground line-through">{metric.traditional}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-semibold text-accent">CAFS Optimized</p>
                        <p className="text-2xl font-black text-foreground">{metric.cafs}</p>
                      </div>
                   </div>
                   <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs font-bold">
                         <span className="text-muted-foreground">Reduction Gain</span>
                         <span className="text-accent flex items-center gap-1">
                            <ArrowDownRight className="h-3 w-3" /> {metric.savings}
                         </span>
                      </div>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Visual Impact Comparison</h2>
                <p className="text-sm text-muted-foreground">Identifying carbon reduction gains through intelligent pathfinding.</p>
             </div>
          </div>
          
          <RouteComparison />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fleet Efficiency Benchmarking</CardTitle>
                <CardDescription>Visualizing environmental and operational improvements</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-accent opacity-50" />
            </CardHeader>
            <CardContent className="h-80">
               <ComparisonChart data={CHART_DATA} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
               <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <CardTitle>Eco-Leaderboard</CardTitle>
               </div>
              <CardDescription>Top performing operatives: March 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Alice Johnson', score: 98, ev: true },
                { name: 'Diana Prince', score: 95, ev: true },
                { name: 'Charlie Davis', score: 89, ev: false },
              ].map((driver, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{driver.name}</p>
                        <p className="text-[10px] text-muted-foreground">{driver.ev ? 'EV Specialist' : 'Hybrid Operator'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-1 text-accent font-bold">
                      <Star className="h-3 w-3 fill-current" />
                      {driver.score}
                   </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-primary h-8">View full leaderboard <ChevronRight className="h-3 w-3" /></Button>
            </CardContent>
          </Card>
        </div>

        {report && (
          <Card className="border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary p-6 text-primary-foreground flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-bold">Sustainability Impact Report</h2>
                  <p className="text-primary-foreground/70">Reporting Period: March 2026</p>
               </div>
               <Button variant="secondary" size="sm" className="gap-2">
                  <Download className="h-4 w-4" /> Export PDF
               </Button>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
                       <TrendingUp className="h-5 w-5 text-accent" /> Strategic Insights
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{report.summary}</p>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
                       <Leaf className="h-5 w-5 text-accent" /> Actionable Improvements
                    </h3>
                    <ul className="space-y-2">
                       {report.improvements.map((imp, i) => (
                         <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                            {imp}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {report.keyMetrics.map((metric, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-muted/30 border border-muted flex flex-col items-center text-center">
                     <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{metric.metricName}</span>
                     <span className="text-xl font-bold text-foreground">{metric.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
