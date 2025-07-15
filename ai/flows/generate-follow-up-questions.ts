'use server';
/**
 * @fileOverview An AI agent that generates follow-up questions to get more details.
 *
 * - generateFollowUpQuestions - A function that generates follow-up questions.
 * - GenerateFollowUpInput - The input type for the generateFollowUpQuestions function.
 * - GenerateFollowUpOutput - The return type for the generateFollowUpQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFollowUpInputSchema = z.object({
  doubt: z.string().describe("The user's original question."),
  answer: z.string().describe("The AI's initial answer."),
});
export type GenerateFollowUpInput = z.infer<typeof GenerateFollowUpInputSchema>;

const GenerateFollowUpOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe(
      'A list of follow-up questions to ask the user for more details to provide a more tailored and specific answer.'
    ),
});
export type GenerateFollowUpOutput = z.infer<typeof GenerateFollowUpOutputSchema>;

export async function generateFollowUpQuestions(
  input: GenerateFollowUpInput
): Promise<GenerateFollowUpOutput> {
  return generateFollowUpQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFollowUpPrompt',
  input: {schema: GenerateFollowUpInputSchema},
  output: {schema: GenerateFollowUpOutputSchema},
  prompt: `You are an expert tutor. Based on the user's question and the initial answer, generate a few specific follow-up questions. These questions should aim to gather more details from the user to provide a more tailored and specific answer. The questions should be phrased to elicit short, one or two word answers.

User's doubt: "{{doubt}}"
Initial Answer: "{{answer}}"

Generate clarifying questions.
  `,
});

const generateFollowUpQuestionsFlow = ai.defineFlow(
  {
    name: 'generateFollowUpQuestionsFlow',
    inputSchema: GenerateFollowUpInputSchema,
    outputSchema: GenerateFollowUpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
