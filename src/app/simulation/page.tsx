
"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import DashboardLayout from "../(dashboard)/layout"
import { GRID_SCENARIOS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Sun, CloudRain, Wind, Play, Info, Map as MapIcon, BarChart3, Activity } from "lucide-react"
import { genAIScenarioComparisonInsights } from "@/ai/flows/gen-ai-scenario-comparison-insights-flow"
import { ComparisonChart } from "@/components/simulation/comparison-chart"
import { useToast } from "@/hooks/use-toast"

// Import Map dynamically to avoid SSR issues with Leaflet
const RouteMap = dynamic(() => import("@/components/simulation/route-map"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-xl" />
})

const DEFAULT_CHART_DATA = [
  { metric: "CO₂ Emissions (kg)", traditional: 18.5, cafs: 6.2, unit: "kg" },
  { metric: "Fuel Cost ($)", traditional: 52.0, cafs: 34.5, unit: "$" },
  { metric: "Time (h)", traditional: 0.8, cafs: 0.9, unit: "h" },
]

export default function SimulationPage() {
  const { toast } = useToast()
  const [activeScenario, setActiveScenario] = useState('balanced')
  const [insights, setInsights] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA)

  // Trigger simulation automatically when scenario changes for "Live" feel
  useEffect(() => {
    handleSimulate(true)
  }, [activeScenario])

  const handleSimulate = async (isAuto = false) => {
    if (!isAuto) setLoading(true)
    
    try {
      const scenario1 = {
        name: 'Traditional Grid',
        co2PerDelivery: 12.5,
        fuelCost: 45.0,
        deliveryTime: 8.5
      }
      
      const scenario2 = activeScenario === 'solar peak' ? {
        name: 'Solar Peak Strategy',
        co2PerDelivery: 3.8,
        fuelCost: 32.0,
        deliveryTime: 9.0
      } : activeScenario === 'coal peak' ? {
        name: 'High Carbon Grid Scenario',
        co2PerDelivery: 18.5,
        fuelCost: 52.0,
        deliveryTime: 8.2
      } : {
        name: 'Balanced Strategy',
        co2PerDelivery: 7.2,
        fuelCost: 39.5,
        deliveryTime: 8.6
      }

      setChartData([
        { metric: "CO₂ Emissions (kg)", traditional: scenario1.co2PerDelivery, cafs: scenario2.co2PerDelivery, unit: "kg" },
        { metric: "Fuel Cost ($)", traditional: scenario1.fuelCost, cafs: scenario2.fuelCost, unit: "$" },
        { metric: "Time (h)", traditional: scenario1.deliveryTime / 10, cafs: scenario2.deliveryTime / 10, unit: "h" },
      ])

      if (!isAuto) {
         const result = await genAIScenarioComparisonInsights({ scenario1, scenario2 })
         setInsights(result.summary)
         toast({ title: "Simulation Insights Generated", description: "AI analysis complete for the selected strategy." })
      }
    } catch (error) {
      console.error(error)
    } finally {
      if (!isAuto) setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Scenario Simulator</h1>
          <p className="text-muted-foreground">Simulate grid conditions to automatically adjust fleet prioritization and predict impact.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(GRID_SCENARIOS) as Array<keyof typeof GRID_SCENARIOS>).map((key) => {
            const scenario = GRID_SCENARIOS[key]
            const isActive = activeScenario === key
            return (
              <Card 
                key={key} 
                className={`cursor-pointer transition-all border-2 ${isActive ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/40 bg-card'}`}
                onClick={() => setActiveScenario(key)}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="capitalize text-lg">{key}</CardTitle>
                  {key === 'solar peak' ? <Sun className="text-orange-400 h-5 w-5" /> : key === 'coal peak' ? <CloudRain className="text-gray-500 h-5 w-5" /> : <Wind className="text-blue-400 h-5 w-5" />}
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-bold">{scenario.intensity}</span>
                    <span className="text-xs text-muted-foreground pb-1">gCO₂/kWh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`font-bold ${isActive ? 'bg-accent text-accent-foreground border-transparent' : 'bg-accent/5 text-accent border-accent/20'}`}>
                      {scenario.renewables}% Renewables
                    </Badge>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                    {scenario.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="px-12 py-6 text-lg font-bold gap-3 rounded-full shadow-2xl bg-accent hover:bg-accent/90"
            disabled={loading}
            onClick={() => handleSimulate(false)}
          >
            {loading ? <Activity className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
            Generate Strategic Analysis
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
           <Card className="overflow-hidden border-none shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-muted/30">
                 <div>
                    <CardTitle className="text-lg">Intelligent Pathfinding</CardTitle>
                    <CardDescription>Live route adjustments based on {activeScenario} profile</CardDescription>
                 </div>
                 <Activity className="h-5 w-5 text-accent animate-pulse" />
              </CardHeader>
              <CardContent className="p-0 h-[400px]">
                 <RouteMap />
              </CardContent>
           </Card>

           <Card className="flex flex-col border-none shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-muted/30">
                 <div>
                    <CardTitle className="text-lg">Real-Time Impact Comparison</CardTitle>
                    <CardDescription>CAFS Efficiency vs. Traditional Baselines</CardDescription>
                 </div>
                 <BarChart3 className="h-5 w-5 text-accent opacity-50" />
              </CardHeader>
              <CardContent className="flex-1 p-6">
                 <div className="h-[350px]">
                    <ComparisonChart data={chartData} />
                 </div>
              </CardContent>
           </Card>
        </div>

        {insights && (
          <Card className="border-accent/30 bg-accent/5 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-accent/10">
               <Zap className="h-5 w-5 text-accent" />
               <CardTitle>AI Strategic Insights: {activeScenario.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-medium leading-relaxed italic">
                {insights}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
