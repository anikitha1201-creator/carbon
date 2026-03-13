/**
 * @fileOverview Utility for calculating carbon emissions based on distance and vehicle type.
 */

export const EMISSION_FACTORS = {
  Diesel: 0.25, // kg CO2 per km
  EV: 0.02,     // kg CO2 per km
  Hybrid: 0.12, // kg CO2 per km
};

export function calculateCarbonEmission(distanceKm: number, vehicleType: 'EV' | 'Diesel' | 'Hybrid'): number {
  const factor = EMISSION_FACTORS[vehicleType] || 0.25;
  return Number((distanceKm * factor).toFixed(2));
}

export function calculateFuelCost(distanceKm: number, vehicleType: 'EV' | 'Diesel' | 'Hybrid'): number {
  // Rough simulated costs in local currency units
  const rates = {
    Diesel: 12, // per km
    EV: 3,      // per km
    Hybrid: 7,  // per km
  };
  return distanceKm * rates[vehicleType];
}
