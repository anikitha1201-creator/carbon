"use client"

import { useState } from "react"
import DashboardLayout from "../(dashboard)/layout"
import { ORDERS, VEHICLES } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Search, 
  Filter, 
  MapPin,
  Clock,
  ChevronRight,
  Route,
  Leaf,
  Zap,
  Info
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { calculateCarbonEmission } from "@/lib/carbon-engine"
import { optimizeFleetOrders } from "@/lib/fleet-optimizer"
import { getGridStatus } from "@/lib/grid-carbon-service"
import { genAIRouteExplanation } from "@/ai/flows/gen-ai-route-explanation-flow"
import { useToast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const { toast } = useToast()
  const [optimizingId, setOptimizingId] = useState<string | null>(null)
  const [explanations, setExplanations] = useState<Record<string, string>>({})

  const handleOptimize = async (order: any) => {
    setOptimizingId(order.id)
    try {
      const grid = getGridStatus('Solar Peak')
      // Map mock vehicles to engine interface
      const fleet = VEHICLES.map(v => ({ 
        id: v.id, 
        type: v.type.toLowerCase() as any, 
        capacity: v.capacity, 
        status: v.status,
        driverName: v.id === 'v-1' ? 'Alice Johnson' : 'Fleet Driver'
      }))
      
      const result = optimizeFleetOrders(order, fleet, grid.carbonIntensity)
      
      if (!result) {
        toast({ variant: "destructive", title: "Optimization Failed", description: "No suitable vehicles found for this order capacity." })
        return
      }

      const explanation = await genAIRouteExplanation({
        chosenRoute: {
          id: 'cafs-optimized-path',
          emissionsCo2: result.estimatedCO2,
          cost: order.distance * 12,
          deliveryTime: order.distance * 3,
          pathDescription: `${order.pickup} to ${order.dropoff} via green corridor`
        },
        alternativeRoutes: [
           {
              id: 'standard-path',
              emissionsCo2: order.distance * 0.25,
              cost: order.distance * 15,
              deliveryTime: order.distance * 3.5,
              pathDescription: 'Default highway route'
           }
        ],
        vehicleDetails: {
          type: result.assignedVehicle.type.toUpperCase() as any,
          capacity: result.assignedVehicle.capacity,
        },
        orderDetails: {
          weight: order.weight,
          pickupLocation: order.pickup,
          dropoffLocation: order.dropoff,
          deliveryDeadline: order.deadline
        },
        carbonIntensityContext: {
          liveCarbonIntensity: grid.carbonIntensity * 1000,
          gridType: grid.name
        }
      })

      setExplanations(prev => ({ ...prev, [order.id]: explanation.explanation }))
      toast({ title: "CAFS Optimization Complete", description: `Assigned to ${result.assignedVehicle.id} (${result.assignedVehicle.type})` })
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate optimization rationale." })
    } finally {
      setOptimizingId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Operations</h1>
            <p className="text-muted-foreground">Manage delivery assignments with automated carbon-aware routing.</p>
          </div>
          <Button className="gap-2">
            <Package className="h-4 w-4" /> Create Request
          </Button>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter by customer, ID or location..." className="pl-10 h-10" />
          </div>
          <Button variant="outline" className="gap-2 h-10">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="grid gap-4">
          {ORDERS.map((order) => {
            const dieselEmissions = calculateCarbonEmission(order.distance, 'diesel').co2Emission
            const evEmissions = calculateCarbonEmission(order.distance, 'electric').co2Emission
            const potentialSavings = ((dieselEmissions - evEmissions) / dieselEmissions * 100).toFixed(0)

            return (
              <div key={order.id} className="space-y-2 group">
                <Card className="hover:shadow-lg transition-all overflow-hidden border-l-4 border-l-primary group-hover:border-l-accent">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="p-6 flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-black text-primary group-hover:text-accent transition-colors">{order.id}</span>
                            <Badge variant="outline" className="bg-muted/50 font-bold border-muted-foreground/20">{order.customer}</Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] text-accent font-black uppercase tracking-tighter">
                               <Leaf className="h-3.5 w-3.5" /> Up to {potentialSavings}% CO₂ Reduction
                            </div>
                            <Badge 
                              variant={order.priority === 'Critical' ? 'destructive' : order.priority === 'High' ? 'default' : 'secondary'}
                              className="rounded-md font-bold text-[10px]"
                            >
                              {order.priority}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <div className="flex items-start gap-4">
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                 <MapPin className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Route Path ({order.distance} km)</p>
                                <p className="text-sm font-bold truncate">{order.pickup} <ChevronRight className="inline h-3 w-3 text-muted-foreground" /> {order.dropoff}</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-4">
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                 <Clock className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">SLA Deadline</p>
                                <p className="text-sm font-bold">{order.deadline}</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-4">
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                 <Info className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Payload Weight</p>
                                <p className="text-sm font-bold">{order.weight} kg</p>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto p-6 md:border-l bg-muted/20 flex flex-col gap-3 min-w-[240px] justify-center items-center">
                         <div className="w-full flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Queue Status</span>
                            <Badge className="bg-orange-500 hover:bg-orange-600 font-bold px-3">{order.status}</Badge>
                         </div>
                         <Button 
                          className="w-full gap-2 font-bold shadow-sm" 
                          disabled={optimizingId === order.id}
                          onClick={() => handleOptimize(order)}
                        >
                            {optimizingId === order.id ? <Zap className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
                            {optimizingId === order.id ? 'Optimizing...' : 'Assign & Optimize'}
                         </Button>
                         <div className="text-[9px] text-muted-foreground font-medium italic text-center">
                            Powered by Carbon-Aware Engine
                         </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {explanations[order.id] && (
                  <div className="bg-accent/5 p-5 rounded-xl border border-accent/20 animate-in fade-in slide-in-from-top-4 shadow-sm">
                    <div className="flex gap-4">
                       <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                          <Zap className="h-4 w-4 text-accent" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-accent tracking-widest">AI Strategic Rationale</p>
                          <p className="text-xs text-muted-foreground leading-relaxed italic">
                            {explanations[order.id]}
                          </p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
