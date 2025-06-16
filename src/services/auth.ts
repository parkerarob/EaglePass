import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  AuthError,
  Auth
} from 'firebase/auth';
import { auth } from './firebase';
import { User, UserRole } from '@/types';
import * as userService from './user';

const googleProvider = new GoogleAuthProvider();

const handleAuthError = (error: AuthError): string => {
  console.error('Auth error details:', {
    code: error.code,
    message: error.message,
    name: error.name
  });

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by the browser';
    case 'auth/cancelled-popup-request':
      return 'Multiple pop-up requests were made';
    case 'auth/network-request-failed':
      return 'Network error occurred';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations';
    default:
      return `Authentication error: ${error.message}`;
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  try {
    console.log('Starting Google sign in...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign in successful:', result.user.uid);
    
    // Check if user exists in Firestore
    let userData = await userService.getUser(result.user.uid);
    console.log('Existing user data:', userData);
    
    // If user doesn't exist, create them
    if (!userData) {
      console.log('Creating new user in Firestore...');
      userData = await userService.createUser(
        result.user.uid,
        result.user.email || '',
        result.user.displayName || '',
        UserRole.STUDENT
      );
      console.log('New user created:', userData);
    }
    
    return userData;
  } catch (error) {
    console.error('Error in signInWithGoogle:', error);
    throw new Error(handleAuthError(error as AuthError));
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Starting email sign in...');
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email sign in successful:', result.user.uid);
    
    const userData = await userService.getUser(result.user.uid);
    console.log('User data from Firestore:', userData);
    
    if (!userData) {
      console.error('User data not found in Firestore');
      throw new Error('User data not found');
    }
    
    return userData;
  } catch (error) {
    console.error('Error in signInWithEmail:', error);
    throw new Error(handleAuthError(error as AuthError));
  }
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<User> => {
  try {
    console.log('Starting email sign up...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Email sign up successful:', result.user.uid);
    
    console.log('Creating user in Firestore...');
    const userData = await userService.createUser(
      result.user.uid,
      email,
      displayName,
      UserRole.STUDENT
    );
    console.log('User created in Firestore:', userData);
    
    return userData;
  } catch (error) {
    console.error('Error in signUpWithEmail:', error);
    throw new Error(handleAuthError(error as AuthError));
  }
};

export const signOut = async (): Promise<void> => {
  try {
    console.log('Starting sign out...');
    await firebaseSignOut(auth);
    console.log('Sign out successful');
  } catch (error) {
    console.error('Error in signOut:', error);
    throw new Error('Failed to sign out');
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
}; 