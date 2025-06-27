/**
 * EaglePass Zod Validation Schemas
 * TypeScript-first validation schemas for all data models
 */

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// ============================================================================
// CUSTOM ZOD VALIDATORS
// ============================================================================

// Custom Firestore Timestamp validator
const FirestoreTimestamp = z.custom<Timestamp>(
  (val) => val instanceof Timestamp,
  {
    message: "Expected Firestore Timestamp instance"
  }
);

// Email domain validator
const EmailWithDomain = z.string().email().refine(
  (email) => email.includes('@'),
  {
    message: "Email must contain a domain"
  }
);

// Time format validator (HH:MM) - must have leading zeros
const TimeFormat = z.string().regex(
  /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
  {
    message: "Time must be in HH:MM format with leading zeros"
  }
);

// Grade validator (K-12)
const GradeLevel = z.number().int().min(0).max(12);

// Employee/Student number validator (alphanumeric, 3-20 chars)
const IdentifierNumber = z.string().regex(
  /^[A-Za-z0-9]{3,20}$/,
  {
    message: "Identifier must be 3-20 alphanumeric characters"
  }
);

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const PassStatusSchema = z.enum(['active', 'closed', 'expired', 'cancelled']);
export const LegDirectionSchema = z.enum(['out', 'in']);
export const UserRoleSchema = z.enum(['student', 'teacher', 'support', 'admin']);
export const UserStatusSchema = z.enum(['pending', 'approved', 'blocked']);
export const PermissionModeSchema = z.enum(['allow', 'require_approval', 'block']);
export const EscalationLevelSchema = z.enum(['warning', 'alert', 'critical']);
export const LocationTypeSchema = z.enum(['classroom', 'restroom', 'office', 'library', 'cafeteria', 'gym', 'parking', 'other']);
export const GroupTypeSchema = z.enum(['positive', 'negative']);
export const SystemSettingsCategorySchema = z.enum(['general', 'permissions', 'escalations', 'notifications']);
export const NotificationTypeSchema = z.enum(['escalation', 'pass_created', 'pass_returned', 'system', 'admin']);
export const ReportTypeSchema = z.enum(['frequent_flyers', 'stall_sitters', 'period_heatmap', 'custom']);

// ============================================================================
// SHARED COMPONENT SCHEMAS
// ============================================================================

export const EscalationThresholdsSchema = z.object({
  warning: z.number().int().min(1).max(1440), // 1 minute to 24 hours
  alert: z.number().int().min(1).max(1440)
}).refine(
  (data) => data.alert > data.warning,
  {
    message: "Alert threshold must be greater than warning threshold",
    path: ["alert"]
  }
);

export const StaffLocationAssignmentSchema = z.object({
  locationId: z.string().min(1),
  locationName: z.string().min(1),
  role: z.string().min(1),
  periods: z.array(z.string()).nullable(),
  isPrimary: z.boolean()
});

export const LocationStaffAssignmentSchema = z.object({
  staffId: z.string().min(1),
  staffName: z.string().min(1),
  role: z.string().min(1),
  periods: z.array(z.string()).nullable(),
  isPrimary: z.boolean()
});

export const PeriodSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  startTime: TimeFormat,
  endTime: TimeFormat,
  isActive: z.boolean()
}).refine(
  (data) => {
    const start = data.startTime.split(':').map(Number);
    const end = data.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes > startMinutes;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"]
  }
);

export const StudentPeriodAssignmentSchema = z.object({
  studentId: z.string().min(1),
  periodId: z.string().min(1),
  staffId: z.string().min(1),
  locationId: z.string().min(1),
  courseName: z.string().nullable(),
  isActive: z.boolean()
});

export const DateRangeSchema = z.object({
  start: FirestoreTimestamp,
  end: FirestoreTimestamp
}).refine(
  (data) => data.end.toMillis() > data.start.toMillis(),
  {
    message: "End date must be after start date",
    path: ["end"]
  }
);

// ============================================================================
// PASS SYSTEM SCHEMAS
// ============================================================================

