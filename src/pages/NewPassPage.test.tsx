import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import * as passService from '@/services/passService';
import * as emergencyService from '@/services/emergencyService';
import DashboardPage from '@/pages/DashboardPage';
import NewPassPage from '@/pages/NewPassPage';
import { User, UserRole, Pass } from '@/models/firestoreModels';
import { auth } from '@/services/firebase';

// Mock services and firebase
vi.mock('@/services/passService');
vi.mock('@/services/emergencyService');
vi.mock('@/services/firebase');

const mockUser: User = {
  id: 'test-user-id',
  displayName: 'Test User',
  email: 'test@example.com',
  role: UserRole.STUDENT,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  schemaVersion: 1,
};

// Mock onAuthStateChanged to immediately return our mock user
vi.mocked(auth.onAuthStateChanged).mockImplementation((callback: any) => {
  callback(mockUser);
  return vi.fn(); // Return a mock unsubscribe function
});

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </AuthProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options });

describe('DashboardPage', () => {
  it('shows create pass button when no active pass exists', async () => {
    vi.mocked(passService.getActivePass).mockResolvedValue(null);
    customRender(<DashboardPage />);
    expect(await screen.findByRole('button', { name: /Create New Pass/i })).toBeInTheDocument();
  });

  it('shows active pass info when a pass exists', async () => {
    const mockPass: Pass = {
      id: 'pass-1',
      studentId: 'user-1',
      destinationLocationId: 'Library',
      status: 'OPEN',
      state: 'OUT',
      createdAt: new Date().toISOString(),
      lastUpdatedAt: '2023-01-01T12:00:00Z',
      schemaVersion: 1,
      originLocationId: 'Room 101'
    };
    vi.mocked(passService.getActivePass).mockResolvedValue(mockPass);
    customRender(<DashboardPage />);
    expect(await screen.findByText('Active Pass')).toBeInTheDocument();
    expect(screen.getByText('Destination ID: Library')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Class/i })).toBeInTheDocument();
  });
});

describe('NewPassPage', () => {
  it('successfully creates a pass', async () => {
    vi.mocked(emergencyService.canCreatePass).mockResolvedValue(true);
    vi.mocked(passService.createPass).mockResolvedValue({} as any);
    
    customRender(<NewPassPage />);

    fireEvent.change(screen.getByLabelText(/Destination/i), { target: { value: 'Nurse Office' } });
    fireEvent.click(screen.getByRole('button', { name: /Get Pass/i }));

    await waitFor(() => {
      expect(passService.createPass).toHaveBeenCalled();
    });
  });

  it('shows an error message if pass creation fails', async () => {
    const errorMessage = 'Student already has an active pass';
    vi.mocked(emergencyService.canCreatePass).mockResolvedValue(true);
    vi.mocked(passService.createPass).mockRejectedValue(new Error(errorMessage));

    customRender(<NewPassPage />);

    fireEvent.change(screen.getByLabelText(/Destination/i), { target: { value: 'Library' } });
    fireEvent.click(screen.getByRole('button', { name: /Get Pass/i }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
}); 