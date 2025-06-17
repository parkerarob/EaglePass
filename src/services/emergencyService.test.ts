import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as emergencyService from './emergencyService';
import { UserRole } from '../models/firestoreModels';
import { getDoc, setDoc, addDoc } from 'firebase/firestore';

vi.mock('./firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn(() => ({ withConverter: vi.fn(() => ({})) })),
  addDoc: vi.fn(),
}));
vi.mock('./firestoreConverters', () => ({
  EVENT_LOGS_COLLECTION: 'event-logs',
  eventLogConverter: {},
}));

// Access mocks reliably using vi.mocked
const mockGetDoc = vi.mocked(getDoc);
const mockSetDoc = vi.mocked(setDoc);
const mockAddDoc = vi.mocked(addDoc);

describe('emergencyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getEmergencyFreeze returns false if config does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false } as any);
    const result = await emergencyService.getEmergencyFreeze();
    expect(result).toBe(false);
  });

  it('getEmergencyFreeze returns true if config exists and freeze is set', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ emergencyFreeze: true }) } as any);
    const result = await emergencyService.getEmergencyFreeze();
    expect(result).toBe(true);
  });

  it('setEmergencyFreeze throws if user is not admin or dev', async () => {
    await expect(emergencyService.setEmergencyFreeze(true, { uid: 'u1', role: UserRole.STUDENT })).rejects.toThrow('Unauthorized');
  });

  it('setEmergencyFreeze sets freeze and logs event for admin', async () => {
    mockSetDoc.mockResolvedValue({} as any);
    mockAddDoc.mockResolvedValue({} as any);
    await emergencyService.setEmergencyFreeze(true, { uid: 'admin', role: UserRole.ADMIN });
    expect(mockSetDoc).toHaveBeenCalled();
    expect(mockAddDoc).toHaveBeenCalled();
  });

  it('canCreatePass returns false if freeze is active', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ emergencyFreeze: true }) } as any);
    const result = await emergencyService.canCreatePass();
    expect(result).toBe(false);
  });

  it('emergencyClaim throws if freeze is not active', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false } as any);
    await expect(
      emergencyService.emergencyClaim('p1', { uid: 'admin', role: UserRole.ADMIN })
    ).rejects.toThrow('Emergency freeze is not active');
  });

  it('emergencyClaim logs event if freeze is active', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ emergencyFreeze: true }) } as any);
    mockAddDoc.mockResolvedValue({} as any);
    await emergencyService.emergencyClaim('p1', { uid: 'admin', role: UserRole.ADMIN });
    expect(mockAddDoc).toHaveBeenCalled();
  });
}); 