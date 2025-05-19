
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

// Schema for the expected output from the LLM
const LLMValidationOutputSchema = z.object({
    isValid: z.boolean().describe("True si la palabra es válida, false en caso contrario."),
});

// Schema for the final output of this flow
const ValidatePlayerWordOutputSchema = z.object({
  isValid: z.boolean().describe('True si la palabra es válida, bien escrita y comienza con la letra especificada; false en caso contrario.'),
});
export type ValidatePlayerWordOutput = z.infer<typeof ValidatePlayerWordOutputSchema>;

export async function validatePlayerWord(input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> {
  const timestamp = new Date().toISOString();
  try {
    return await validatePlayerWordFlow(input);
  } catch (e: any) {
    console.error(`[${timestamp}] validatePlayerWord (EXPORTED FUNCTION): CRITICAL ERROR invoking flow for input ${JSON.stringify(input)}. Error:`, e.message || e, e.stack);
    return { isValid: false }; // Return a valid default response
  }
}

const currentPromptText = `You are an expert judge for the game "Stop" (also known as Tutti Frutti).
Your specific task is to determine if the player's word '{{{playerWord}}}' is a valid entry for the letter '{{{letter}}}' in the language '{{{language}}}'.

Follow these rules STRICTLY:
1. The word MUST begin with the letter '{{{letter}}}' (ignore case).
2. The word '{{{playerWord}}}' MUST be a real, commonly known, and correctly spelled word in {{{language}}} OR a common proper name in {{{language}}} (like 'Paco', 'París', 'John', 'London', 'Zorro', 'Irene', 'Sofia'). It should not be an invented word, a typo, a random string of letters, or a word from another language unless it's a very common loanword in {{{language}}}.
3. The word must NOT be empty or consist only of whitespace.

Player's word: '{{{playerWord}}}'
Required letter: '{{{letter}}}'
Language: '{{{language}}}'

Based ONLY on these rules, is the player's word valid?
Respond with a JSON object in the format {"isValid": true} if ALL rules are met.
Respond with a JSON object in the format {"isValid": false} if ANY rule is not met.
DO NOT include any other text, explanation, or markdown. YOUR ENTIRE RESPONSE MUST BE ONLY THE JSON OBJECT.
Example for a valid word like "Paco" for letter "P" in language "es": {"isValid": true}
Example for an invalid word like "Xyzzy" for letter "X" in language "en": {"isValid": false}
`;

const prompt = ai.definePrompt({
  name: 'validatePlayerWordPromptJSON_vMinimal_Strict_MultiLang_v3',
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: LLMValidationOutputSchema}, // Expecting {isValid: boolean}
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
    try {
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

      const llmResponse = await prompt(input);
      const output = llmResponse.output; // Access the structured output

      let rawResponseTextForLogging = "LLM_TEXT_UNAVAILABLE";
      try {
        rawResponseTextForLogging = (await llmResponse.text()) || "Empty LLM response text";
      } catch (e: any) {
        console.error(`[${timestamp}] validatePlayerWordFlow: Error fetching raw text from LLM response for input ${JSON.stringify(input)}:`, e.message || e);
      }
      console.log(`[${timestamp}] validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}, Raw LLM Response Text: "${rawResponseTextForLogging}"`);

      if (output && typeof output.isValid === 'boolean') {
        console.log(`[${timestamp}] validatePlayerWordFlow: LLM devolvió JSON válido (vía schema Genkit) y output.isValid es un booleano. Palabra: "${input.playerWord}". Resultado: {isValid: ${output.isValid}}.`);
        return { isValid: output.isValid };
      } else {
        // Attempt to parse from raw text if structured output is not as expected
        console.warn(`[${timestamp}] validatePlayerWordFlow: LLM structured output (output.isValid) no fue un booleano, o 'output' fue nulo/inválido según el schema de Genkit. LLM no cumplió el formato JSON esperado ({"isValid":boolean}). Raw output object from Genkit: ${JSON.stringify(output)}. Raw text from LLM: "${rawResponseTextForLogging}". Intentando parseo manual de JSON.`);
        
        // Regex to find a JSON object that looks like {"isValid": true/false}
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
      return { isValid: false }; // Ensure a valid output is always returned
    }
  }
);
