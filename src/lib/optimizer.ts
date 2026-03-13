/**
 * @fileOverview Simple optimization engine for vehicle assignment based on carbon impact.
 */
import { EMISSION_FACTORS } from './carbon-calculator';

export type Vehicle = {
  id: string;
  type: 'EV' | 'Diesel' | 'Hybrid';
  capacity: number;
  status: string;
};

export type Order = {
  id: string;
  weight: number;
};

export function optimizeVehicleAssignment(order: Order, vehicles: Vehicle[], gridIntensity: number) {
  // 1. Filter vehicles by capacity and availability
  const eligibleVehicles = vehicles.filter(v => v.capacity >= order.weight && v.status === 'Active');

  if (eligibleVehicles.length === 0) return null;

  // 2. Calculate score for each vehicle
  // score = 1 - (gridCarbonIntensity * vehicleEmissionFactor)
  // Higher score is better.
  const scoredVehicles = eligibleVehicles.map(vehicle => {
    const emissionFactor = EMISSION_FACTORS[vehicle.type];
    const score = 1 - (gridIntensity * emissionFactor);
    return { ...vehicle, score };
  });

  // 3. Choose vehicle with highest score
  return scoredVehicles.sort((a, b) => b.score - a.score)[0];
}
