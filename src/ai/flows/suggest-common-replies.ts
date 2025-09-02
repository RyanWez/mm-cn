'use server';

/**
 * @fileOverview Suggests common Chinese replies based on the translated Burmese input.
 *
 * - suggestCommonReplies - A function that suggests common replies.
 * - SuggestCommonRepliesInput - The input type for the suggestCommonReplies function.
 * - SuggestCommonRepliesOutput - The return type for the suggestCommonReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCommonRepliesInputSchema = z.object({
  translatedBurmeseText: z
    .string()
    .describe('The translated Burmese text to suggest replies for.'),
});
export type SuggestCommonRepliesInput = z.infer<typeof SuggestCommonRepliesInputSchema>;

const SuggestCommonRepliesOutputSchema = z.object({
  suggestedReplies: z
    .array(z.string())
    .describe('An array of suggested common Chinese replies.'),
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
  Given the following translated Burmese text, suggest 5 common Chinese replies that would be appropriate.
  Provide ONLY the replies themselves, as a JSON array of strings.

  Burmese Text: {{{translatedBurmeseText}}}
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
