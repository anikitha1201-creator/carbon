import DashboardLayout from "../(dashboard)/layout"
import { VEHICLES } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Battery, 
  Fuel, 
  Truck as TruckIcon,
  Activity,
  Zap,
  Navigation
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

export default function FleetPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Fleet Telemetry</h1>
            <p className="text-muted-foreground">Monitor real-time vehicle metrics, battery levels, and operational health.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
           <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Battery className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Avg. Fleet Charge</p>
                    <p className="text-2xl font-bold text-foreground">64%</p>
                 </div>
              </CardContent>
           </Card>
           <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Activity className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">In-Transit Status</p>
                    <p className="text-2xl font-bold text-foreground">84%</p>
                 </div>
              </CardContent>
           </Card>
           <Card className="bg-orange-500/5 border-orange-500/20">
              <CardContent className="pt-6 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Navigation className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Total Range Coverage</p>
                    <p className="text-2xl font-bold text-foreground">1,240 km</p>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vehicles by ID, model, or driver..." className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">Vehicle ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Battery / Fuel</TableHead>
                  <TableHead>Est. Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VEHICLES.map((v) => {
                  const isEV = v.type === 'EV';
                  const telemetryValue = v.batteryLevel || Math.floor(Math.random() * 40) + 40;
                  const estRange = isEV ? telemetryValue * 4 : telemetryValue * 8;

                  return (
                    <TableRow key={v.id} className="cursor-pointer hover:bg-muted/30">
                      <TableCell className="font-bold">{v.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isEV ? <Zap className="h-4 w-4 text-accent" /> : <Fuel className="h-4 w-4 text-primary" />}
                          <span className="text-xs font-medium uppercase tracking-tight">{v.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{v.model}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Assigned</TableCell>
                      <TableCell className="w-[180px]">
                        <div className="space-y-1">
                           <div className="flex justify-between text-[10px] font-bold">
                              <span>{isEV ? 'Charge' : 'Level'}</span>
                              <span className={telemetryValue < 20 ? 'text-destructive' : 'text-accent'}>{telemetryValue}%</span>
                           </div>
                           <Progress 
                            value={telemetryValue} 
                            className={`h-1.5 ${telemetryValue < 20 ? 'bg-destructive/20' : 'bg-muted'}`}
                           />
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs">{estRange} km</TableCell>
                      <TableCell>
                        <Badge 
                          variant={v.status === 'Active' ? 'default' : v.status === 'Charging' ? 'secondary' : 'outline'}
                          className={v.status === 'Active' ? 'bg-accent/10 text-accent hover:bg-accent/20 border-accent/20' : ''}
                        >
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
