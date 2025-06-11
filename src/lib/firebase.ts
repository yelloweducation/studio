
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Ensure these environment variables are correctly set in your Netlify deployment environment
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

// Check if all essential Firebase config keys are present, especially in server-side/function context
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("CRITICAL: Firebase API Key or Project ID is missing. Firebase will not initialize. Ensure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set in your environment variables.");
  // You might want to throw an error here or handle this state appropriately
  // For now, we'll let initialization proceed, which will likely fail more explicitly if keys are truly missing.
}


if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  if (firebaseConfig.apiKey && firebaseConfig.projectId){
      console.log("Firebase initialized successfully.");
  } else {
      console.warn("Firebase initialized BUT API Key or Project ID might be missing, check environment variables.");
  }
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
