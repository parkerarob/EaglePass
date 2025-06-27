/**
 * StudentHome Component Tests
 * Basic tests for student dashboard functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentHome from './StudentHome';
import { useAuth } from '../hooks/useAuth';
import { createMockUseAuth } from '../lib/test-utils';

// Mock dependencies
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/database-service', () => ({
  PassService: {
    getActivePassesForStudent: vi.fn().mockResolvedValue([]),
    createPass: vi.fn().mockResolvedValue('new-pass-id'),
  },
  LocationService: {
    getLocations: vi.fn().mockResolvedValue([]),
  },
}));

// Mock implementations
const mockUseAuth = vi.mocked(useAuth);

// Test wrapper with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('StudentHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('shows loading state when auth is loading', () => {
      mockUseAuth.mockReturnValue(createMockUseAuth({
        profile: null,
        loading: true,
        isAuthenticated: false,
        isApproved: false,
      }));

      renderWithRouter(<StudentHome />);
      
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('handles missing student ID gracefully', () => {
      mockUseAuth.mockReturnValue(createMockUseAuth({
        profile: {
          uid: 'test-uid',
          displayName: 'Test User',
          role: 'student',
          metadata: {}, // No studentId
        },
        loading: false,
        isAuthenticated: true,
        isApproved: true,
      }));

      renderWithRouter(<StudentHome />);
      
      // Should show loading state since no studentId
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing student ID gracefully', () => {
      mockUseAuth.mockReturnValue(createMockUseAuth({
        profile: {
          uid: 'test-uid',
          displayName: 'Test User',
          role: 'student',
          metadata: {}, // No studentId
        },
        loading: false,
        isAuthenticated: true,
        isApproved: true,
      }));

      renderWithRouter(<StudentHome />);
      
      // Should not crash and should show loading state
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });
  });
}); 