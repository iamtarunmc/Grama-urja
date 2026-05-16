
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

// Check for API Key validity on the client side
if (typeof window !== 'undefined') {
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Firebase API Key is missing. Please check your .env file.");
  } else if (!firebaseConfig.apiKey.startsWith("AIza")) {
    console.warn("⚠️ The provided API Key does not look like a valid Firebase Key (should start with AIza).");
  }
}
