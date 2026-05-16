/**
 * Firebase configuration object.
 * Values are pulled from your .env file for security.
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

// Help debug missing environment variables in the browser console
if (typeof window !== 'undefined') {
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Firebase API Key is missing. Add NEXT_PUBLIC_FIREBASE_API_KEY to .env");
  }
  if (!firebaseConfig.databaseURL) {
    console.warn("⚠️ Firebase Database URL is missing. Add NEXT_PUBLIC_FIREBASE_DATABASE_URL to .env");
  }
}
