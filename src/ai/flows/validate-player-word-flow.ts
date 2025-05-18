
'use server';
/**
 * @fileOverview Validador de palabras del jugador para el juego Global Stop.
 *
 * - validatePlayerWord - Una función que valida la palabra de un jugador.
 * - ValidatePlayerWordInput - El tipo de entrada para la función validatePlayerWord.
 * - ValidatePlayerWordOutput - El tipo de retorno para la función validatePlayerWord.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidatePlayerWordInputSchema = z.object({
  letter: z.string().describe('La letra para la ronda actual.'),
  category: z.string().describe('La categoría para la ronda actual (informativo, la validación debe ser general).'),
  playerWord: z.string().describe('La palabra ingresada por el jugador.'),
});
export type ValidatePlayerWordInput = z.infer<typeof ValidatePlayerWordInputSchema>;

// El schema que el flujo expone (lo que GamePage espera)
const ValidatePlayerWordOutputSchema = z.object({
  isValid: z.boolean().describe('True si la palabra es válida, bien escrita y comienza con la letra especificada; false en caso contrario.'),
});
export type ValidatePlayerWordOutput = z.infer<typeof ValidatePlayerWordOutputSchema>;

// El schema de lo que esperamos que el LLM devuelva (usado en ai.definePrompt)
const LLMResponseSchema = z.object({
    isValid: z.boolean().describe("True si la palabra es válida, false en caso contrario."),
});

export async function validatePlayerWord(input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> {
  return validatePlayerWordFlow(input);
}

const currentPromptText = `Word: "{{{playerWord}}}"
Letter: "{{{letter}}}"
Is the Spanish word "{{{playerWord}}}" a real, correctly-spelled word OR a common Spanish proper name that starts with the letter "{{{letter}}}" (case-insensitive)?
Answer ONLY with JSON: {"isValid": true} or {"isValid": false}.
NO OTHER TEXT. NO MARKDOWN. JUST JSON.`;

const prompt = ai.definePrompt({
  name: 'validatePlayerWordPromptJSON_vMinimal_Strict',
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: LLMResponseSchema}, // Espera { isValid: boolean } directamente de Genkit
  prompt: currentPromptText,
  config: { temperature: 0.2 },
});

const validatePlayerWordFlow = ai.defineFlow(
  {
    name: 'validatePlayerWordFlow',
    inputSchema: ValidatePlayerWordInputSchema,
    outputSchema: ValidatePlayerWordOutputSchema,
  },
  async (input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] validatePlayerWordFlow: Iniciando validación para input: ${JSON.stringify(input)}`);
    console.log(`[${timestamp}] validatePlayerWordFlow: Usando prompt (esperando JSON {"isValid": boolean}): "${currentPromptText.substring(0,300)}..."`);

    if (input.playerWord.trim() === "") {
      console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra vacía recibida. Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
      return { isValid: false };
    }
    if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra "${input.playerWord}" no comienza con la letra "${input.letter}". Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
        return { isValid: false };
    }
    
    const {output, response: rawLLMResponse} = await prompt(input);
    
    let rawResponseTextForLogging = "LLM_TEXT_UNAVAILABLE";
    try {
      rawResponseTextForLogging = (await rawLLMResponse.text()) || "Empty LLM response text";
    } catch (e: any) {
      console.error(`[${timestamp}] validatePlayerWordFlow: Error fetching raw text from LLM response for input ${JSON.stringify(input)}:`, e.message || e);
    }
    console.log(`[${timestamp}] validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}, Raw LLM Response Text: "${rawResponseTextForLogging}"`);

    if (output && typeof output.isValid === 'boolean') {
      console.log(`[${timestamp}] validatePlayerWordFlow: LLM devolvió JSON válido (vía schema de Genkit). Palabra: "${input.playerWord}", Letra: "${input.letter}". Resultado: {isValid: ${output.isValid}}.`);
      return { isValid: output.isValid };
    } else {
        console.error(`[${timestamp}] validatePlayerWordFlow: LLM structured output (output.isValid) no fue un booleano, o 'output' fue nulo/inválido según el schema de Genkit. LLM no cumplió el formato JSON esperado. Raw output object from Genkit: ${JSON.stringify(output)}. Raw text from LLM: "${rawResponseTextForLogging}". Defaulting to {isValid: false}.`);
        return { isValid: false };
    }
  }
);
