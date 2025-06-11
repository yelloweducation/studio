
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
  try {
    console.log('[getCareerAdvice] Invoked with input query:', input.query);

    if (!ai || typeof ai.defineFlow !== 'function') {
      console.error("[getCareerAdvice] Genkit 'ai' object is not properly initialized. AI features will not work effectively.");
      // This error should ideally be caught by the main try-catch, but for clarity:
      return { advice: "The AI service is currently unavailable due to an initialization error. Please check server logs or contact support." };
    }
    
    if (typeof careerAdviceFlow !== 'function') {
        const errorMsg = "[getCareerAdvice] 'careerAdviceFlow' is not defined as a function. This indicates a serious problem with the AI flow module initialization, possibly due to Genkit setup issues.";
        console.error(errorMsg);
        return { advice: "A critical error occurred with the AI advisory flow. Please contact support if this persists." };
    }

    const result = await careerAdviceFlow(input);
    // careerAdviceFlow (real or fallback) is expected to return CareerAdviceOutput
    console.log('[getCareerAdvice] Successfully received result from careerAdviceFlow.');
    return result;

  } catch (error) {
    console.error("[getCareerAdvice] Unexpected top-level error in getCareerAdvice server action:", error);
    let userFriendlyMessage = "An unexpected error occurred while trying to get career advice. Please try again later or check server logs.";
    if (error instanceof Error) {
        // You could check for specific error messages or types if needed here
        // For example: if (error.message.includes("API_KEY_INVALID")) { ... }
        if (error.stack) {
            console.error("[getCareerAdvice] Stack trace:", error.stack);
        }
    }
    return { advice: userFriendlyMessage };
  }
}

// Define prompt and flow only if 'ai' seems available.
let prompt: any; 
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
      console.log('[careerAdviceFlow] Real flow invoked with input query:', input.query);
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
        return { advice: "An error occurred while the AI was processing your career advice request. Please try again later." };
      }
    }
  );
} else {
    console.error("[CareerAdviceFlow] ai.definePrompt or ai.defineFlow is not available at module level. Skipping real prompt and flow definition, using fallback.");
    careerAdviceFlow = async (input: CareerAdviceInput): Promise<CareerAdviceOutput> => {
        console.warn("[CareerAdviceFlow] Fallback careerAdviceFlow used because 'ai' was not properly initialized or Genkit methods were unavailable.");
        return { advice: "The AI career advisor service is currently unavailable due to a setup issue. Please check server logs or contact support." };
    };
}
