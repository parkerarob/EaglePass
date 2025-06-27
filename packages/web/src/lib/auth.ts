import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type UserCredential
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from './firebase';

// User roles in the system
export type UserRole = 'student' | 'teacher' | 'admin';

// User status for approval workflow
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// Extended user profile stored in Firestore
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  metadata?: {
    studentId?: string;
    staffId?: string;
    department?: string;
    grade?: string;
    homeroom?: string;
  };
}

// Auth state for the application
export interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Domain restriction configuration
const ALLOWED_DOMAIN = 'nhcs.net';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: ALLOWED_DOMAIN, // Restrict to specific domain
  prompt: 'select_account'
});

/**
 * Validates if the user's email domain is allowed
 */
function validateDomain(email: string): boolean {
  const domain = email.split('@')[1];
  return domain === ALLOWED_DOMAIN;
}

/**
 * Extracts likely role from email address
 * This is a heuristic - actual role assignment should be done by admins
 */
function inferRoleFromEmail(email: string): UserRole {
  const localPart = email.split('@')[0].toLowerCase();
  
  // Common teacher/staff patterns
  if (localPart.includes('teacher') || 
      localPart.includes('staff') || 
      localPart.includes('admin') ||
      localPart.includes('principal') ||
      localPart.includes('counselor')) {
    return 'teacher';
  }
  
  // Default to student for most users
  return 'student';
}

/**
 * Creates or updates user profile in Firestore
 */
async function createOrUpdateUserProfile(
  firebaseUser: FirebaseUser, 
  isNewUser: boolean = false
): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  
  if (isNewUser) {
    // Create new user profile
    const profile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
      photoURL: firebaseUser.photoURL || undefined,
      role: inferRoleFromEmail(firebaseUser.email!),
      status: 'pending', // All new users start as pending
      domain: firebaseUser.email!.split('@')[1],
    };

    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    return {
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    };
  } else {
    // Update existing user's last login
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        approvedAt: data.approvedAt?.toDate(),
      } as UserProfile;
    }
    
    throw new Error('User profile not found');
  }
}

/**
 * Sign in with Google SSO
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Validate domain
    if (!validateDomain(user.email!)) {
      await firebaseSignOut(auth);
      throw new Error(`Only ${ALLOWED_DOMAIN} email addresses are allowed`);
    }

    // Check if user already exists
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const isNewUser = !userDoc.exists();

    // Create or update user profile
    const profile = await createOrUpdateUserProfile(user, isNewUser);

    return profile;
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign in was cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by the browser');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for authentication');
    }
    
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        approvedAt: data.approvedAt?.toDate(),
      } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  uid: string, 
  newRole: UserRole, 
  adminUid: string
): Promise<void> {
  try {
    // Verify admin has permission (this should also be enforced by Firestore rules)
    const adminProfile = await getUserProfile(adminUid);
    if (!adminProfile || adminProfile.role !== 'admin') {
      throw new Error('Insufficient permissions to update user role');
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Approve or reject a pending user (admin only)
 */
export async function updateUserStatus(
  uid: string,
  newStatus: UserStatus,
  adminUid: string
): Promise<void> {
  try {
    // Verify admin has permission
    const adminProfile = await getUserProfile(adminUid);
    if (!adminProfile || adminProfile.role !== 'admin') {
      throw new Error('Insufficient permissions to update user status');
    }

    const updateData: any = {
      status: newStatus,
      updatedAt: serverTimestamp(),
    };

    if (newStatus === 'approved') {
      updateData.approvedBy = adminUid;
      updateData.approvedAt = serverTimestamp();
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

/**
 * Get pending users for admin approval
 */
export function getPendingUsers(callback: (users: UserProfile[]) => void) {
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        approvedAt: data.approvedAt?.toDate(),
      } as UserProfile);
    });
    callback(users);
  });
}

/**
 * Check if user has required role
 */
export function hasRole(profile: UserProfile | null, requiredRole: UserRole): boolean {
  if (!profile || profile.status !== 'approved') return false;
  
  // Admin has access to everything
  if (profile.role === 'admin') return true;
  
  // Teacher has access to teacher and student features
  if (profile.role === 'teacher' && (requiredRole === 'teacher' || requiredRole === 'student')) {
    return true;
  }
  
  // Exact role match
  return profile.role === requiredRole;
}

/**
 * Check if user is approved and active
 */
export function isUserActive(profile: UserProfile | null): boolean {
  return profile?.status === 'approved';
}

/**
 * Auth state listener
 */
export function onAuthStateChange(callback: (authState: AuthState) => void): () => void {
  let unsubscribeProfile: (() => void) | null = null;
  
  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    // Clean up previous profile listener
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }

    if (user) {
      // User is signed in, get their profile
      callback({ user, profile: null, loading: true, error: null });
      
      try {
        const profile = await getUserProfile(user.uid);
        callback({ user, profile, loading: false, error: null });
        
        // Set up real-time profile updates
        const userRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const updatedProfile: UserProfile = {
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              lastLoginAt: data.lastLoginAt?.toDate(),
              approvedAt: data.approvedAt?.toDate(),
            } as UserProfile;
            callback({ user, profile: updatedProfile, loading: false, error: null });
          }
        });
      } catch (error: any) {
        callback({ user, profile: null, loading: false, error: error.message });
      }
    } else {
      // User is signed out
      callback({ user: null, profile: null, loading: false, error: null });
    }
  });

  // Return cleanup function
  return () => {
    unsubscribeAuth();
    if (unsubscribeProfile) {
      unsubscribeProfile();
    }
  };
}
