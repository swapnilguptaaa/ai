// src/lib/actions.ts
'use server';

import { answerDoubt } from '@/ai/flows/answer-doubt';
import { enhanceClarity } from '@/ai/flows/enhance-clarity';
import { convertToResearchFormat } from '@/ai/flows/convert-to-research-format';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { visualizeConceptMap } from '@/ai/flows/visualize-concept-map';
import { generateFollowUpQuestions } from '@/ai/flows/generate-follow-up-questions';

async function handleRequestWithRetry<T>(
  actionFn: () => Promise<T>,
  errorMessage: string,
  retries = 2
): Promise<{ data: T | null; error: string | null }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await actionFn();
      return { data, error: null };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      const isTransient =
        errorMsg.includes('503') ||
        errorMsg.includes('Service Unavailable') ||
        errorMsg.includes('429') ||
        errorMsg.includes('Resource Exhausted') ||
        errorMsg.includes('high demand') ||
        errorMsg.includes('spikes in demand');

      if (isTransient && attempt < retries) {
        // Wait with exponential backoff before retrying (1.5s, 3s)
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        continue;
      }

      console.error(`Action failed (attempt ${attempt + 1}/${retries + 1}):`, errorMsg);

      if (errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('Service Unavailable')) {
        return {
          data: null,
          error:
            'The AI service is temporarily experiencing high traffic spikes. Please wait a few seconds and try clicking Search again.',
        };
      }
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Resource Exhausted')) {
        return {
          data: null,
          error:
            'API rate limit reached. Please wait a few moments before trying again.',
        };
      }

      return { data: null, error: `${errorMessage}: ${errorMsg}` };
    }
  }
  return {
    data: null,
    error: 'The AI service is temporarily busy. Please try again in a few moments.',
  };
}

export async function submitDoubtAction(doubt: string, wordLimit?: number, isDefinition?: boolean, isStudent?: boolean) {
  if (!doubt) {
    return { data: null, error: 'Please enter a question.' };
  }
  return handleRequestWithRetry(
    () => answerDoubt({ doubt, wordLimit, isDefinition, isStudent }),
    'Failed to get an answer. Please try again.'
  );
}

export async function enhanceClarityAction(question: string, initialAnswer: string) {
  return handleRequestWithRetry(
    () => enhanceClarity({ question, initialAnswer }),
    'Failed to enhance clarity. Please try again.'
  );
}

export async function convertToResearchFormatAction(question: string) {
  return handleRequestWithRetry(
    () => convertToResearchFormat({ question }),
    'Failed to convert to research format. Please try again.'
  );
}

export async function generateQuizAction(answer: string) {
  return handleRequestWithRetry(
    () => generateQuiz({ answer }),
    'Failed to generate a quiz. Please try again.'
  );
}

export async function visualizeConceptMapAction(text: string) {
  return handleRequestWithRetry(
    () => visualizeConceptMap({ text }),
    'Failed to create a concept map. Please try again.'
  );
}

export async function generateFollowUpQuestionsAction(doubt: string, answer: string) {
  return handleRequestWithRetry(
    () => generateFollowUpQuestions({ doubt, answer }),
    'Failed to generate suggestions. Please try again.'
  );
}
