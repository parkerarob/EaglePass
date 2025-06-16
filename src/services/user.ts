import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, UserRole } from '@/types';

const COLLECTION_NAME = 'users';

export const createUser = async (
  userId: string,
  email: string,
  displayName: string,
  role: UserRole = UserRole.STUDENT
): Promise<User> => {
  const userRef = doc(db, COLLECTION_NAME, userId);
  const userData: User = {
    id: userId,
    email,
    displayName,
    role,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return userData;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, COLLECTION_NAME, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    id: userSnap.id,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  };
};

export const updateUser = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const userRef = doc(db, COLLECTION_NAME, userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const updateUserRole = async (
  userId: string,
  role: UserRole
): Promise<void> => {
  await updateUser(userId, { role });
}; 