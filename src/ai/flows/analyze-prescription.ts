'use server';

/**
 * @fileOverview Analyzes a prescription image and provides a detailed analysis with non-medical suggestions.
 *
 * - analyzePrescription - A function that handles the prescription analysis process.
 * - AnalyzePrescriptionInput - The input type for the analyzePrescription function.
 * - AnalyzePrescriptionOutput - The return type for the analyzePrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePrescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo/screenshot of a prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePrescriptionInput = z.infer<typeof AnalyzePrescriptionInputSchema>;

const AnalyzePrescriptionOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the prescription, including the purpose of the medications.'),
  exercises: z.string().describe('A list of suggested gentle exercises that may help with the underlying condition. This should not be medical advice.'),
  homeRemedies: z.string().describe('A list of suggested home remedies that could complement the treatment. This should not be medical advice and should not include taking any other medicine.'),
});
export type AnalyzePrescriptionOutput = z.infer<typeof AnalyzePrescriptionOutputSchema>;

export async function analyzePrescription(input: AnalyzePrescriptionInput): Promise<AnalyzePrescriptionOutput> {
  return analyzePrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePrescriptionPrompt',
  input: {schema: AnalyzePrescriptionInputSchema},
  output: {schema: AnalyzePrescriptionOutputSchema},
  prompt: `You are a helpful and cautious health assistant. You are not a doctor and cannot give medical advice.

You will receive a prescription photo. Your task is to analyze it and provide helpful, non-medical suggestions.

1.  **Detailed Analysis**: First, identify the medications and their dosages from the image. Explain what these medications are generally used for in simple terms. Do not provide specific medical advice.
2.  **Exercises**: Based on the likely condition the prescription is for, suggest some gentle, general exercises that could support well-being. For example, if it's for high blood pressure, suggest walking or light stretching. Frame this as a general wellness tip, not a treatment plan.
3.  **Home Remedies**: Suggest some safe, non-medicinal home remedies that could complement the user's care. For example, for pain management, you could suggest a warm compress. **Crucially, do not suggest any other medicines, supplements, or herbs.** Focus on simple, safe actions like hydration, rest, or diet adjustments (e.g., 'eating leafy greens').

Always include a clear disclaimer that this is not medical advice and the user should consult their doctor before making any changes to their treatment plan. Do not list potential side effects or drug interactions.

Prescription Photo: {{media url=photoDataUri}}`,
});

const analyzePrescriptionFlow = ai.defineFlow(
  {
    name: 'analyzePrescriptionFlow',
    inputSchema: AnalyzePrescriptionInputSchema,
    outputSchema: AnalyzePrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
