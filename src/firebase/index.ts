import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services.
 * Realtime Database requires a valid databaseURL in the config.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  database: Database | null;
  auth: Auth;
} {
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // Initialize Database with explicit URL check to avoid fatal parsing errors
  // If URL is missing, we return null for database to prevent app crash
  const database = firebaseConfig.databaseURL && firebaseConfig.databaseURL.startsWith("https://") 
    ? getDatabase(firebaseApp, firebaseConfig.databaseURL)
    : null;
    
  const auth = getAuth(firebaseApp);

  return { firebaseApp, database, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
