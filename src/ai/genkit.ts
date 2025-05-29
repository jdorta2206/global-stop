import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Línea temporal para depuración (lo más temprano posible)
console.log("[Genkit Init Early Debug] GOOGLE_API_KEY is set:", !!process.env.GOOGLE_API_KEY);
console.log("[Genkit Init Early Debug] process.env keys:", Object.keys(process.env).join(', ')); // Opcional: log todas las keys (¡con cuidado!)


console.log("[Genkit Init] Starting Genkit initialization process, relying on GOOGLE_GENERATIVE_AI_API_KEY.");


export const ai = genkit({
  plugins: [googleAI({})],
  model: 'googleai/gemini-1.5-flash-latest',
});

console.log("[Genkit Init] Genkit initialization code complete.")
