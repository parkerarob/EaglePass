import * as admin from 'firebase-admin';
import { PassStatus } from '../src/types/pass';

// Initialize Firebase Admin
const app = admin.initializeApp();
const auth = app.auth();
const db = app.firestore();

async function createTestUser(email: string, password: string) {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
    });
    console.log(`✅ Created user: ${email}`);
    return userRecord;
  } catch (error) {
    if ((error as any).code === 'auth/email-already-exists') {
      console.log(`ℹ️ User already exists: ${email}`);
      const userRecord = await auth.getUserByEmail(email);
      return userRecord;
    }
    throw error;
  }
}

async function createTestPass(userId: string, passNumber: number) {
  const passData = {
    userId,
    passNumber,
    status: PassStatus.ACTIVE,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    destination: 'Test Destination',
    purpose: 'Test Purpose',
    notes: 'Test Notes',
  };

  try {
    const passRef = await db.collection('passes').add(passData);
    console.log(`✅ Created pass ${passNumber} for user ${userId}`);
    return passRef;
  } catch (error) {
    console.error(`❌ Failed to create pass ${passNumber}:`, error);
    throw error;
  }
}

async function seed() {
  try {
    console.log('🌱 Starting seed process...');

    // Create test users
    const alice = await createTestUser('alice@example.com', 'Test123!');
    const bob = await createTestUser('bob@example.com', 'Test123!');

    // Create test passes
    await createTestPass(alice.uid, 1);
    await createTestPass(bob.uid, 2);

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await app.delete();
  }
}

seed(); 