// Base Pass schema without refinements
const BasePassSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  originLocationId: z.string().min(1),
  originLocationName: z.string().min(1),
  destinationLocationId: z.string().min(1),
  destinationLocationName: z.string().min(1),
  status: PassStatusSchema,
  openedAt: FirestoreTimestamp,
  closedAt: FirestoreTimestamp.nullable(),
  totalDuration: z.number().int().min(0).nullable(),
  currentLocationId: z.string().nullable(),
  escalationLevel: EscalationLevelSchema.nullable(),
  escalationTriggeredAt: FirestoreTimestamp.nullable(),
  issuedById: z.string().min(1),
  issuedByName: z.string().min(1),
  isOverride: z.boolean(),
  notes: z.string().nullable(),
  createdAt: FirestoreTimestamp,
  updatedAt: FirestoreTimestamp
});

// Pass schema with refinements
export const PassSchema = BasePassSchema.refine(
  (data) => data.originLocationId !== data.destinationLocationId,
  {
    message: "Origin and destination locations must be different",
    path: ["destinationLocationId"]
  }
).refine(
  (data) => !data.closedAt || data.closedAt.toMillis() >= data.openedAt.toMillis(),
  {
    message: "Closed time must be after or equal to opened time",
    path: ["closedAt"]
  }
).refine(
  (data) => data.updatedAt.toMillis() >= data.createdAt.toMillis(),
  {
    message: "Updated time must be after or equal to created time",
    path: ["updatedAt"]
  }
);

// Base PassLeg schema without refinements
const BasePassLegSchema = z.object({
  id: z.string().min(1),
  passId: z.string().min(1),
  legNumber: z.number().int().min(1),
  studentId: z.string().min(1),
  locationId: z.string().min(1),
  locationName: z.string().min(1),
  actorId: z.string().min(1),
  actorName: z.string().min(1),
  direction: LegDirectionSchema,
  timestamp: FirestoreTimestamp,
  isCheckIn: z.boolean(),
  isReturn: z.boolean(),
  durationFromPrevious: z.number().int().min(0).nullable(),
  notes: z.string().nullable(),
  createdAt: FirestoreTimestamp
});

// PassLeg schema with refinements
export const PassLegSchema = BasePassLegSchema.refine(
  (data) => data.createdAt.toMillis() >= data.timestamp.toMillis(),
  {
    message: "Created time must be after or equal to timestamp",
    path: ["createdAt"]
  }
);

// ============================================================================
// USER SYSTEM SCHEMAS
// ============================================================================

// Base User schema without refinements
const BaseUserSchema = z.object({
  uid: z.string().min(1),
  email: EmailWithDomain,
  displayName: z.string().min(1),
  photoURL: z.string().url().nullable(),
  domain: z.string().min(1),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: FirestoreTimestamp,
  updatedAt: FirestoreTimestamp,
  lastLoginAt: FirestoreTimestamp.nullable(),
  approvedAt: FirestoreTimestamp.nullable(),
  approvedById: z.string().nullable()
});

// User schema with refinements
export const UserSchema = BaseUserSchema.refine(
  (data) => data.updatedAt.toMillis() >= data.createdAt.toMillis(),
  {
    message: "Updated time must be after or equal to created time",
    path: ["updatedAt"]
  }
).refine(
  (data) => !data.lastLoginAt || data.lastLoginAt.toMillis() >= data.createdAt.toMillis(),
  {
    message: "Last login must be after account creation",
    path: ["lastLoginAt"]
  }
).refine(
  (data) => data.status !== 'approved' || (data.approvedAt && data.approvedById),
  {
    message: "Approved users must have approval timestamp and approver ID",
    path: ["status"]
  }
);

// Base Student schema without refinements
const BaseStudentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  studentNumber: IdentifierNumber,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  grade: GradeLevel,
  homeroom: z.string().nullable(),
  groupIds: z.array(z.string()),
  permissionMode: PermissionModeSchema,
  escalationThresholds: EscalationThresholdsSchema,
  isActive: z.boolean(),
  notes: z.string().nullable(),
  createdAt: FirestoreTimestamp,
  updatedAt: FirestoreTimestamp
});

// Student schema with refinements
export const StudentSchema = BaseStudentSchema.refine(
  (data) => data.updatedAt.toMillis() >= data.createdAt.toMillis(),
  {
    message: "Updated time must be after or equal to created time",
    path: ["updatedAt"]
  }
);

