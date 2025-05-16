'use server';

/**
 * @fileOverview An AI opponent response generator for the Global Stop game.
 *
 * - generateAiOpponentResponse - A function that generates the AI opponent's response for a given letter and category.
 * - AiOpponentResponseInput - The input type for the generateAiOpponentResponse function.
 * - AiOpponentResponseOutput - The return type for the generateAiOpponentResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiOpponentResponseInputSchema = z.object({
  letter: z.string().describe('The letter for the current round.'),
  category: z.string().describe('The category for the current round.'),
});
export type AiOpponentResponseInput = z.infer<typeof AiOpponentResponseInputSchema>;

const AiOpponentResponseOutputSchema = z.object({
  response: z.string().describe('The AI opponent\'s response for the given letter and category.'),
});
export type AiOpponentResponseOutput = z.infer<typeof AiOpponentResponseOutputSchema>;

export async function generateAiOpponentResponse(input: AiOpponentResponseInput): Promise<AiOpponentResponseOutput> {
  return generateAiOpponentResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiOpponentResponsePrompt',
  input: {schema: AiOpponentResponseInputSchema},
  output: {schema: AiOpponentResponseOutputSchema},
  prompt: `You are an AI opponent playing the game Stop. Your task is to generate a plausible and relevant response for the given letter and category. The letter is "{{{letter}}}" and the category is "{{{category}}}". Generate only the word. Do not include any additional information or explanations.`,
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
