'use server';

/**
 * @fileOverview This flow handles initial health queries from new users.
 *
 * - initialHealthQuery - A function that processes the user's health question and returns a response.
 * - InitialHealthQueryInput - The input type for the initialHealthQuery function.
 * - InitialHealthQueryOutput - The return type for the initialHealthQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialHealthQueryInputSchema = z.object({
  query: z.string().describe('The user health query.'),
});

export type InitialHealthQueryInput = z.infer<typeof InitialHealthQueryInputSchema>;

const InitialHealthQueryOutputSchema = z.object({
  response: z.string().describe('The response to the user health query.'),
});

export type InitialHealthQueryOutput = z.infer<typeof InitialHealthQueryOutputSchema>;

export async function initialHealthQuery(input: InitialHealthQueryInput): Promise<InitialHealthQueryOutput> {
  return initialHealthQueryFlow(input);
}

const initialHealthQueryPrompt = ai.definePrompt({
  name: 'initialHealthQueryPrompt',
  input: {schema: InitialHealthQueryInputSchema},
  output: {schema: InitialHealthQueryOutputSchema},
  prompt: `You are a helpful medical assistant. Please answer the following health query:

  Query: {{{query}}}
  `,
});

const initialHealthQueryFlow = ai.defineFlow(
  {
    name: 'initialHealthQueryFlow',
    inputSchema: InitialHealthQueryInputSchema,
    outputSchema: InitialHealthQueryOutputSchema,
  },
  async input => {
    const {output} = await initialHealthQueryPrompt(input);
    return output!;
  }
);
