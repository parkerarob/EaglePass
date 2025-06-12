import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import * as admin from 'firebase-admin';

describe('declareDeparture Cloud Function', () => {
  let testEnv: any;
  let studentId: string;
  let passId: string;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'eaglepass-mvp',
      firestore: { rules: readFileSync('../firestore.rules', 'utf8') },
    });
    studentId = 'student-uid-2';
    // Create a pass for testing
    const passRef = admin.firestore().collection('passes').doc();
    passId = passRef.id;
    await passRef.set({
      passId,
      studentId,
      scheduleLocationId: 'class-2',
      destinationLocationId: 'nurse-1',
      status: 'OPEN',
      state: 'IN_CLASS',
      legId: 1,
      createdAt: admin.firestore.Timestamp.now(),
      lastUpdatedAt: admin.firestore.Timestamp.now(),
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('should update pass state and log event (happy path)', async () => {
    const wrapped = testEnv.wrap(require('../src/index').declareDeparture);
    const data = { passId, studentId };
    const result = await wrapped(data, { auth: { uid: studentId } });
    expect(result).toHaveProperty('passId', passId);
    const db = admin.firestore();
    const passSnap = await db.collection('passes').doc(passId).get();
    expect(passSnap.data()?.state).toBe('IN_TRANSIT');
    const eventLogs = await db.collection('eventLogs').where('passId', '==', passId).get();
    expect(eventLogs.size).toBe(1);
  });

  it('should fail if UID does not match studentId', async () => {
    const wrapped = testEnv.wrap(require('../src/index').declareDeparture);
    const data = { passId, studentId };
    await expect(wrapped(data, { auth: { uid: 'other-uid' } })).rejects.toThrow();
  });
}); 