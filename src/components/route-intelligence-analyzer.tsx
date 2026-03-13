"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DRIVERS } from "@/lib/mock-data"
import { calculateCarbonEmission } from "@/lib/carbon-engine"
import { BrainCircuit, Navigation, Clock, Leaf, AlertCircle, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  driverId: z.string().min(1, "Select a driver"),
  vehicleType: z.enum(["diesel", "electric", "hybrid"]),
  currentLocation: z.string().min(1, "Enter current location"),
  pickupLocation: z.string().min(1, "Enter pickup location"),
  dropoffLocation: z.string().min(1, "Enter dropoff location"),
  pickupTime: z.string().min(1, "Enter pickup time"),
  deadline: z.string().min(1, "Enter deadline"),
})

type FormValues = z.infer<typeof formSchema>

export function RouteIntelligenceAnalyzer() {
  const [result, setResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleType: "electric",
    }
  })

  const onAnalyze = async (data: FormValues) => {
    setIsAnalyzing(true)
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200))

    // Simulated Calculations
    const distance = Math.floor(Math.random() * (25 - 5 + 1)) + 5 // 5-25km
    const travelTimeMinutes = distance * 3.5 // ~3.5 mins per km in city
    const emissions = calculateCarbonEmission(distance, data.vehicleType).co2Emission
    
    // Feasibility Check
    const pickupDate = new Date(`2026-03-13T${data.pickupTime}`)
    const deadlineDate = new Date(`2026-03-13T${data.deadline}`)
    const estimatedArrival = new Date(pickupDate.getTime() + travelTimeMinutes * 60000)
    const isFeasible = estimatedArrival <= deadlineDate

    const explanation = data.vehicleType === 'electric' 
      ? "EV selected because solar peak grid conditions reduce carbon emissions while meeting the delivery deadline. This path leverages the green corridor for maximum efficiency."
      : "Standard routing applied. Emissions could be reduced by 85% by switching to an EV unit for this specific urban corridor."

    setResult({
      route: `${data.pickupLocation} → Marathahalli → Domlur → ${data.dropoffLocation}`,
      distance: `${distance} km`,
      time: `${Math.round(travelTimeMinutes)} minutes`,
      emissions: `${emissions} kg CO₂`,
      feasible: isFeasible,
      explanation
    })
    setIsAnalyzing(false)
  }

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Route Intelligence Analyzer</CardTitle>
            <CardDescription>Manually simulate and analyze route performance for any vehicle unit</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onAnalyze)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Driver Assignment</Label>
              <Select onValueChange={(v) => setValue("driverId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Driver" />
                </SelectTrigger>
                <SelectContent>
                  {DRIVERS.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Propulsion</Label>
              <Select onValueChange={(v) => setValue("vehicleType", v as any)} defaultValue="electric">
                <SelectTrigger>
                  <SelectValue placeholder="Select Propulsion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electric">EV (Electric)</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Current Station</Label>
              <Input {...register("currentLocation")} placeholder="e.g. Warehouse A" />
            </div>

            <div className="space-y-2">
              <Label>Pickup Point</Label>
              <Input {...register("pickupLocation")} placeholder="e.g. Whitefield" />
            </div>

            <div className="space-y-2">
              <Label>Dropoff Point</Label>
              <Input {...register("dropoffLocation")} placeholder="e.g. Koramangala" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pickup Time</Label>
                <Input {...register("pickupTime")} type="time" />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input {...register("deadline")} type="time" />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 gap-2" disabled={isAnalyzing}>
            {isAnalyzing ? "Processing Rationale..." : <><BrainCircuit className="h-4 w-4" /> Run Intelligence Analysis</>}
          </Button>
        </form>

        {result && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-muted">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                  <Navigation className="h-3 w-3" /> Recommended Path
                </p>
                <p className="text-sm font-bold">{result.route}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-muted">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Distance & Time
                </p>
                <p className="text-sm font-bold">{result.distance} / {result.time}</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-[10px] font-bold uppercase text-accent mb-1 flex items-center gap-1">
                  <Leaf className="h-3.5 w-3.5" /> Est. Emissions
                </p>
                <p className="text-sm font-bold text-accent">{result.emissions}</p>
              </div>
              <div className={`p-4 rounded-xl border flex flex-col justify-center ${result.feasible ? 'bg-green-500/5 border-green-500/20' : 'bg-destructive/5 border-destructive/20'}`}>
                <p className={`text-[10px] font-bold uppercase mb-1 flex items-center gap-1 ${result.feasible ? 'text-green-600' : 'text-destructive'}`}>
                  {result.feasible ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />} 
                  SLA Feasibility
                </p>
                <p className="text-sm font-bold">{result.feasible ? 'Within Deadline' : 'SLA Breach Likely'}</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-[10px] font-bold uppercase text-primary tracking-widest">AI Strategic Explanation</p>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {result.explanation}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
