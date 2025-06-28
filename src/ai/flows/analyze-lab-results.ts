'use server';

/**
 * @fileOverview Analyzes lab test results and provides a summary of out-of-range values and potential indications.
 *
 * - analyzeLabResults - A function that handles the lab results analysis process.
 * - AnalyzeLabResultsInput - The input type for the analyzeLabResults function.
 * - AnalyzeLabResultsOutput - The return type for the analyzeLabResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLabResultsInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file containing lab results (image or PDF), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeLabResultsInput = z.infer<typeof AnalyzeLabResultsInputSchema>;

const AnalyzeLabResultsOutputSchema = z.object({
  summary: z.string().describe('A summary of the lab results, including which values are outside of the normal range and what they could indicate.'),
});
export type AnalyzeLabResultsOutput = z.infer<typeof AnalyzeLabResultsOutputSchema>;

export async function analyzeLabResults(input: AnalyzeLabResultsInput): Promise<AnalyzeLabResultsOutput> {
  return analyzeLabResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLabResultsPrompt',
  input: {schema: AnalyzeLabResultsInputSchema},
  output: {schema: AnalyzeLabResultsOutputSchema},
  prompt: `You are a medical professional specializing in interpreting lab results.

You will receive a document containing lab results. This could be an image or a PDF.

Your task is to analyze the values, provide a summary of which values are outside of the normal range, and explain what they could indicate. Be concise and clear in your explanation.

Lab Results Document:
{{media url=fileDataUri}}`,
});

const analyzeLabResultsFlow = ai.defineFlow(
  {
    name: 'analyzeLabResultsFlow',
    inputSchema: AnalyzeLabResultsInputSchema,
    outputSchema: AnalyzeLabResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
