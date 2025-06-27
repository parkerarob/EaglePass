/**
 * EaglePass Database Schema
 * Defines all Firestore collections and their TypeScript interfaces
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// CORE TYPES
// ============================================================================

export type PassStatus = 'active' | 'closed' | 'expired' | 'cancelled';
export type LegDirection = 'out' | 'in';
export type UserRole = 'student' | 'teacher' | 'support' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'blocked';
export type PermissionMode = 'allow' | 'require_approval' | 'block';
export type EscalationLevel = 'warning' | 'alert' | 'critical';

// ============================================================================
// PASS SYSTEM SCHEMA
// ============================================================================

/**
 * Pass Collection: passes/{passId}
 * Summary document for each hall pass
 */
export interface Pass {
  id: string;
  studentId: string;
  studentName: string;
  originLocationId: string;
  originLocationName: string;
  destinationLocationId: string;
  destinationLocationName: string;
  status: PassStatus;
  openedAt: Timestamp;
  closedAt: Timestamp | null;
  totalDuration: number | null; // in minutes, calculated when closed
  currentLocationId: string | null; // where student currently is
  escalationLevel: EscalationLevel | null;
  escalationTriggeredAt: Timestamp | null;
  issuedById: string; // student or staff who issued the pass
  issuedByName: string;
  isOverride: boolean; // true if issued by staff for student
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Legs Subcollection: legs/{passId}/{legId}
 * Immutable movement records for each pass
 */
export interface PassLeg {
  id: string;
  passId: string;
  legNumber: number; // sequential number for this pass
  studentId: string;
  locationId: string;
  locationName: string;
  actorId: string; // who performed this action (student or staff)
  actorName: string;
  direction: LegDirection;
  timestamp: Timestamp;
  isCheckIn: boolean; // true if this is a check-in at intermediate location
  isReturn: boolean; // true if this is return to origin
  durationFromPrevious: number | null; // minutes since previous leg
  notes: string | null;
  createdAt: Timestamp;
}

// ============================================================================
// USER SYSTEM SCHEMA
// ============================================================================

/**
 * Users Collection: users/{userId}
 * Base user profiles (extends Firebase Auth)
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  domain: string; // e.g., 'nhcs.net'
  role: UserRole;
  status: UserStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
  approvedAt: Timestamp | null;
  approvedById: string | null;
}

/**
 * Students Collection: students/{studentId}
 * Extended student information
 */
export interface Student {
  id: string;
  userId: string; // references users collection
  studentNumber: string;
  firstName: string;
  lastName: string;
  grade: number;
  homeroom: string | null;
  groupIds: string[]; // references groups collection
  permissionMode: PermissionMode;
  escalationThresholds: {
    warning: number; // minutes
    alert: number; // minutes
  };
  isActive: boolean;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Staff Collection: staff/{staffId}
 * Extended staff information
 */
export interface Staff {
  id: string;
  userId: string; // references users collection
  employeeNumber: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string | null;
  locationAssignments: StaffLocationAssignment[];
  canOverridePasses: boolean;
  canCreateGroups: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StaffLocationAssignment {
  locationId: string;
  locationName: string;
  role: string; // e.g., 'teacher', 'monitor', 'admin'
  periods: string[] | null; // null means all periods
  isPrimary: boolean;
}

// ============================================================================
// LOCATION & SCHEDULE SCHEMA
// ============================================================================

/**
 * Locations Collection: locations/{locationId}
 * School locations and their configurations
 */
export interface Location {
  id: string;
  name: string;
  shortName: string; // e.g., 'RM 101'
  type: 'classroom' | 'restroom' | 'office' | 'library' | 'cafeteria' | 'gym' | 'parking' | 'other';
  building: string | null;
  floor: number | null;
  staffAssignments: LocationStaffAssignment[];
  isShared: boolean; // true if multiple staff can monitor
  isCheckInEligible: boolean; // false for restrooms
  permissionMode: PermissionMode;
  escalationThresholds: {
    warning: number; // minutes
    alert: number; // minutes
  };
  isActive: boolean;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LocationStaffAssignment {
  staffId: string;
  staffName: string;
  role: string;
  periods: string[] | null; // null means all periods
  isPrimary: boolean;
}

/**
 * Schedules Collection: schedules/{term}
 * Class schedules and period assignments
 */
export interface Schedule {
  id: string; // term identifier, e.g., 'fall2024'
  term: string;
  year: number;
  isActive: boolean;
  periods: Period[];
  studentAssignments: StudentPeriodAssignment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Period {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
}

export interface StudentPeriodAssignment {
  studentId: string;
  periodId: string;
  staffId: string;
  locationId: string;
  courseName: string | null;
  isActive: boolean;
}

// ============================================================================
// GROUP SYSTEM SCHEMA
// ============================================================================

/**
 * Groups Collection: groups/{groupId}
 * Student groupings for permission management
 */
export interface Group {
  id: string;
  name: string;
  description: string | null;
  type: 'positive' | 'negative'; // positive = more permissions, negative = restrictions
  createdById: string;
  createdByName: string;
  studentIds: string[];
  permissionMode: PermissionMode;
  escalationThresholds: {
    warning: number; // minutes
    alert: number; // minutes
  } | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// SYSTEM CONFIGURATION SCHEMA
// ============================================================================

/**
 * Settings Collection: settings/{settingId}
 * Global system configuration
 */
export interface SystemSettings {
  id: string;
  category: 'general' | 'permissions' | 'escalations' | 'notifications';
  key: string;
  value: any;
  description: string | null;
  isActive: boolean;
  updatedById: string;
  updatedByName: string;
  updatedAt: Timestamp;
}

/**
 * Notifications Collection: notifications/{notificationId}
 * User notifications and alerts
 */
export interface Notification {
  id: string;
  userId: string;
  type: 'escalation' | 'pass_created' | 'pass_returned' | 'system' | 'admin';
  title: string;
  message: string;
  passId: string | null;
  isRead: boolean;
  createdAt: Timestamp;
  readAt: Timestamp | null;
}

// ============================================================================
// REPORTING & AUDIT SCHEMA
// ============================================================================

/**
 * Reports Collection: reports/{reportId}
 * Generated reports and analytics
 */
export interface Report {
  id: string;
  name: string;
  type: 'frequent_flyers' | 'stall_sitters' | 'period_heatmap' | 'custom';
  generatedById: string;
  generatedByName: string;
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
  filters: Record<string, any>;
  data: any; // report-specific data structure
  createdAt: Timestamp;
}

/**
 * Audit Collection: audit/{auditId}
 * System audit logs
 */
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Timestamp;
}

// ============================================================================
// COLLECTION NAMES
// ============================================================================

export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  STAFF: 'staff',
  LOCATIONS: 'locations',
  SCHEDULES: 'schedules',
  GROUPS: 'groups',
  PASSES: 'passes',
  LEGS: 'legs',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  AUDIT: 'audit',
} as const;

// ============================================================================
// COMPOSITE INDEX REQUIREMENTS
// ============================================================================

/**
 * Required Firestore Composite Indexes:
 * 
 * 1. passes collection:
 *    - (studentId, status) - for student's active passes
 *    - (locationId, openedAt) - for location heatmaps
 *    - (status, openedAt) - for active passes dashboard
 *    - (escalationLevel, escalationTriggeredAt) - for escalation alerts
 * 
 * 2. legs subcollection:
 *    - (passId, legNumber) - for chronological leg ordering
 *    - (studentId, timestamp) - for student movement history
 *    - (locationId, timestamp) - for location traffic analysis
 * 
 * 3. students collection:
 *    - (grade, isActive) - for grade-level reporting
 *    - (homeroom, isActive) - for homeroom reporting
 * 
 * 4. notifications collection:
 *    - (userId, isRead, createdAt) - for user notification feeds
 *    - (type, createdAt) - for system notification management
 * 
 * 5. audit collection:
 *    - (userId, timestamp) - for user activity logs
 *    - (resource, timestamp) - for resource change history
 */

// ============================================================================
// HELPER TYPES
// ============================================================================

export type CreatePassRequest = Omit<Pass, 'id' | 'status' | 'openedAt' | 'closedAt' | 'totalDuration' | 'currentLocationId' | 'escalationLevel' | 'escalationTriggeredAt' | 'createdAt' | 'updatedAt'>;

export type CreateLegRequest = Omit<PassLeg, 'id' | 'timestamp' | 'durationFromPrevious' | 'createdAt'>;

export type UpdatePassRequest = Partial<Pick<Pass, 'status' | 'closedAt' | 'totalDuration' | 'currentLocationId' | 'escalationLevel' | 'escalationTriggeredAt' | 'notes'>>;

export type PassWithLegs = Pass & {
  legs: PassLeg[];
};

export type StudentWithUser = Student & {
  user: User;
};

export type StaffWithUser = Staff & {
  user: User;
}; 