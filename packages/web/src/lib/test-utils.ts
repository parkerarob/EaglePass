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
  createdAt: Timestamp.fromDate(new Date()),
  updatedAt: Timestamp.fromDate(new Date()),
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
// FIREBASE MOCKS
// ============================================================================

export const createMockFirestoreDoc = (data: any) => ({
  id: 'mock-doc-id',
  data: () => data,
  exists: () => !!data,
  ref: { id: 'mock-doc-id' },
});

export const createMockFirestoreQuerySnapshot = (docs: any[]) => ({
  docs: docs.map(doc => createMockFirestoreDoc(doc)),
  empty: docs.length === 0,
  size: docs.length,
  forEach: (callback: (doc: any) => void) => docs.forEach(callback),
});

export const createMockFirestoreCollection = (docs: any[]) => ({
  id: 'mock-collection',
  docs: docs.map(doc => createMockFirestoreDoc(doc)),
  empty: docs.length === 0,
  size: docs.length,
  forEach: (callback: (doc: any) => void) => docs.forEach(callback),
});

// ============================================================================
// SERVICE MOCKS
// ============================================================================

export const createMockPassService = () => ({
  getActivePassesForStudent: vi.fn().mockResolvedValue([]),
  createPass: vi.fn().mockResolvedValue(undefined),
  checkIn: vi.fn().mockResolvedValue(undefined),
  returnPass: vi.fn().mockResolvedValue(undefined),
  getPassHistory: vi.fn().mockResolvedValue([]),
  getAllActivePasses: vi.fn().mockResolvedValue([]),
  subscribeToActivePasses: vi.fn().mockReturnValue(vi.fn()),
});

export const createMockLocationService = () => ({
  getLocations: vi.fn().mockResolvedValue([]),
  getLocation: vi.fn().mockResolvedValue(null),
  createLocation: vi.fn().mockResolvedValue(undefined),
  updateLocation: vi.fn().mockResolvedValue(undefined),
  deleteLocation: vi.fn().mockResolvedValue(undefined),
});

export const createMockRealtimeService = () => ({
  subscribeToAllActivePasses: vi.fn().mockReturnValue(vi.fn()),
  subscribeToEscalationAlerts: vi.fn().mockReturnValue(vi.fn()),
  subscribeToLocationPasses: vi.fn().mockReturnValue(vi.fn()),
});

// ============================================================================
// HOOK MOCKS
// ============================================================================

export const createMockUseAuth = (overrides = {}) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
  isAuthenticated: false,
  isApproved: false,
  isPending: false,
  isRejected: false,
  isSuspended: false,
  ...overrides,
});

export const createMockUseEscalation = (overrides = {}) => ({
  escalationStats: { totalActive: 0, warnings: 0, alerts: 0, critical: 0 },
  isMonitoring: false,
  lastCheck: null,
  startMonitoring: vi.fn(),
  checkPassEscalation: vi.fn(),
  batchCheckEscalations: vi.fn(),
  getEscalationLevel: vi.fn(),
  getEscalationThresholds: vi.fn(),
  getEscalationIconForUI: vi.fn(),
  refreshStats: vi.fn(),
  checkAllPasses: vi.fn(),
  clearEscalation: vi.fn(),
  getThresholds: vi.fn(),
  getEscalationStatus: vi.fn(),
  calculateDuration: vi.fn(),
  formatPassDuration: vi.fn(),
  getEscalationColorForUI: vi.fn(),
  ...overrides,
});

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

// Mock useAuth to always return a valid user and loading: false
export const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'student',
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    error: null,
    isAdmin: false,
    isTeacher: false,
    isStudent: true,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// Mock PassService to return valid data and loading: false
export const mockPass = {
  id: 'pass-1',
  studentId: 'test-uid',
  status: 'active',
  createdAt: Timestamp.fromDate(new Date()),
  updatedAt: Timestamp.fromDate(new Date()),
};

vi.mock('./pass-service', () => ({
  PassService: {
    getActivePass: vi.fn(() => Promise.resolve(mockPass)),
    getPassesForStudent: vi.fn(() => Promise.resolve([mockPass])),
    createPass: vi.fn(() => Promise.resolve(mockPass)),
    updatePass: vi.fn(() => Promise.resolve(mockPass)),
    deletePass: vi.fn(() => Promise.resolve()),
  },
}));

// Mock LocationService to return valid data and loading: false
export const mockLocation = {
  id: 'loc-1',
  name: 'Main Hall',
};

vi.mock('./location-service', () => ({
  LocationService: {
    getLocations: vi.fn(() => Promise.resolve([mockLocation])),
    getLocationById: vi.fn(() => Promise.resolve(mockLocation)),
  },
})); 