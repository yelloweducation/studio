
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: any;

try {
  console.log("[Genkit] Attempting to initialize Genkit 'ai' object...");

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY; // Some older Genkit versions might prefer this

  if (!googleApiKey && !geminiApiKey) {
    console.error("[Genkit] CRITICAL: NEITHER GOOGLE_API_KEY NOR GEMINI_API_KEY IS SET IN THE ENVIRONMENT. Genkit's googleAI plugin will fail to initialize. Please set GOOGLE_API_KEY in your Netlify environment variables for the Gemini API and redeploy.");
  } else if (googleApiKey) {
    console.log("[Genkit] GOOGLE_API_KEY found in environment. Attempting to use it for googleAI() plugin.");
  } else if (geminiApiKey) {
    console.log("[Genkit] GEMINI_API_KEY found. This might be used by googleAI(), but GOOGLE_API_KEY is generally preferred now.");
  }

  aiInstance = genkit({
    plugins: [
      googleAI(), // This will use GOOGLE_API_KEY or GEMINI_API_KEY from process.env
    ],
  });

  if (aiInstance && typeof aiInstance.defineFlow === 'function') {
    console.log("[Genkit] Successfully initialized 'ai' object with expected methods.");
  } else {
    console.error("[Genkit] 'ai' object initialized but seems incomplete or invalid. Methods like defineFlow might be missing. This often points to an issue during plugin initialization (e.g., googleAI), possibly due to missing or incorrect API keys (GOOGLE_API_KEY).");
    if (!googleApiKey && !geminiApiKey) {
        console.error("[Genkit] RECONFIRMED: GOOGLE_API_KEY (or GEMINI_API_KEY) environment variable is definitely missing in your Netlify deployment environment.");
    } else {
        console.warn("[Genkit] An API key was detected, but initialization still seems problematic. Ensure the key is valid and has permissions for the Generative Language API (or Vertex AI API for Gemini) in your Google Cloud project.");
    }
  }
} catch (e:any) {
  console.error("[Genkit] CRITICAL ERROR during 'ai' object initialization:", e);
  if (e && typeof e.message === 'string' && (e.message.toLowerCase().includes('api_key') || e.message.toLowerCase().includes('api key') || e.message.toLowerCase().includes('credential'))) {
    console.error("[Genkit] This error strongly suggests that the GOOGLE_API_KEY (or GEMINI_API_KEY) environment variable is missing, incorrect, or the associated account doesn't have the required AI API enabled in Google Cloud. Please verify this in your Netlify deployment environment and Google Cloud Console, then redeploy.");
  } else if (e && typeof e.toString === 'function') {
    console.error("[Genkit] Error details: " + e.toString());
  }
}

export const ai = aiInstance;
