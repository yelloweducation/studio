
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: any; // Use 'any' for now to handle potential partial initialization

try {
  console.log("[Genkit] Attempting to initialize Genkit 'ai' object...");

  // Explicitly check for common API key environment variables before initialization
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!googleApiKey && !geminiApiKey) {
    console.error("[Genkit] CRITICAL: NEITHER GOOGLE_API_KEY NOR GEMINI_API_KEY IS SET IN THE ENVIRONMENT. Genkit's googleAI plugin will likely fail to initialize. Please set one of these in your Netlify environment variables.");
    // We can still attempt initialization, genkit might have other ways or throw its own error.
  } else if (googleApiKey) {
    console.log("[Genkit] GOOGLE_API_KEY found in environment.");
  } else if (geminiApiKey) {
    console.log("[Genkit] GEMINI_API_KEY found in environment. The googleAI() plugin might use this.");
  }

  aiInstance = genkit({
    plugins: [
      googleAI() // This is a primary point of failure if API keys are missing/wrong
    ],
    // model: 'googleai/gemini-2.0-flash', // Default model can be set here, but often overridden in prompts/flows
  });

  if (aiInstance && typeof aiInstance.defineFlow === 'function') {
    console.log("[Genkit] Successfully initialized 'ai' object with expected methods.");
  } else {
    console.error("[Genkit] 'ai' object initialized but seems incomplete or invalid. Methods like defineFlow might be missing. This often points to an issue during plugin initialization (e.g., googleAI), possibly due to missing or incorrect API keys even if one was detected above.");
    if (!googleApiKey && !geminiApiKey) {
        console.error("[Genkit] RECONFIRMED: GOOGLE_API_KEY or GEMINI_API_KEY environment variable is definitely missing in your Netlify deployment environment.");
    } else {
        console.warn("[Genkit] An API key was detected, but initialization still seems problematic. Ensure the key is valid and has permissions for the Gemini API in your Google Cloud project.");
    }
  }
} catch (e:any) {
  console.error("[Genkit] CRITICAL ERROR during 'ai' object initialization:", e);
  if (e && typeof e.message === 'string' && (e.message.toLowerCase().includes('api_key') || e.message.toLowerCase().includes('api key') || e.message.toLowerCase().includes('credential'))) {
    console.error("[Genkit] This error strongly suggests that the GOOGLE_API_KEY (or GEMINI_API_KEY) environment variable is missing, incorrect, or the associated account doesn't have the Gemini API enabled in Google Cloud. Please verify this in your Netlify deployment environment and Google Cloud Console.");
  } else if (e && typeof e.toString === 'function') {
    console.error("[Genkit] Error details: " + e.toString());
  }
  // aiInstance will remain undefined or be whatever genkit might return on error.
}

// Export aiInstance. If initialization failed, this will be undefined.
export const ai = aiInstance;
