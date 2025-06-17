import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { User, UserRole } from '@/models/firestoreModels';
import * as authService from '@/services/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: FirebaseUser | null) => {
      if (user) {
        // This is a temporary user object. In a real app, you would fetch
        // the full user profile from Firestore here.
        setCurrentUser({
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Anonymous',
          role: UserRole.STUDENT, // Default role
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          schemaVersion: 1,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle: authService.signInWithGoogle,
    signInWithEmail: authService.signInWithEmail,
    signUpWithEmail: authService.signUpWithEmail,
    signOut: authService.signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 