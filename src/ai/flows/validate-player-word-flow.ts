
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

const currentPromptText = `Eres un juez experto para el juego "Stop" (también conocido como Tutti Frutti o Basta) jugado en español.
Tu tarea específica es determinar si la palabra '{{{playerWord}}}' es una entrada válida para la letra '{{{letter}}}'.

Reglas a seguir ESTRICTAMENTE:
1.  La palabra DEBE comenzar con la letra '{{{letter}}}' (ignora mayúsculas/minúsculas).
2.  La palabra '{{{playerWord}}}' DEBE ser una palabra española real, comúnmente conocida y correctamente escrita, O un nombre propio común en español (ejemplos: 'Paco', 'París', 'Zaragoza', 'Zorro', 'Irene', 'Sofía'). No debe ser una palabra inventada, un error tipográfico, una cadena aleatoria de letras o una palabra de otro idioma (a menos que sea un préstamo muy común en español como 'hobby' o 'sándwich').
3.  La palabra NO debe estar vacía ni consistir solo en espacios en blanco.

Palabra del jugador: '{{{playerWord}}}'
Letra requerida: '{{{letter}}}'

Considerando SOLO las reglas 1, 2 y 3, ¿es válida la palabra del jugador?
Responde con un objeto JSON en el formato {"isValid": true} si TODAS las reglas se cumplen.
Responde con un objeto JSON en el formato {"isValid": false} si ALGUNA regla no se cumple.
TU RESPUESTA COMPLETA DEBE SER ÚNICAMENTE EL OBJETO JSON. SIN TEXTO ADICIONAL NI MARKDOWN.
`;

const prompt = ai.definePrompt({
  name: 'validatePlayerWordPromptJSON',
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: LLMResponseSchema},
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

    if (input.playerWord.trim() === "") {
      console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra vacía recibida. Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
      return { isValid: false };
    }
    if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`[${timestamp}] validatePlayerWordFlow (pre-LLM check): Palabra "${input.playerWord}" no comienza con la letra "${input.letter}". Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
        return { isValid: false };
    }
    
    console.log(`[${timestamp}] validatePlayerWordFlow: Input para LLM: ${JSON.stringify(input)}`);
    console.log(`[${timestamp}] validatePlayerWordFlow: Usando prompt (esperando JSON {"isValid": boolean}): "${currentPromptText.substring(0,300)}..."`);
    
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
        const markdownMatch = rawResponseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
          jsonText = markdownMatch[1];
          console.warn(`[${timestamp}] validatePlayerWordFlow: Se extrajo JSON de bloque markdown: "${jsonText}"`);
        } else {
          const firstBrace = rawResponseText.indexOf('{');
          const lastBrace = rawResponseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonText = rawResponseText.substring(firstBrace, lastBrace + 1);
            console.warn(`[${timestamp}] validatePlayerWordFlow: Se extrajo contenido entre llaves: "${jsonText}"`);
          } else {
            console.warn(`[${timestamp}] validatePlayerWordFlow: No se encontró un bloque markdown JSON claro ni un objeto JSON entre llaves en el texto crudo: "${rawResponseText}"`);
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
