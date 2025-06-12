import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Pass, EventLog } from '../src/types';
import { Timestamp } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Mock firebase functions and admin
jest.mock('firebase-functions');
jest.mock('firebase-admin');

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'eaglepass-dev',
    firestore: {
      rules: readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('declareReturn', () => {
  const studentId = 'student123';
  const passId = 'pass123';
  
  // Setup initial pass document
  beforeEach(async () => {
    const now = admin.firestore.Timestamp.now();
    await testEnv.unauthenticatedContext().firestore()
      .collection('passes')
      .doc(passId)
      .set({
        passId,
        studentId,
        scheduleLocationId: 'location1',
        destinationLocationId: 'location2',
        status: 'OPEN',
        state: 'IN_TRANSIT',
        legId: 1,
        createdAt: now,
        lastUpdatedAt: now
      });
  });

  const mockData = {
    passId,
    studentId
  };

  const mockContext: functions.https.CallableContext = {
    auth: {
      uid: studentId,
      token: {} as any
    },
    rawRequest: {} as any
  };

  it('successfully closes pass and logs event', async () => {
    const { declareReturn } = require('../src');
    const result = await declareReturn(mockData, mockContext);
    expect(result).toHaveProperty('passId');

    // Verify pass document update
    const passDoc = await testEnv.unauthenticatedContext().firestore()
      .collection('passes')
      .doc(passId)
      .get();
    
    expect(passDoc.exists).toBe(true);
    const passData = passDoc.data() as Pass;
    expect(passData).toMatchObject({
      passId,
      studentId,
      state: 'IN_CLASS',
      status: 'CLOSED'
    });
    expect(passData.lastUpdatedAt).toBeInstanceOf(Timestamp);

    // Verify eventLog document
    const eventLogs = await testEnv.unauthenticatedContext().firestore()
      .collection('eventLogs')
      .where('passId', '==', passId)
      .get();
    
    expect(eventLogs.empty).toBe(false);
    const eventLog = eventLogs.docs[0].data() as EventLog;
    expect(eventLog).toMatchObject({
      passId,
      studentId,
      actorId: studentId,
      eventType: 'RETURNED_TO_CLASS'
    });
    expect(eventLog.timestamp).toBeInstanceOf(Timestamp);
  });

  it('fails if authenticated UID does not match studentId', async () => {
    const { declareReturn } = require('../src');
    const invalidContext: functions.https.CallableContext = {
      auth: {
        uid: 'different_student',
        token: {} as any
      },
      rawRequest: {} as any
    };

    await expect(declareReturn(mockData, invalidContext))
      .rejects
      .toThrow('permission-denied');
  });

  it('fails if not authenticated', async () => {
    const { declareReturn } = require('../src');
    const unauthContext: functions.https.CallableContext = {
      auth: undefined,
      rawRequest: {} as any
    };

    await expect(declareReturn(mockData, unauthContext))
      .rejects
      .toThrow('permission-denied');
  });

  it('fails if pass does not exist', async () => {
    const { declareReturn } = require('../src');
    const nonExistentData = {
      passId: 'nonexistent',
      studentId
    };

    await expect(declareReturn(nonExistentData, mockContext))
      .rejects
      .toThrow('not-found');
  });

  it('fails if pass is not open', async () => {
    const { declareReturn } = require('../src');
    
    // Update pass to closed state
    await testEnv.unauthenticatedContext().firestore()
      .collection('passes')
      .doc(passId)
      .update({ status: 'CLOSED' });

    await expect(declareReturn(mockData, mockContext))
      .rejects
      .toThrow('failed-precondition');
  });
}); 