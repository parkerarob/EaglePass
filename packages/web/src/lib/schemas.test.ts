/**
 * Unit tests for EaglePass Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import {
  PassSchema,
  PassLegSchema,
  UserSchema,
  StudentSchema,
  StaffSchema,
  LocationSchema,
  ScheduleSchema,
  GroupSchema,
  EscalationThresholdsSchema,
  PeriodSchema,
  CreatePassRequestSchema,
  PassStatusSchema,
  UserRoleSchema,
  PermissionModeSchema,
  LocationTypeSchema
} from './schemas';

// Helper to create test Timestamp
const createTimestamp = (milliseconds: number) => 
  Timestamp.fromMillis(milliseconds);

const NOW = createTimestamp(Date.now());
const EARLIER = createTimestamp(Date.now() - 60000); // 1 minute ago

describe('Zod Schemas', () => {
  describe('Enum Schemas', () => {
    it('should validate PassStatus enum', () => {
      expect(PassStatusSchema.parse('active')).toBe('active');
      expect(PassStatusSchema.parse('closed')).toBe('closed');
      expect(PassStatusSchema.parse('expired')).toBe('expired');
      expect(PassStatusSchema.parse('cancelled')).toBe('cancelled');
      
      expect(() => PassStatusSchema.parse('invalid')).toThrow();
    });

    it('should validate UserRole enum', () => {
      expect(UserRoleSchema.parse('student')).toBe('student');
      expect(UserRoleSchema.parse('teacher')).toBe('teacher');
      expect(UserRoleSchema.parse('support')).toBe('support');
      expect(UserRoleSchema.parse('admin')).toBe('admin');
      
      expect(() => UserRoleSchema.parse('invalid')).toThrow();
    });

    it('should validate PermissionMode enum', () => {
      expect(PermissionModeSchema.parse('allow')).toBe('allow');
      expect(PermissionModeSchema.parse('require_approval')).toBe('require_approval');
      expect(PermissionModeSchema.parse('block')).toBe('block');
      
      expect(() => PermissionModeSchema.parse('invalid')).toThrow();
    });

    it('should validate LocationType enum', () => {
      expect(LocationTypeSchema.parse('classroom')).toBe('classroom');
      expect(LocationTypeSchema.parse('restroom')).toBe('restroom');
      expect(LocationTypeSchema.parse('office')).toBe('office');
      
      expect(() => LocationTypeSchema.parse('invalid')).toThrow();
    });
  });

  describe('EscalationThresholds Schema', () => {
    it('should validate correct escalation thresholds', () => {
      const validThresholds = {
        warning: 10,
        alert: 20
      };
      
      expect(EscalationThresholdsSchema.parse(validThresholds)).toEqual(validThresholds);
    });

    it('should reject alert threshold less than or equal to warning', () => {
      const invalidThresholds = {
        warning: 20,
        alert: 10
      };
      
      expect(() => EscalationThresholdsSchema.parse(invalidThresholds)).toThrow();
    });

    it('should reject thresholds outside valid range', () => {
      expect(() => EscalationThresholdsSchema.parse({ warning: 0, alert: 10 })).toThrow();
      expect(() => EscalationThresholdsSchema.parse({ warning: 10, alert: 1500 })).toThrow();
    });
  });

  describe('Period Schema', () => {
    it('should validate correct period', () => {
      const validPeriod = {
        id: 'period-1',
        name: 'First Period',
        startTime: '08:00',
        endTime: '08:50',
        isActive: true
      };
      
      expect(PeriodSchema.parse(validPeriod)).toEqual(validPeriod);
    });

    it('should reject invalid time formats', () => {
      const invalidPeriod = {
        id: 'period-1',
        name: 'First Period',
        startTime: '8:00', // Missing leading zero
        endTime: '08:50',
        isActive: true
      };
      
      expect(() => PeriodSchema.parse(invalidPeriod)).toThrow();
    });

    it('should reject end time before start time', () => {
      const invalidPeriod = {
        id: 'period-1',
        name: 'First Period',
        startTime: '09:00',
        endTime: '08:50',
        isActive: true
      };
      
      expect(() => PeriodSchema.parse(invalidPeriod)).toThrow();
    });
  });

  describe('Pass Schema', () => {
    const validPass = {
      id: 'pass-123',
      studentId: 'student-123',
      studentName: 'John Doe',
      originLocationId: 'room-101',
      originLocationName: 'Room 101',
      destinationLocationId: 'room-102',
      destinationLocationName: 'Room 102',
      status: 'active' as const,
      openedAt: EARLIER,
      closedAt: null,
      totalDuration: null,
      currentLocationId: null,
      escalationLevel: null,
      escalationTriggeredAt: null,
      issuedById: 'user-123',
      issuedByName: 'Jane Teacher',
      isOverride: false,
      notes: null,
      createdAt: EARLIER,
      updatedAt: NOW
    };

    it('should validate correct pass', () => {
      expect(PassSchema.parse(validPass)).toEqual(validPass);
    });

    it('should reject same origin and destination', () => {
      const invalidPass = {
        ...validPass,
        destinationLocationId: 'room-101' // Same as origin
      };
      
      expect(() => PassSchema.parse(invalidPass)).toThrow();
    });

    it('should reject closed time before opened time', () => {
      const invalidPass = {
        ...validPass,
        closedAt: EARLIER,
        openedAt: NOW
      };
      
      expect(() => PassSchema.parse(invalidPass)).toThrow();
    });

    it('should reject updated time before created time', () => {
      const invalidPass = {
        ...validPass,
        createdAt: NOW,
        updatedAt: EARLIER
      };
      
      expect(() => PassSchema.parse(invalidPass)).toThrow();
    });
  });

  describe('PassLeg Schema', () => {
    const validLeg = {
      id: 'leg-123',
      passId: 'pass-123',
      legNumber: 1,
      studentId: 'student-123',
      locationId: 'room-101',
      locationName: 'Room 101',
      actorId: 'user-123',
      actorName: 'John Doe',
      direction: 'out' as const,
      timestamp: EARLIER,
      isCheckIn: false,
      isReturn: false,
      durationFromPrevious: null,
      notes: null,
      createdAt: NOW
    };

    it('should validate correct pass leg', () => {
      expect(PassLegSchema.parse(validLeg)).toEqual(validLeg);
    });

    it('should reject created time before timestamp', () => {
      const invalidLeg = {
        ...validLeg,
        timestamp: NOW,
        createdAt: EARLIER
      };
      
      expect(() => PassLegSchema.parse(invalidLeg)).toThrow();
    });

    it('should require positive leg number', () => {
      const invalidLeg = {
        ...validLeg,
        legNumber: 0
      };
      
      expect(() => PassLegSchema.parse(invalidLeg)).toThrow();
    });
  });

  describe('User Schema', () => {
    const validUser = {
      uid: 'user-123',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      photoURL: null,
      domain: 'example.com',
      role: 'student' as const,
      status: 'approved' as const,
      createdAt: EARLIER,
      updatedAt: NOW,
      lastLoginAt: NOW,
      approvedAt: NOW,
      approvedById: 'admin-123'
    };

    it('should validate correct user', () => {
      expect(UserSchema.parse(validUser)).toEqual(validUser);
    });

    it('should reject invalid email format', () => {
      const invalidUser = {
        ...validUser,
        email: 'invalid-email'
      };
      
      expect(() => UserSchema.parse(invalidUser)).toThrow();
    });

    it('should reject approved user without approval info', () => {
      const invalidUser = {
        ...validUser,
        status: 'approved' as const,
        approvedAt: null,
        approvedById: null
      };
      
      expect(() => UserSchema.parse(invalidUser)).toThrow();
    });

    it('should allow pending user without approval info', () => {
      const validPendingUser = {
        ...validUser,
        status: 'pending' as const,
        approvedAt: null,
        approvedById: null
      };
      
      expect(UserSchema.parse(validPendingUser)).toEqual(validPendingUser);
    });
  });

  describe('Student Schema', () => {
    const validStudent = {
      id: 'student-123',
      userId: 'user-123',
      studentNumber: 'STU123',
      firstName: 'John',
      lastName: 'Doe',
      grade: 10,
      homeroom: 'HR-101',
      groupIds: ['group-1', 'group-2'],
      permissionMode: 'allow' as const,
      escalationThresholds: {
        warning: 10,
        alert: 20
      },
      isActive: true,
      notes: null,
      createdAt: EARLIER,
      updatedAt: NOW
    };

    it('should validate correct student', () => {
      expect(StudentSchema.parse(validStudent)).toEqual(validStudent);
    });

    it('should reject invalid grade', () => {
      const invalidStudent = {
        ...validStudent,
        grade: 15 // Invalid grade
      };
      
      expect(() => StudentSchema.parse(invalidStudent)).toThrow();
    });

    it('should reject invalid student number format', () => {
      const invalidStudent = {
        ...validStudent,
        studentNumber: 'ST' // Too short
      };
      
      expect(() => StudentSchema.parse(invalidStudent)).toThrow();
    });
  });

  describe('Staff Schema', () => {
    const validStaff = {
      id: 'staff-123',
      userId: 'user-123',
      employeeNumber: 'EMP123',
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
          isPrimary: true
        }
      ],
      canOverridePasses: true,
      canCreateGroups: false,
      isActive: true,
      notes: null,
      createdAt: EARLIER,
      updatedAt: NOW
    };

    it('should validate correct staff', () => {
      expect(StaffSchema.parse(validStaff)).toEqual(validStaff);
    });

    it('should reject multiple primary assignments', () => {
      const invalidStaff = {
        ...validStaff,
        locationAssignments: [
          {
            locationId: 'room-101',
            locationName: 'Room 101',
            role: 'teacher',
            periods: ['1', '2'],
            isPrimary: true
          },
          {
            locationId: 'room-102',
            locationName: 'Room 102',
            role: 'teacher',
            periods: ['3', '4'],
            isPrimary: true
          }
        ]
      };
      
      expect(() => StaffSchema.parse(invalidStaff)).toThrow();
    });
  });

  describe('Location Schema', () => {
    const validLocation = {
      id: 'location-123',
      name: 'Room 101',
      shortName: 'RM 101',
      type: 'classroom' as const,
      building: 'Main Building',
      floor: 1,
      staffAssignments: [
        {
          staffId: 'staff-123',
          staffName: 'Jane Teacher',
          role: 'teacher',
          periods: ['1', '2', '3'],
          isPrimary: true
        }
      ],
      isShared: false,
      isCheckInEligible: true,
      permissionMode: 'allow' as const,
      escalationThresholds: {
        warning: 10,
        alert: 20
      },
      isActive: true,
      notes: null,
      createdAt: EARLIER,
      updatedAt: NOW
    };

    it('should validate correct location', () => {
      expect(LocationSchema.parse(validLocation)).toEqual(validLocation);
    });

    it('should reject restroom that is check-in eligible', () => {
      const invalidLocation = {
        ...validLocation,
        type: 'restroom' as const,
        isCheckInEligible: true
      };
      
      expect(() => LocationSchema.parse(invalidLocation)).toThrow();
    });

    it('should allow restroom that is not check-in eligible', () => {
      const validRestroom = {
        ...validLocation,
        type: 'restroom' as const,
        isCheckInEligible: false
      };
      
      expect(LocationSchema.parse(validRestroom)).toEqual(validRestroom);
    });

    it('should reject non-shared location with multiple primary assignments', () => {
      const invalidLocation = {
        ...validLocation,
        isShared: false,
        staffAssignments: [
          {
            staffId: 'staff-123',
            staffName: 'Jane Teacher',
            role: 'teacher',
            periods: ['1', '2'],
            isPrimary: true
          },
          {
            staffId: 'staff-124',
            staffName: 'John Teacher',
            role: 'teacher',
            periods: ['3', '4'],
            isPrimary: true
          }
        ]
      };
      
      expect(() => LocationSchema.parse(invalidLocation)).toThrow();
    });
  });

  describe('Group Schema', () => {
    const validGroup = {
      id: 'group-123',
      name: 'Advanced Students',
      description: 'Students with advanced privileges',
      type: 'positive' as const,
      createdById: 'admin-123',
      createdByName: 'Admin User',
      studentIds: ['student-1', 'student-2', 'student-3'],
      permissionMode: 'allow' as const,
      escalationThresholds: {
        warning: 15,
        alert: 30
      },
      isActive: true,
      notes: null,
      createdAt: EARLIER,
      updatedAt: NOW
    };

    it('should validate correct group', () => {
      expect(GroupSchema.parse(validGroup)).toEqual(validGroup);
    });

    it('should reject duplicate student IDs', () => {
      const invalidGroup = {
        ...validGroup,
        studentIds: ['student-1', 'student-2', 'student-1'] // Duplicate
      };
      
      expect(() => GroupSchema.parse(invalidGroup)).toThrow();
    });

    it('should validate empty student list', () => {
      const validEmptyGroup = {
        ...validGroup,
        studentIds: []
      };
      
      expect(GroupSchema.parse(validEmptyGroup)).toEqual(validEmptyGroup);
    });
  });

  describe('Schedule Schema', () => {
    const validSchedule = {
      id: 'fall2024',
      term: 'Fall 2024',
      year: 2024,
      isActive: true,
      periods: [
        {
          id: 'period-1',
          name: 'First Period',
          startTime: '08:00',
          endTime: '08:50',
          isActive: true
        },
        {
          id: 'period-2',
          name: 'Second Period',
          startTime: '09:00',
          endTime: '09:50',
          isActive: true
        }
      ],
      studentAssignments: [
        {
          studentId: 'student-123',
          periodId: 'period-1',
          staffId: 'staff-123',
          locationId: 'room-101',
          courseName: 'Algebra I',
          isActive: true
        }
      ],
      createdAt: EARLIER,
      updatedAt: NOW
    };

    it('should validate correct schedule', () => {
      expect(ScheduleSchema.parse(validSchedule)).toEqual(validSchedule);
    });

    it('should reject duplicate period IDs', () => {
      const invalidSchedule = {
        ...validSchedule,
        periods: [
          {
            id: 'period-1',
            name: 'First Period',
            startTime: '08:00',
            endTime: '08:50',
            isActive: true
          },
          {
            id: 'period-1', // Duplicate ID
            name: 'Second Period',
            startTime: '09:00',
            endTime: '09:50',
            isActive: true
          }
        ]
      };
      
      expect(() => ScheduleSchema.parse(invalidSchedule)).toThrow();
    });

    it('should reject invalid year', () => {
      const invalidSchedule = {
        ...validSchedule,
        year: 2051 // Out of range
      };
      
      expect(() => ScheduleSchema.parse(invalidSchedule)).toThrow();
    });

    it('should require at least one period', () => {
      const invalidSchedule = {
        ...validSchedule,
        periods: []
      };
      
      expect(() => ScheduleSchema.parse(invalidSchedule)).toThrow();
    });
  });

  describe('CreatePassRequest Schema', () => {
    const validCreateRequest = {
      studentId: 'student-123',
      studentName: 'John Doe',
      originLocationId: 'room-101',
      originLocationName: 'Room 101',
      destinationLocationId: 'room-102',
      destinationLocationName: 'Room 102',
      issuedById: 'user-123',
      issuedByName: 'Jane Teacher',
      isOverride: false,
      notes: null
    };

    it('should validate correct create request', () => {
      expect(CreatePassRequestSchema.parse(validCreateRequest)).toEqual(validCreateRequest);
    });

    it('should reject same origin and destination', () => {
      const invalidRequest = {
        ...validCreateRequest,
        destinationLocationId: 'room-101' // Same as origin
      };
      
      expect(() => CreatePassRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should require all mandatory fields', () => {
      const incompleteRequest = {
        studentId: 'student-123',
        // Missing other required fields
      };
      
      expect(() => CreatePassRequestSchema.parse(incompleteRequest)).toThrow();
    });
  });
}); 