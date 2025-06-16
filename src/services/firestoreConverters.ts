import { FirestoreDataConverter } from 'firebase/firestore';
import {
  User, UserRole,
  Location,
  Pass,
  EventLog,
  Group,
  AutonomyMatrix,
  Restriction,
  FIRESTORE_SCHEMA_VERSION
} from '../models/firestoreModels';

// --- Collection Name Constants (kebab-case) ---
export const USERS_COLLECTION = 'users';
export const LOCATIONS_COLLECTION = 'locations';
export const PASSES_COLLECTION = 'passes';
export const EVENT_LOGS_COLLECTION = 'event-logs';
export const GROUPS_COLLECTION = 'groups';
export const AUTONOMY_MATRIX_COLLECTION = 'autonomy-matrix';
export const RESTRICTIONS_COLLECTION = 'restrictions';

// --- Firestore Data Converters ---

function withSchemaVersion<T extends { schemaVersion: number }>(data: Omit<T, 'schemaVersion'>): T {
  return {
    ...data,
    schemaVersion: FIRESTORE_SCHEMA_VERSION,
  } as T;
}

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user) => ({ ...user }),
  fromFirestore: (snap) => ({ ...snap.data(), id: snap.id } as User),
};

export const locationConverter: FirestoreDataConverter<Location> = {
  toFirestore: (location) => ({ ...location }),
  fromFirestore: (snap) => ({ ...snap.data(), id: snap.id } as Location),
};

export const passConverter: FirestoreDataConverter<Pass> = {
  toFirestore: (pass) => ({ ...pass }),
  fromFirestore: (snap) => ({ ...snap.data(), id: snap.id } as Pass),
};

export const eventLogConverter: FirestoreDataConverter<EventLog> = {
  toFirestore: (eventLog) => ({ ...eventLog }),
  fromFirestore: (snap) => ({ ...snap.data(), id: snap.id } as EventLog),
};

export const groupConverter: FirestoreDataConverter<Group> = {
  toFirestore: (group) => ({ ...group }),
  fromFirestore: (snap) => ({ ...snap.data(), id: snap.id } as Group),
};

export const autonomyMatrixConverter: FirestoreDataConverter<AutonomyMatrix> = {
  toFirestore: (matrix) => ({ ...matrix }),
  fromFirestore: (snap) => ({ ...snap.data(), id: snap.id } as AutonomyMatrix),
};

export const restrictionConverter: FirestoreDataConverter<Restriction> = {
  toFirestore: (restriction) => ({ ...restriction }),
  fromFirestore: (snap) => ({ ...snap.data(), id: snap.id } as Restriction),
}; 