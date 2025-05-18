
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
  name: 'validatePlayerWordPromptJSON_vMinimal',
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: LLMResponseSchema}, // Espera { isValid: boolean }
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
    
    let rawResponseText = "LLM_TEXT_UNAVAILABLE";
    try {
      rawResponseText = (await rawLLMResponse.text()) || "Empty LLM response text";
    } catch (e: any) {
      console.error(`[${timestamp}] validatePlayerWordFlow: Error fetching raw text from LLM response for input ${JSON.stringify(input)}:`, e.message || e);
    }
    console.log(`[${timestamp}] validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}, Raw LLM Response Text: "${rawResponseText}"`);

    if (output && typeof output.isValid === 'boolean') {
      console.log(`[${timestamp}] validatePlayerWordFlow: LLM devolvió JSON válido (vía schema). Palabra: "${input.playerWord}", Letra: "${input.letter}". Resultado: {isValid: ${output.isValid}}.`);
      return { isValid: output.isValid };
    } else {
        console.warn(`[${timestamp}] validatePlayerWordFlow: LLM structured output (output.isValid) no fue un booleano o 'output' fue nulo. Raw output object: ${JSON.stringify(output)}. Raw text: "${rawResponseText}". Se intentará parsear manualmente desde texto crudo.`);
    }
      
    if (rawResponseText && rawResponseText !== "LLM_TEXT_UNAVAILABLE" && rawResponseText !== "Empty LLM response text") {
      try {
        let jsonText = rawResponseText;
        // Primero, intentar encontrar ```json ... ```
        const markdownMatch = rawResponseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
          jsonText = markdownMatch[1];
          console.warn(`[${timestamp}] validatePlayerWordFlow: Se extrajo JSON de bloque markdown: "${jsonText}"`);
        } else {
          // Si no, intentar encontrar el primer { y el último }
          const firstBrace = rawResponseText.indexOf('{');
          const lastBrace = rawResponseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonText = rawResponseText.substring(firstBrace, lastBrace + 1);
            console.warn(`[${timestamp}] validatePlayerWordFlow: Se extrajo contenido entre llaves: "${jsonText}"`);
          } else {
            console.warn(`[${timestamp}] validatePlayerWordFlow: No se encontró un bloque markdown JSON claro ni un objeto JSON entre llaves en el texto crudo: "${rawResponseText}". No se pudo parsear.`);
            // No se pudo extraer un JSON probable
            throw new Error("No clear JSON found in raw text");
          }
        }

        const parsedJson = JSON.parse(jsonText);
        if (typeof parsedJson.isValid === 'boolean') {
          console.warn(`[${timestamp}] validatePlayerWordFlow: Parseado JSON manualmente desde texto crudo. Resultado: {isValid: ${parsedJson.isValid}}.`);
          return { isValid: parsedJson.isValid };
        } else {
          console.error(`[${timestamp}] validatePlayerWordFlow: JSON parseado manualmente no contenía 'isValid' booleano. JSON parseado: ${JSON.stringify(parsedJson)}`);
        }
      } catch (e: any) {
        console.error(`[${timestamp}] validatePlayerWordFlow: Error al parsear JSON extraído manualmente del texto crudo "${rawResponseText}". Error: ${e.message || e}`);
      }
    }
    
    console.error(`[${timestamp}] validatePlayerWordFlow: TODOS LOS INTENTOS DE OBTENER UN BOOLEANO 'isValid' HAN FALLADO. Por favor, revisa el "Raw LLM Response Text" logueado arriba. Defaulting to {isValid: false}. Palabra: "${input.playerWord}", Letra: "${input.letter}".`);
    return { isValid: false };
  }
);
