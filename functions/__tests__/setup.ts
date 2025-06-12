// Mock Firestore Timestamp
jest.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    now: () => ({
      toDate: () => new Date(),
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    }),
  },
}));

// Mock Firebase Functions
jest.mock('firebase-functions', () => ({
  https: {
    HttpsError: class HttpsError extends Error {
      constructor(code: string, message: string) {
        super(message);
        this.code = code;
      }
      code: string;
    },
    onCall: (handler: any) => handler,
  },
}));

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: {
    Timestamp: {
      now: () => ({
        toDate: () => new Date(),
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      }),
    },
  },
})); 