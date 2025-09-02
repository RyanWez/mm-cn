'use server';

/**
 * @fileOverview This flow translates Burmese customer service queries to Chinese.
 *
 * - translateCustomerQuery - A function that translates the input query.
 * - TranslateCustomerQueryInput - The input type for the translateCustomerQuery function.
 * - TranslateCustomerQueryOutput - The return type for the translateCustomerQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateCustomerQueryInputSchema = z.object({
  query: z.string().describe('The Burmese customer service query to translate.'),
});
export type TranslateCustomerQueryInput = z.infer<typeof TranslateCustomerQueryInputSchema>;

const TranslateCustomerQueryOutputSchema = z.object({
  translation: z.string().describe('The Chinese translation of the input query.'),
});
export type TranslateCustomerQueryOutput = z.infer<typeof TranslateCustomerQueryOutputSchema>;

export async function translateCustomerQuery(input: TranslateCustomerQueryInput): Promise<TranslateCustomerQueryOutput> {
  return translateCustomerQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateCustomerQueryPrompt',
  input: {schema: TranslateCustomerQueryInputSchema},
  output: {schema: TranslateCustomerQueryOutputSchema},
  prompt: `Translate the following Burmese customer service query to Chinese, optimizing for phrases commonly used in online betting customer service:

Query: {{{query}}}`,
});

const translateCustomerQueryFlow = ai.defineFlow(
  {
    name: 'translateCustomerQueryFlow',
    inputSchema: TranslateCustomerQueryInputSchema,
    outputSchema: TranslateCustomerQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
