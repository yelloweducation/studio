
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

// Placeholder for the flow; will be defined at runtime
let careerAdviceFlowDefinition: any;
let careerAdvicePromptDefinition: any;

export async function getCareerAdvice(input: CareerAdviceInput): Promise<CareerAdviceOutput> {
  console.log('[getCareerAdvice] Invoked with input query:', input.query);

  if (!ai || typeof ai.definePrompt !== 'function' || typeof ai.defineFlow !== 'function') {
    const errorMessage = "[getCareerAdvice] Genkit 'ai' object is not properly initialized or no AI provider plugin is configured. AI features are currently unavailable.";
    console.error(errorMessage);
    return { advice: "The AI service is currently unavailable. Please ensure an AI provider (like Google AI, OpenAI, etc.) is configured for Genkit." };
  }

  // Define prompt and flow at runtime
  if (!careerAdvicePromptDefinition) {
    try {
      careerAdvicePromptDefinition = ai.definePrompt({
        name: 'careerAdvicePromptRuntime',
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
    } catch (e: any) {
        console.error("[getCareerAdvice] Error defining careerAdvicePromptDefinition:", e);
        return { advice: "A critical error occurred while setting up the AI prompt. This might be due to missing AI provider configuration." };
    }
  }

  if (!careerAdviceFlowDefinition) {
    if (!careerAdvicePromptDefinition) {
        console.error("[getCareerAdvice] careerAdvicePromptDefinition is not defined. Cannot define careerAdviceFlowDefinition.");
        return { advice: "A critical error occurred: AI prompt definition is missing." };
    }
    try {
      careerAdviceFlowDefinition = ai.defineFlow(
        {
          name: 'careerAdviceFlowRuntime',
          inputSchema: CareerAdviceInputSchema,
          outputSchema: CareerAdviceOutputSchema,
        },
        async (flowInput: CareerAdviceInput): Promise<CareerAdviceOutput> => {
          console.log('[careerAdviceFlowRuntime] Real flow invoked with input query:', flowInput.query);
          try {
            // Since no AI model is configured, this call will likely fail or hang.
            // We should ideally check if any model is available before calling prompt.
            // For now, we rely on the initial `ai` object check.
            const genkitResponse = await careerAdvicePromptDefinition(flowInput);
            
            if (!genkitResponse || !genkitResponse.output) {
              console.warn('[careerAdviceFlowRuntime] Genkit careerAdvicePrompt returned no output for query:', flowInput.query, 'Genkit Response:', JSON.stringify(genkitResponse));
              return { advice: "I'm sorry, the AI couldn't generate advice for that query. This could be due to a configuration issue or the AI service being unavailable." };
            }
            console.log('[careerAdviceFlowRuntime] Successfully generated output from AI.');
            return genkitResponse.output;
          } catch (error) {
            console.error("[careerAdviceFlowRuntime] Error during AI execution:", error);
            if (error instanceof Error && error.stack) {
              console.error("[careerAdviceFlowRuntime] Stack trace:", error.stack);
            }
            return { advice: "An error occurred while the AI was processing your career advice request. Please check if an AI provider is configured." };
          }
        }
      );
    } catch (e: any) {
        console.error("[getCareerAdvice] Error defining careerAdviceFlowDefinition:", e);
        return { advice: "A critical error occurred while setting up the AI advisory flow. This might be due to missing AI provider configuration." };
    }
  }
  
  if (typeof careerAdviceFlowDefinition !== 'function') {
      const errorMsg = "[getCareerAdvice] 'careerAdviceFlowDefinition' is not defined as a function. This indicates a serious problem with the AI flow module initialization, possibly due to Genkit setup issues or missing AI provider.";
      console.error(errorMsg);
      return { advice: "A critical error occurred with the AI advisory flow. Please contact support if this persists." };
  }

  try {
    const result = await careerAdviceFlowDefinition(input);
    console.log('[getCareerAdvice] Successfully received result from careerAdviceFlowDefinition.');
    return result;
  } catch (error: any) {
    console.error("[getCareerAdvice] Unexpected error during careerAdviceFlowDefinition execution:", error);
    let userFriendlyMessage = "An unexpected error occurred while trying to get career advice. The AI service might be unavailable or misconfigured.";
    if (error.stack) {
        console.error("[getCareerAdvice] Stack trace:", error.stack);
    }
    return { advice: userFriendlyMessage };
  }
}
