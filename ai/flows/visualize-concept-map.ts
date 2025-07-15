// src/ai/flows/visualize-concept-map.ts
'use server';

/**
 * @fileOverview Generates a visual concept map from a given text.
 *
 * - visualizeConceptMap - A function that generates a visual concept map.
 * - VisualizeConceptMapInput - The input type for the visualizeConceptMap function.
 * - VisualizeConceptMapOutput - The return type for the visualizeConceptMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeConceptMapInputSchema = z.object({
  text: z.string().describe('The text to generate a concept map from.'),
});
export type VisualizeConceptMapInput = z.infer<typeof VisualizeConceptMapInputSchema>;

const VisualizeConceptMapOutputSchema = z.object({
  conceptMap: z
    .string()
    .describe('A textual representation of the concept map in Markdown format.'),
});
export type VisualizeConceptMapOutput = z.infer<typeof VisualizeConceptMapOutputSchema>;

export async function visualizeConceptMap(input: VisualizeConceptMapInput): Promise<VisualizeConceptMapOutput> {
  return visualizeConceptMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visualizeConceptMapPrompt',
  input: {schema: VisualizeConceptMapInputSchema},
  output: {schema: VisualizeConceptMapOutputSchema},
  prompt: `You are an expert in creating visual concept maps from text.

  Based on the following text, create a visual concept map that shows the relationships between different concepts. The visual concept map MUST be formatted as a markdown diagram.

  Text: {{{text}}}
  `,
});

const visualizeConceptMapFlow = ai.defineFlow(
  {
    name: 'visualizeConceptMapFlow',
    inputSchema: VisualizeConceptMapInputSchema,
    outputSchema: VisualizeConceptMapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
