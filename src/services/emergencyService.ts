import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  runTransaction
} from 'firebase/firestore';
import { EVENT_LOGS_COLLECTION, eventLogConverter } from './firestoreConverters';
import { EventLog, UserRole } from '../models/firestoreModels';

const CONFIG_DOC = 'config/emergency';

// Get the current emergency freeze state
export async function getEmergencyFreeze(): Promise<boolean> {
  const configRef = doc(db, CONFIG_DOC);
  const snap = await getDoc(configRef);
  return snap.exists() ? !!snap.data().emergencyFreeze : false;
}

// Set the emergency freeze state (admin/dev only)
export async function setEmergencyFreeze(state: boolean, actor: { uid: string; role: UserRole }): Promise<void> {
  if (![UserRole.ADMIN, UserRole.DEV].includes(actor.role)) {
    throw new Error('Unauthorized: Only Admin or Dev can toggle emergency freeze');
  }
  const configRef = doc(db, CONFIG_DOC);
  await setDoc(configRef, { emergencyFreeze: state }, { merge: true });
  // Log event
  const eventLogRef = collection(db, EVENT_LOGS_COLLECTION).withConverter(eventLogConverter);
  const event: Omit<EventLog, 'id'> = {
    passId: '',
    studentId: '',
    actorId: actor.uid,
    timestamp: new Date().toISOString(),
    eventType: 'EMERGENCY_ACTIVATED',
    schemaVersion: 1,
  };
  await addDoc(eventLogRef, event);
}

// Check if pass creation is allowed
export async function canCreatePass(): Promise<boolean> {
  return !(await getEmergencyFreeze());
}

// Emergency claim: OUT->IN for a pass
export async function emergencyClaim(passId: string, actor: { uid: string; role: UserRole }): Promise<void> {
  // Only allow if freeze is ON
  if (!(await getEmergencyFreeze())) {
    throw new Error('Emergency freeze is not active');
  }
  // Log event
  const eventLogRef = collection(db, EVENT_LOGS_COLLECTION).withConverter(eventLogConverter);
  const event: Omit<EventLog, 'id'> = {
    passId,
    studentId: '',
    actorId: actor.uid,
    timestamp: new Date().toISOString(),
    eventType: 'EMERGENCY_ACTIVATED',
    schemaVersion: 1,
  };
  await addDoc(eventLogRef, event);
  // (Pass state update logic would be handled in passService or a Cloud Function)
} 