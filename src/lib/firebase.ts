import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Support both JSON file and Environment Variables (for Vercel/External)
const baseConfig = (firebaseConfig as any).default || firebaseConfig;

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || baseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || baseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || baseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || baseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || baseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || baseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || baseConfig.measurementId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || baseConfig.firestoreDatabaseId,
};

if (!config.apiKey || config.apiKey === 'YOUR_API_KEY') {
  console.error('Firebase API Key is missing or invalid. Check firebase-applet-config.json or environment variables.');
}

const app = getApps().length === 0 ? initializeApp(config) : getApp();
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)'); 
export const auth = getAuth(app);
