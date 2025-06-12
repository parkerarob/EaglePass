import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { readFileSync } from 'fs';
import * as admin from 'firebase-admin';

describe('createPass Cloud Function', () => {
  let testEnv: any;
  let studentId: string;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'eaglepass-mvp',
      firestore: { rules: readFileSync('../firestore.rules', 'utf8') },
    });
    studentId = 'student-uid-1';
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('should create a pass and eventLog (happy path)', async () => {
    const context = testEnv.authenticatedContext(studentId);
    const wrapped = testEnv.wrap(require('../src/index').createPass);
    const data = {
      studentId,
      scheduleLocationId: 'class-1',
      destinationLocationId: 'bathroom-1',
    };
    const result = await wrapped(data, { auth: { uid: studentId } });
    expect(result).toHaveProperty('passId');
    // Check Firestore for pass and eventLog
    const db = admin.firestore();
    const passSnap = await db.collection('passes').doc(result.passId).get();
    expect(passSnap.exists).toBe(true);
    const eventLogs = await db.collection('eventLogs').where('passId', '==', result.passId).get();
    expect(eventLogs.size).toBe(1);
  });

  it('should fail if UID does not match studentId', async () => {
    const context = testEnv.authenticatedContext('other-uid');
    const wrapped = testEnv.wrap(require('../src/index').createPass);
    const data = {
      studentId,
      scheduleLocationId: 'class-1',
      destinationLocationId: 'bathroom-1',
    };
    await expect(wrapped(data, { auth: { uid: 'other-uid' } })).rejects.toThrow();
  });
}); 