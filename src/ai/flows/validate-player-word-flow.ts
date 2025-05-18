
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

// Este es el tipo de salida que GamePage espera. El flujo interno manejará la conversión.
// REMOVED 'export' from the Zod schema object below
const ValidatePlayerWordOutputSchema = z.object({
  isValid: z.boolean().describe('True si la palabra es válida, bien escrita y comienza con la letra especificada; false en caso contrario.'),
});
export type ValidatePlayerWordOutput = z.infer<typeof ValidatePlayerWordOutputSchema>;

// Nuevo esquema de salida que el *prompt* espera del LLM (texto plano)
const PlainTextValidationOutputSchema = z.object({
  validationStatus: z.string().describe("Una sola palabra: 'VALIDO' o 'INVALIDO'."),
});

export async function validatePlayerWord(input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> {
  return validatePlayerWordFlow(input);
}

const currentPromptText = `Analiza la siguiente palabra en español para el juego "Stop".
Palabra: "{{{playerWord}}}"
Debe comenzar con la letra: "{{{letter}}}" (ignora mayúsculas/minúsculas)

Reglas para ser válida:
1. La palabra DEBE comenzar con la letra "{{{letter}}}".
2. La palabra DEBE ser una palabra española real, comúnmente conocida y correctamente escrita, O un nombre propio común en español (ejemplos: Paco, París, Zorro, Irene, Sofía). No debe ser una palabra inventada, un error tipográfico, o una palabra de otro idioma (a menos que sea un préstamo muy común en español como 'hobby').
3. La palabra NO debe estar vacía.

Considerando TODAS las reglas, ¿es válida la palabra?
RESPONDE CON UNA SOLA PALABRA: VALIDO o INVALIDO.
NO uses JSON. NO uses markdown. NO añadas ningún otro texto. Solo la palabra VALIDO o INVALIDO.`;

const prompt = ai.definePrompt({
  name: 'validatePlayerWordPromptPlainText', // Nombre diferente para evitar conflictos si se cachea
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: PlainTextValidationOutputSchema}, // Usar el nuevo esquema para el prompt
  prompt: currentPromptText,
});

const validatePlayerWordFlow = ai.defineFlow(
  {
    name: 'validatePlayerWordFlow',
    inputSchema: ValidatePlayerWordInputSchema,
    outputSchema: ValidatePlayerWordOutputSchema, // El flujo aún expone el schema original
  },
  async (input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] validatePlayerWordFlow: Iniciando validación para input: ${JSON.stringify(input)}`);

    if (input.playerWord.trim() === "") {
      console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra vacía recibida. Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
      return { isValid: false };
    }
    if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra "${input.playerWord}" no comienza con la letra "${input.letter}". Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
        return { isValid: false };
    }
    
    console.log(`[${timestamp}] validatePlayerWordFlow: Input para LLM: ${JSON.stringify(input)}`);
    console.log(`[${timestamp}] validatePlayerWordFlow: Usando prompt (esperando VALIDO/INVALIDO): "${currentPromptText.substring(0,300)}..."`);
    
    const {output, response: rawLLMResponse} = await prompt(input);
    
    let llmResponseTextForLogging = "LLM_TEXT_UNAVAILABLE";
    try {
      llmResponseTextForLogging = (await rawLLMResponse.text()) || "Empty LLM response text";
    } catch (e: any)
{
      console.error(`[${timestamp}] validatePlayerWordFlow: Error fetching raw text from LLM response for input ${JSON.stringify(input)}:`, e.message || e);
    }
    console.log(`[${timestamp}] validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Structured Output (Genkit schema expecting validationStatus string): ${JSON.stringify(output)}, Raw LLM Response Text: "${llmResponseTextForLogging}"`);

    // Prioritize the structured output if available and valid
    if (output && typeof output.validationStatus === 'string') {
      const status = output.validationStatus.trim().toUpperCase();
      if (status === "VALIDO") {
        console.log(`[${timestamp}] validatePlayerWordFlow: LLM devolvió "VALIDO" (vía schema). Palabra: "${input.playerWord}", Letra: "${input.letter}". Mapeando a {isValid: true}.`);
        return { isValid: true };
      } else if (status === "INVALIDO") {
        console.log(`[${timestamp}] validatePlayerWordFlow: LLM devolvió "INVALIDO" (vía schema). Palabra: "${input.playerWord}", Letra: "${input.letter}". Mapeando a {isValid: false}.`);
        return { isValid: false };
      } else {
        // The schema parsed, but the string wasn't VALIDO or INVALIDO. Log it and try raw text.
        console.warn(`[${timestamp}] validatePlayerWordFlow: LLM devolvió un estado inesperado por schema: "${output.validationStatus}". Respuesta cruda: "${llmResponseTextForLogging}". Se intentará parsear texto crudo.`);
        // Continue to try parsing raw text
      }
    } else {
        // Schema parsing failed or output.validationStatus wasn't a string.
        console.warn(`[${timestamp}] validatePlayerWordFlow: LLM structured output (output.validationStatus) no fue un string o 'output' fue nulo. Respuesta cruda: "${llmResponseTextForLogging}". Se intentará parsear texto crudo.`);
    }
      
    // Fallback: attempt to interpret the raw LLM text directly if schema parsing failed or gave unexpected content
    if (llmResponseTextForLogging && llmResponseTextForLogging !== "LLM_TEXT_UNAVAILABLE" && llmResponseTextForLogging !== "Empty LLM response text") {
      const rawTextUpper = llmResponseTextForLogging.trim().toUpperCase();
      if (rawTextUpper === "VALIDO") {
          console.warn(`[${timestamp}] validatePlayerWordFlow: Parseado "VALIDO" directamente desde texto crudo: "${llmResponseTextForLogging}". Mapeando a {isValid: true}.`);
          return { isValid: true };
      } else if (rawTextUpper === "INVALIDO") {
          console.warn(`[${timestamp}] validatePlayerWordFlow: Parseado "INVALIDO" directamente desde texto crudo: "${llmResponseTextForLogging}". Mapeando a {isValid: false}.`);
          return { isValid: false };
      } else {
          // Raw text was something else entirely
          console.warn(`[${timestamp}] validatePlayerWordFlow: Texto crudo ("${llmResponseTextForLogging}") no es ni "VALIDO" ni "INVALIDO".`);
      }
    }
    
    // If all attempts failed
    console.error(`[${timestamp}] validatePlayerWordFlow: TODOS LOS INTENTOS DE OBTENER VALIDO/INVALIDO HAN FALLADO. Por favor, revisa el "Raw LLM Response Text" logueado arriba para ver qué está devolviendo la IA. Defaulting to {isValid: false}. Palabra: "${input.playerWord}", Letra: "${input.letter}".`);
    return { isValid: false }; // Default to false if all parsing fails
  }
);

    