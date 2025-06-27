/**
 * TeacherHome Component Tests
 * Comprehensive tests for teacher dashboard functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TeacherHome from './TeacherHome';
import { useAuth } from '../hooks/useAuth';
import { useEscalationDisplay, useEscalation } from '../hooks/useEscalation';
import { PassService, LocationService, RealtimeService } from '../lib/database-service';
import { 
  createMockUserProfile, 
  createMockPass, 
  createMockLocation,
  createMockUseAuth,
} from '../lib/test-utils';
import type { Pass, Location } from '../lib/database';

// Mock dependencies
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useEscalation', () => ({
  useEscalationDisplay: vi.fn(),
  useEscalation: vi.fn(),
}));
vi.mock('../lib/database-service');

// Mock implementations
const mockUseAuth = vi.mocked(useAuth);
const mockUseEscalationDisplay = vi.mocked(useEscalationDisplay);
const mockUseEscalation = vi.mocked(useEscalation);
const mockPassService = vi.mocked(PassService);
const mockLocationService = vi.mocked(LocationService);
const mockRealtimeService = vi.mocked(RealtimeService);

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TeacherHome', () => {
  const mockLocations: Location[] = [
    createMockLocation({ id: 'room-101', name: 'Room 101' }),
    createMockLocation({ id: 'bathroom-1', name: 'Bathroom', type: 'restroom' }),
  ];

  const mockActivePasses: Pass[] = [
    createMockPass({ id: 'pass-1', studentName: 'Student A', destinationLocationName: 'Bathroom', status: 'active', escalationLevel: null }),
    createMockPass({ id: 'pass-2', studentName: 'Student B', destinationLocationName: 'Room 101', status: 'active', escalationLevel: 'warning' }),
    createMockPass({ id: 'pass-3', studentName: 'Student C', destinationLocationName: 'Room 101', status: 'active', escalationLevel: 'alert' }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Auth
    mockUseAuth.mockReturnValue(createMockUseAuth({
      profile: createMockUserProfile({ role: 'teacher', displayName: 'Teacher Name' }),
      loading: false,
      isAuthenticated: true,
      isApproved: true,
    }));
    // Escalation
    mockUseEscalationDisplay.mockReturnValue({
      duration: 0,
      thresholds: { warning: 10, alert: 20 },
      escalationLevel: null,
      formattedDuration: '0m',
      escalationColor: 'gray',
      escalationIcon: 'clock',
      isEscalated: false,
      isWarning: false,
      isAlert: false,
    });
    mockUseEscalation.mockReturnValue({
      escalationStats: { totalActive: 0, warnings: 0, alerts: 0, critical: 0 },
      isMonitoring: false,
      lastCheck: null,
      startMonitoring: vi.fn(),
      checkPassEscalation: vi.fn(),
      refreshStats: vi.fn(),
      checkAllPasses: vi.fn(),
      clearEscalation: vi.fn(),
      getThresholds: vi.fn(),
      calculateDuration: vi.fn(),
      formatPassDuration: vi.fn(),
      getEscalationColorForUI: vi.fn(),
      getEscalationIconForUI: vi.fn(),
    });
    // Locations
    mockLocationService.getLocations.mockResolvedValue(mockLocations);
    // Passes
    mockPassService.getActivePassesForStudent.mockResolvedValue([]);
    // Realtime subscriptions
    mockRealtimeService.subscribeToAllActivePasses.mockImplementation(cb => {
      cb(mockActivePasses);
      return vi.fn();
    });
    mockRealtimeService.subscribeToEscalationAlerts.mockImplementation(cb => {
      cb(mockActivePasses.filter(p => p.escalationLevel));
      return vi.fn();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders teacher dashboard with correct title', () => {
      renderWithRouter(<TeacherHome />);
      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Monitor active passes and manage student movements')).toBeInTheDocument();
    });

    it('shows loading state when auth is loading', () => {
      mockUseAuth.mockReturnValue(createMockUseAuth({
        profile: null,
        loading: true,
      }));
      renderWithRouter(<TeacherHome />);
      expect(screen.getByText('Loading teacher dashboard...')).toBeInTheDocument();
    });

    it('shows error state when data loading fails', async () => {
      mockLocationService.getLocations.mockRejectedValue(new Error('Failed to load locations'));
      renderWithRouter(<TeacherHome />);
      await waitFor(() => {
        expect(screen.getByText('Failed to load locations')).toBeInTheDocument();
      });
    });

    it('renders statistics overview', () => {
      renderWithRouter(<TeacherHome />);
      expect(screen.getAllByText('Active Passes')).toHaveLength(2); // One in stats, one in table
      expect(screen.getAllByText('Warnings')).toHaveLength(2); // One in stats, one in table
      expect(screen.getAllByText('Alerts')).toHaveLength(2); // One in stats, one in table
      expect(screen.getByText('Locations')).toBeInTheDocument();
    });

    it('renders escalation overview', () => {
      renderWithRouter(<TeacherHome />);
      // The escalation overview is shown in the statistics cards, not as a separate section
      expect(screen.getAllByText('Warnings')).toHaveLength(2); // One in stats, one in table
      expect(screen.getAllByText('Alerts')).toHaveLength(2); // One in stats, one in table
    });

    it('renders controls for filtering and actions', () => {
      renderWithRouter(<TeacherHome />);
      expect(screen.getByLabelText('Filter by Location')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Pass' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Flag Student' })).toBeInTheDocument();
    });

    it('renders active passes table', () => {
      renderWithRouter(<TeacherHome />);
      expect(screen.getByText('Active Passes (3)')).toBeInTheDocument();
      expect(screen.getByText('Student A')).toBeInTheDocument();
      expect(screen.getByText('Student B')).toBeInTheDocument();
      expect(screen.getByText('Student C')).toBeInTheDocument();
    });
  });

  describe('Pass Actions', () => {
    it('calls PassService.checkIn when check-in button is clicked', async () => {
      mockPassService.checkIn = vi.fn().mockResolvedValue(undefined);
      renderWithRouter(<TeacherHome />);
      await waitFor(() => {
        const checkInButtons = screen.getAllByRole('button', { name: /Check-In/i });
        if (checkInButtons.length > 0) {
          fireEvent.click(checkInButtons[0]);
          expect(mockPassService.checkIn).toHaveBeenCalled();
        }
      });
    });

    it('calls PassService.returnPass when return button is clicked', async () => {
      mockPassService.returnPass = vi.fn().mockResolvedValue(undefined);
      renderWithRouter(<TeacherHome />);
      await waitFor(() => {
        const returnButtons = screen.getAllByRole('button', { name: /Return/i });
        if (returnButtons.length > 0) {
          fireEvent.click(returnButtons[0]);
          expect(mockPassService.returnPass).toHaveBeenCalled();
        }
      });
    });
  });
}); 