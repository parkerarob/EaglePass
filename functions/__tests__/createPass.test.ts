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

describe('createPass', () => {
  const mockData = {
    studentId: 'student123',
    scheduleLocationId: 'location1',
    destinationLocationId: 'location2'
  };

  const mockContext: functions.https.CallableContext = {
    auth: {
      uid: 'student123',
      token: {} as any
    },
    rawRequest: {} as any
  };

  it('successfully creates new pass and eventLog documents', async () => {
    const { createPass } = require('../src');
    const result = await createPass(mockData, mockContext);
    expect(result).toHaveProperty('passId');

    // Verify pass document
    const passDoc = await testEnv.unauthenticatedContext().firestore()
      .collection('passes')
      .doc(result.passId)
      .get();
    
    expect(passDoc.exists).toBe(true);
    const passData = passDoc.data() as Pass;
    expect(passData).toMatchObject({
      passId: result.passId,
      studentId: mockData.studentId,
      scheduleLocationId: mockData.scheduleLocationId,
      destinationLocationId: mockData.destinationLocationId,
      status: 'OPEN',
      state: 'IN_TRANSIT',
      legId: 1
    });
    expect(passData.createdAt).toBeInstanceOf(Timestamp);
    expect(passData.lastUpdatedAt).toBeInstanceOf(Timestamp);

    // Verify eventLog document
    const eventLogs = await testEnv.unauthenticatedContext().firestore()
      .collection('eventLogs')
      .where('passId', '==', result.passId)
      .get();
    
    expect(eventLogs.empty).toBe(false);
    const eventLog = eventLogs.docs[0].data() as EventLog;
    expect(eventLog).toMatchObject({
      passId: result.passId,
      studentId: mockData.studentId,
      actorId: mockData.studentId,
      eventType: 'LEFT_CLASS'
    });
    expect(eventLog.timestamp).toBeInstanceOf(Timestamp);
  });

  it('fails if authenticated UID does not match studentId', async () => {
    const { createPass } = require('../src');
    const invalidContext: functions.https.CallableContext = {
      auth: {
        uid: 'different_student',
        token: {} as any
      },
      rawRequest: {} as any
    };

    await expect(createPass(mockData, invalidContext))
      .rejects
      .toThrow('permission-denied');
  });

  it('fails if not authenticated', async () => {
    const { createPass } = require('../src');
    const unauthContext: functions.https.CallableContext = {
      auth: undefined,
      rawRequest: {} as any
    };

    await expect(createPass(mockData, unauthContext))
      .rejects
      .toThrow('permission-denied');
  });
}); 