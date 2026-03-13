"use client"

import { useState } from "react"
import DashboardLayout from "./(dashboard)/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Leaf, 
  DollarSign, 
  ArrowUpRight, 
  Zap,
  TrendingDown,
  Activity,
  PackageCheck,
  Play,
  Flame,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"
import dynamic from "next/dynamic"
import { ORDERS, VEHICLES } from "@/lib/mock-data"
import { calculateCarbonEmission } from "@/lib/carbon-engine"
import { useToast } from "@/hooks/use-toast"
import { optimizeFleetOrders } from "@/lib/fleet-optimizer"
import { getGridStatus } from "@/lib/grid-carbon-service"

// Import Map dynamically to avoid SSR issues
const FleetLiveMap = dynamic(() => import("@/components/fleet-live-map"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-muted animate-pulse rounded-xl flex items-center justify-center text-muted-foreground font-medium italic">Initializing Live Telemetry Stream...</div>
})

export default function HomePage() {
  const { toast } = useToast()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [metrics, setMetrics] = useState({
    co2Saved: 28.4,
    fuelSaved: 450,
    evUtilization: 65,
    ordersOptimized: ORDERS.length,
    avgTime: 38
  })

  const runGlobalOptimization = async () => {
    setIsOptimizing(true)
    await new Promise(r => setTimeout(r, 1500))
    
    const grid = getGridStatus('Solar Peak')
    const totalBasline = ORDERS.reduce((acc, o) => acc + calculateCarbonEmission(o.distance, 'diesel').co2Emission, 0)
    const totalOptimized = ORDERS.reduce((acc, o) => {
      const res = optimizeFleetOrders(o, VEHICLES as any, grid.carbonIntensity)
      return acc + (res?.estimatedCO2 || 0)
    }, 0)

    const saved = totalBasline - totalOptimized
    
    setMetrics({
      co2Saved: Number(saved.toFixed(1)),
      fuelSaved: 620,
      evUtilization: 82,
      ordersOptimized: ORDERS.length,
      avgTime: 32
    })

    toast({
      title: "Fleet Optimization Complete",
      description: `CO2 emissions reduced by ${((saved/totalBasline)*100).toFixed(0)}% across all active routes.`,
    })
    setIsOptimizing(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Fleet Command Center</h1>
            <p className="text-muted-foreground">Real-time carbon performance and autonomous scheduling status for March 2026.</p>
          </div>
          <Button 
            onClick={runGlobalOptimization} 
            disabled={isOptimizing}
            className="gap-2 bg-accent hover:bg-accent/90 shadow-lg px-6"
          >
            {isOptimizing ? <Activity className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            {isOptimizing ? "Optimizing Fleet..." : "Run Carbon Optimizer"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow cursor-default border-l-4 border-l-accent bg-accent/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-accent">CO₂ Saved Today</CardTitle>
              <Leaf className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{metrics.co2Saved} kg</div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-bold">
                <span className="text-accent flex items-center"><ArrowUpRight className="h-3 w-3" /> +18.4%</span> Efficiency Gain
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-default border-l-4 border-l-primary bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-primary">EV Utilization</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{metrics.evUtilization}%</div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-bold">
                <span className="text-primary flex items-center"><Activity className="h-3 w-3" /> Grid Active</span> Optimized
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-default border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] uppercase font-bold tracking-wider">Orders Optimized</CardTitle>
              <PackageCheck className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{metrics.ordersOptimized}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-bold">100% Automation Status</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-default border-l-4 border-l-orange-500 bg-orange-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-orange-500">Fuel Cost Saved</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">₹{metrics.fuelSaved}</div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-bold">
                <span className="text-accent flex items-center"><TrendingDown className="h-3 w-3" /> -12%</span> OpEx Reduction
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="overflow-hidden shadow-2xl border-none">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-lg">Real-Time Fleet Telemetry</CardTitle>
                  <CardDescription>Visualizing live asset movement and environmental compliance</CardDescription>
               </div>
               <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 animate-pulse font-bold px-4">
                  <Activity className="h-3 w-3 mr-1" /> System Live
               </Badge>
            </CardHeader>
            <CardContent className="p-0">
               <FleetLiveMap />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">City Carbon Emission Hotspots</CardTitle>
              </div>
              <CardDescription>Identifying environmental pressure zones to prioritize EV transition</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-xl bg-orange-500/5 border-orange-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Electronic City</p>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-[10px] uppercase font-black text-orange-600 tracking-tighter">High Carbon Density</p>
                  <p className="text-xs text-muted-foreground">Priority 1 for EV conversion.</p>
                </div>
                <div className="p-4 border rounded-xl bg-yellow-500/5 border-yellow-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Whitefield</p>
                    <Activity className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-[10px] uppercase font-black text-yellow-600 tracking-tighter">Transition Zone</p>
                  <p className="text-xs text-muted-foreground">45% optimized via current green corridors.</p>
                </div>
                <div className="p-4 border rounded-xl bg-accent/5 border-accent/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Koramangala</p>
                    <ShieldCheck className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-[10px] uppercase font-black text-accent tracking-tighter">Green Leader</p>
                  <p className="text-xs text-muted-foreground">Successfully meeting sustainability targets.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
