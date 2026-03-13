/**
 * @fileOverview Service for providing simulated grid carbon intensity data.
 */

export type GridScenario = {
  name: string;
  intensity: number; // kg CO2 per kWh (simulated)
  renewables: number;
  description: string;
};

export const GRID_SCENARIOS: Record<string, GridScenario> = {
  'Solar Peak': {
    name: 'Solar Peak',
    intensity: 0.12,
    renewables: 85,
    description: 'High solar output during mid-day. Best time for EV charging.'
  },
  'Coal Peak': {
    name: 'Coal Peak',
    intensity: 0.45,
    renewables: 12,
    description: 'High fossil fuel reliance during evening peak demand.'
  },
  'Night Grid': {
    name: 'Night Grid',
    intensity: 0.22,
    renewables: 45,
    description: 'Stable wind and hydro mix during off-peak hours.'
  }
};

export function getCurrentGridIntensity(scenarioName: string = 'Solar Peak'): number {
  return GRID_SCENARIOS[scenarioName]?.intensity || 0.25;
}
