'use server';

/*
 * @fileOverview Generador de respuestas para un oponente IA en el juego Global Stop.
 *
 * - generateAiOpponentResponse - Una función que genera la respuesta del oponente IA para una letra y categoría dadas.
 * - AiOpponentResponseInput - El tipo de entrada para la función generateAiOpponentResponse.
 * - AiOpponentResponseOutput - El tipo de retorno para la función generateAiOpponentResponse.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Language } from '@/contexts/language-context'; // Import Language type

const AiOpponentResponseInputSchema = z.object({
  letter: z.string().describe('La letra para la ronda actual.'),
  category: z.string().describe('La categoría para la ronda actual.'),
  language: z.custom<Language>().describe('El idioma para la respuesta (es, en, fr, pt).'),
});
export type AiOpponentResponseInput = z.infer<typeof AiOpponentResponseInputSchema>;

const AiOpponentResponseOutputSchema = z.object({
  response: z.string().describe('La respuesta del oponente IA para la letra y categoría dadas.'),
});
export type AiOpponentResponseOutput = z.infer<typeof AiOpponentResponseOutputSchema>;


export async function generateAiOpponentResponse(input: AiOpponentResponseInput): Promise<AiOpponentResponseOutput> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] generateAiOpponentResponse (EXPORTED FUNCTION): Invoking flow for input: ${JSON.stringify(input)}`);
    // Línea temporal para depuración: verifica si la variable GOOGLE_API_KEY está presente aquí
    console.log(`[${timestamp}] generateAiOpponentResponse Debug: GOOGLE_API_KEY is set:`, !!process.env.GOOGLE_API_KEY);

    return await generateAiOpponentResponseFlow(input);
  } catch (e: any) {
    console.error(`[${timestamp}] generateAiOpponentResponse (EXPORTED FUNCTION): CRITICAL ERROR during flow invocation for input ${JSON.stringify(input)}. This often indicates a problem with Genkit/Google AI setup. Error:`, e.message || e, e.stack, ". ENSURE GOOGLE_API_KEY is correctly set in your server environment and check server logs for more details, including any preceding errors from Genkit or Google AI services.");
    return { response: "" }; // Return a valid default response
  }
}

const currentPromptText = `Game: "Stop". Language: "{{{language}}}". Letter: "{{{letter}}}". Category: "{{{category}}}".
Task: ONE valid word in {{{language}}} for this category starting with "{{{letter}}}".
If no word, respond with an empty string.
ONLY the word or empty string. NO explanations.
The word MUST begin with the letter "{{{letter}}}".
Example for letter "P", category "Fruit", language "en": "Peach"
Example for letter "M", category "Animal", language "es": "Mono"
Example for letter "C", category "Couleur", language "fr": "Citron"
`;


const prompt = ai.definePrompt({
  name: 'generateAiOpponentResponsePrompt_vRestored',
  input: {schema: AiOpponentResponseInputSchema},
  output: {schema: AiOpponentResponseOutputSchema},
  prompt: currentPromptText,
  config: { temperature: 0.2 },
});

const generateAiOpponentResponseFlow = ai.defineFlow(
  {
    name: 'generateAiOpponentResponseFlow',
    inputSchema: AiOpponentResponseInputSchema,
    outputSchema: AiOpponentResponseOutputSchema,
  },
  async (input: AiOpponentResponseInput): Promise<AiOpponentResponseOutput> => {
    const timestamp = new Date().toISOString();
    try {
      console.log(`[${timestamp}] generateAiOpponentResponseFlow: Iniciando generación para input: ${JSON.stringify(input)}`);
      console.log(`[${timestamp}] generateAiOpponentResponseFlow: Usando prompt (primeros 300 caracteres): "${currentPromptText.substring(0,300)}..."`);

      const llmGenerateResponse = await prompt(input);
      const output = llmGenerateResponse.output;

      let llmResponseTextForLogging = "LLM_TEXT_UNAVAILABLE";
      try {
        llmResponseTextForLogging = llmGenerateResponse.text || "Empty LLM response text"; // Corrected: .text is a property
      } catch (e: any) {
        console.error(`[${timestamp}] generateAiOpponentResponseFlow: Error fetching raw text from LLM response for input ${JSON.stringify(input)}:`, e.message || e);
      }
      console.log(`[${timestamp}] generateAiOpponentResponseFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}, Raw LLM Response Text: "${llmResponseTextForLogging}"`);

      if (output && typeof output.response === 'string') {
        const structuredResponseTrimmed = output.response.trim();
        if (structuredResponseTrimmed !== "" && !structuredResponseTrimmed.toLowerCase().startsWith(input.letter.toLowerCase())) {
          console.warn(`[${timestamp}] generateAiOpponentResponseFlow: AI response (structured by Genkit schema) "${structuredResponseTrimmed}" for letter "${input.letter}" in category "${input.category}" (lang ${input.language}) did not start with the correct letter. Correcting to empty string.`);
          return { response: "" };
        }
        console.log(`[${timestamp}] generateAiOpponentResponseFlow: Respuesta de IA generada (parseada por schema Genkit): "${structuredResponseTrimmed}"`);
        return { response: structuredResponseTrimmed };
      }

      const rawTextTrimmed = llmResponseTextForLogging.trim();
      if (rawTextTrimmed && !rawTextTrimmed.includes(" ") && !rawTextTrimmed.includes("\\n") && rawTextTrimmed.length < 30) {
          if (rawTextTrimmed.toLowerCase().startsWith(input.letter.toLowerCase())) {
              console.warn(`[${timestamp}] generateAiOpponentResponseFlow: LLM structured output (output.response) no fue válido o estaba vacío. Usando raw text "${rawTextTrimmed}" como respuesta de IA ya que parece una sola palabra válida.`);
              return { response: rawTextTrimmed };
          } else {
              console.warn(`[${timestamp}] generateAiOpponentResponseFlow: LLM structured output no fue válido o estaba vacío. Raw text "${rawTextTrimmed}" parece una palabra pero no empieza con la letra "${input.letter}". Defaulting to empty string.`);
              return { response: "" };
          }
      }

      console.error(`[${timestamp}] generateAiOpponentResponseFlow: LLM no devolvió 'output.response' string válido según schema Genkit, y el texto crudo no es una sola palabra usable. Input: ${JSON.stringify(input)}. Raw output object: ${JSON.stringify(output)}. Raw text: "${llmResponseTextForLogging}". Defaulting to empty string.`);
      return { response: "" };
    } catch (error: any) {
      console.error(`[${timestamp}] generateAiOpponentResponseFlow (INTERNAL FLOW): UNHANDLED EXCEPTION for input ${JSON.stringify(input)}. Error:`, error.message || error, error.stack);
      return { response: "" };
    }
  }
);
