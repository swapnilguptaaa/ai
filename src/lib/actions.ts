// src/lib/actions.ts
'use server';

import { answerDoubt } from '@/ai/flows/answer-doubt';
import { enhanceClarity } from '@/ai/flows/enhance-clarity';
import { convertToResearchFormat } from '@/ai/flows/convert-to-research-format';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { visualizeConceptMap } from '@/ai/flows/visualize-concept-map';
import { generateFollowUpQuestions } from '@/ai/flows/generate-follow-up-questions';

async function handleRequest<T>(
  promise: Promise<T>,
  errorMessage: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (e) {
    console.error(e);
    const error = e instanceof Error ? e.message : String(e);
    return { data: null, error: `${errorMessage}: ${error}` };
  }
}

export async function submitDoubtAction(doubt: string, wordLimit?: number, isDefinition?: boolean, isStudent?: boolean) {
  if (!doubt) {
    return { data: null, error: 'Please enter a question.' };
  }
  return handleRequest(answerDoubt({ doubt, wordLimit, isDefinition, isStudent }), 'Failed to get an answer. Please try again.');
}

export async function enhanceClarityAction(question: string, initialAnswer: string) {
  return handleRequest(
    enhanceClarity({ question, initialAnswer }),
    'Failed to enhance clarity. Please try again.'
  );
}

export async function convertToResearchFormatAction(question: string) {
  return handleRequest(
    convertToResearchFormat({ question }),
    'Failed to convert to research format. Please try again.'
  );
}

export async function generateQuizAction(answer: string) {
  return handleRequest(
    generateQuiz({ answer }),
    'Failed to generate a quiz. Please try again.'
  );
}

export async function visualizeConceptMapAction(text: string) {
  return handleRequest(
    visualizeConceptMap({ text }),
    'Failed to create a concept map. Please try again.'
  );
}

export async function generateFollowUpQuestionsAction(doubt: string, answer: string) {
    return handleRequest(
      generateFollowUpQuestions({ doubt, answer }),
      'Failed to generate suggestions. Please try again.'
    );
  }
