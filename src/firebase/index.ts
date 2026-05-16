import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Safely initializes Firebase services.
 * Returns null for services if configuration is missing or invalid.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  database: Database | null;
  auth: Auth | null;
} {
  // Defensive check: If no API key, don't initialize to prevent fatal crash
  const hasApiKey = !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;
  
  if (!hasApiKey) {
    return { firebaseApp: null, database: null, auth: null };
  }

  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    
    // Database requires a valid URL
    const database = firebaseConfig.databaseURL && firebaseConfig.databaseURL.startsWith("https://") 
      ? getDatabase(firebaseApp, firebaseConfig.databaseURL)
      : null;

    return { firebaseApp, database, auth };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return { firebaseApp: null, database: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
