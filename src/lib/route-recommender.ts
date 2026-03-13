/**
 * @fileOverview Utility to suggest optimized routes and vehicles for specific orders.
 */
import { optimizeFleetOrders, Vehicle, Order } from './fleet-optimizer';
import { getGridStatus } from './grid-carbon-service';

export interface Recommendation {
  distance: number;
  ETA: number;
  estimatedCO2: number;
  bestVehicle: Vehicle;
}

export function suggestRoute(order: Order, vehicles: Vehicle[], scenario: any = 'Solar Peak'): Recommendation | null {
  const grid = getGridStatus(scenario);
  const result = optimizeFleetOrders(order, vehicles, grid.carbonIntensity);

  if (!result) return null;

  return {
    distance: order.distance,
    ETA: Math.round(order.distance * 3), // 3 mins per km avg
    estimatedCO2: result.estimatedCO2,
    bestVehicle: result.assignedVehicle
  };
}
