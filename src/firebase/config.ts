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

// Diagnostic check for the developer
if (typeof window !== 'undefined') {
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Firebase API Key is missing. Check NEXT_PUBLIC_FIREBASE_API_KEY in .env");
  }
  if (!firebaseConfig.databaseURL) {
    console.error("❌ Firebase Database URL is missing! Realtime Database will not work. Check NEXT_PUBLIC_FIREBASE_DATABASE_URL in .env. It should look like https://your-project-id.firebaseio.com");
  } else if (!firebaseConfig.databaseURL.startsWith("https://")) {
    console.error("❌ Firebase Database URL is invalid. It must start with https://");
  }
}
