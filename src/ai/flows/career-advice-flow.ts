
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

// Early check for 'ai' object validity
if (!ai || typeof ai.definePrompt !== 'function' || typeof ai.defineFlow !== 'function') {
  const errorMessage = "[CareerAdviceFlow] CRITICAL: Genkit 'ai' object from '@/ai/genkit' is not properly initialized or is missing essential methods. This usually means Genkit initialization failed, often due to missing API keys (e.g., GOOGLE_API_KEY) in the environment. Check Netlify function logs and environment variable settings for 'GOOGLE_API_KEY' or 'GEMINI_API_KEY'.";
  console.error(errorMessage);
  // If 'ai' is truly unusable, subsequent calls like ai.definePrompt will fail.
  // Throwing an error here might give a clearer initial error in logs if this module is loaded and 'ai' is bad.
  // However, it's often better to let the specific 'ai.method' call fail to see the exact point of usage error.
}

const CareerAdviceInputSchema = z.object({
  query: z.string().describe('The user query about career advice.'),
});
export type CareerAdviceInput = z.infer<typeof CareerAdviceInputSchema>;

const CareerAdviceOutputSchema = z.object({
  advice: z.string().describe('The AI-generated career advice.'),
});
export type CareerAdviceOutput = z.infer<typeof CareerAdviceOutputSchema>;

export async function getCareerAdvice(input: CareerAdviceInput): Promise<CareerAdviceOutput> {
  console.log('[getCareerAdvice] Invoked with input query:', input.query);
  if (!ai || typeof ai.definePrompt !== 'function') { // Defensive check before using careerAdviceFlow
    console.error("[getCareerAdvice] Genkit 'ai' object is not available or not properly initialized. Cannot proceed.");
    return { advice: "AI service is currently unavailable due to an initialization error. Please check server logs." };
  }
  try {
    const result = await careerAdviceFlow(input);
    console.log('[getCareerAdvice] Successfully returned advice.');
    return result;
  } catch (error) {
    console.error("[getCareerAdvice] Error calling careerAdviceFlow:", error);
    if (error instanceof Error && error.stack) {
        console.error("[getCareerAdvice] Stack trace:", error.stack);
    }
    // Ensure the returned object matches the CareerAdviceOutput schema
    return { advice: "An unexpected error occurred while trying to get career advice from the AI. Please check the logs or try again later." };
  }
}

// Define prompt and flow only if 'ai' seems available.
// This is a bit problematic as top-level consts are hard to make conditional.
// The check above and in genkit.ts is the primary defense.
let prompt: any; // Define with any to handle potential undefined 'ai'
let careerAdviceFlow: any;

if (ai && typeof ai.definePrompt === 'function' && typeof ai.defineFlow === 'function') {
  prompt = ai.definePrompt({
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

  careerAdviceFlow = ai.defineFlow(
    {
      name: 'careerAdviceFlow',
      inputSchema: CareerAdviceInputSchema,
      outputSchema: CareerAdviceOutputSchema,
    },
    async (input): Promise<CareerAdviceOutput> => {
      console.log('[careerAdviceFlow] Invoked with input query:', input.query);
      try {
        const genkitResponse = await prompt(input);
        
        if (!genkitResponse || !genkitResponse.output) {
          console.warn('[careerAdviceFlow] Genkit careerAdvicePrompt returned no output for query:', input.query, 'Genkit Response:', JSON.stringify(genkitResponse));
          return { advice: "I'm sorry, the AI couldn't generate advice for that query. Could you try rephrasing it or check back later?" };
        }
        console.log('[careerAdviceFlow] Successfully generated output from AI.');
        return genkitResponse.output;
      } catch (error) {
        console.error("[careerAdviceFlow] Error during AI execution:", error);
        if (error instanceof Error && error.stack) {
          console.error("[careerAdviceFlow] Stack trace:", error.stack);
        }
        // Ensure the returned object matches the CareerAdviceOutput schema
        return { advice: "An error occurred while the AI was processing your career advice request. Please try again later." };
      }
    }
  );
} else {
    console.error("[CareerAdviceFlow] ai.definePrompt or ai.defineFlow is not available. Skipping prompt and flow definition.");
    // Define a fallback for careerAdviceFlow if 'ai' is not initialized
    careerAdviceFlow = async (input: CareerAdviceInput): Promise<CareerAdviceOutput> => {
        console.error("[CareerAdviceFlow] Fallback used because 'ai' was not initialized.");
        return { advice: "AI service is currently unavailable (initialization failed). Please check server logs." };
    };
}
