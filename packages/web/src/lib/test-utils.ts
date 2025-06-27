/**
 * Test utilities for EaglePass
 * Common mock objects and helper functions for testing
 */

import { vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import type { 
  Pass, 
  User, 
  Student, 
  Staff, 
  Location
} from './database';
import type { UserProfile, AuthState } from './auth';

// ============================================================================
// MOCK OBJECTS
// ============================================================================

export const createMockPass = (overrides: Partial<Pass> = {}): Pass => ({
  id: 'pass-1',
  studentId: 'student-1',
  studentName: 'John Doe',
  originLocationId: 'room-101',
  originLocationName: 'Room 101',
  destinationLocationId: 'room-102',
  destinationLocationName: 'Room 102',
  status: 'active',
  openedAt: Timestamp.now(),
  closedAt: null,
  totalDuration: null,
  currentLocationId: null,
  escalationLevel: null,
  escalationTriggeredAt: null,
  issuedById: 'user-1',
  issuedByName: 'Teacher',
  isOverride: false,
  notes: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  uid: 'user-1',
  email: 'test@nhcs.net',
  displayName: 'Test User',
  photoURL: null,
  domain: 'nhcs.net',
  role: 'student',
  status: 'approved',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  lastLoginAt: Timestamp.now(),
  approvedAt: Timestamp.now(),
  approvedById: 'admin-1',
  ...overrides,
});

export const createMockStudent = (overrides: Partial<Student> = {}): Student => ({
  id: 'student-1',
  userId: 'user-1',
  studentNumber: 'STU001',
  firstName: 'John',
  lastName: 'Doe',
  grade: 10,
  homeroom: 'HR-101',
  groupIds: [],
  permissionMode: 'allow',
  escalationThresholds: {
    warning: 10,
    alert: 20,
  },
  isActive: true,
  notes: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

export const createMockStaff = (overrides: Partial<Staff> = {}): Staff => ({
  id: 'staff-1',
  userId: 'user-1',
  employeeNumber: 'EMP001',
  firstName: 'Jane',
  lastName: 'Teacher',
  title: 'Math Teacher',
  department: 'Mathematics',
  locationAssignments: [
    {
      locationId: 'room-101',
      locationName: 'Room 101',
      role: 'teacher',
      periods: ['1', '2', '3'],
      isPrimary: true,
    },
  ],
  canOverridePasses: true,
  canCreateGroups: false,
  isActive: true,
  notes: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

export const createMockLocation = (overrides: Partial<Location> = {}): Location => ({
  id: 'location-1',
  name: 'Room 101',
  shortName: 'RM 101',
  type: 'classroom',
  building: 'Main Building',
  floor: 1,
  staffAssignments: [
    {
      staffId: 'staff-1',
      staffName: 'Jane Teacher',
      role: 'teacher',
      periods: ['1', '2', '3'],
      isPrimary: true,
    },
  ],
  isShared: false,
  isCheckInEligible: true,
  permissionMode: 'allow',
  escalationThresholds: {
    warning: 10,
    alert: 20,
  },
  isActive: true,
  notes: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

export const createMockUserProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  uid: 'user-1',
  email: 'test@nhcs.net',
  displayName: 'Test User',
  photoURL: undefined,
  domain: 'nhcs.net',
  role: 'student',
  status: 'approved',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
  approvedBy: 'admin-1',
  approvedAt: new Date(),
  ...overrides,
});

export const createMockFirebaseUser = (overrides: any = {}) => ({
  uid: 'user-1',
  email: 'test@nhcs.net',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
  ...overrides,
});

export const createMockAuthState = (overrides: Partial<AuthState> = {}): AuthState => ({
  user: createMockFirebaseUser(),
  profile: createMockUserProfile(),
  loading: false,
  error: null,
  ...overrides,
});

// ============================================================================
// MOCK FUNCTIONS
// ============================================================================

export const createMockUnsubscribe = () => vi.fn();

export const createMockAuthStateCallback = () => {
  let callback: ((state: AuthState) => void) | null = null;
  return {
    setCallback: (cb: (state: AuthState) => void) => {
      callback = cb;
    },
    triggerCallback: (state: AuthState) => {
      if (callback) callback(state);
    },
  };
};

// ============================================================================
// TEST HELPERS
// ============================================================================

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const createMockError = (message: string) => new Error(message);

export const mockConsoleError = () => {
  const originalError = console.error;
  const mockError = vi.fn();
  console.error = mockError;
  return {
    mockError,
    restore: () => {
      console.error = originalError;
    },
  };
}; 