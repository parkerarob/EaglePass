/**
 * EaglePass Escalation Service Tests
 * Tests for escalation threshold calculation and level determination
 */

import { describe, it, expect, vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase dependencies
vi.mock('./firebase', () => ({
  db: {},
}));

vi.mock('./database-service', () => ({
  PassService: {
    getAllActivePasses: vi.fn(),
    updatePass: vi.fn(),
  },
  UserService: {
    getUser: vi.fn(),
    getUsers: vi.fn(),
  },
  LocationService: {
    getLocation: vi.fn(),
  },
  StudentService: {
    getStudent: vi.fn(),
  },
}));

// Import after mocking
import { EscalationService, DEFAULT_ESCALATION_THRESHOLDS } from './escalation-service';
import type { Pass } from './database';

// Mock pass data for testing
const createMockPass = (openedMinutesAgo: number): Pass => ({
  id: 'test-pass-1',
  studentId: 'student-1',
  studentName: 'Test Student',
  originLocationId: 'origin-1',
  originLocationName: 'Origin Location',
  destinationLocationId: 'dest-1',
  destinationLocationName: 'Destination Location',
  status: 'active',
  openedAt: Timestamp.fromMillis(Date.now() - (openedMinutesAgo * 60 * 1000)),
  closedAt: null,
  totalDuration: null,
  currentLocationId: 'dest-1',
  escalationLevel: null,
  escalationTriggeredAt: null,
  issuedById: 'teacher-1',
  issuedByName: 'Test Teacher',
  isOverride: false,
  notes: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});

describe('EscalationService', () => {
  describe('calculatePassDuration', () => {
    it('should calculate correct duration in minutes', () => {
      const pass = createMockPass(15); // 15 minutes ago
      const duration = EscalationService.calculatePassDuration(pass);
      expect(duration).toBe(15);
    });

    it('should handle very recent passes', () => {
      const pass = createMockPass(1); // 1 minute ago
      const duration = EscalationService.calculatePassDuration(pass);
      expect(duration).toBe(1);
    });

    it('should handle long duration passes', () => {
      const pass = createMockPass(120); // 2 hours ago
      const duration = EscalationService.calculatePassDuration(pass);
      expect(duration).toBe(120);
    });
  });

  describe('determineEscalationLevel', () => {
    it('should return null for duration below warning threshold', () => {
      const duration = 5; // 5 minutes
      const level = EscalationService.determineEscalationLevel(duration, DEFAULT_ESCALATION_THRESHOLDS);
      expect(level).toBeNull();
    });

    it('should return warning for duration at warning threshold', () => {
      const duration = 10; // 10 minutes (warning threshold)
      const level = EscalationService.determineEscalationLevel(duration, DEFAULT_ESCALATION_THRESHOLDS);
      expect(level).toBe('warning');
    });

    it('should return warning for duration between warning and alert thresholds', () => {
      const duration = 15; // 15 minutes (between 10 and 20)
      const level = EscalationService.determineEscalationLevel(duration, DEFAULT_ESCALATION_THRESHOLDS);
      expect(level).toBe('warning');
    });

    it('should return alert for duration at alert threshold', () => {
      const duration = 20; // 20 minutes (alert threshold)
      const level = EscalationService.determineEscalationLevel(duration, DEFAULT_ESCALATION_THRESHOLDS);
      expect(level).toBe('alert');
    });

    it('should return alert for duration above alert threshold', () => {
      const duration = 30; // 30 minutes (above 20)
      const level = EscalationService.determineEscalationLevel(duration, DEFAULT_ESCALATION_THRESHOLDS);
      expect(level).toBe('alert');
    });
  });

  describe('isHigherEscalation', () => {
    it('should return true when new level is higher', () => {
      expect(EscalationService.isHigherEscalation('alert', 'warning')).toBe(true);
      expect(EscalationService.isHigherEscalation('critical', 'warning')).toBe(true);
      expect(EscalationService.isHigherEscalation('critical', 'alert')).toBe(true);
    });

    it('should return false when new level is lower or same', () => {
      expect(EscalationService.isHigherEscalation('warning', 'alert')).toBe(false);
      expect(EscalationService.isHigherEscalation('warning', 'warning')).toBe(false);
      expect(EscalationService.isHigherEscalation('alert', 'alert')).toBe(false);
    });
  });

  describe('DEFAULT_ESCALATION_THRESHOLDS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_ESCALATION_THRESHOLDS.warning).toBe(10);
      expect(DEFAULT_ESCALATION_THRESHOLDS.alert).toBe(20);
    });

    it('should have alert threshold greater than warning threshold', () => {
      expect(DEFAULT_ESCALATION_THRESHOLDS.alert).toBeGreaterThan(DEFAULT_ESCALATION_THRESHOLDS.warning);
    });
  });
}); 