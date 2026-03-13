/**
 * @fileOverview Mock data for EV charging infrastructure in Bengaluru.
 */

export interface ChargingStation {
  id: string;
  name: string;
  coords: [number, number];
  available: number;
  speed: string;
}

export const CHARGING_STATIONS: ChargingStation[] = [
  { id: 'cs-1', name: 'Whitefield EV Hub', coords: [12.9710, 77.7510], available: 4, speed: '150kW' },
  { id: 'cs-2', name: 'Electronic City Charging Station', coords: [12.8460, 77.6650], available: 2, speed: '100kW' },
  { id: 'cs-3', name: 'Indiranagar Fast Charger', coords: [12.9790, 77.6420], available: 1, speed: '50kW' },
  { id: 'cs-4', name: 'Koramangala Green Point', coords: [12.9340, 77.6230], available: 3, speed: '22kW' },
];
