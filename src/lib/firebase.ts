
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// These environment variables MUST be set in your Netlify deployment environment
// and prefixed with NEXT_PUBLIC_ if they also need to be accessible on the client-side.
// For server-side usage (like in API routes or Genkit flows if they run server-side),
// they don't strictly need the NEXT_PUBLIC_ prefix if Netlify injects them directly.
// However, for consistency and if Firebase is initialized client-side (as is common),
// NEXT_PUBLIC_ is standard.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Check if all essential Firebase config keys are present
const essentialKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'projectId', 'authDomain'];
const missingKeys = essentialKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(`CRITICAL: Firebase configuration is missing the following essential keys: ${missingKeys.join(', ')}. 
    Please ensure these environment variables (e.g., NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID) 
    are correctly set in your Netlify environment variables and that the site has been redeployed. 
    Firebase will NOT initialize correctly.`);
  // To prevent the app from completely crashing in a broken state,
  // we can assign placeholder objects, but features will fail.
  // A better approach for production might be to throw an error or show a maintenance page.
  // For now, logging the error is the primary action.
}

if (getApps().length === 0) {
  if (missingKeys.length > 0) {
    console.warn("[Firebase Setup] Attempting to initialize Firebase despite missing essential config keys. This is likely to fail or lead to errors.");
    // We could throw an error here to halt execution if keys are missing.
    // throw new Error(`Firebase essential config keys missing: ${missingKeys.join(', ')}`);
  }
  try {
    app = initializeApp(firebaseConfig);
    console.log("[Firebase Setup] Firebase app initialized successfully.");
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("[Firebase Setup] CRITICAL ERROR during Firebase initialization:", error);
    console.error("[Firebase Setup] This usually means your Firebase environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, etc.) are missing or incorrect in your Netlify deployment environment. Please verify them and redeploy.");
    // Assign dummy objects or throw to prevent further execution with broken Firebase
    // For example:
    // app = {} as FirebaseApp;
    // auth = {} as Auth;
    // db = {} as Firestore;
    // throw error; // Or rethrow to stop the app
  }
} else {
  app = getApps()[0];
  console.log("[Firebase Setup] Firebase app already initialized.");
  // Ensure auth and db are also initialized if app was already initialized
  // This can happen with HMR in development.
  try {
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("[Firebase Setup] Error getting Auth/Firestore from existing app instance:", error);
  }
}

// @ts-ignore
export { app, auth, db };
