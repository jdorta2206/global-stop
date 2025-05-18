
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
  category: z.string().describe('La categoría para la ronda actual (aunque la validación de la palabra debe ser general).'),
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
  prompt: `You are an expert judge for the game "Stop" (also known as Tutti Frutti) played in Spanish.
Your specific task is to determine if the player's word '{{{playerWord}}}' is a valid entry for the letter '{{{letter}}}'.

Follow these rules STRICTLY:
1.  The word MUST begin with the letter '{{{letter}}}' (ignore case).
2.  The word '{{{playerWord}}}' MUST be a real, commonly known, and correctly spelled Spanish word or a common Spanish proper name (like 'Paco', 'París'). It should not be an invented word, a typo, a random string of letters, or a word from another language unless it's a very common loanword in Spanish.
3.  The word must NOT be empty or consist only of whitespace.

Player's word: '{{{playerWord}}}'
Required letter: '{{{letter}}}'

Based ONLY on these rules, is the player's word valid?
Respond with a JSON object in the format {"isValid": true} if ALL rules are met.
Respond with a JSON object in the format {"isValid": false} if ANY rule is not met.
DO NOT include any other text, explanation, or markdown. YOUR ENTIRE RESPONSE MUST BE ONLY THE JSON OBJECT.`,
});

const validatePlayerWordFlow = ai.defineFlow(
  {
    name: 'validatePlayerWordFlow',
    inputSchema: ValidatePlayerWordInputSchema,
    outputSchema: ValidatePlayerWordOutputSchema,
  },
  async input => {
    // Pre-validación en el flujo (defensiva)
    if (input.playerWord.trim() === "") {
      console.warn(`validatePlayerWordFlow (pre-LLM check): Palabra vacía recibida para letra "${input.letter}", categoría "${input.category}". No válida.`);
      return { isValid: false };
    }
    if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`validatePlayerWordFlow (pre-LLM check): Palabra "${input.playerWord}" no comienza con la letra "${input.letter}". No válida.`);
        return { isValid: false };
    }
    
    const {output, response: rawLLMResponse} = await prompt(input);

    console.log(`validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}`);

    if (output && typeof output.isValid === 'boolean') {
      // Happy path: Genkit successfully parsed the output according to the schema
      console.log(`validatePlayerWordFlow: Successfully validated via schema. Word: "${input.playerWord}", Letter: "${input.letter}", Category: "${input.category}", isValid: ${output.isValid}`);
      return output;
    }
    
    // Attempt to parse from raw text if structured output (schema parsing) failed or was incomplete
    let llmResponseText = "Unavailable";
    try {
      llmResponseText = await rawLLMResponse.text() || "Empty LLM response text";
      console.warn(`validatePlayerWordFlow: LLM structured output was not as expected or 'isValid' was not a boolean. Input: ${JSON.stringify(input)}. Attempting to parse from raw text: "${llmResponseText}"`);
      
      const jsonMatch = llmResponseText.match(/\{\s*"isValid"\s*:\s*(true|false)\s*\}/);
      if (jsonMatch && jsonMatch[0]) {
        const potentialJson = jsonMatch[0];
        try {
          const parsedText = JSON.parse(potentialJson);
          // Double check 'isValid' is a boolean, even though regex matched true/false
          if (typeof parsedText.isValid === 'boolean') {
            console.warn(`validatePlayerWordFlow: Successfully parsed JSON from raw text: ${potentialJson}. Word: "${input.playerWord}", Letter: "${input.letter}", isValid: ${parsedText.isValid}`);
            return { isValid: parsedText.isValid }; 
          } else {
            // This case should be rare given the regex, but good to have a guard
            console.error(`validatePlayerWordFlow: Parsed JSON from raw text, but 'isValid' is not a boolean after all: ${potentialJson}. Input: ${JSON.stringify(input)}`);
          }
        } catch (parseError) {
          console.error(`validatePlayerWordFlow: Failed to parse JSON extracted from raw text: "${potentialJson}". Input: ${JSON.stringify(input)}. Parse error:`, parseError);
        }
      } else {
         console.error(`validatePlayerWordFlow: No valid JSON object ({"isValid": true/false}) found in raw LLM text: "${llmResponseText}". Input: ${JSON.stringify(input)}`);
      }
    } catch (fetchTextError) {
      llmResponseText = "Error fetching LLM response text";
      console.error(`validatePlayerWordFlow: Error fetching raw LLM response text for input ${JSON.stringify(input)}. Error:`, fetchTextError);
    }
    
    console.error(`validatePlayerWordFlow: All attempts to get a valid boolean for 'isValid' failed. Defaulting to false. Word: "${input.playerWord}", Letter: "${input.letter}", Category: "${input.category}". LLM Raw Output Object: ${JSON.stringify(output)}, LLM Raw Text: "${llmResponseText}"`);
    return { isValid: false }; // Default to false if all else fails
  }
);

