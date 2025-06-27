/**
 * EaglePass Database Service
 * Provides CRUD operations for all Firestore collections
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  COLLECTIONS,
  type Pass,
  type User,
  type Student,
  type Staff,
  type Location,
  type CreatePassRequest,
  type UpdatePassRequest,
  type UserRole,
  type UserStatus,
} from './database';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generic function to get a document by ID
 */
async function getDocumentById<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to get multiple documents with query constraints
 */
async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to create a document
 */
async function createDocument<T>(
  collectionName: string,
  data: Omit<T, 'id'>,
  customId?: string
): Promise<string> {
  try {
    const timestamp = Timestamp.now();
    const docData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (customId) {
      const docRef = doc(db, collectionName, customId);
      await setDoc(docRef, docData);
      return customId;
    } else {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, docData);
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to update a document
 */
async function updateDocument<T>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

// ============================================================================
// PASS MANAGEMENT FUNCTIONS
// ============================================================================

export const PassService = {
  async createPass(passData: CreatePassRequest): Promise<string> {
    const now = Timestamp.now();
    const pass: Omit<Pass, 'id'> = {
      ...passData,
      status: 'active',
      openedAt: now,
      closedAt: null,
      totalDuration: null,
      currentLocationId: passData.destinationLocationId,
      escalationLevel: null,
      escalationTriggeredAt: null,
      createdAt: now,
      updatedAt: now,
    };

    return createDocument<Pass>(COLLECTIONS.PASSES, pass);
  },

  async getPass(passId: string): Promise<Pass | null> {
    return getDocumentById<Pass>(COLLECTIONS.PASSES, passId);
  },

  async getActivePassesForStudent(studentId: string): Promise<Pass[]> {
    return getDocuments<Pass>(COLLECTIONS.PASSES, [
      where('studentId', '==', studentId),
      where('status', '==', 'active'),
      orderBy('openedAt', 'desc'),
    ]);
  },

  async updatePass(passId: string, updates: UpdatePassRequest): Promise<void> {
    return updateDocument<Pass>(COLLECTIONS.PASSES, passId, updates);
  },
};

// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

export const UserService = {
  async createOrUpdateUser(userData: Omit<User, 'id'>): Promise<void> {
    await createDocument<User>(COLLECTIONS.USERS, userData, userData.uid);
  },

  async getUser(uid: string): Promise<User | null> {
    return getDocumentById<User>(COLLECTIONS.USERS, uid);
  },

  async getUsers(role?: UserRole, status?: UserStatus): Promise<User[]> {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    if (role) {
      constraints.push(where('role', '==', role));
    }
    if (status) {
      constraints.push(where('status', '==', status));
    }

    return getDocuments<User>(COLLECTIONS.USERS, constraints);
  },

  async updateUserStatus(uid: string, status: UserStatus, approvedById?: string): Promise<void> {
    const updates: Partial<User> = { status };
    
    if (status === 'approved' && approvedById) {
      updates.approvedAt = Timestamp.now();
      updates.approvedById = approvedById;
    }

    return updateDocument<User>(COLLECTIONS.USERS, uid, updates);
  },
};

// ============================================================================
// STUDENT MANAGEMENT FUNCTIONS
// ============================================================================

export const StudentService = {
  async createStudent(studentData: Omit<Student, 'id'>): Promise<string> {
    return createDocument<Student>(COLLECTIONS.STUDENTS, studentData);
  },

  async getStudent(studentId: string): Promise<Student | null> {
    return getDocumentById<Student>(COLLECTIONS.STUDENTS, studentId);
  },

  async getStudentByUserId(userId: string): Promise<Student | null> {
    const students = await getDocuments<Student>(COLLECTIONS.STUDENTS, [
      where('userId', '==', userId),
      limit(1),
    ]);

    return students.length > 0 ? students[0] : null;
  },
};

// ============================================================================
// STAFF MANAGEMENT FUNCTIONS
// ============================================================================

export const StaffService = {
  async createStaff(staffData: Omit<Staff, 'id'>): Promise<string> {
    return createDocument<Staff>(COLLECTIONS.STAFF, staffData);
  },

  async getStaff(staffId: string): Promise<Staff | null> {
    return getDocumentById<Staff>(COLLECTIONS.STAFF, staffId);
  },

  async getStaffByUserId(userId: string): Promise<Staff | null> {
    const staff = await getDocuments<Staff>(COLLECTIONS.STAFF, [
      where('userId', '==', userId),
      limit(1),
    ]);

    return staff.length > 0 ? staff[0] : null;
  },
};

// ============================================================================
// LOCATION MANAGEMENT FUNCTIONS
// ============================================================================

export const LocationService = {
  async createLocation(locationData: Omit<Location, 'id'>): Promise<string> {
    return createDocument<Location>(COLLECTIONS.LOCATIONS, locationData);
  },

  async getLocation(locationId: string): Promise<Location | null> {
    return getDocumentById<Location>(COLLECTIONS.LOCATIONS, locationId);
  },

  async getLocations(isActive?: boolean): Promise<Location[]> {
    const constraints: QueryConstraint[] = [orderBy('name', 'asc')];

    if (isActive !== undefined) {
      constraints.push(where('isActive', '==', isActive));
    }

    return getDocuments<Location>(COLLECTIONS.LOCATIONS, constraints);
  },
};

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

export const RealtimeService = {
  subscribeToStudentActivePasses(
    studentId: string,
    callback: (passes: Pass[]) => void
  ): () => void {
    const q = query(
      collection(db, COLLECTIONS.PASSES),
      where('studentId', '==', studentId),
      where('status', '==', 'active'),
      orderBy('openedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const passes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pass[];
      callback(passes);
    });
  },
};
