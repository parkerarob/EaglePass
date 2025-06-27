/**
 * Unit tests for useAuth hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { 
  createMockUserProfile, 
  createMockFirebaseUser, 
  createMockAuthState 
} from '../lib/test-utils';
import type { AuthState } from '../lib/auth';

// Mock the auth module before importing the hook
vi.mock('../lib/auth', () => ({
  onAuthStateChange: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}));

import { onAuthStateChange, signInWithGoogle, signOut } from '../lib/auth';

describe('useAuth', () => {
  const mockUserProfile = createMockUserProfile({
    uid: 'user-123',
    email: 'test@nhcs.net',
    displayName: 'Test User',
    role: 'student',
    status: 'approved',
  });

  const mockFirebaseUser = createMockFirebaseUser({
    uid: 'user-123',
    email: 'test@nhcs.net',
    displayName: 'Test User',
  });

  const mockAuthState: AuthState = createMockAuthState({
    user: mockFirebaseUser,
    profile: mockUserProfile,
    loading: false,
    error: null,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.profile).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should set up auth state listener on mount', () => {
    renderHook(() => useAuth());

    expect(onAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update state when auth state changes', async () => {
    let authStateCallback: (state: AuthState) => void;
    (onAuthStateChange as unknown as MockInstance).mockImplementation((callback) => {
      authStateCallback = callback;
      return () => {}; // unsubscribe function
    });

    const { result } = renderHook(() => useAuth());

    // Simulate auth state change
    act(() => {
      authStateCallback(mockAuthState);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockAuthState.user);
      expect(result.current.profile).toEqual(mockAuthState.profile);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isApproved).toBe(true);
    });
  });

  it('should handle login successfully', async () => {
    (signInWithGoogle as unknown as MockInstance).mockResolvedValue(mockUserProfile);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const profile = await result.current.login();
      expect(profile).toEqual(mockUserProfile);
    });

    expect(signInWithGoogle).toHaveBeenCalled();
  });

  it('should handle login error', async () => {
    const errorMessage = 'Login failed';
    (signInWithGoogle as unknown as MockInstance).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
      }
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle logout successfully', async () => {
    (signOut as unknown as MockInstance).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(signOut).toHaveBeenCalled();
  });

  it('should handle logout error', async () => {
    const errorMessage = 'Logout failed';
    (signOut as unknown as MockInstance).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.logout();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
      }
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should clear error when clearError is called', () => {
    const { result } = renderHook(() => useAuth());

    // Set error state
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it('should provide correct authentication status flags', async () => {
    let authStateCallback: (state: AuthState) => void;
    (onAuthStateChange as unknown as MockInstance).mockImplementation((callback) => {
      authStateCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useAuth());

    // Test approved user
    act(() => {
      authStateCallback(mockAuthState);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isApproved).toBe(true);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isRejected).toBe(false);
      expect(result.current.isSuspended).toBe(false);
    });

    // Test pending user
    const pendingState = createMockAuthState({
      profile: createMockUserProfile({ status: 'pending' }),
    });

    act(() => {
      authStateCallback(pendingState);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isApproved).toBe(false);
      expect(result.current.isPending).toBe(true);
    });
  });

  it('should clean up auth state listener on unmount', () => {
    const unsubscribe = vi.fn();
    (onAuthStateChange as unknown as MockInstance).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
}); 