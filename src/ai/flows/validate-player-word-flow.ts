
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
  prompt: `Tu tarea es validar una palabra para el juego "Stop" en español.
La palabra a evaluar es: "{{{playerWord}}}"
La letra con la que DEBE comenzar es: "{{{letter}}}"

Considera los siguientes criterios para la palabra "{{{playerWord}}}":
1.  ¿Es "{{{playerWord}}}" una palabra o nombre propio comúnmente reconocido y correctamente escrito en español? (Por ejemplo, "Paco", "París", "pelota" son válidos. "Pxzqr" o una palabra claramente inventada no lo son).
2.  ¿Comienza "{{{playerWord}}}" con la letra "{{{letter}}}" (ignora mayúsculas/minúsculas)?
3.  ¿No es "{{{playerWord}}}" una cadena vacía o solo espacios?

Si TODOS estos criterios son VERDADEROS, la palabra es válida.
Si ALGUNO es FALSO, la palabra NO es válida.

La categoría "{{{category}}}" es solo para tu contexto general del juego, NO la uses como criterio principal para decidir la validez de la palabra en sí misma. Concéntrate en si es una palabra o nombre propio existente y bien escrito que empieza con la letra.

Responde ÚNICAMENTE con un objeto JSON con una clave "isValid" cuyo valor sea un booleano (true o false). No incluyas explicaciones adicionales.
Ejemplo si es válida: {"isValid": true}
Ejemplo si NO es válida: {"isValid": false}

Palabra a validar: {{{playerWord}}}. Letra inicial requerida: {{{letter}}}.`,
});

const validatePlayerWordFlow = ai.defineFlow(
  {
    name: 'validatePlayerWordFlow',
    inputSchema: ValidatePlayerWordInputSchema,
    outputSchema: ValidatePlayerWordOutputSchema,
  },
  async input => {
    // Si la palabra está vacía después de trim, no es válida.
    if (input.playerWord.trim() === "") {
      return { isValid: false };
    }
    // Verificación rápida de la letra inicial (la IA también lo hará, pero es bueno tenerlo aquí)
    if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`validatePlayerWordFlow: Palabra "${input.playerWord}" no comienza con la letra "${input.letter}" (verificación frontend).`);
        return { isValid: false };
    }
    
    const {output, response: rawLLMResponse} = await prompt(input);
    if (output && typeof output.isValid === 'boolean') {
      return output;
    }
    
    let llmResponseText = "Unavailable";
    try {
      llmResponseText = await rawLLMResponse.text() || "Empty LLM response text";
    } catch (e) {
      llmResponseText = "Error fetching LLM response text";
    }
    console.error(`validatePlayerWordFlow: LLM did not return valid output for input: ${JSON.stringify(input)}. Raw response text: ${llmResponseText}. Output object: ${JSON.stringify(output)}`);
    return { isValid: false }; // Default to not valid if LLM response is problematic
  }
);