// Base Staff schema without refinements
const BaseStaffSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  employeeNumber: IdentifierNumber,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  title: z.string().min(1),
  department: z.string().nullable(),
  locationAssignments: z.array(StaffLocationAssignmentSchema),
  canOverridePasses: z.boolean(),
  canCreateGroups: z.boolean(),
  isActive: z.boolean(),
  notes: z.string().nullable(),
  createdAt: FirestoreTimestamp,
  updatedAt: FirestoreTimestamp
});

// Staff schema with refinements
export const StaffSchema = BaseStaffSchema.refine(
  (data) => data.updatedAt.toMillis() >= data.createdAt.toMillis(),
  {
    message: "Updated time must be after or equal to created time",
    path: ["updatedAt"]
  }
).refine(
  (data) => {
    const primaryAssignments = data.locationAssignments.filter(a => a.isPrimary);
    return primaryAssignments.length <= 1;
  },
  {
    message: "Staff can have at most one primary location assignment",
    path: ["locationAssignments"]
  }
);

// ============================================================================
// LOCATION & SCHEDULE SCHEMAS
// ============================================================================

// Base Location schema without refinements
const BaseLocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1).max(20),
  type: LocationTypeSchema,
  building: z.string().nullable(),
  floor: z.number().int().nullable(),
  staffAssignments: z.array(LocationStaffAssignmentSchema),
  isShared: z.boolean(),
  isCheckInEligible: z.boolean(),
  permissionMode: PermissionModeSchema,
  escalationThresholds: EscalationThresholdsSchema,
  isActive: z.boolean(),
  notes: z.string().nullable(),
  createdAt: FirestoreTimestamp,
  updatedAt: FirestoreTimestamp
});

// Location schema with refinements
export const LocationSchema = BaseLocationSchema.refine(
  (data) => data.updatedAt.toMillis() >= data.createdAt.toMillis(),
  {
    message: "Updated time must be after or equal to created time",
    path: ["updatedAt"]
  }
).refine(
  (data) => data.type !== 'restroom' || !data.isCheckInEligible,
  {
    message: "Restrooms cannot be check-in eligible",
    path: ["isCheckInEligible"]
  }
).refine(
  (data) => {
    const primaryAssignments = data.staffAssignments.filter(a => a.isPrimary);
    return data.isShared || primaryAssignments.length <= 1;
  },
  {
    message: "Non-shared locations can have at most one primary staff assignment",
    path: ["staffAssignments"]
  }
);

// Base Schedule schema without refinements
const BaseScheduleSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  year: z.number().int().min(2020).max(2050),
  isActive: z.boolean(),
  periods: z.array(PeriodSchema).min(1),
  studentAssignments: z.array(StudentPeriodAssignmentSchema),
  createdAt: FirestoreTimestamp,
  updatedAt: FirestoreTimestamp
});

// Schedule schema with refinements
export const ScheduleSchema = BaseScheduleSchema.refine(
  (data) => data.updatedAt.toMillis() >= data.createdAt.toMillis(),
  {
    message: "Updated time must be after or equal to created time",
    path: ["updatedAt"]
  }
).refine(
  (data) => {
    const periodIds = data.periods.map(p => p.id);
    return new Set(periodIds).size === periodIds.length;
  },
  {
    message: "All period IDs must be unique",
    path: ["periods"]
  }
);

// Base Group schema without refinements
const BaseGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().nullable(),
  type: GroupTypeSchema,
  createdById: z.string().min(1),
  createdByName: z.string().min(1),
  studentIds: z.array(z.string()),
  permissionMode: PermissionModeSchema,
  escalationThresholds: EscalationThresholdsSchema.nullable(),
  isActive: z.boolean(),
  notes: z.string().nullable(),
  createdAt: FirestoreTimestamp,
  updatedAt: FirestoreTimestamp
});

// Group schema with refinements
export const GroupSchema = BaseGroupSchema.refine(
  (data) => data.updatedAt.toMillis() >= data.createdAt.toMillis(),
  {
    message: "Updated time must be after or equal to created time",
    path: ["updatedAt"]
  }
).refine(
  (data) => {
    const uniqueStudents = new Set(data.studentIds);
    return uniqueStudents.size === data.studentIds.length;
  },
  {
    message: "Student IDs must be unique within group",
    path: ["studentIds"]
  }
);

// ============================================================================
// SYSTEM SCHEMAS
// ============================================================================

