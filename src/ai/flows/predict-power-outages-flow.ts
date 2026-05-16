'use server';
/**
 * @fileOverview An AI agent that predicts potential power outages or maintenance windows based on historical power data.
 *
 * - predictPowerOutages - A function that handles the power outage prediction process.
 * - PredictPowerOutagesInput - The input type for the predictPowerOutages function.
 * - PredictPowerOutagesOutput - The return type for the predictPowerOutages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HistoricalPowerEventSchema = z.object({
  villageName: z.string().describe('The name of the village.'),
  status: z.enum(['ON', 'OFF']).describe('The power status (ON or OFF).'),
  timestamp: z
    .string()
    .datetime()
    .describe('ISO timestamp when the status was recorded.'),
  durationMinutes: z
    .number()
    .optional()
    .describe('Duration of the outage in minutes if the status was OFF.'),
});

const PredictedOutageSchema = z.object({
  villageName: z.string().describe('The name of the village affected.'),
  predictedStartTime: z
    .string()
    .datetime()
    .describe('ISO timestamp for the predicted start time of the outage/maintenance window.'),
  predictedEndTime: z
    .string()
    .datetime()
    .describe('ISO timestamp for the predicted end time of the outage/maintenance window.'),
  reason: z
    .string()
    .describe('Reason for the predicted outage or maintenance window (e.g., equipment failure, scheduled maintenance, weather).'),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('Confidence score of the prediction (0-100, where 100 is highly confident).'),
});

const PredictPowerOutagesInputSchema = z.object({
  historicalData: z
    .array(HistoricalPowerEventSchema)
    .describe('An array of historical power events for various villages.'),
  currentTime: z.string().datetime().describe('The current ISO timestamp to base predictions from.'),
});
export type PredictPowerOutagesInput = z.infer<
  typeof PredictPowerOutagesInputSchema
>;

const PredictPowerOutagesOutputSchema = z.object({
  predictions: z
    .array(PredictedOutageSchema)
    .describe('An array of predicted power outages or maintenance windows.'),
  summary: z.string().describe('A summary of the prediction.'),
});
export type PredictPowerOutagesOutput = z.infer<
  typeof PredictPowerOutagesOutputSchema
>;

export async function predictPowerOutages(
  input: PredictPowerOutagesInput
): Promise<PredictPowerOutagesOutput> {
  return predictPowerOutagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictPowerOutagesPrompt',
  input: {schema: PredictPowerOutagesInputSchema},
  output: {schema: PredictPowerOutagesOutputSchema},
  prompt: `You are an AI-powered outage predictor tool for the Grama-Urja system. Your goal is to analyze historical power data and forecast potential power outages or maintenance windows for various villages.

Analyze the provided historical power events and predict future outages or maintenance windows, along with their reasons and estimated durations. Consider patterns, frequencies, and any recurring issues.

It is currently {{{currentTime}}}. All predicted times should be in the future relative to this current time.

Historical Power Data:
{{#each historicalData}}
  - Village: {{{this.villageName}}}, Status: {{{this.status}}}, Timestamp: {{{this.timestamp}}}{{#if this.durationMinutes}}, Duration (if OFF): {{{this.durationMinutes}}} minutes{{/if}}
{{/each}}

Based on this data, provide your predictions.`,
});

const predictPowerOutagesFlow = ai.defineFlow(
  {
    name: 'predictPowerOutagesFlow',
    inputSchema: PredictPowerOutagesInputSchema,
    outputSchema: PredictPowerOutagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
