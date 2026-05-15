import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Handle potential JSON import variations (some bundlers wrap it in .default)
const config = (firebaseConfig as any).default || firebaseConfig;

if (!config.apiKey || config.apiKey === 'YOUR_API_KEY') {
  console.error('Firebase API Key is missing or invalid in firebase-applet-config.json');
}

const app = getApps().length === 0 ? initializeApp(config) : getApp();
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)'); 
export const auth = getAuth(app);
