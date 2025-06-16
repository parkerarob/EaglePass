import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as passService from './passService';

// Mock Firestore and dependencies
vi.mock('./firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({
    withConverter: vi.fn(() => ({})),
  })) as any,
  doc: vi.fn(() => ({
    withConverter: vi.fn(() => ({})),
  })) as any,
  getDoc: vi.fn() as any,
  setDoc: vi.fn() as any,
  updateDoc: vi.fn() as any,
  query: vi.fn() as any,
  where: vi.fn() as any,
  getDocs: vi.fn() as any,
  runTransaction: vi.fn((db, fn) => fn()) as any,
  serverTimestamp: vi.fn() as any,
  addDoc: vi.fn() as any,
}));
vi.mock('./firestoreConverters', () => ({
  PASSES_COLLECTION: 'passes',
  EVENT_LOGS_COLLECTION: 'event-logs',
  passConverter: {},
  eventLogConverter: {},
}));

const fakePass = {
  id: 'p1',
  studentId: 'u1',
  originLocationId: 'l1',
  destinationLocationId: 'l2',
  status: 'OPEN' as 'OPEN',
  state: 'OUT' as 'OUT',
  createdAt: 'now',
  lastUpdatedAt: 'now',
  schemaVersion: 1,
};

describe('passService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getActivePass returns null if no active pass', async () => {
    const { getDocs } = await import('firebase/firestore');
    (getDocs as any).mockResolvedValue({ empty: true });
    const result = await passService.getActivePass('u1');
    expect(result).toBeNull();
  });

  it('getActivePass returns pass if found', async () => {
    const { getDocs } = await import('firebase/firestore');
    (getDocs as any).mockResolvedValue({ empty: false, docs: [{ data: () => fakePass }] });
    const result = await passService.getActivePass('u1');
    expect(result).toEqual(fakePass);
  });

  it('createPass throws if student already has active pass', async () => {
    vi.spyOn(passService, 'getActivePass').mockResolvedValue(fakePass);
    await expect(passService.createPass({
      studentId: 'u1',
      originLocationId: 'l1',
      destinationLocationId: 'l2',
    })).rejects.toThrow('Student already has an active pass');
  });

  it('closePass throws if pass not found', async () => {
    const { getDoc } = await import('firebase/firestore');
    (getDoc as any).mockResolvedValue({ exists: () => false });
    await expect(passService.closePass('bad-id', 'actor')).rejects.toThrow('Pass not found');
  });

  it('closePass throws and logs invalid transition if pass is not OPEN/OUT', async () => {
    const { getDoc, addDoc } = await import('firebase/firestore');
    (getDoc as any).mockResolvedValue({ exists: () => true, data: () => ({ ...fakePass, status: 'CLOSED' as 'CLOSED', state: 'IN' as 'IN' }) });
    (addDoc as any).mockResolvedValue({});
    await expect(passService.closePass('p1', 'actor')).rejects.toThrow('Invalid pass state for closing');
    expect(addDoc).toHaveBeenCalled();
  });
}); 