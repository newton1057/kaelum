'use server';
/**
 * @fileOverview AI agent that suggests follow-up questions related to the current topic.
 *
 * - suggestFollowUpQuestions - A function that suggests follow-up questions based on the input.
 * - SuggestFollowUpQuestionsInput - The input type for the suggestFollowUpQuestions function.
 * - SuggestFollowUpQuestionsOutput - The return type for the suggestFollowUpQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFollowUpQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic to generate follow-up questions for.'),
  previousResponse: z.string().describe('The previous response from the AI.'),
});
export type SuggestFollowUpQuestionsInput = z.infer<typeof SuggestFollowUpQuestionsInputSchema>;

const SuggestFollowUpQuestionsOutputSchema = z.object({
  followUpQuestions: z
    .array(z.string())
    .describe('An array of follow-up questions related to the topic.'),
});
export type SuggestFollowUpQuestionsOutput = z.infer<typeof SuggestFollowUpQuestionsOutputSchema>;

export async function suggestFollowUpQuestions(
  input: SuggestFollowUpQuestionsInput
): Promise<SuggestFollowUpQuestionsOutput> {
  return suggestFollowUpQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFollowUpQuestionsPrompt',
  input: {schema: SuggestFollowUpQuestionsInputSchema},
  output: {schema: SuggestFollowUpQuestionsOutputSchema},
  prompt: `You are an AI assistant that helps users explore topics in depth by suggesting follow-up questions.

  Based on the current topic and the previous response, generate a list of follow-up questions that the user might find helpful.

  Topic: {{{topic}}}
  Previous Response: {{{previousResponse}}}

  Follow-up Questions:
  {{#each followUpQuestions}}- {{{this}}}
  {{/each}}`,
});

const suggestFollowUpQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestFollowUpQuestionsFlow',
    inputSchema: SuggestFollowUpQuestionsInputSchema,
    outputSchema: SuggestFollowUpQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
