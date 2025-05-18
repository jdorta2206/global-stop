
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
  language: z.custom<Language>().describe('El idioma de la palabra a validar (es, en, fr, pt).'), // Add language
});
export type ValidatePlayerWordInput = z.infer<typeof ValidatePlayerWordInputSchema>;

const ValidatePlayerWordOutputSchema = z.object({
  isValid: z.boolean().describe('True si la palabra es válida, bien escrita y comienza con la letra especificada; false en caso contrario.'),
});
export type ValidatePlayerWordOutput = z.infer<typeof ValidatePlayerWordOutputSchema>;

const LLMResponseSchema = z.object({
    isValid: z.string().describe("Un string: 'true' si la palabra es válida, 'false' en caso contrario."),
});

export async function validatePlayerWord(input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> {
  return validatePlayerWordFlow(input);
}

// Updated prompt to include language
const currentPromptText = `Word: "{{{playerWord}}}"
Letter: "{{{letter}}}"
Language: "{{{language}}}"
Is the word "{{{playerWord}}}" a real, correctly-spelled word in {{{language}}} OR a common proper name in {{{language}}} that starts with the letter "{{{letter}}}" (case-insensitive)?
Examples: 
- If language is "es", letter "P", word "Paco" -> {"isValid": "true"}
- If language is "en", letter "A", word "Apple" -> {"isValid": "true"}
- If language is "fr", letter "C", word "Chien" -> {"isValid": "true"}
- If language is "pt", letter "B", word "Brasil" -> {"isValid": "true"}
- If word is "Xyzzy" (invented) -> {"isValid": "false"}

Answer ONLY with JSON: {"isValid": "true"} or {"isValid": "false"}. (Important: "true" or "false" as STRINGS).
NO OTHER TEXT. NO MARKDOWN. JUST JSON.`;

const prompt = ai.definePrompt({
  name: 'validatePlayerWordPromptJSON_vMinimal_Strict_MultiLang',
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: LLMResponseSchema}, 
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
    console.log(`[${timestamp}] validatePlayerWordFlow: Usando prompt (esperando JSON {"isValid": "string"}): "${currentPromptText.substring(0,300)}..."`);

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

    if (output && typeof output.isValid === 'string') {
      const isValidString = output.isValid.trim().toLowerCase();
      if (isValidString === 'true') {
        console.log(`[${timestamp}] validatePlayerWordFlow: LLM devolvió JSON válido (vía schema Genkit) y output.isValid es "true". Palabra: "${input.playerWord}". Resultado: {isValid: true}.`);
        return { isValid: true };
      } else if (isValidString === 'false') {
        console.log(`[${timestamp}] validatePlayerWordFlow: LLM devolvió JSON válido (vía schema Genkit) y output.isValid es "false". Palabra: "${input.playerWord}". Resultado: {isValid: false}.`);
        return { isValid: false };
      } else {
        console.error(`[${timestamp}] validatePlayerWordFlow: LLM devolvió JSON válido (vía schema Genkit) pero output.isValid ("${output.isValid}") no es "true" ni "false". Raw text: "${rawResponseTextForLogging}". Defaulting to {isValid: false}.`);
        // Attempt manual parse from raw text if specific format expected
        if (rawResponseTextForLogging.includes('"isValid": "true"')) return { isValid: true };
        if (rawResponseTextForLogging.includes('"isValid": "false"')) return { isValid: false };
        return { isValid: false };
      }
    } else {
        console.error(`[${timestamp}] validatePlayerWordFlow: LLM structured output (output.isValid) no fue un string, o 'output' fue nulo/inválido según el schema de Genkit. LLM no cumplió el formato JSON esperado ({"isValid":"string"}). Raw output object from Genkit: ${JSON.stringify(output)}. Raw text from LLM: "${rawResponseTextForLogging}". Defaulting to {isValid: false}.`);
        // Attempt manual parse from raw text
        if (rawResponseTextForLogging.includes('"isValid": "true"')) return { isValid: true };
        if (rawResponseTextForLogging.includes('"isValid": "false"')) return { isValid: false };
        return { isValid: false };
    }
  }
);
