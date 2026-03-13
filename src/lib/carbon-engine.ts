/**
 * @fileOverview Core module for calculating carbon emissions based on specification.
 */

export const EMISSION_FACTORS = {
  diesel: 0.25,      // kg CO2 per km
  electric: 0.02,    // kg CO2 per km
  hybrid: 0.12,      // kg CO2 per km
};

export interface CarbonResult {
  distance: number;
  vehicleType: keyof typeof EMISSION_FACTORS;
  co2Emission: number;
}

export function calculateCarbonEmission(distanceKm: number, vehicleType: keyof typeof EMISSION_FACTORS): CarbonResult {
  const factor = EMISSION_FACTORS[vehicleType] || 0.25;
  const co2Emission = Number((distanceKm * factor).toFixed(2));
  return {
    distance: distanceKm,
    vehicleType,
    co2Emission,
  };
}

export function calculateFuelCost(distanceKm: number, vehicleType: keyof typeof EMISSION_FACTORS): number {
  const rates = {
    diesel: 12,    // Fuel cost per km
    electric: 3,   // Charging cost per km
    hybrid: 7,     // Mixed cost per km
  };
  return distanceKm * (rates[vehicleType] || 12);
}
