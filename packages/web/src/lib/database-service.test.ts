import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { Timestamp } from 'firebase/firestore';

// Mock the firebase module before importing any service logic
vi.mock('./firebase', () => ({
  db: {}, // Add more mocks if needed
}));

import { PassService, LocationService } from './database-service';
import { createMockPass, createMockLocation } from './test-utils';

const mockStudentId = 'student-1';
const mockPassId = 'pass-1';
const mockLocationId = 'loc-1';
const mockActorId = 'actor-1';
const mockActorName = 'Test User';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(PassService, 'getActivePassesForStudent');
  vi.spyOn(PassService, 'createPass');
  vi.spyOn(PassService, 'getPass');
  vi.spyOn(PassService, 'updatePass');
  vi.spyOn(PassService, 'returnPass');
  vi.spyOn(LocationService, 'getLocation');
});

describe('PassService (mocked)', () => {
  it('should not allow more than one active pass per student', async () => {
    (PassService.getActivePassesForStudent as unknown as MockInstance).mockResolvedValueOnce([createMockPass()]);
    await expect(PassService.createPass({ studentId: mockStudentId, studentName: 'Test', originLocationId: 'locA', originLocationName: 'A', destinationLocationId: 'locB', destinationLocationName: 'B', issuedById: mockActorId, issuedByName: mockActorName, isOverride: false, notes: null })).rejects.toThrow();
  });

  it('should allow pass creation if no active pass exists', async () => {
    (PassService.getActivePassesForStudent as unknown as MockInstance).mockResolvedValueOnce([]);
    (PassService.createPass as unknown as MockInstance).mockResolvedValueOnce('new-pass-id');
    await expect(PassService.createPass({ studentId: mockStudentId, studentName: 'Test', originLocationId: 'locA', originLocationName: 'A', destinationLocationId: 'locB', destinationLocationName: 'B', issuedById: mockActorId, issuedByName: mockActorName, isOverride: false, notes: null })).resolves.toBe('new-pass-id');
  });

  it('should not allow check-in to non-check-in-eligible location', async () => {
    (PassService.getPass as unknown as MockInstance).mockResolvedValueOnce(createMockPass({ status: 'active' }));
    (LocationService.getLocation as unknown as MockInstance).mockResolvedValueOnce(createMockLocation({ isCheckInEligible: false }));
    await expect(PassService.checkIn(mockPassId, mockLocationId, mockActorId, mockActorName)).rejects.toThrow();
  });

  it('should allow check-in to check-in-eligible location', async () => {
    (PassService.getPass as unknown as MockInstance).mockResolvedValueOnce(createMockPass({ status: 'active' }));
    (LocationService.getLocation as unknown as MockInstance).mockResolvedValueOnce(createMockLocation({ isCheckInEligible: true }));
    (PassService.updatePass as unknown as MockInstance).mockResolvedValueOnce(undefined);
    await expect(PassService.checkIn(mockPassId, mockLocationId, mockActorId, mockActorName)).resolves.toBeUndefined();
  });

  it('should close pass on return', async () => {
    const now = Timestamp.now();
    (PassService.getPass as unknown as MockInstance).mockResolvedValueOnce(createMockPass({ status: 'active', openedAt: now, originLocationId: mockLocationId }));
    (LocationService.getLocation as unknown as MockInstance).mockResolvedValueOnce(createMockLocation());
    (PassService.updatePass as unknown as MockInstance).mockResolvedValueOnce(undefined);
    await expect(PassService.returnPass(mockPassId, mockActorId, mockActorName)).resolves.toBeUndefined();
  });

  it('should throw if trying to return a non-active pass', async () => {
    (PassService.getPass as unknown as MockInstance).mockResolvedValueOnce(createMockPass({ status: 'closed' }));
    await expect(PassService.returnPass(mockPassId, mockActorId, mockActorName)).rejects.toThrow();
  });
}); 