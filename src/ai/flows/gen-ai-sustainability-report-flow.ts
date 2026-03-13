'use server';
/**
 * @fileOverview A GenAI tool to generate a concise sustainability report for a fleet's carbon emissions performance.
 *
 * - genAISustainabilityReport - A function that handles the generation of the sustainability report.
 * - GenAISustainabilityReportInput - The input type for the genAISustainabilityReport function.
 * - GenAISustainabilityReportOutput - The return type for the genAISustainabilityReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenAISustainabilityReportInputSchema = z.object({
  totalCO2Emissions: z.number().describe('Total CO2 emissions in kg CO2 for the reporting period.'),
  co2PerDelivery: z.number().describe('Average CO2 emissions per delivery in kg CO2.'),
  emissionTrend: z.string().describe('A description of the CO2 emission trend (e.g., "increasing by 5%", "decreasing by 2%").'),
  evUsagePercentage: z.number().min(0).max(100).describe('Percentage of deliveries performed by EV vehicles.'),
  fleetSize: z.number().int().positive().describe('Total number of vehicles in the fleet.'),
  periodDescription: z.string().describe('A descriptive string for the reporting period (e.g., "last quarter", "Q1 2024").'),
  previousPeriodData: z.object({
    totalCO2Emissions: z.number().describe('Total CO2 emissions for the previous period in kg CO2.'),
    co2PerDelivery: z.number().describe('Average CO2 emissions per delivery for the previous period in kg CO2.'),
  }).optional().describe('Optional data from a previous period for comparison.'),
});
export type GenAISustainabilityReportInput = z.infer<typeof GenAISustainabilityReportInputSchema>;

const GenAISustainabilityReportOutputSchema = z.object({
  summary: z.string().describe('A high-level overview of the fleet\'s carbon performance for the period.'),
  keyMetrics: z.array(z.object({
    metricName: z.string().describe('The name of the key metric (e.g., "Total CO2 Emissions").'),
    value: z.string().describe('The value of the key metric (e.g., "1200 kg CO2").'),
  })).describe('An array of key statistics related to sustainability.'),
  trends: z.string().describe('An analysis and description of the CO2 emission trends.'),
  improvements: z.array(z.string()).describe('A list of suggested areas for improvement to reduce emissions.'),
});
export type GenAISustainabilityReportOutput = z.infer<typeof GenAISustainabilityReportOutputSchema>;

export async function genAISustainabilityReport(input: GenAISustainabilityReportInput): Promise<GenAISustainabilityReportOutput> {
  return genAISustainabilityReportFlow(input);
}

const sustainabilityReportPrompt = ai.definePrompt({
  name: 'sustainabilityReportPrompt',
  input: { schema: GenAISustainabilityReportInputSchema },
  output: { schema: GenAISustainabilityReportOutputSchema },
  prompt: `You are an expert in fleet sustainability and reporting. Your task is to generate a concise sustainability report based on the provided fleet data. The report should summarize key carbon emission metrics, identify trends, and suggest actionable areas for improvement. Always use the metricName and value exactly as described by the output schema.

Reporting Period: {{{periodDescription}}}

---
**Current Period Data:**
Total CO2 Emissions: {{{totalCO2Emissions}}} kg CO2
CO2 per Delivery: {{{co2PerDelivery}}} kg CO2
EV Usage Percentage: {{{evUsagePercentage}}}%
Fleet Size: {{{fleetSize}}} vehicles
Emission Trend: {{{emissionTrend}}}

{{#if previousPeriodData}}
**Previous Period Data (for comparison):**
Total CO2 Emissions (Previous Period): {{{previousPeriodData.totalCO2Emissions}}} kg CO2
CO2 per Delivery (Previous Period): {{{previousPeriodData.co2PerDelivery}}} kg CO2
{{/if}}
---

Generate the report in a structured JSON format. Ensure all numerical values are presented as strings within the 'value' field of keyMetrics, including units where appropriate. For example, for total CO2, the value should be '1200 kg CO2'.`,
});

const genAISustainabilityReportFlow = ai.defineFlow(
  {
    name: 'genAISustainabilityReportFlow',
    inputSchema: GenAISustainabilityReportInputSchema,
    outputSchema: GenAISustainabilityReportOutputSchema,
  },
  async (input) => {
    const {output} = await sustainabilityReportPrompt(input);
    return output!;
  }
);
