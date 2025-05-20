
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

console.log("[Genkit Init] Attempting to initialize Genkit with Google AI. Ensure GOOGLE_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) is set correctly in your server environment.");

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
});
