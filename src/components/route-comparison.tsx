"use client";

import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Fuel, Zap } from "lucide-react";

// Marker fix for Leaflet
let markerFixed = false;
if (typeof window !== 'undefined' && !markerFixed) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  markerFixed = true;
}

function FitBounds({ route }: { route: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route as any);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, route]);
  return null;
}

const dieselRoute: [number, number][] = [
  [12.9698, 77.7499], // Whitefield
  [12.955, 77.69],
  [12.9352, 77.6245], // Koramangala
];

const greenRoute: [number, number][] = [
  [12.9698, 77.7499],
  [12.96, 77.70],
  [12.9352, 77.6245],
];

export default function RouteComparison() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Diesel Route Card */}
        <Card className="overflow-hidden border-destructive/20 shadow-lg bg-card">
          <div className="bg-destructive/10 p-4 border-b border-destructive/20 flex items-center justify-between">
            <h3 className="font-bold text-destructive flex items-center gap-2">
              <Fuel className="h-4 w-4" /> Traditional Route (Diesel)
            </h3>
            <Badge variant="outline" className="text-destructive border-destructive/20 uppercase text-[10px] font-bold">
              Baseline
            </Badge>
          </div>
          <CardContent className="p-0">
            <div className="h-[350px] w-full">
              <MapContainer center={[12.96, 77.70]} zoom={12} className="h-full w-full" scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={dieselRoute} color="#ef4444" weight={5} opacity={0.7} dashArray="10, 10" />
                <Marker position={dieselRoute[0]}><Popup>Pickup: Whitefield</Popup></Marker>
                <Marker position={dieselRoute[2]}><Popup>Dropoff: Koramangala</Popup></Marker>
                <FitBounds route={dieselRoute} />
              </MapContainer>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4 border-t bg-muted/20">
              <div className="space-y-1 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">CO₂ Emissions</p>
                <p className="text-xl font-black text-foreground">4.5 kg</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Fuel Cost</p>
                <p className="text-xl font-black text-foreground">₹213</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Est. Time</p>
                <p className="text-xl font-black text-foreground">45 min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Green Route Card */}
        <Card className="overflow-hidden border-accent/20 shadow-lg bg-card">
          <div className="bg-accent/10 p-4 border-b border-accent/20 flex items-center justify-between">
            <h3 className="font-bold text-accent flex items-center gap-2">
              <Leaf className="h-4 w-4" /> CAFS Optimized (EV)
            </h3>
            <Badge className="bg-accent text-accent-foreground uppercase text-[10px] border-none font-black px-3 animate-[pulse_2s_infinite]">
              Optimized
            </Badge>
          </div>
          <CardContent className="p-0">
            <div className="h-[350px] w-full">
              <MapContainer center={[12.96, 77.70]} zoom={12} className="h-full w-full" scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={greenRoute} color="#10b981" weight={6} opacity={0.8} />
                <Marker position={greenRoute[0]}><Popup>Pickup: Whitefield</Popup></Marker>
                <Marker position={greenRoute[2]}><Popup>Dropoff: Koramangala</Popup></Marker>
                <FitBounds route={greenRoute} />
              </MapContainer>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4 border-t bg-accent/5">
              <div className="space-y-1 text-center">
                <p className="text-[10px] uppercase font-bold text-accent tracking-wider">CO₂ Saved</p>
                <p className="text-xl font-black text-foreground">2.79 kg</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-[10px] uppercase font-bold text-accent tracking-wider">Energy Cost</p>
                <p className="text-xl font-black text-foreground">₹166</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-[10px] uppercase font-bold text-accent tracking-wider">Time Saved</p>
                <p className="text-xl font-black text-foreground">35 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 text-center p-6 border rounded-xl bg-accent/10 border-accent/30 shadow-inner">
          <div className="flex items-center justify-center gap-2 text-accent">
            <Zap className="h-6 w-6 fill-current" />
            <h3 className="text-xl font-bold tracking-tight">Environmental Performance Breakthrough</h3>
          </div>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto mt-2">
            CAFS optimization achieved a <span className="text-accent font-black underline decoration-accent/30 underline-offset-4">38% reduction</span> in carbon emissions.
          </p>
      </div>
    </div>
  );
}
