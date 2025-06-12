import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Pass } from '../types/models';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Typed Firebase service functions
export interface CreatePassData {
  scheduleLocationId: string;
  destinationLocationId: string;
}

export interface CreatePassResult {
  passId: string;
  pass: Pass;
}

export interface DeclareActionResult {
  success: boolean;
  pass: Pass;
}

// Cloud Function callable wrappers
export const createPass = async (data: CreatePassData): Promise<CreatePassResult> => {
  const createPassFn = httpsCallable<CreatePassData, CreatePassResult>(functions, 'createPass');
  const result = await createPassFn(data);
  return result.data;
};

export const declareDeparture = async (passId: string): Promise<DeclareActionResult> => {
  const declareDepartureFn = httpsCallable<{ passId: string }, DeclareActionResult>(functions, 'declareDeparture');
  const result = await declareDepartureFn({ passId });
  return result.data;
};

export const declareReturn = async (passId: string): Promise<DeclareActionResult> => {
  const declareReturnFn = httpsCallable<{ passId: string }, DeclareActionResult>(functions, 'declareReturn');
  const result = await declareReturnFn({ passId });
  return result.data;
}; 