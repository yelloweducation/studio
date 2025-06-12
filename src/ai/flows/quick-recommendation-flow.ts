
'use server';
/**
 * @fileOverview Provides AI-powered quick course recommendations.
 *
 * - getQuickRecommendations - A function that takes a user's interest and a list of available courses, then returns 1-2 course suggestions.
 * - QuickRecommendationInput - The input type for the getQuickRecommendations function.
 * - QuickRecommendationOutput - The return type for the getQuickRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Course } from '@/data/mockData';

const CourseSchemaForFlow = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  categoryNameCache: z.string().optional(),
});

const QuickRecommendationInputSchema = z.object({
  userInterest: z.string().describe('The user query or area of interest for course recommendations.'),
  availableCourses: z.array(CourseSchemaForFlow).describe('A list of available courses with their id, title, description, and category name.'),
});
export type QuickRecommendationInput = z.infer<typeof QuickRecommendationInputSchema>;

const RecommendedCourseSchema = z.object({
    id: z.string().describe('The ID of the recommended course.'),
    title: z.string().describe('The title of the recommended course.'),
    reason: z.string().optional().describe('A brief reason why this course is recommended.'),
});

const QuickRecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendedCourseSchema).max(2).describe('A list of 1 or 2 course recommendations based on the user interest and available courses.'),
  error: z.string().optional().describe("An error message if recommendations could not be generated."),
});
export type QuickRecommendationOutput = z.infer<typeof QuickRecommendationOutputSchema>;

let quickRecommendationPromptDefinition: any;
let quickRecommendationFlowDefinition: any;

export async function getQuickRecommendations(input: QuickRecommendationInput): Promise<QuickRecommendationOutput> {
  console.log('[getQuickRecommendations] Invoked with user interest:', input.userInterest, 'and', input.availableCourses?.length, 'courses.');

  if (!ai || typeof ai.definePrompt !== 'function' || typeof ai.defineFlow !== 'function') {
    const errorMessage = "[getQuickRecommendations] Genkit 'ai' object is not properly initialized or no AI provider plugin is configured. AI features are currently unavailable.";
    console.error(errorMessage);
    return { recommendations: [], error: "The AI recommendation service is currently unavailable. Please ensure an AI provider is configured for Genkit." };
  }

  if (!input.availableCourses || input.availableCourses.length === 0) {
      console.warn('[getQuickRecommendations] No available courses provided.');
      return { recommendations: [], error: "No courses available to recommend from." };
  }

  if (!quickRecommendationPromptDefinition) {
    try {
        quickRecommendationPromptDefinition = ai.definePrompt({
            name: 'quickRecommendationPromptRuntime',
            input: {schema: QuickRecommendationInputSchema},
            output: {schema: QuickRecommendationOutputSchema},
            prompt: `You are an AI assistant helping users find relevant courses.
            Based on the user's stated interest: "{{userInterest}}" and the following list of available courses, please select 1 or at most 2 courses that best match the interest.
            For each recommended course, provide its ID and title. Optionally, provide a very brief reason for the recommendation.

            Available Courses (format: ID - Title - Description - Category):
            {{#each availableCourses}}
            - {{id}} - {{title}} - {{description}} - {{categoryNameCache}}
            {{/each}}

            Consider the course title, description, and category for relevance.
            Prioritize courses that directly address keywords in the user's interest.
            If multiple courses are highly relevant, pick the top two. If only one is very relevant, just pick one. If none seem relevant, return an empty list of recommendations.
            `,
        });
    } catch (e: any) {
        console.error("[getQuickRecommendations] Error defining quickRecommendationPromptDefinition:", e);
        return { recommendations: [], error: "A critical error occurred while setting up the AI recommendation prompt. This may be due to missing AI provider configuration." };
    }
  }
  
  if (!quickRecommendationFlowDefinition) {
    if (!quickRecommendationPromptDefinition) {
        console.error("[getQuickRecommendations] quickRecommendationPromptDefinition is not defined. Cannot define quickRecommendationFlowDefinition.");
        return { recommendations: [], error: "A critical error occurred: AI prompt definition is missing for recommendations." };
    }
    try {
        quickRecommendationFlowDefinition = ai.defineFlow(
            {
            name: 'quickRecommendationFlowRuntime',
            inputSchema: QuickRecommendationInputSchema,
            outputSchema: QuickRecommendationOutputSchema,
            },
            async (flowInput: QuickRecommendationInput): Promise<QuickRecommendationOutput> => {
            console.log('[quickRecommendationFlowRuntime] Real flow invoked with user interest:', flowInput.userInterest, 'and', flowInput.availableCourses?.length, 'courses.');
            try {
                const genkitResponse = await quickRecommendationPromptDefinition(flowInput);
                
                if (!genkitResponse || !genkitResponse.output) {
                console.warn('[quickRecommendationFlowRuntime] QuickRecommendationPrompt returned no output for interest:', flowInput.userInterest, 'Genkit Response:', JSON.stringify(genkitResponse));
                return { recommendations: [], error: "The AI couldn't generate recommendations for that interest. This could be due to configuration or service unavailability." };
                }
                
                const validRecommendations = genkitResponse.output.recommendations.filter(rec => 
                    flowInput.availableCourses.some(course => course.id === rec.id)
                );

                if (validRecommendations.length !== genkitResponse.output.recommendations.length) {
                console.warn('[quickRecommendationFlowRuntime] AI recommended non-existent course IDs. Filtered to valid IDs. Original:', JSON.stringify(genkitResponse.output.recommendations), 'Valid:', JSON.stringify(validRecommendations));
                }
                
                console.log('[quickRecommendationFlowRuntime] Successfully generated recommendations from AI:', JSON.stringify(validRecommendations));
                return { recommendations: validRecommendations };

            } catch (error) {
                console.error("[quickRecommendationFlowRuntime] Error during AI execution:", error);
                if (error instanceof Error && error.stack) {
                console.error("[quickRecommendationFlowRuntime] Stack trace:", error.stack);
                }
                return { recommendations: [], error: "An error occurred while the AI was processing your recommendation request. Check AI provider configuration." };
            }
            }
        );
    } catch (e: any) {
        console.error("[getQuickRecommendations] Error defining quickRecommendationFlowDefinition:", e);
        return { recommendations: [], error: "A critical error occurred while setting up the AI recommendation flow. Missing AI provider?" };
    }
  }

  if (typeof quickRecommendationFlowDefinition !== 'function') {
    const errorMsg = "[getQuickRecommendations] 'quickRecommendationFlowDefinition' is not defined as a function. This indicates a serious problem with the AI flow module initialization.";
    console.error(errorMsg);
    return { recommendations: [], error: "A critical error occurred with the AI recommendation flow (not a function)." };
  }

  try {
    const result = await quickRecommendationFlowDefinition(input);
    console.log('[getQuickRecommendations] Successfully received result from quickRecommendationFlowDefinition.');
    return result;
  } catch (error: any) {
    console.error("[getQuickRecommendations] Unexpected error during quickRecommendationFlowDefinition execution:", error);
    let userFriendlyMessage = "An unexpected error occurred while trying to get course recommendations. The AI service might be unavailable or misconfigured.";
     if (error.stack) {
        console.error("[getQuickRecommendations] Stack trace:", error.stack);
    }
    return { recommendations: [], error: userFriendlyMessage };
  }
}
