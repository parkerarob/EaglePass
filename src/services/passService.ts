import { db } from './firebase';
import { Firestore } from 'firebase/firestore';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import {
  PASSES_COLLECTION,
  EVENT_LOGS_COLLECTION,
  passConverter,
  eventLogConverter
} from './firestoreConverters';
import { Pass, EventLog } from '../models/firestoreModels';

// Utility to get active pass for a student
export async function getActivePass(studentId: string): Promise<Pass | null> {
  const passesRef = collection(db, PASSES_COLLECTION).withConverter(passConverter);
  const q = query(passesRef, where('studentId', '==', studentId), where('status', '==', 'OPEN'));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
}

// Create a new pass (IN -> OUT)
export async function createPass(passData: Omit<Pass, 'id' | 'status' | 'state' | 'createdAt' | 'lastUpdatedAt' | 'schemaVersion'>): Promise<Pass> {
  return await runTransaction(db, async (transaction) => {
    // Enforce single active pass per student
    const active = await getActivePass(passData.studentId);
    if (active) throw new Error('Student already has an active pass');

    const passesRef = collection(db, PASSES_COLLECTION).withConverter(passConverter);
    const newPass = {
      ...passData,
      status: 'OPEN',
      state: 'OUT',
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      schemaVersion: 1,
    } as Omit<Pass, 'id'>;
    const docRef = await addDoc(passesRef, newPass);
    const pass: Pass = { ...newPass, id: docRef.id };

    // Log to EventLog
    const eventLogRef = collection(db, EVENT_LOGS_COLLECTION).withConverter(eventLogConverter);
    const event: Omit<EventLog, 'id'> = {
      passId: pass.id,
      studentId: pass.studentId,
      actorId: pass.studentId,
      timestamp: new Date().toISOString(),
      eventType: 'DEPARTED',
      schemaVersion: 1,
    };
    await addDoc(eventLogRef, event);
    return pass;
  });
}

// Return or assist (OUT -> IN)
export async function closePass(passId: string, actorId: string): Promise<Pass> {
  return await runTransaction(db, async (transaction) => {
    const passRef = doc(db, PASSES_COLLECTION, passId).withConverter(passConverter);
    const passSnap = await getDoc(passRef);
    if (!passSnap.exists()) throw new Error('Pass not found');
    const pass = passSnap.data();
    if (pass.status !== 'OPEN' || pass.state !== 'OUT') {
      // Log invalid transition
      const eventLogRef = collection(db, EVENT_LOGS_COLLECTION).withConverter(eventLogConverter);
      const event: Omit<EventLog, 'id'> = {
        passId: pass.id,
        studentId: pass.studentId,
        actorId,
        timestamp: new Date().toISOString(),
        eventType: 'INVALID_TRANSITION',
        schemaVersion: 1,
      };
      await addDoc(eventLogRef, event);
      throw new Error('Invalid pass state for closing');
    }
    // Update pass
    await updateDoc(passRef, {
      status: 'CLOSED',
      state: 'IN',
      lastUpdatedAt: new Date().toISOString(),
    });
    // Log to EventLog
    const eventLogRef = collection(db, EVENT_LOGS_COLLECTION).withConverter(eventLogConverter);
    const event: Omit<EventLog, 'id'> = {
      passId: pass.id,
      studentId: pass.studentId,
      actorId,
      timestamp: new Date().toISOString(),
      eventType: 'RETURNED',
      schemaVersion: 1,
    };
    await addDoc(eventLogRef, event);
    return { ...pass, status: 'CLOSED', state: 'IN', lastUpdatedAt: new Date().toISOString() };
  });
} 