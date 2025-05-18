
'use server';

/**
 * @fileOverview Generador de respuestas para un oponente IA en el juego Global Stop.
 *
 * - generateAiOpponentResponse - Una función que genera la respuesta del oponente IA para una letra y categoría dadas.
 * - AiOpponentResponseInput - El tipo de entrada para la función generateAiOpponentResponse.
 * - AiOpponentResponseOutput - El tipo de retorno para la función generateAiOpponentResponse.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiOpponentResponseInputSchema = z.object({
  letter: z.string().describe('La letra para la ronda actual.'),
  category: z.string().describe('La categoría para la ronda actual.'),
});
export type AiOpponentResponseInput = z.infer<typeof AiOpponentResponseInputSchema>;

// El schema que el flujo expone (lo que GamePage espera)
const AiOpponentResponseOutputSchema = z.object({
  response: z.string().describe('La respuesta del oponente IA para la letra y categoría dadas.'),
});
export type AiOpponentResponseOutput = z.infer<typeof AiOpponentResponseOutputSchema>;


export async function generateAiOpponentResponse(input: AiOpponentResponseInput): Promise<AiOpponentResponseOutput> {
  return generateAiOpponentResponseFlow(input);
}

const currentPromptText = `Game: "Stop". Letter: "{{{letter}}}". Category: "{{{category}}}".
Task: ONE valid Spanish word for this category starting with "{{{letter}}}".
If no word, respond with an empty string.
ONLY the word or empty string. NO explanations.
The word MUST begin with the letter "{{{letter}}}".`;

const prompt = ai.definePrompt({
  name: 'generateAiOpponentResponsePrompt_vMinimalStrict', // Nombre actualizado
  input: {schema: AiOpponentResponseInputSchema},
  output: {schema: AiOpponentResponseOutputSchema}, // Espera { response: "palabra" }
  prompt: currentPromptText,
  config: { temperature: 0.2 },
});

const generateAiOpponentResponseFlow = ai.defineFlow(
  {
    name: 'generateAiOpponentResponseFlow',
    inputSchema: AiOpponentResponseInputSchema,
    outputSchema: AiOpponentResponseOutputSchema,
  },
  async input => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] generateAiOpponentResponseFlow: Iniciando generación para input: ${JSON.stringify(input)}`);
    console.log(`[${timestamp}] generateAiOpponentResponseFlow: Usando prompt (primeros 300 caracteres): "${currentPromptText.substring(0,300)}..."`);

    const {output, response: rawLLMResponse} = await prompt(input);

    let llmResponseTextForLogging = "LLM_TEXT_UNAVAILABLE";
    try {
      llmResponseTextForLogging = (await rawLLMResponse.text()) || "Empty LLM response text";
    } catch (e: any) {
      console.error(`[${timestamp}] generateAiOpponentResponseFlow: Error fetching raw text from LLM response for input ${JSON.stringify(input)}:`, e.message || e);
    }
    console.log(`[${timestamp}] generateAiOpponentResponseFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}, Raw LLM Response Text: "${llmResponseTextForLogging}"`);


    if (output && typeof output.response === 'string') {
      const structuredResponseTrimmed = output.response.trim();
      if (structuredResponseTrimmed !== "" && !structuredResponseTrimmed.toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`[${timestamp}] generateAiOpponentResponseFlow: AI response (structured by Genkit schema) "${structuredResponseTrimmed}" for letter "${input.letter}" in category "${input.category}" did not start with the correct letter. Correcting to empty string.`);
        return { response: "" };
      }
      // Si la respuesta estructurada está vacía pero el texto crudo no lo está, podríamos haber perdido la palabra. No devolver aquí todavía.
      if (structuredResponseTrimmed !== "") {
        console.log(`[${timestamp}] generateAiOpponentResponseFlow: Respuesta de IA generada (parseada por schema Genkit): "${structuredResponseTrimmed}"`);
        return { response: structuredResponseTrimmed };
      }
    } 
    
    // Fallback: Si output.response no es un string válido, o está vacío pero el texto crudo tiene contenido,
    // intentamos usar el texto crudo si es solo una palabra y cumple las condiciones.
    const rawTextTrimmed = llmResponseTextForLogging.trim();
    if (rawTextTrimmed && !rawTextTrimmed.includes(" ") && !rawTextTrimmed.includes("\n") && rawTextTrimmed.length < 30) { // Heurística: es una sola palabra?
        if (rawTextTrimmed.toLowerCase().startsWith(input.letter.toLowerCase())) {
            console.warn(`[${timestamp}] generateAiOpponentResponseFlow: LLM structured output (output.response) no fue válido o estaba vacío. Usando raw text "${rawTextTrimmed}" como respuesta de IA ya que parece una sola palabra válida.`);
            return { response: rawTextTrimmed };
        } else {
            console.warn(`[${timestamp}] generateAiOpponentResponseFlow: LLM structured output no fue válido o estaba vacío. Raw text "${rawTextTrimmed}" parece una palabra pero no empieza con la letra "${input.letter}". Defaulting to empty string.`);
            return { response: "" };
        }
    }
    
    console.error(`[${timestamp}] generateAiOpponentResponseFlow: LLM no devolvió 'output.response' string válido según schema Genkit, y el texto crudo no es una sola palabra usable (o el texto crudo también falló la validación de letra inicial). Input: ${JSON.stringify(input)}. Raw output object: ${JSON.stringify(output)}. Raw text: "${llmResponseTextForLogging}". Defaulting to empty string.`);
    return { response: "" };
  }
);
