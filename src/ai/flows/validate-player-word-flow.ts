
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
  category: z.string().describe('La categoría para la ronda actual.'),
  playerWord: z.string().describe('La palabra ingresada por el jugador.'),
});
export type ValidatePlayerWordInput = z.infer<typeof ValidatePlayerWordInputSchema>;

const ValidatePlayerWordOutputSchema = z.object({
  isValid: z.boolean().describe('True si la palabra es válida, bien escrita y comienza con la letra especificada; false en caso contrario.'),
});
export type ValidatePlayerWordOutput = z.infer<typeof ValidatePlayerWordOutputSchema>;

export async function validatePlayerWord(input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> {
  return validatePlayerWordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validatePlayerWordPrompt',
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: ValidatePlayerWordOutputSchema},
  prompt: `Evalúa la palabra "{{{playerWord}}}" para el juego "Stop" en español.
Letra requerida: "{{{letter}}}"

Criterios:
1. ¿Es "{{{playerWord}}}" una palabra o nombre propio común y bien escrito en español? (Ej: "Paco", "París", "pelota" son válidos. "Pxzqr" o inventos no).
2. ¿Comienza "{{{playerWord}}}" con la letra "{{{letter}}}" (ignora mayúsculas/minúsculas)?
3. ¿No es "{{{playerWord}}}" una cadena vacía o solo espacios?

Si TODOS son VERDADEROS, responde: {"isValid": true}
Si ALGUNO es FALSO, responde: {"isValid": false}
NO incluyas NINGUNA otra palabra, explicación, o markdown. Solo el JSON.
Palabra: {{{playerWord}}}. Letra: {{{letter}}}.`,
});

const validatePlayerWordFlow = ai.defineFlow(
  {
    name: 'validatePlayerWordFlow',
    inputSchema: ValidatePlayerWordInputSchema,
    outputSchema: ValidatePlayerWordOutputSchema,
  },
  async input => {
    if (input.playerWord.trim() === "") {
      console.warn(`validatePlayerWordFlow: Palabra vacía recibida para letra "${input.letter}", categoría "${input.category}". No válida.`);
      return { isValid: false };
    }
    if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`validatePlayerWordFlow: Palabra "${input.playerWord}" no comienza con la letra "${input.letter}" (verificación previa al LLM). No válida.`);
        return { isValid: false };
    }
    
    const {output, response: rawLLMResponse} = await prompt(input);

    console.log(`validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object: ${JSON.stringify(output)}`);

    if (output && typeof output.isValid === 'boolean') {
      return output;
    }
    
    let llmResponseText = "Unavailable";
    try {
      llmResponseText = await rawLLMResponse.text() || "Empty LLM response text";
      console.warn(`validatePlayerWordFlow: LLM structured output was not as expected for input ${JSON.stringify(input)}. Raw text: "${llmResponseText}"`);
      
      const jsonMatch = llmResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch && jsonMatch[0]) {
        const potentialJson = jsonMatch[0];
        try {
          const parsedText = JSON.parse(potentialJson);
          if (typeof parsedText.isValid === 'boolean') {
            console.warn(`validatePlayerWordFlow: Successfully parsed JSON from raw text: ${potentialJson} for input ${JSON.stringify(input)}`);
            return { isValid: parsedText.isValid };
          } else {
            console.error(`validatePlayerWordFlow: Parsed JSON from raw text, but 'isValid' is not a boolean: ${potentialJson} for input ${JSON.stringify(input)}`);
          }
        } catch (parseError) {
          console.error(`validatePlayerWordFlow: Failed to parse JSON from raw text: "${potentialJson}" for input ${JSON.stringify(input)}. Parse error:`, parseError);
        }
      } else {
         console.error(`validatePlayerWordFlow: No JSON object found in raw LLM text: "${llmResponseText}" for input ${JSON.stringify(input)}`);
      }
    } catch (fetchTextError) {
      llmResponseText = "Error fetching LLM response text";
      console.error(`validatePlayerWordFlow: Error fetching raw LLM response text for input ${JSON.stringify(input)}. Error:`, fetchTextError);
    }
    
    console.error(`validatePlayerWordFlow: All attempts to get a valid boolean for 'isValid' failed. Defaulting to false. Input: ${JSON.stringify(input)}, LLM Raw Output: ${JSON.stringify(output)}, LLM Raw Text: "${llmResponseText}"`);
    return { isValid: false };
  }
);

