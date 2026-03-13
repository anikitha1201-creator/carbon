/**
 * @fileOverview Service simulating electricity grid carbon intensity for scheduling decisions.
 */

export interface GridStatus {
  name: string;
  carbonIntensity: number; // kg CO2 per kWh
  renewablePercentage: number;
  description: string;
}

export const GRID_SCENARIOS: Record<string, GridStatus> = {
  'Solar Peak': {
    name: 'Solar Peak',
    carbonIntensity: 0.12,
    renewablePercentage: 85,
    description: 'Optimal window for EV charging and distribution.'
  },
  'Coal Peak': {
    name: 'Coal Peak',
    carbonIntensity: 0.45,
    renewablePercentage: 12,
    description: 'High fossil fuel reliance. Limit high-power operations.'
  },
  'Night Grid': {
    name: 'Night Grid',
    carbonIntensity: 0.22,
    renewablePercentage: 45,
    description: 'Stable wind-heavy mix for overnight optimization.'
  }
};

export function getGridStatus(scenario: keyof typeof GRID_SCENARIOS = 'Solar Peak'): GridStatus {
  return GRID_SCENARIOS[scenario];
}
