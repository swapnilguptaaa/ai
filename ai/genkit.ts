import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({ models: ['gemini-3.8-flash'] })],
  model: 'googleai/gemini-3.8-flash',
});
