
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
import type { Language } from '@/contexts/language-context'; // Import Language type

const ValidatePlayerWordInputSchema = z.object({
  letter: z.string().describe('La letra para la ronda actual.'),
  category: z.string().describe('La categoría para la ronda actual (informativo, la validación debe ser general).'),
  playerWord: z.string().describe('La palabra ingresada por el jugador.'),
  language: z.custom<Language>().describe('El idioma de la palabra a validar (es, en, fr, pt).'),
});
export type ValidatePlayerWordInput = z.infer<typeof ValidatePlayerWordInputSchema>;

// Schema for the expected output from the LLM when using JSON mode
const LLMValidationOutputSchema = z.object({
    isValid: z.boolean().describe("True si la palabra es válida, false en caso contrario."),
});

// This is the actual output type of the EXPORTED validatePlayerWord function.
export type ValidatePlayerWordOutput = z.infer<typeof LLMValidationOutputSchema>;


export async function validatePlayerWord(input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] validatePlayerWord (EXPORTED FUNCTION): Invoking flow for input: ${JSON.stringify(input)}`);
    return await validatePlayerWordFlow(input);
  } catch (e: any) {
    console.error(`[${timestamp}] validatePlayerWord (EXPORTED FUNCTION): CRITICAL ERROR invoking flow for input ${JSON.stringify(input)}. Error:`, e.message || e, e.stack, ". ENSURE GOOGLE_API_KEY is correctly set in your server environment and check server logs for more details, including any preceding errors from Genkit or Google AI services.");
    return { isValid: false }; // Return a valid default response
  }
}

const currentPromptText = `Eres un juez experto para el juego "Stop" (también conocido como Tutti Frutti o Basta).
Your specific task is to determine if the word '{{{playerWord}}}' is a valid entry for the letter '{{{letter}}}' in the language '{{{language}}}'.

Rules to follow STRICTLY:
1. The word MUST start with the letter '{{{letter}}}' (case-insensitive).
2. The word '{{{playerWord}}}' MUST be a real, commonly known, correctly spelled {{{language}}} word, OR a common proper noun in {{{language}}} (examples for 'es': Paco, París, Zorro, Irene, Sofía; examples for 'en': John, London, Fox, Irene, Sophia). It must not be a made-up word, a typo, a random string of letters, or a word from another language (unless it's a very common loanword in {{{language}}} like 'hobby' or 'sandwich').
3.  La palabra NO debe estar vacía ni consistir solo en espacios en blanco.

Palabra del jugador: '{{{playerWord}}}'
Letra requerida: '{{{letter}}}'
Idioma: '{{{language}}}'

Considerando SOLO las reglas 1, 2 y 3, ¿es válida la palabra del jugador?
Responde con un objeto JSON en el formato {"isValid": true} si TODAS las reglas se cumplen.
Responde con un objeto JSON en el formato {"isValid": false} si ALGUNA regla no se cumple.
TU RESPUESTA COMPLETA DEBE SER ÚNICAMENTE EL OBJETO JSON. SIN TEXTO ADICIONAL NI MARKDOWN.
Ejemplo para 'Paco', letra 'P', idioma 'es': {"isValid": true}
Ejemplo para 'Xyzzy', letra 'X', idioma 'en': {"isValid": false}
`;


const prompt = ai.definePrompt({
  name: 'validatePlayerWordPromptJSON_vRestored', // New name
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: LLMValidationOutputSchema},
  prompt: currentPromptText,
  config: { temperature: 0.2 },
});

const validatePlayerWordFlow = ai.defineFlow(
  {
    name: 'validatePlayerWordFlow',
    inputSchema: ValidatePlayerWordInputSchema,
    outputSchema: LLMValidationOutputSchema, // Flow output schema is the same as LLM output
  },
  async (input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> => {
    const timestamp = new Date().toISOString();
    try {
      console.log(`[${timestamp}] validatePlayerWordFlow: Iniciando validación para input: ${JSON.stringify(input)}`);
      console.log(`[${timestamp}] validatePlayerWordFlow: Usando prompt (esperando JSON {"isValid": boolean}): "${currentPromptText.substring(0,300)}..."`);

      if (!input.playerWord || input.playerWord.trim() === "") {
        console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra vacía recibida. Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
        return { isValid: false };
      }
      if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
          console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra "${input.playerWord}" no comienza con la letra "${input.letter}". Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
          return { isValid: false };
      }

      const llmResponse = await prompt(input);
      const output = llmResponse.output;

      let rawResponseTextForLogging = "LLM_TEXT_UNAVAILABLE";
      try {
        rawResponseTextForLogging = llmResponse.text || "Empty LLM response text"; // Corrected: .text is a property
      } catch (e: any) {
        console.error(`[${timestamp}] validatePlayerWordFlow: Error fetching raw text from LLM response for input ${JSON.stringify(input)}:`, e.message || e);
      }
      console.log(`[${timestamp}] validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}, Raw LLM Response Text: "${rawResponseTextForLogging}"`);

      if (output && typeof output.isValid === 'boolean') {
        console.log(`[${timestamp}] validatePlayerWordFlow: LLM devolvió JSON válido (vía schema Genkit) y output.isValid es un booleano. Palabra: "${input.playerWord}". Resultado: {isValid: ${output.isValid}}.`);
        return { isValid: output.isValid };
      } else {
        console.warn(`[${timestamp}] validatePlayerWordFlow: LLM structured output (output.isValid) no fue un booleano, o 'output' fue nulo/inválido según el schema de Genkit. LLM no cumplió el formato JSON esperado ({"isValid":boolean}). Raw output object from Genkit: ${JSON.stringify(output)}. Raw text from LLM: "${rawResponseTextForLogging}". Intentando parseo manual de JSON.`);

        const jsonRegex = /\{\s*"isValid"\s*:\s*(true|false)\s*\}/;
        const match = rawResponseTextForLogging.match(jsonRegex);

        if (match && match[0]) {
          try {
            const parsedJson = JSON.parse(match[0]);
            if (typeof parsedJson.isValid === 'boolean') {
              console.warn(`[${timestamp}] validatePlayerWordFlow: Fallback: Encontrado y parseado JSON válido ("${match[0]}") en texto crudo. Retornando {isValid: ${parsedJson.isValid}}.`);
              return { isValid: parsedJson.isValid };
            } else {
               console.error(`[${timestamp}] validatePlayerWordFlow: Fallback: JSON parseado de texto crudo ("${match[0]}") no contiene 'isValid' como booleano. Defaulting to {isValid: false}.`);
            }
          } catch (parseError: any) {
            console.error(`[${timestamp}] validatePlayerWordFlow: Fallback: Error al parsear JSON extraído de texto crudo ("${match[0]}"). Error: ${parseError.message}. Defaulting to {isValid: false}.`);
          }
        } else {
          console.error(`[${timestamp}] validatePlayerWordFlow: Fallback: No se encontró un patrón JSON válido (ej. {"isValid": true/false}) en texto crudo: "${rawResponseTextForLogging}". Defaulting to {isValid: false}.`);
        }
        return { isValid: false };
      }
    } catch (error: any) {
      console.error(`[${timestamp}] validatePlayerWordFlow (INTERNAL FLOW): UNHANDLED EXCEPTION for input ${JSON.stringify(input)}. Error:`, error.message || error, error.stack);
      return { isValid: false };
    }
  }
);
