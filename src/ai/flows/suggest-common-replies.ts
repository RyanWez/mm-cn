'use server';

/**
 * @fileOverview Suggests a common Chinese reply based on the translated Burmese input.
 *
 * - suggestCommonReplies - A function that suggests a common reply.
 * - SuggestCommonRepliesInput - The input type for the suggestCommonReplies function.
 * - SuggestCommonRepliesOutput - The return type for the suggestCommonReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCommonRepliesInputSchema = z.object({
  translatedText: z
    .string()
    .describe('The translated text to suggest replies for.'),
  language: z.string().describe('The language of the translated text (e.g., "Chinese" or "Burmese").'),
});
export type SuggestCommonRepliesInput = z.infer<typeof SuggestCommonRepliesInputSchema>;

const SuggestCommonRepliesOutputSchema = z.object({
  suggestedReplies: z
    .array(z.string())
    .describe('An array containing a single suggested improved reply.'),
});
export type SuggestCommonRepliesOutput = z.infer<typeof SuggestCommonRepliesOutputSchema>;

export async function suggestCommonReplies(
  input: SuggestCommonRepliesInput
): Promise<SuggestCommonRepliesOutput> {
  return suggestCommonRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCommonRepliesPrompt',
  input: {schema: SuggestCommonRepliesInputSchema},
  output: {schema: SuggestCommonRepliesOutputSchema},
  prompt: `You are a customer service AI assistant specializing in an online betting platform.
  Given the following translated text in {{language}}, suggest 1 improved or alternative phrase that is clearer, more polite, or more effective for customer communication.
  Provide ONLY the reply itself, as a JSON array of one string.

  Text: {{{translatedText}}}
  `,
});

const suggestCommonRepliesFlow = ai.defineFlow(
  {
    name: 'suggestCommonRepliesFlow',
    inputSchema: SuggestCommonRepliesInputSchema,
    outputSchema: SuggestCommonRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
