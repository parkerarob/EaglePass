import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Pass, EventLog } from './types';

admin.initializeApp();
const db = admin.firestore();

const PASSES_COLLECTION = 'passes';
const EVENT_LOGS_COLLECTION = 'eventLogs';

export const createPass = functions.https.onCall(async (data, context) => {
  const { studentId, scheduleLocationId, destinationLocationId } = data;
  if (!context.auth || context.auth.uid !== studentId) {
    throw new functions.https.HttpsError('permission-denied', 'UID mismatch or unauthenticated');
  }
  const passRef = db.collection(PASSES_COLLECTION).doc();
  const eventLogRef = db.collection(EVENT_LOGS_COLLECTION).doc();
  const now = admin.firestore.Timestamp.now();
  const pass: Pass = {
    passId: passRef.id,
    studentId,
    scheduleLocationId,
    destinationLocationId,
    status: 'OPEN',
    state: 'IN_TRANSIT',
    legId: 1,
    createdAt: now,
    lastUpdatedAt: now,
  };
  const eventLog: EventLog = {
    eventId: eventLogRef.id,
    passId: passRef.id,
    studentId,
    actorId: studentId,
    timestamp: now,
    eventType: 'LEFT_CLASS',
  };
  await db.runTransaction(async (trx) => {
    trx.set(passRef, pass);
    trx.set(eventLogRef, eventLog);
  });
  return { passId: passRef.id };
});

export const declareDeparture = functions.https.onCall(async (data, context) => {
  const { passId, studentId } = data;
  if (!context.auth || context.auth.uid !== studentId) {
    throw new functions.https.HttpsError('permission-denied', 'UID mismatch or unauthenticated');
  }
  const passRef = db.collection(PASSES_COLLECTION).doc(passId);
  const eventLogRef = db.collection(EVENT_LOGS_COLLECTION).doc();
  const now = admin.firestore.Timestamp.now();
  await db.runTransaction(async (trx) => {
    const passSnap = await trx.get(passRef);
    if (!passSnap.exists) throw new functions.https.HttpsError('not-found', 'Pass not found');
    const pass = passSnap.data() as Pass;
    if (pass.status !== 'OPEN') throw new functions.https.HttpsError('failed-precondition', 'Pass not open');
    trx.update(passRef, { state: 'IN_TRANSIT', lastUpdatedAt: now });
    const eventLog: EventLog = {
      eventId: eventLogRef.id,
      passId,
      studentId,
      actorId: studentId,
      timestamp: now,
      eventType: 'LEFT_CLASS',
    };
    trx.set(eventLogRef, eventLog);
  });
  return { passId };
});

export const declareReturn = functions.https.onCall(async (data, context) => {
  const { passId, studentId } = data;
  if (!context.auth || context.auth.uid !== studentId) {
    throw new functions.https.HttpsError('permission-denied', 'UID mismatch or unauthenticated');
  }
  const passRef = db.collection(PASSES_COLLECTION).doc(passId);
  const eventLogRef = db.collection(EVENT_LOGS_COLLECTION).doc();
  const now = admin.firestore.Timestamp.now();
  await db.runTransaction(async (trx) => {
    const passSnap = await trx.get(passRef);
    if (!passSnap.exists) throw new functions.https.HttpsError('not-found', 'Pass not found');
    const pass = passSnap.data() as Pass;
    if (pass.status !== 'OPEN') throw new functions.https.HttpsError('failed-precondition', 'Pass not open');
    trx.update(passRef, { state: 'IN_CLASS', status: 'CLOSED', lastUpdatedAt: now });
    const eventLog: EventLog = {
      eventId: eventLogRef.id,
      passId,
      studentId,
      actorId: studentId,
      timestamp: now,
      eventType: 'RETURNED_TO_CLASS',
    };
    trx.set(eventLogRef, eventLog);
  });
  return { passId };
}); 