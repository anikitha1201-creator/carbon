"use client"

import { useState } from "react"
import DashboardLayout from "../(dashboard)/layout"
import { DRIVERS, ORDERS, VEHICLES } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Search, 
  Star, 
  ShieldCheck, 
  MoreHorizontal,
  Route,
  Leaf,
  Clock,
  Navigation
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import { calculateCarbonEmission } from "@/lib/carbon-engine"

const FleetRouteMap = dynamic(() => import("@/components/fleet-route-map"), { ssr: false })

export default function DriversPage() {
  const [selectedDriver, setSelectedDriver] = useState<any>(null)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Driver Directory</h1>
            <p className="text-muted-foreground">Manage active personnel, track route compliance, and eco-performance.</p>
          </div>
          <Button className="gap-2">
            <Users className="h-4 w-4" /> Register Driver
          </Button>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search drivers by name or ID..." className="pl-10" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DRIVERS.map((driver) => (
            <Card key={driver.id} className="hover:shadow-lg transition-all group border-t-4 border-t-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-4">
                   <Avatar className="h-12 w-12 border-2 border-accent/20">
                      <AvatarImage src={`https://picsum.photos/seed/${driver.id}/100/100`} />
                      <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div>
                      <CardTitle className="text-base">{driver.name}</CardTitle>
                      <CardDescription className="text-xs">ID: {driver.id}</CardDescription>
                   </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                   <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                   <Badge 
                    variant={driver.status === 'Active' ? 'default' : 'secondary'}
                    className={driver.status === 'Active' ? 'bg-accent/10 text-accent hover:bg-accent/20 border-accent/20' : ''}
                   >
                     {driver.status}
                   </Badge>
                   <div className="flex items-center gap-1 text-sm font-bold">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {driver.rating}
                   </div>
                </div>

                <div className="space-y-2 py-4 border-y">
                   <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Exp. Level</span>
                      <span className="font-semibold">{driver.experience}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Current Unit</span>
                      <span className="font-semibold">{VEHICLES.find(v => v.id === driver.assignedVehicle)?.model || 'Reserve'}</span>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   {driver.activeRouteId ? (
                     <Button 
                      className="flex-1 h-9 gap-2 bg-primary shadow-sm" 
                      onClick={() => setSelectedDriver(driver)}
                     >
                        <Route className="h-4 w-4" /> View Route
                     </Button>
                   ) : (
                     <Button variant="outline" size="sm" className="flex-1 h-9 gap-2" disabled>
                        Standby
                     </Button>
                   )}
                </div>
                
                <div className="pt-2 flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                   <ShieldCheck className="h-3 w-3 text-accent" /> Eco-Certified Operative
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden border-none">
          <DialogHeader className="p-6 border-b bg-muted/20">
            <div className="flex items-center justify-between">
               <div>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-accent">
                      <AvatarImage src={`https://picsum.photos/seed/${selectedDriver?.id}/100/100`} />
                    </Avatar>
                    <div className="flex flex-col">
                       <span>Live Route: {selectedDriver?.name}</span>
                       <span className="text-xs text-muted-foreground font-normal">Active Assignment: {selectedDriver?.activeRouteId}</span>
                    </div>
                  </DialogTitle>
               </div>
               <div className="flex items-center gap-4 text-xs font-bold uppercase">
                  <div className="flex items-center gap-2 text-accent">
                     <div className="h-2 w-2 rounded-full bg-accent animate-pulse" /> Live Tracking
                  </div>
               </div>
            </div>
          </DialogHeader>
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
             <div className="flex-1 relative">
                {selectedDriver && <FleetRouteMap activeOrderId={selectedDriver.activeRouteId} />}
             </div>
             <div className="w-full md:w-80 bg-background p-6 border-l space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                     <Navigation className="h-3 w-3" /> Vehicle Telemetry
                  </h4>
                  {selectedDriver && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Model</p>
                        <p className="text-xs font-bold truncate">{VEHICLES.find(v => v.id === selectedDriver.assignedVehicle)?.model}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border text-right">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Type</p>
                        <Badge variant="outline" className="text-[9px] h-4 text-accent border-accent/20 bg-accent/5">
                          {VEHICLES.find(v => v.id === selectedDriver.assignedVehicle)?.type}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                     <Clock className="h-3 w-3" /> Performance Metrics
                  </h4>
                  {selectedDriver && (
                    <div className="space-y-3">
                      <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Leaf className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Est. CO₂ Impact</p>
                            <p className="text-xl font-black">
                              {(() => {
                                const order = ORDERS.find(o => o.id === selectedDriver.activeRouteId);
                                const v = VEHICLES.find(v => v.id === selectedDriver.assignedVehicle);
                                return calculateCarbonEmission(order?.distance || 0, (v?.type?.toLowerCase() || 'diesel') as any).co2Emission
                              })()} kg
                            </p>
                         </div>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Navigation className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Distance Remaining</p>
                            <p className="text-xl font-black">
                              {ORDERS.find(o => o.id === selectedDriver.activeRouteId)?.distance} km
                            </p>
                         </div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl border flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                            <Clock className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Est. ETA</p>
                            <p className="text-xl font-black">
                              {Math.round((ORDERS.find(o => o.id === selectedDriver.activeRouteId)?.distance || 0) * 3)} min
                            </p>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
