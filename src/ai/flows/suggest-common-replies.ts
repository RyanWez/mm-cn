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
  translatedText: z
    .string()
    .describe('The translated text to suggest replies for.'),
  language: z.string().describe('The language of the translated text (e.g., "Chinese" or "Burmese").'),
});
export type SuggestCommonRepliesInput = z.infer<typeof SuggestCommonRepliesInputSchema>;

const SuggestCommonRepliesOutputSchema = z.object({
  suggestedReplies: z
    .array(z.string())
    .describe('An array of suggested improved replies.'),
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
  Given the following translated text in {{language}}, suggest 5 improved or alternative phrases that are clearer, more polite, or more effective for customer communication.
  Provide ONLY the replies themselves, as a JSON array of strings.

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
