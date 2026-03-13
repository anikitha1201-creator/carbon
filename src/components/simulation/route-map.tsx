"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { COORDINATES, CHARGING_STATIONS, ORDERS, VEHICLES, DRIVERS } from '@/lib/mock-data'
import { calculateCarbonEmission } from '@/lib/carbon-calculator'
import { BatteryCharging, Truck, MapPin } from 'lucide-react'
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

// Custom Icons
const createIcon = (color: string) => L.divIcon({
  html: renderToStaticMarkup(<MapPin className="h-6 w-6" style={{ color }} fill={color + '20'} />),
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
})

const chargingIcon = L.divIcon({
  html: renderToStaticMarkup(<BatteryCharging className="h-5 w-5 text-accent" />),
  className: 'charging-icon',
  iconSize: [20, 20],
})

export default function RouteMap({ activeOrderId }: { activeOrderId?: string }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    fixLeafletIcons()
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-full w-full bg-muted animate-pulse rounded-xl" />

  const getVehicleColor = (type: string) => {
    switch (type) {
      case 'EV': return '#10b981'; // green
      case 'Diesel': return '#ef4444'; // red
      case 'Hybrid': return '#eab308'; // yellow
      default: return '#3b82f6';
    }
  }

  // Filter orders to show. If activeOrderId is provided, only show that one.
  const ordersToShow = activeOrderId 
    ? ORDERS.filter(o => o.id === activeOrderId)
    : ORDERS;

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={[12.9525, 77.6872]} 
        zoom={11} 
        scrollWheelZoom={false}
        className="h-full w-full rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Charging Stations */}
        {CHARGING_STATIONS.map((station, idx) => (
          <Marker key={idx} position={station.coords as [number, number]} icon={chargingIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-accent">{station.name}</p>
                <p>Speed: {station.speed}</p>
                <p>Available: {station.available} ports</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Delivery Routes */}
        {ordersToShow.map((order) => {
          const pickup = COORDINATES[order.pickup as keyof typeof COORDINATES] as [number, number];
          const dropoff = COORDINATES[order.dropoff as keyof typeof COORDINATES] as [number, number];
          
          // Find assigned driver and vehicle for metadata
          const driver = DRIVERS.find(d => d.activeRouteId === order.id);
          const vehicle = VEHICLES.find(v => v.id === driver?.assignedVehicle);
          const color = getVehicleColor(vehicle?.type || 'Diesel');

          if (!pickup || !dropoff) return null;

          return (
            <div key={order.id}>
              <Marker position={pickup} icon={createIcon(color)}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">Pickup: {order.pickup}</p>
                    <p>Order ID: {order.id}</p>
                  </div>
                </Popup>
              </Marker>
              <Marker position={dropoff} icon={createIcon('#1e293b')}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">Dropoff: {order.dropoff}</p>
                    <p>Customer: {order.customer}</p>
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
        <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg space-y-2">
           <h4 className="text-[10px] font-bold uppercase text-muted-foreground">Legend</h4>
           <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                 <div className="h-2 w-2 rounded-full bg-[#10b981]" /> <span>Electric Route</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                 <div className="h-2 w-2 rounded-full bg-[#ef4444]" /> <span>Diesel Route</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                 <div className="h-2 w-2 rounded-full bg-[#eab308]" /> <span>Hybrid Route</span>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}