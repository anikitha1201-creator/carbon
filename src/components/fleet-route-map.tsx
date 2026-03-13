"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { COORDINATES, ORDERS, VEHICLES, DRIVERS } from '@/lib/mock-data'
import { CHARGING_STATIONS } from '@/lib/charging-stations'
import { EMISSION_FACTORS } from '@/lib/carbon-engine'
import { MapPin, BatteryCharging, Zap, Info } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'

// Fix for default marker icons in Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

const createIcon = (color: string) => L.divIcon({
  html: renderToStaticMarkup(<MapPin className="h-6 w-6" style={{ color }} fill={color + '20'} />),
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
})

const chargingIcon = L.divIcon({
  html: renderToStaticMarkup(<div className="p-1 bg-accent rounded-full border border-white shadow-lg"><BatteryCharging className="h-4 w-4 text-white" /></div>),
  className: 'charging-icon',
  iconSize: [24, 24],
})

export default function FleetRouteMap({ activeOrderId }: { activeOrderId?: string }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    fixLeafletIcons()
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-full w-full bg-muted animate-pulse rounded-xl" />

  const getVehicleColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('electric') || t === 'ev') return '#10b981';
    if (t.includes('diesel')) return '#ef4444';
    if (t.includes('hybrid')) return '#eab308';
    return '#3b82f6';
  }

  const ordersToShow = activeOrderId 
    ? ORDERS.filter(o => o.id === activeOrderId)
    : ORDERS;

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={[12.9525, 77.6872]} 
        zoom={11} 
        scrollWheelZoom={false}
        className="h-full w-full rounded-xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Charging Stations */}
        {CHARGING_STATIONS.map((station) => (
          <Marker key={station.id} position={station.coords} icon={chargingIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-accent flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {station.name}
                </p>
                <div className="mt-1 space-y-1">
                   <p className="flex justify-between"><span>Speed:</span> <span className="font-semibold">{station.speed}</span></p>
                   <p className="flex justify-between"><span>Available:</span> <span className="font-semibold text-accent">{station.available} ports</span></p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Routes */}
        {ordersToShow.map((order) => {
          const pickup = COORDINATES[order.pickup as keyof typeof COORDINATES] as [number, number];
          const dropoff = COORDINATES[order.dropoff as keyof typeof COORDINATES] as [number, number];
          
          const driver = DRIVERS.find(d => d.activeRouteId === order.id);
          const vehicle = VEHICLES.find(v => v.id === driver?.assignedVehicle);
          const color = getVehicleColor(vehicle?.type || 'Diesel');

          if (!pickup || !dropoff) return null;

          return (
            <div key={order.id}>
              <Marker position={pickup} icon={createIcon(color)}>
                <Popup>
                  <div className="text-xs p-1">
                    <p className="font-bold text-primary">Pickup: {order.pickup}</p>
                    <p className="text-muted-foreground">Order ID: {order.id}</p>
                    <div className="mt-2 border-t pt-1">
                       <p>Driver: <span className="font-semibold">{driver?.name || 'Unassigned'}</span></p>
                       <p>Vehicle: <span className="font-semibold uppercase">{vehicle?.type || 'Diesel'}</span></p>
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Marker position={dropoff} icon={createIcon('#1e293b')}>
                <Popup>
                  <div className="text-xs p-1">
                    <p className="font-bold">Dropoff: {order.dropoff}</p>
                    <p>Customer: {order.customer}</p>
                    <div className="mt-2 border-t pt-1 space-y-1">
                       <p className="flex justify-between"><span>Dist:</span> <span>{order.distance} km</span></p>
                       <p className="flex justify-between font-bold text-accent">
                        <span>Est CO₂:</span> 
                        <span>{((order.distance || 0) * (EMISSION_FACTORS[vehicle?.type?.toLowerCase() as any] || 0.25)).toFixed(2)} kg</span>
                       </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Polyline 
                positions={[pickup, dropoff]} 
                color={color}
                weight={4} 
                opacity={0.6}
                dashArray="5, 10"
              />
            </div>
          )
        })}
      </MapContainer>
      
      {!activeOrderId && (
        <div className="absolute top-4 right-4 z-[400] bg-background/95 backdrop-blur-sm p-4 rounded-xl border shadow-xl space-y-3 min-w-[150px]">
           <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b pb-2">Fleet Legend</h4>
           <div className="space-y-2">
              <div className="flex items-center gap-3 text-[10px]">
                 <div className="h-3 w-3 rounded-full bg-[#10b981]" /> <span className="font-medium">Electric Route</span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                 <div className="h-3 w-3 rounded-full bg-[#ef4444]" /> <span className="font-medium">Diesel Route</span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                 <div className="h-3 w-3 rounded-full bg-[#eab308]" /> <span className="font-medium">Hybrid Route</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-accent pt-1 border-t">
                 <BatteryCharging className="h-3 w-3" /> <span className="font-medium">Charging Hub</span>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
