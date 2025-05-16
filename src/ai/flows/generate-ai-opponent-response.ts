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

const AiOpponentResponseOutputSchema = z.object({
  response: z.string().describe('La respuesta del oponente IA para la letra y categoría dadas.'),
});
export type AiOpponentResponseOutput = z.infer<typeof AiOpponentResponseOutputSchema>;

export async function generateAiOpponentResponse(input: AiOpponentResponseInput): Promise<AiOpponentResponseOutput> {
  return generateAiOpponentResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiOpponentResponsePrompt',
  input: {schema: AiOpponentResponseInputSchema},
  output: {schema: AiOpponentResponseOutputSchema},
  prompt: `Eres un oponente de IA jugando al juego Stop (también conocido como Tutti Frutti, Lápiz Quieto o Basta). Tu tarea es generar una respuesta plausible y relevante para la letra y categoría dadas. La palabra DEBE comenzar con la letra "{{{letter}}}". La categoría es "{{{category}}}". Genera solo la palabra. No incluyas información adicional ni explicaciones. Si no puedes generar una palabra válida que comience con la letra especificada para la categoría, responde con una cadena vacía.`,
});

const generateAiOpponentResponseFlow = ai.defineFlow(
  {
    name: 'generateAiOpponentResponseFlow',
    inputSchema: AiOpponentResponseInputSchema,
    outputSchema: AiOpponentResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
