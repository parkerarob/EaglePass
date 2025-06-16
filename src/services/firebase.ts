import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAt1xxoEXjambNTZWh4UiLRBA2YmgiTeKU",
  authDomain: "eaglepass-f15af.firebaseapp.com",
  projectId: "eaglepass-f15af",
  storageBucket: "eaglepass-f15af.firebasestorage.app",
  messagingSenderId: "917580916120",
  appId: "1:917580916120:web:d412ce6159071fc791f7ed",
  measurementId: "G-E5DZ24HBV0"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize services
let auth: Auth, db, functions, analytics;
try {
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);
  analytics = getAnalytics(app);
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase services:', error);
  throw error;
}

export { auth, db, functions, analytics };
export default app; 