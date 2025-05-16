
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
  prompt: `Evalúa la siguiente palabra del jugador para el juego "Stop".
Contexto:
- Letra: {{{letter}}}
- Categoría: {{{category}}}
- Palabra del Jugador: {{{playerWord}}}

Considera si la "Palabra del Jugador":
1. Es una palabra real y comúnmente aceptada en español.
2. Comienza con la "Letra" especificada (ignora mayúsculas/minúsculas).
3. No está vacía (la palabra ya debería haber sido pre-filtrada si está vacía antes de esta llamada, pero confírmalo).

Devuelve un objeto JSON con una única clave "isValid" (booleano).
Por ejemplo: {"isValid": true} o {"isValid": false}.
No te preocupes demasiado por si la palabra encaja perfectamente en la categoría; prioriza su validez como palabra y si comienza con la letra correcta.
Recuerda, la palabra del jugador que debes evaluar es: {{{playerWord}}}.`,
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
        return { isValid: false };
    }
    
    const {output, response: rawLLMResponse} = await prompt(input);
    if (output && typeof output.isValid === 'boolean') {
      return output;
    }
    
    // Log an error or return a default if output is not as expected
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

