'use server';
/**
 * @fileOverview A GenAI flow for analyzing and summarizing the differences between simulated carbon-aware routing scenarios.
 *
 * - genAIScenarioComparisonInsights - A function that handles the comparison of two routing scenarios.
 * - GenAIScenarioComparisonInsightsInput - The input type for the genAIScenarioComparisonInsights function.
 * - GenAIScenarioComparisonInsightsOutput - The return type for the genAIScenarioComparisonInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScenarioMetricsSchema = z.object({
  name: z.string().describe("The name of the scenario (e.g., 'solar peak', 'coal peak')."),
  co2PerDelivery: z.number().describe('The CO2 emissions per delivery for this scenario.'),
  fuelCost: z.number().describe('The fuel cost for this scenario.'),
  deliveryTime: z.number().describe('The delivery time in hours for this scenario.'),
});

const GenAIScenarioComparisonInsightsInputSchema = z.object({
  scenario1: ScenarioMetricsSchema.describe('The metrics for the first routing scenario.'),
  scenario2: ScenarioMetricsSchema.describe('The metrics for the second routing scenario.'),
});
export type GenAIScenarioComparisonInsightsInput = z.infer<typeof GenAIScenarioComparisonInsightsInputSchema>;

const GenAIScenarioComparisonInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary highlighting the most significant impacts and differences between the two scenarios.'),
});
export type GenAIScenarioComparisonInsightsOutput = z.infer<typeof GenAIScenarioComparisonInsightsOutputSchema>;

export async function genAIScenarioComparisonInsights(
  input: GenAIScenarioComparisonInsightsInput
): Promise<GenAIScenarioComparisonInsightsOutput> {
  return genAIScenarioComparisonInsightsFlow(input);
}

const scenarioComparisonPrompt = ai.definePrompt({
  name: 'scenarioComparisonPrompt',
  input: {schema: GenAIScenarioComparisonInsightsInputSchema},
  output: {schema: GenAIScenarioComparisonInsightsOutputSchema},
  prompt: `You are a Sustainability Analyst. Your task is to analyze and summarize the differences between two simulated carbon-aware routing scenarios. Highlight the most significant impacts on CO2 per delivery, fuel cost, and delivery time.

Scenario 1 ({{{scenario1.name}}}):
- CO2 per delivery: {{{scenario1.co2PerDelivery}}} kg
- Fuel cost: {{{scenario1.fuelCost}}} $
- Delivery time: {{{scenario1.deliveryTime}}} hours

Scenario 2 ({{{scenario2.name}}}):
- CO2 per delivery: {{{scenario2.co2PerDelivery}}} kg
- Fuel cost: {{{scenario2.fuelCost}}} $
- Delivery time: {{{scenario2.deliveryTime}}} hours

Analyze these two scenarios and provide a concise summary, focusing on which scenario performs better for each metric and the overall implications for operational strategies. The summary should highlight the percentage difference for each metric between the two scenarios. If the value is higher in scenario 2 compared to scenario 1, it's an increase, otherwise a decrease.`,
});

const genAIScenarioComparisonInsightsFlow = ai.defineFlow(
  {
    name: 'genAIScenarioComparisonInsightsFlow',
    inputSchema: GenAIScenarioComparisonInsightsInputSchema,
    outputSchema: GenAIScenarioComparisonInsightsOutputSchema,
  },
  async input => {
    const {output} = await scenarioComparisonPrompt(input);
    return output!;
  }
);
