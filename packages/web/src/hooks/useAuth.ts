import { useState, useEffect } from 'react';
import { 
  onAuthStateChange, 
  signInWithGoogle, 
  signOut 
} from '../lib/auth';
import type { AuthState, UserProfile } from '../lib/auth';

/**
 * React hook for managing authentication state
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange(setAuthState);
    return unsubscribe;
  }, []);

  const login = async (): Promise<UserProfile> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await signInWithGoogle();
      return profile;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await signOut();
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    login,
    logout,
    clearError,
    isAuthenticated: !!authState.user,
    isApproved: authState.profile?.status === 'approved',
    isPending: authState.profile?.status === 'pending',
    isRejected: authState.profile?.status === 'rejected',
    isSuspended: authState.profile?.status === 'suspended',
  };
} 