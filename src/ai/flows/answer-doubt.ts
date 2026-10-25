// 'use server';

/**
 * @fileOverview An AI agent that answers student doubts.
 *
 * - answerDoubt - A function that handles the answering of a student's doubt.
 * - AnswerDoubtInput - The input type for the answerDoubt function.
 * - AnswerDoubtOutput - The return type for the answerDoubt function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerDoubtInputSchema = z.object({
  doubt: z.string().describe("The student's doubt or question."),
  wordLimit: z.number().optional().describe('The desired word limit for the answer.'),
  isDefinition: z.boolean().optional().describe('Whether to provide a short definition instead of a full answer.'),
  isStudent: z.boolean().optional().describe('Whether the user is a student, which dictates the tone and inclusion of a motivational quote.'),
});
export type AnswerDoubtInput = z.infer<typeof AnswerDoubtInputSchema>;

const AnswerDoubtOutputSchema = z.object({
  answer: z.string().describe("The answer to the student's doubt."),
  isClear: z.boolean().describe('Whether the doubt is clear enough to be answered.'),
  followUpQuestions: z.array(z.string()).optional().describe('A list of follow-up questions to ask the student for clarity, if the doubt is not clear.'),
  coreTopic: z.string().optional().describe("A single word representing the core topic of the answer."),
  briefSummary: z.string().optional().describe("A 10-15 word summary of the answer."),
});
export type AnswerDoubtOutput = z.infer<typeof AnswerDoubtOutputSchema>;

export async function answerDoubt(input: AnswerDoubtInput): Promise<AnswerDoubtOutput> {
  return answerDoubtFlow(input);
}

const answerDoubtPrompt = ai.definePrompt({
  name: 'answerDoubtPrompt',
  input: {schema: AnswerDoubtInputSchema},
  output: {schema: AnswerDoubtOutputSchema},
  prompt: `{{#if isStudent}}
You are an expert tutor writing for a student. Your tone should be encouraging, educational, and easy to understand.
{{else}}
You are a knowledgeable AI assistant providing expert-level information for a general audience or researcher. Your tone should be formal and informative.
{{/if}}

Your task is to analyze the user's doubt.

If the question is too vague or lacks context, set 'isClear' to false and generate a few relevant follow-up questions that people commonly ask related to the user's initial prompt. These should be complete questions that could be asked to get a detailed answer. Place these in the 'followUpQuestions' field. Do not attempt to answer the vague question and leave other fields empty.

If the question is clear:
1. Set 'isClear' to true.
2. Provide an answer in the 'answer' field based on the following:
   {{#if isDefinition}}
   - Provide a short, concise definition for the topic. The definition should be clear, simple, and formatted in Markdown.
   {{else}}
   - Provide a comprehensive answer. Format the answer using Markdown to ensure it is readable, with features like lists, bold text, and code blocks where appropriate.
   - {{#if wordLimit}}The answer must be approximately {{wordLimit}} words long.{{/if}}
   {{/if}}
3. After the main answer, on a new line, add a horizontal rule using '---'.
4. On the next line, add a relevant quote.
   {{#if isStudent}}
   - The quote should be motivational and suitable for a student.
   {{else}}
   - The quote should be insightful and directly related to the topic of the answer.
   {{/if}}
5. Identify a single word that represents the core topic of the answer and put it in the 'coreTopic' field.
6. Create a concise 10-15 word summary of the answer and put it in the 'briefSummary' field.

Student's doubt: "{{doubt}}"
  `,
});

const answerDoubtFlow = ai.defineFlow(
  {
    name: 'answerDoubtFlow',
    inputSchema: AnswerDoubtInputSchema,
    outputSchema: AnswerDoubtOutputSchema,
  },
  async input => {
    try {
      const {output} = await answerDoubtPrompt(input);
      return output!;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('Service Unavailable')) {
        const {output} = await answerDoubtPrompt(input, {
          model: 'googleai/gemini-2.5-flash',
        });
        return output!;
      }
      throw err;
    }
  }
);
