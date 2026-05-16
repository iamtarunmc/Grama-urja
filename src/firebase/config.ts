/**
 * Firebase configuration object.
 * Values MUST be provided in your .env file.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

// Log warnings instead of errors to avoid triggering the Next.js error overlay
if (typeof window !== 'undefined') {
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Firebase API Key is missing. Check NEXT_PUBLIC_FIREBASE_API_KEY in .env");
  }
  if (!firebaseConfig.databaseURL) {
    console.warn("⚠️ Firebase Database URL is missing. Realtime Database features will be disabled until NEXT_PUBLIC_FIREBASE_DATABASE_URL is added to .env");
  }
}
