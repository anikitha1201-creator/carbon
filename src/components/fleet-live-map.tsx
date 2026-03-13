"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";
import { Zap, Truck } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { CHARGING_STATIONS } from "@/lib/charging-stations";

// Fix marker icons
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const chargingIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="p-1 bg-accent rounded-full border border-white shadow-lg">
      <Zap className="h-4 w-4 text-white" />
    </div>
  ),
  className: 'charging-icon',
  iconSize: [24, 24],
});

const vehicleIcon = (color: string) => L.divIcon({
  html: renderToStaticMarkup(
    <div className="p-1.5 bg-white rounded-full border-2 shadow-md" style={{ borderColor: color }}>
      <Truck className="h-4 w-4" style={{ color }} />
    </div>
  ),
  className: 'vehicle-icon',
  iconSize: [30, 30],
});

const initialVehicles = [
  {
    id: "EV-702",
    driver: "Arun Kumar",
    type: "EV",
    start: [12.9698, 77.7499], // Whitefield
    end: [12.9352, 77.6245],   // Koramangala
    color: "#10b981",
    speed: "42 km/h"
  },
  {
    id: "D-401",
    driver: "Manoj Singh",
    type: "Diesel",
    start: [12.9141, 77.6387], // Silk Board
    end: [13.0354, 77.5970],   // Hebbal
    color: "#ef4444",
    speed: "38 km/h"
  },
  {
    id: "H-505",
    driver: "Rahul Sharma",
    type: "Hybrid",
    start: [12.8456, 77.6603], // Electronic City
    end: [12.9738, 77.6119],   // MG Road
    color: "#eab308",
    speed: "45 km/h"
  },
];

export default function FleetLiveMap() {
  const [vehicles, setVehicles] = useState(initialVehicles.map(v => ({ ...v, currentPos: v.start, progress: 0 })));

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          const nextProgress = v.progress >= 1 ? 0 : v.progress + 0.005;
          const lat = v.start[0] + (v.end[0] - v.start[0]) * nextProgress;
          const lng = v.start[1] + (v.end[1] - v.start[1]) * nextProgress;
          return {
            ...v,
            currentPos: [lat, lng],
            progress: nextProgress
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[500px] w-full relative rounded-xl overflow-hidden border shadow-inner">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Vehicles */}
        {vehicles.map((vehicle) => (
          <div key={vehicle.id}>
             <Marker position={vehicle.currentPos as [number, number]} icon={vehicleIcon(vehicle.color)}>
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-primary">{vehicle.id}</p>
                  <p><span className="font-semibold">Driver:</span> {vehicle.driver}</p>
                  <p><span className="font-semibold">Type:</span> {vehicle.type}</p>
                  <p><span className="font-semibold">Speed:</span> {vehicle.speed}</p>
                  <div className="pt-2 border-t mt-2 flex items-center gap-1 text-[10px] text-accent font-bold uppercase">
                     <Zap className="h-3 w-3" /> Live Telemetry Active
                  </div>
                </div>
              </Popup>
            </Marker>
            <Polyline 
              positions={[vehicle.start, vehicle.end] as [number, number][]} 
              color={vehicle.color} 
              weight={2} 
              opacity={0.3} 
              dashArray="5, 10" 
            />
          </div>
        ))}

        {/* Charging Stations */}
        {CHARGING_STATIONS.map((station) => (
          <Marker key={station.id} position={station.coords} icon={chargingIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-accent">{station.name}</p>
                <p>Available: {station.available} ports</p>
                <p>Speed: {station.speed}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Interactive Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-background/95 backdrop-blur-sm p-4 rounded-xl border shadow-xl space-y-3 min-w-[160px]">
         <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b pb-2">Fleet Status</h4>
         <div className="space-y-2">
            <div className="flex items-center gap-3 text-[10px]">
               <div className="h-3 w-3 rounded-full bg-[#10b981]" /> <span className="font-medium">EV (In Transit)</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
               <div className="h-3 w-3 rounded-full bg-[#ef4444]" /> <span className="font-medium">Diesel (In Transit)</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
               <div className="h-3 w-3 rounded-full bg-[#eab308]" /> <span className="font-medium">Hybrid (In Transit)</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-accent pt-1 border-t">
               <Zap className="h-3 w-3" /> <span className="font-medium">Charging Hub</span>
            </div>
         </div>
      </div>
    </div>
  );
}
