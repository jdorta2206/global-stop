
'use server';

/**
 * @fileOverview Generador de respuestas para un oponente IA en el juego Global Stop.
 *
 * - generateAiOpponentResponse - Una función que genera la respuesta del oponente IA para una letra y categoría dadas.
 * - AiOpponentResponseInput - El tipo de entrada para la función generateAiOpponentResponse.
 * - AiOpponentResponseOutput - El tipo de retorno para la función generateAiOpponentResponse.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiOpponentResponseInputSchema = z.object({
  letter: z.string().describe('La letra para la ronda actual.'),
  category: z.string().describe('La categoría para la ronda actual.'),
});
export type AiOpponentResponseInput = z.infer<typeof AiOpponentResponseInputSchema>;

const AiOpponentResponseOutputSchema = z.object({
  response: z.string().describe('La respuesta del oponente IA para la letra y categoría dadas.'),
});
export type AiOpponentResponseOutput = z.infer<typeof AiOpponentResponseOutputSchema>;

export async function generateAiOpponentResponse(input: AiOpponentResponseInput): Promise<AiOpponentResponseOutput> {
  return generateAiOpponentResponseFlow(input);
}

// Prompt ultra-directo en inglés
const currentPromptText = `You are an AI playing the game "Stop" (also known as Tutti Frutti).
Current letter: "{{{letter}}}"
Current category: "{{{category}}}"

Your task: Generate ONE valid Spanish word for this category that STARTS WITH the letter "{{{letter}}}".
If you cannot generate a valid word that starts with the letter, respond with an empty string.
DO NOT include explanations. Only the word itself or an empty string.
The word MUST begin with the letter "{{{letter}}}".`;

const prompt = ai.definePrompt({
  name: 'generateAiOpponentResponsePrompt',
  input: {schema: AiOpponentResponseInputSchema},
  output: {schema: AiOpponentResponseOutputSchema},
  prompt: currentPromptText,
});

const generateAiOpponentResponseFlow = ai.defineFlow(
  {
    name: 'generateAiOpponentResponseFlow',
    inputSchema: AiOpponentResponseInputSchema,
    outputSchema: AiOpponentResponseOutputSchema,
  },
  async input => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] generateAiOpponentResponseFlow: Iniciando generación para input: ${JSON.stringify(input)}`);
    console.log(`[${timestamp}] generateAiOpponentResponseFlow: Usando prompt (primeros 300 caracteres): "${currentPromptText.substring(0,300)}..."`);

    const {output, response: rawLLMResponse} = await prompt(input);

    let llmResponseTextForLogging = "LLM_TEXT_UNAVAILABLE";
    try {
      llmResponseTextForLogging = (await rawLLMResponse.text()) || "Empty LLM response text";
    } catch (e: any) {
      console.error(`[${timestamp}] generateAiOpponentResponseFlow: Error fetching raw text from LLM response for input ${JSON.stringify(input)}:`, e.message || e);
    }
    console.log(`[${timestamp}] generateAiOpponentResponseFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}, Raw LLM Response Text: "${llmResponseTextForLogging}"`);


    if (output && typeof output.response === 'string') {
      // Defensive check: Ensure AI's response actually starts with the correct letter,
      // even though the prompt instructs it to.
      if (output.response.trim() !== "" && !output.response.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`[${timestamp}] generateAiOpponentResponseFlow: AI response "${output.response}" for letter "${input.letter}" in category "${input.category}" did not start with the correct letter. Correcting to empty string.`);
        return { response: "" }; // Treat as invalid if it doesn't adhere to the primary rule
      }
      console.log(`[${timestamp}] generateAiOpponentResponseFlow: Respuesta de IA generada y validada (formato letra): "${output.response}"`);
      return output;
    }
    
    console.error(`[${timestamp}] generateAiOpponentResponseFlow: LLM did not return valid 'response' string in structured output. Input: ${JSON.stringify(input)}. Raw LLM Output Object (schema parsed): ${JSON.stringify(output)}. Raw LLM Response Text (captured): "${llmResponseTextForLogging}". Defaulting to empty string.`);
    return { response: "" }; // Default to empty string if LLM response is problematic
  }
);
