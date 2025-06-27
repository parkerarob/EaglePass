/**
 * Test setup file for EaglePass
 * Configures global test utilities and matchers
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Patch global Timestamp to be a class for instanceof checks in Zod
class MockTimestamp {
  _date: Date;
  constructor(dateOrMillis: Date | number) {
    this._date = typeof dateOrMillis === 'number' ? new Date(dateOrMillis) : dateOrMillis;
  }
  toDate() { return this._date; }
  toMillis() { return this._date.getTime(); }
  get seconds() { return Math.floor(this._date.getTime() / 1000); }
  get nanoseconds() { return 0; }
  static now() { return new MockTimestamp(new Date()); }
  static fromDate(date: Date) { return new MockTimestamp(date); }
  static fromMillis(ms: number) { return new MockTimestamp(ms); }
}
// @ts-ignore
global.Timestamp = MockTimestamp;

// Mock Firebase to prevent initialization errors in tests
vi.mock('./lib/firebase', () => ({
  auth: {},
  db: {},
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: MockTimestamp,
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({
    setCustomParameters: vi.fn(),
    addScope: vi.fn(),
  })),
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: MockTimestamp,
}));

// Mock Firebase App
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
}); 