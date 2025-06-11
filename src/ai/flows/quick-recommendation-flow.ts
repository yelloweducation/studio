
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
import type { Course } from '@/data/mockData'; // Assuming Course type is exported from mockData

// Early check for 'ai' object validity
if (!ai || typeof ai.definePrompt !== 'function' || typeof ai.defineFlow !== 'function') {
  const errorMessage = "[QuickRecommendationFlow] CRITICAL: Genkit 'ai' object from '@/ai/genkit' is not properly initialized or is missing essential methods. This usually means Genkit initialization failed, often due to missing API keys (e.g., GOOGLE_API_KEY) in the environment. Check Netlify function logs and environment variable settings for 'GOOGLE_API_KEY' or 'GEMINI_API_KEY'.";
  console.error(errorMessage);
}

const CourseSchemaForFlow = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
});

const QuickRecommendationInputSchema = z.object({
  userInterest: z.string().describe('The user query or area of interest for course recommendations.'),
  availableCourses: z.array(CourseSchemaForFlow).describe('A list of available courses with their id, title, description, and category.'),
});
export type QuickRecommendationInput = z.infer<typeof QuickRecommendationInputSchema>;

const RecommendedCourseSchema = z.object({
    id: z.string().describe('The ID of the recommended course.'),
    title: z.string().describe('The title of the recommended course.'),
    reason: z.string().optional().describe('A brief reason why this course is recommended.'),
});

const QuickRecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendedCourseSchema).max(2).describe('A list of 1 or 2 course recommendations based on the user interest and available courses.'),
  error?: z.string().optional().describe("An error message if recommendations could not be generated."),
});
export type QuickRecommendationOutput = z.infer<typeof QuickRecommendationOutputSchema>;

export async function getQuickRecommendations(input: QuickRecommendationInput): Promise<QuickRecommendationOutput> {
  try {
    console.log('[getQuickRecommendations] Invoked with user interest:', input.userInterest, 'and', input.availableCourses?.length, 'courses.');

    if (!ai || typeof ai.defineFlow !== 'function') {
      console.error("[getQuickRecommendations] Genkit 'ai' object is not properly initialized. AI features will not work effectively.");
      return { recommendations: [], error: "The AI recommendation service is currently unavailable due to an initialization error." };
    }

    if (typeof quickRecommendationFlow !== 'function') {
      const errorMsg = "[getQuickRecommendations] 'quickRecommendationFlow' is not defined as a function. This indicates a serious problem with the AI flow module initialization.";
      console.error(errorMsg);
      return { recommendations: [], error: "A critical error occurred with the AI recommendation flow." };
    }
    
    if (!input.availableCourses || input.availableCourses.length === 0) {
        console.warn('[getQuickRecommendations] No available courses provided.');
        return { recommendations: [], error: "No courses available to recommend from." };
    }

    const result = await quickRecommendationFlow(input);
    console.log('[getQuickRecommendations] Successfully received result from quickRecommendationFlow.');
    return result;

  } catch (error) {
    console.error("[getQuickRecommendations] Unexpected top-level error in getQuickRecommendations server action:", error);
    let userFriendlyMessage = "An unexpected error occurred while trying to get course recommendations. Please try again later.";
     if (error instanceof Error && error.stack) {
        console.error("[getQuickRecommendations] Stack trace:", error.stack);
    }
    return { recommendations: [], error: userFriendlyMessage };
  }
}

let prompt: any;
let quickRecommendationFlow: any;

if (ai && typeof ai.definePrompt === 'function' && typeof ai.defineFlow === 'function') {
  prompt = ai.definePrompt({
    name: 'quickRecommendationPrompt',
    input: {schema: QuickRecommendationInputSchema},
    output: {schema: QuickRecommendationOutputSchema},
    prompt: `You are an AI assistant helping users find relevant courses.
    Based on the user's stated interest: "{{userInterest}}" and the following list of available courses, please select 1 or at most 2 courses that best match the interest.
    For each recommended course, provide its ID and title. Optionally, provide a very brief reason for the recommendation.

    Available Courses (format: ID - Title - Description - Category):
    {{#each availableCourses}}
    - {{id}} - {{title}} - {{description}} - {{category}}
    {{/each}}

    Consider the course title, description, and category for relevance.
    Prioritize courses that directly address keywords in the user's interest.
    If multiple courses are highly relevant, pick the top two. If only one is very relevant, just pick one. If none seem relevant, return an empty list of recommendations.
    `,
  });

  quickRecommendationFlow = ai.defineFlow(
    {
      name: 'quickRecommendationFlow',
      inputSchema: QuickRecommendationInputSchema,
      outputSchema: QuickRecommendationOutputSchema,
    },
    async (input): Promise<QuickRecommendationOutput> => {
      console.log('[quickRecommendationFlow] Real flow invoked with user interest:', input.userInterest, 'and', input.availableCourses?.length, 'courses.');
      try {
        const genkitResponse = await prompt(input);
        
        if (!genkitResponse || !genkitResponse.output) {
          console.warn('[quickRecommendationFlow] QuickRecommendationPrompt returned no output for interest:', input.userInterest, 'Genkit Response:', JSON.stringify(genkitResponse));
          return { recommendations: [], error: "The AI couldn't generate recommendations for that interest." };
        }
        
        const validRecommendations = genkitResponse.output.recommendations.filter(rec => 
          input.availableCourses.some(course => course.id === rec.id)
        );

        if (validRecommendations.length !== genkitResponse.output.recommendations.length) {
          console.warn('[quickRecommendationFlow] AI recommended non-existent course IDs. Filtered to valid IDs. Original:', JSON.stringify(genkitResponse.output.recommendations), 'Valid:', JSON.stringify(validRecommendations));
        }
        
        console.log('[quickRecommendationFlow] Successfully generated recommendations from AI:', JSON.stringify(validRecommendations));
        return { recommendations: validRecommendations };

      } catch (error) {
        console.error("[quickRecommendationFlow] Error during AI execution:", error);
        if (error instanceof Error && error.stack) {
          console.error("[quickRecommendationFlow] Stack trace:", error.stack);
        }
        return { recommendations: [], error: "An error occurred while the AI was processing your recommendation request." };
      }
    }
  );
} else {
    console.error("[QuickRecommendationFlow] ai.definePrompt or ai.defineFlow is not available at module level. Skipping real prompt and flow definition, using fallback.");
    quickRecommendationFlow = async (input: QuickRecommendationInput): Promise<QuickRecommendationOutput> => {
        console.warn("[QuickRecommendationFlow] Fallback quickRecommendationFlow used because 'ai' was not properly initialized or Genkit methods were unavailable.");
        return { recommendations: [], error: "The AI recommendation service is currently unavailable due to a setup issue. Please check server logs." };
    };
}
