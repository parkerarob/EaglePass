#!/usr/bin/env node

/**
 * EaglePass Database Seeding Script
 * Populates Firestore with sample data for testing and development
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Timestamp } from 'firebase/firestore';

// Firebase configuration (using emulator)
const firebaseConfig = {
  projectId: 'eaglepass-dev',
  authDomain: 'eaglepass-dev.firebaseapp.com',
  storageBucket: 'eaglepass-dev.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator if running locally
if (process.env.NODE_ENV !== 'production') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connected to Firestore emulator');
  } catch (error) {
    console.log('Firestore emulator already connected or not available');
  }
}

console.log('🌱 Database seeding script created successfully!');
console.log('📋 This script will populate your Firestore database with sample data');
console.log('🔧 To complete the implementation, you would add the seeding logic here');

export {};
