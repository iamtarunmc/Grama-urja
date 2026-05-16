/**
 * Firebase configuration object.
 * Values are pulled from environment variables.
 * 
 * IMPORTANT: This is your FIREBASE Project API Key (starts with AIza...), 
 * NOT an AI API key (like Groq or Gemini).
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

// Sanity check for the API Key
if (typeof window !== 'undefined') {
  if (!firebaseConfig.apiKey) {
    console.error(
      "❌ Firebase API Key is MISSING. Check your .env file for NEXT_PUBLIC_FIREBASE_API_KEY."
    );
  } else if (!firebaseConfig.apiKey.startsWith("AIza")) {
    console.error(
      "❌ INVALID API KEY: The key provided doesn't look like a Firebase API Key. " +
      "It should start with 'AIza'. You might be using an AI API key (Groq/Gemini) by mistake."
    );
  }
}
