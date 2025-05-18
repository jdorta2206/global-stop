
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
  category: z.string().describe('La categoría para la ronda actual (aunque la validación de la palabra debe ser general).'),
  playerWord: z.string().describe('La palabra ingresada por el jugador.'),
});
export type ValidatePlayerWordInput = z.infer<typeof ValidatePlayerWordInputSchema>;

const ValidatePlayerWordOutputSchema = z.object({
  isValid: z.boolean().describe('True si la palabra es válida, bien escrita y comienza con la letra especificada; false en caso contrario.'),
});
export type ValidatePlayerWordOutput = z.infer<typeof ValidatePlayerWordOutputSchema>;

export async function validatePlayerWord(input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> {
  // Llamamos directamente al flujo que invoca al LLM.
  return validatePlayerWordFlow(input);
}

// Prompt actualizado para mayor claridad y robustez
const currentPromptText = `Is the Spanish word "{{{playerWord}}}" a valid, correctly-spelled word or common proper name that starts with the letter "{{{letter}}}" (case-insensitive)?
The word must not be empty.
The word must be a real Spanish word or a common Spanish proper name (e.g., Paco, París, Zorro, Irene, Sofía).
Do not accept invented words or typos.

Respond ONLY with a JSON object in the format: {"isValid": true} or {"isValid": false}.
No other text, no explanations, no markdown. Just the JSON.
Example for a valid word: {"isValid": true}
Example for an invalid word: {"isValid": false}`;

const prompt = ai.definePrompt({
  name: 'validatePlayerWordPrompt',
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: ValidatePlayerWordOutputSchema},
  prompt: currentPromptText, 
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

    // Pre-validación en el flujo (defensiva)
    if (input.playerWord.trim() === "") {
      console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra vacía recibida. Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
      return { isValid: false };
    }
    if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra "${input.playerWord}" no comienza con la letra "${input.letter}". Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
        return { isValid: false };
    }
    
    console.log(`[${timestamp}] validatePlayerWordFlow: Input pasó las pre-validaciones. Llamando al LLM con: ${JSON.stringify(input)}`);
    console.log(`[${timestamp}] validatePlayerWordFlow: Usando prompt (primeros 300 caracteres): "${currentPromptText.substring(0,300)}..."`);
    
    const {output, response: rawLLMResponse} = await prompt(input);
    
    let llmResponseTextForLogging = "LLM_TEXT_UNAVAILABLE";
    try {
      llmResponseTextForLogging = await rawLLMResponse.text();
    } catch (e: any) {
      console.error(`[${timestamp}] validatePlayerWordFlow: Error fetching raw text from LLM response for input ${JSON.stringify(input)}:`, e.message || e);
    }
    console.log(`[${timestamp}] validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}, Raw LLM Response Text: "${llmResponseTextForLogging}"`);


    if (output && typeof output.isValid === 'boolean') {
      console.log(`[${timestamp}] validatePlayerWordFlow: Validación exitosa vía schema. Word: "${input.playerWord}", Letter: "${input.letter}", isValid: ${output.isValid}`);
      return output;
    }
    
    // Si el parseo del schema falla, intentamos obtener el texto crudo y parsearlo manualmente.
    // La variable llmResponseTextForLogging ya contiene el texto crudo o un error.
    // Si hubo error al obtener el texto crudo, llmResponseTextForLogging contendrá "LLM_TEXT_UNAVAILABLE" o el mensaje de error.
    
    console.warn(`[${timestamp}] validatePlayerWordFlow: LLM structured output (output.isValid) no fue un booleano o el objeto output fue nulo/undefined. Input: ${JSON.stringify(input)}. Raw LLM Output Object (schema parsed): ${JSON.stringify(output)}. Raw LLM Response Text (captured): "${llmResponseTextForLogging}". Intentando parsear manualmente desde el texto crudo capturado.`);
      
    if (llmResponseTextForLogging !== "LLM_TEXT_UNAVAILABLE" && llmResponseTextForLogging !== "Empty LLM response text" && !llmResponseTextForLogging.startsWith("Error fetching raw text")) {
      const jsonMatch = llmResponseTextForLogging.match(/\{\s*"isValid"\s*:\s*(true|false)\s*\}/i);
      if (jsonMatch && jsonMatch[0]) {
        try {
          const parsedJson = JSON.parse(jsonMatch[0]);
          if (typeof parsedJson.isValid === 'boolean') {
            console.warn(`[${timestamp}] validatePlayerWordFlow: Parseo manual de JSON desde texto crudo exitoso: ${jsonMatch[0]}. Word: "${input.playerWord}", Letter: "${input.letter}", isValid: ${parsedJson.isValid}`);
            return { isValid: parsedJson.isValid };
          } else {
            console.error(`[${timestamp}] validatePlayerWordFlow: JSON extraído manualmente no contiene 'isValid' como booleano: "${jsonMatch[0]}". Defaulting to false.`);
          }
        } catch (parseError: any) {
          console.error(`[${timestamp}] validatePlayerWordFlow: Error al parsear JSON extraído manualmente: "${jsonMatch[0]}". Error: ${parseError.message || parseError}. Defaulting to false.`);
        }
      } else {
         console.error(`[${timestamp}] validatePlayerWordFlow: No se encontró un patrón JSON válido ({"isValid": true/false}) en el texto crudo del LLM: "${llmResponseTextForLogging}". Input: ${JSON.stringify(input)}. Defaulting to false.`);
      }
    } else {
      console.error(`[${timestamp}] validatePlayerWordFlow: No se pudo obtener texto crudo válido del LLM para parseo manual. Raw text was: "${llmResponseTextForLogging}". Defaulting to false.`);
    }
    
    console.error(`[${timestamp}] validatePlayerWordFlow: Todos los intentos de obtener un booleano válido para 'isValid' fallaron. Defaulting to false. Word: "${input.playerWord}", Letter: "${input.letter}". LLM Raw Output Object (schema parsed): ${JSON.stringify(output)}, LLM Raw Text (captured): "${llmResponseTextForLogging}"`);
    return { isValid: false }; 
  }
);

