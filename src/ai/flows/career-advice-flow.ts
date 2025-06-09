
'use server';
/**
 * @fileOverview Provides an AI-powered career advice flow.
 *
 * - getCareerAdvice - A function that takes a user's query and returns career advice.
 * - CareerAdviceInput - The input type for the getCareerAdvice function.
 * - CareerAdviceOutput - The return type for the getCareerAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerAdviceInputSchema = z.object({
  query: z.string().describe('The user query about career advice.'),
});
export type CareerAdviceInput = z.infer<typeof CareerAdviceInputSchema>;

const CareerAdviceOutputSchema = z.object({
  advice: z.string().describe('The AI-generated career advice.'),
});
export type CareerAdviceOutput = z.infer<typeof CareerAdviceOutputSchema>;

export async function getCareerAdvice(input: CareerAdviceInput): Promise<CareerAdviceOutput> {
  try {
    return await careerAdviceFlow(input);
  } catch (error) {
    console.error("Error calling careerAdviceFlow from getCareerAdvice:", error);
    // Ensure the returned object matches the CareerAdviceOutput schema
    return { advice: "An unexpected error occurred while trying to get career advice. Please try again later." };
  }
}

const prompt = ai.definePrompt({
  name: 'careerAdvicePrompt',
  input: {schema: CareerAdviceInputSchema},
  output: {schema: CareerAdviceOutputSchema},
  prompt: `You are a friendly and knowledgeable career advisor specializing in technology fields.
  The user is seeking advice. Provide helpful, concise, and actionable guidance.
  Consider common tech roles such as Web Developer, Data Scientist, AI/ML Engineer, Cloud Engineer, Cybersecurity Analyst, etc.
  If relevant, you can suggest general skill areas or types of courses that might be beneficial (e.g., "learning programming languages like Python or JavaScript," "understanding data analysis techniques," "exploring cloud platforms").
  Do not recommend specific courses from this platform, but focus on general advice.

  User's query: {{{query}}}

  Provide your advice:`,
});

const careerAdviceFlow = ai.defineFlow(
  {
    name: 'careerAdviceFlow',
    inputSchema: CareerAdviceInputSchema,
    outputSchema: CareerAdviceOutputSchema,
  },
  async (input): Promise<CareerAdviceOutput> => {
    try {
      const genkitResponse = await prompt(input);
      
      if (!genkitResponse || !genkitResponse.output) {
        console.error('Genkit careerAdvicePrompt returned no output for query:', input.query);
        return { advice: "I'm sorry, I couldn't generate advice for that query. Could you try rephrasing it or check back later?" };
      }
      return genkitResponse.output;
    } catch (error) {
      console.error("Error within careerAdviceFlow execution:", error);
      // Ensure the returned object matches the CareerAdviceOutput schema
      return { advice: "An error occurred while processing your career advice request. Please try again later." };
    }
  }
);

