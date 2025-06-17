// Firestore Data Models & Schema Definitions
// Version: 1.0.0

// --- USERS COLLECTION ---
export interface User {
  id: string; // Corresponds to Firebase Auth UID
  displayName: string;
  email?: string;
  role: UserRole;
  assignment?: string; // e.g., class, group, or location
  restrictions?: string[];
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export enum UserRole {
  DEV = 'dev',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  SUPPORT = 'support',
  STUDENT = 'student',
}

// --- LOCATIONS COLLECTION ---
export interface Location {
  id: string;
  name: string;
  locationType: string;
  responsiblePartyId?: string;
  schemaVersion: number;
}

// --- PASSES COLLECTION ---
export interface Pass {
  id: string;
  studentId: string;
  originLocationId: string;
  destinationLocationId: string;
  status: 'OPEN' | 'CLOSED';
  state: 'IN' | 'OUT';
  createdAt: string;
  lastUpdatedAt: string;
  schemaVersion: number;
}

// --- EVENT LOGS COLLECTION ---
export interface EventLog {
  id: string;
  passId: string;
  studentId: string;
  actorId: string;
  timestamp: string;
  eventType: 'DEPARTED' | 'RETURNED' | 'CLAIMED' | 'EMERGENCY_ACTIVATED' | 'INVALID_TRANSITION';
  schemaVersion: number;
}

// --- GROUPS COLLECTION ---
export interface Group {
  id: string;
  name: string;
  groupType: 'Positive' | 'Negative';
  assignedStudents: string[];
  schemaVersion: number;
}

// --- AUTONOMY MATRIX COLLECTION ---
export interface AutonomyMatrix {
  id: string;
  locationId: string;
  autonomyType: 'Allow' | 'Disallow' | 'Require Approval';
  schemaVersion: number;
}

// --- RESTRICTIONS COLLECTION ---
export interface Restriction {
  id: string;
  studentId: string;
  restrictionType: 'Global' | 'Class-Level';
  isActive: boolean;
  schemaVersion: number;
}

// --- Versioning ---
export const FIRESTORE_SCHEMA_VERSION = 1; 