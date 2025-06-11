
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: any; // Use 'any' for now to handle potential partial initialization

try {
  console.log("[Genkit] Attempting to initialize Genkit 'ai' object...");
  aiInstance = genkit({
    plugins: [
      googleAI() // This is a primary point of failure if API keys are missing/wrong
    ],
    model: 'googleai/gemini-2.0-flash', // Ensure this model is appropriate and available
  });

  if (aiInstance && typeof aiInstance.defineFlow === 'function') {
    console.log("[Genkit] Successfully initialized 'ai' object with expected methods.");
  } else {
    console.error("[Genkit] 'ai' object initialized but seems incomplete or invalid. Methods like defineFlow might be missing. This often points to an issue during plugin initialization (e.g., googleAI).");
    if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) { // Check common key names
        console.error("[Genkit] HINT: GOOGLE_API_KEY or GEMINI_API_KEY environment variable might be missing in your Netlify deployment environment.");
    }
  }
} catch (e:any) { // Catch 'any' to get more details from unknown errors
  console.error("[Genkit] CRITICAL ERROR during 'ai' object initialization:", e);
  if (e && typeof e.message === 'string' && (e.message.includes('API_KEY') || e.message.includes('api key'))) {
    console.error("[Genkit] This error strongly suggests that the GOOGLE_API_KEY (or similar, e.g., GEMINI_API_KEY) environment variable is missing or incorrect in your Netlify deployment environment.");
  } else if (e && typeof e.toString === 'function') {
    console.error("[Genkit] Error details: " + e.toString());
  }
  // aiInstance will remain undefined or be whatever genkit might return on error.
  // This doesn't stop subsequent errors if other modules try to use an undefined 'ai'.
}

// Export aiInstance. If initialization failed, this will be undefined.
export const ai = aiInstance;