export const SystemSettingsSchema = z.object({
  id: z.string().min(1),
  category: SystemSettingsCategorySchema,
  key: z.string().min(1),
  value: z.any(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  updatedById: z.string().min(1),
  updatedByName: z.string().min(1),
  updatedAt: FirestoreTimestamp
});

export const NotificationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: NotificationTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  passId: z.string().nullable(),
  isRead: z.boolean(),
  createdAt: FirestoreTimestamp,
  readAt: FirestoreTimestamp.nullable()
}).refine(
  (data) => !data.readAt || (data.isRead && data.readAt.toMillis() >= data.createdAt.toMillis()),
  {
    message: "Read timestamp must exist for read notifications and be after creation",
    path: ["readAt"]
  }
);

export const ReportSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: ReportTypeSchema,
  generatedById: z.string().min(1),
  generatedByName: z.string().min(1),
  dateRange: DateRangeSchema,
  filters: z.record(z.any()),
  data: z.any(),
  createdAt: FirestoreTimestamp
});

export const AuditLogSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  action: z.string().min(1),
  resource: z.string().min(1),
  resourceId: z.string().min(1),
  changes: z.record(z.any()).nullable(),
  ipAddress: z.string().ip().nullable(),
  userAgent: z.string().nullable(),
  timestamp: FirestoreTimestamp
});

// ============================================================================
// REQUEST & RESPONSE SCHEMAS
// ============================================================================

export const CreatePassRequestSchema = BasePassSchema.omit({
  id: true,
  status: true,
  openedAt: true,
  closedAt: true,
  totalDuration: true,
  currentLocationId: true,
  escalationLevel: true,
  escalationTriggeredAt: true,
  createdAt: true,
  updatedAt: true
}).refine(
  (data) => data.originLocationId !== data.destinationLocationId,
  {
    message: "Origin and destination locations must be different",
    path: ["destinationLocationId"]
  }
);

export const CreateLegRequestSchema = BasePassLegSchema.omit({
  id: true,
  timestamp: true,
  durationFromPrevious: true,
  createdAt: true
});

export const UpdatePassRequestSchema = BasePassSchema.partial().pick({
  status: true,
  closedAt: true,
  totalDuration: true,
  currentLocationId: true,
  escalationLevel: true,
  escalationTriggeredAt: true,
  notes: true
});

export const PassWithLegsSchema = BasePassSchema.extend({
  legs: z.array(PassLegSchema)
});

export const StudentWithUserSchema = BaseStudentSchema.extend({
  user: UserSchema
});

export const StaffWithUserSchema = BaseStaffSchema.extend({
  user: UserSchema
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

// Export inferred types for use throughout the application
export type Pass = z.infer<typeof PassSchema>;
export type PassLeg = z.infer<typeof PassLegSchema>;
export type User = z.infer<typeof UserSchema>;
export type Student = z.infer<typeof StudentSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type SystemSettings = z.infer<typeof SystemSettingsSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;

export type CreatePassRequest = z.infer<typeof CreatePassRequestSchema>;
export type CreateLegRequest = z.infer<typeof CreateLegRequestSchema>;
export type UpdatePassRequest = z.infer<typeof UpdatePassRequestSchema>;
export type PassWithLegs = z.infer<typeof PassWithLegsSchema>;
export type StudentWithUser = z.infer<typeof StudentWithUserSchema>;
export type StaffWithUser = z.infer<typeof StaffWithUserSchema>;

// Enum types
export type PassStatus = z.infer<typeof PassStatusSchema>;
export type LegDirection = z.infer<typeof LegDirectionSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type PermissionMode = z.infer<typeof PermissionModeSchema>;
export type EscalationLevel = z.infer<typeof EscalationLevelSchema>;
export type LocationType = z.infer<typeof LocationTypeSchema>;
export type GroupType = z.infer<typeof GroupTypeSchema>;
export type SystemSettingsCategory = z.infer<typeof SystemSettingsCategorySchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type ReportType = z.infer<typeof ReportTypeSchema>;

// Component types
export type EscalationThresholds = z.infer<typeof EscalationThresholdsSchema>;
export type StaffLocationAssignment = z.infer<typeof StaffLocationAssignmentSchema>;
export type LocationStaffAssignment = z.infer<typeof LocationStaffAssignmentSchema>;
export type Period = z.infer<typeof PeriodSchema>;
export type StudentPeriodAssignment = z.infer<typeof StudentPeriodAssignmentSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>; 