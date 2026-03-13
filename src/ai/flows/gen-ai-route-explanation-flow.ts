'use server';
/**
 * @fileOverview A GenAI flow that explains the rationale behind a chosen carbon-aware optimized route.
 *
 * - genAIRouteExplanation - A function that handles the generation of the route explanation.
 * - GenAIRouteExplanationInput - The input type for the genAIRouteExplanation function.
 * - GenAIRouteExplanationOutput - The return type for the genAIRouteExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RouteDetailsSchema = z.object({
  id: z.string().describe('Unique identifier for the route.'),
  emissionsCo2: z.number().describe('Estimated CO2 emissions for this route in kg.'),
  cost: z.number().describe('Estimated monetary cost for this route.'),
  deliveryTime: z.number().describe('Estimated delivery time for this route in minutes.'),
  pathDescription: z.string().describe('A brief description of the route path.'),
});

const GenAIRouteExplanationInputSchema = z.object({
  chosenRoute: RouteDetailsSchema.describe('Details of the carbon-aware optimized route that was chosen.'),
  alternativeRoutes: z.array(RouteDetailsSchema).describe('Details of alternative routes that were considered but not chosen.'),
  vehicleDetails: z.object({
    type: z.enum(['EV', 'Diesel', 'Hybrid']).describe('Type of the vehicle used for the route.'),
    fuelConsumption: z.number().optional().describe('Fuel consumption rate (e.g., L/100km for Diesel, kWh/100km for EV).'),
    capacity: z.number().describe('Cargo capacity of the vehicle.'),
  }).describe('Details of the vehicle assigned to the chosen route.'),
  orderDetails: z.object({
    weight: z.number().describe('Total weight of the order in kg.'),
    pickupLocation: z.string().describe('Description or address of the pickup location.'),
    dropoffLocation: z.string().describe('Description or address of the dropoff location.'),
    deliveryDeadline: z.string().describe('The deadline for the delivery (e.g., YYYY-MM-DD HH:MM).'),
  }).describe('Details of the order being delivered.'),
  carbonIntensityContext: z.object({
    liveCarbonIntensity: z.number().describe('Current or simulated grid carbon intensity in gCO2/kWh.'),
    gridType: z.string().optional().describe('Description of the current grid energy mix (e.g., \'solar peak\', \'coal peak\').'),
  }).describe('Contextual information about the current or simulated grid carbon intensity.'),
});
export type GenAIRouteExplanationInput = z.infer<typeof GenAIRouteExplanationInputSchema>;

const GenAIRouteExplanationOutputSchema = z.object({
  explanation: z.string().describe('A natural language explanation for why the specific carbon-aware optimized route was chosen.'),
});
export type GenAIRouteExplanationOutput = z.infer<typeof GenAIRouteExplanationOutputSchema>;

export async function genAIRouteExplanation(input: GenAIRouteExplanationInput): Promise<GenAIRouteExplanationOutput> {
  return genAIRouteExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'genAIRouteExplanationPrompt',
  input: { schema: GenAIRouteExplanationInputSchema },
  output: { schema: GenAIRouteExplanationOutputSchema },
  prompt: `As an expert logistics manager and sustainability analyst, provide a clear, natural language explanation for why the specified carbon-aware optimized route was chosen over the alternatives. Detail the trade-offs between CO2 emissions, cost, and delivery time. Your explanation should help a stakeholder understand and justify the system's decisions. Make sure to highlight the role of carbon intensity and vehicle type in the decision. Present your explanation as if you are directly addressing a stakeholder.

### Context for Decision:
- **Vehicle Type**: {{{vehicleDetails.type}}} (Capacity: {{{vehicleDetails.capacity}}} kg)
- **Order Details**: Weight: {{{orderDetails.weight}}} kg, Pickup: {{{orderDetails.pickupLocation}}}, Dropoff: {{{orderDetails.dropoffLocation}}}, Deadline: {{{orderDetails.deliveryDeadline}}}
- **Grid Carbon Intensity**: {{{carbonIntensityContext.liveCarbonIntensity}}} gCO2/kWh (Current grid scenario: {{{carbonIntensityContext.gridType}}})

### Chosen Route (ID: {{{chosenRoute.id}}}):
- **CO2 Emissions**: {{{chosenRoute.emissionsCo2}}} kg
- **Cost**: $ {{{chosenRoute.cost}}}
- **Delivery Time**: {{{chosenRoute.deliveryTime}}} minutes
- **Path**: {{{chosenRoute.pathDescription}}}

### Alternative Routes Considered:
{{#each alternativeRoutes}}
- **Route ID**: {{{this.id}}}
  - **CO2 Emissions**: {{{this.emissionsCo2}}} kg
  - **Cost**: $ {{{this.cost}}}
  - **Delivery Time**: {{{this.deliveryTime}}} minutes
  - **Path**: {{{this.pathDescription}}}
{{/each}}

### Explanation:
`,
});

const genAIRouteExplanationFlow = ai.defineFlow(
  {
    name: 'genAIRouteExplanationFlow',
    inputSchema: GenAIRouteExplanationInputSchema,
    outputSchema: GenAIRouteExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate route explanation.');
    }
    return output;
  }
);
