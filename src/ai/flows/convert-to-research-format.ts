'use server';
/**
 * @fileOverview Converts a question into research format using AI.
 *
 * - convertToResearchFormat - A function that handles the conversion of a question into research format.
 * - ConvertToResearchFormatInput - The input type for the convertToResearchFormat function.
 * - ConvertToResearchFormatOutput - The return type for the convertToResearchFormat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertToResearchFormatInputSchema = z.object({
  question: z.string().describe('The question to convert into research format.'),
});
export type ConvertToResearchFormatInput = z.infer<typeof ConvertToResearchFormatInputSchema>;

const ConvertToResearchFormatOutputSchema = z.object({
  researchFormat: z.string().describe('The question converted into research format.'),
});
export type ConvertToResearchFormatOutput = z.infer<typeof ConvertToResearchFormatOutputSchema>;

export async function convertToResearchFormat(input: ConvertToResearchFormatInput): Promise<ConvertToResearchFormatOutput> {
  return convertToResearchFormatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertToResearchFormatPrompt',
  input: {schema: ConvertToResearchFormatInputSchema},
  output: {schema: ConvertToResearchFormatOutputSchema},
  prompt: `You are an expert in converting questions into a research format.

  Convert the following question into a research format:

  Question: {{{question}}}

  Research Format:`,
});

const convertToResearchFormatFlow = ai.defineFlow(
  {
    name: 'convertToResearchFormatFlow',
    inputSchema: ConvertToResearchFormatInputSchema,
    outputSchema: ConvertToResearchFormatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
