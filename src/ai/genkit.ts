
import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/googleai'; // Removed Google AI plugin

let aiInstance: any;

try {
  console.log("[Genkit] Attempting to initialize Genkit 'ai' object...");

  // const googleApiKey = process.env.GOOGLE_API_KEY; // Removed
  // const geminiApiKey = process.env.GEMINI_API_KEY; // Removed

  // if (!googleApiKey && !geminiApiKey) { // Removed
  //   console.warn("[Genkit] WARNING: NEITHER GOOGLE_API_KEY NOR GEMINI_API_KEY IS SET. If you intended to use Google AI, it will not work.");
  // }

  aiInstance = genkit({
    plugins: [
      // googleAI(), // Removed Google AI plugin
      // Add other Genkit plugins here if needed in the future
    ],
    // Removed logLevel from here as it's not a v1.x top-level option for genkit()
    // If you need to configure logLevel for specific plugins or globally,
    // it's typically done differently in Genkit 1.x or via environment variables.
  });

  if (aiInstance && typeof aiInstance.defineFlow === 'function') {
    console.log("[Genkit] Successfully initialized 'ai' object. Note: No AI provider plugins are currently configured.");
  } else {
    console.error("[Genkit] 'ai' object initialization seems incomplete or invalid. This might be expected if no plugins are configured.");
  }
} catch (e:any) {
  console.error("[Genkit] CRITICAL ERROR during 'ai' object initialization:", e);
  // console.error("[Genkit] This error strongly suggests that the GOOGLE_API_KEY (or GEMINI_API_KEY) environment variable is missing, incorrect, or the associated account doesn't have the required AI API enabled in Google Cloud. Please verify this in your Netlify deployment environment and Google Cloud Console, then redeploy.");
  // Updated error message
  console.error("[Genkit] This error occurred during basic Genkit setup. If you intend to use AI features, ensure Genkit is correctly configured with appropriate plugins.");
  if (e && typeof e.toString === 'function') {
    console.error("[Genkit] Error details: " + e.toString());
  }
}

export const ai = aiInstance;
