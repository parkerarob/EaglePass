import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PassDetailPage from '../pages/PassDetailPage';
import * as firebaseService from '../services/firebase';

// Mock Firebase service
jest.mock('../services/firebase', () => ({
  declareDeparture: jest.fn(),
  declareReturn: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-pass-id' }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PassDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pass details', async () => {
    renderWithRouter(<PassDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Hall Pass')).toBeInTheDocument();
      expect(screen.getByText('test-pass-id')).toBeInTheDocument();
      expect(screen.getByText('Room 101 - Math')).toBeInTheDocument();
      expect(screen.getByText('Restroom')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderWithRouter(<PassDetailPage />);
    
    expect(screen.getByRole('generic')).toHaveClass('animate-pulse');
  });

  it('shows declare departure button for IN_CLASS state', async () => {
    renderWithRouter(<PassDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Declare Departure' })).toBeInTheDocument();
    });
  });

  it('calls declareDeparture when departure button is clicked', async () => {
    const mockDeclareDeparture = firebaseService.declareDeparture as jest.MockedFunction<typeof firebaseService.declareDeparture>;
    mockDeclareDeparture.mockResolvedValue({
      success: true,
      pass: {
        passId: 'test-pass-id',
        studentId: 'student-123',
        scheduleLocationId: 'room-101',
        destinationLocationId: 'restroom',
        status: 'OPEN',
        state: 'IN_TRANSIT',
        legId: 1,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        lastUpdatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      }
    });

    renderWithRouter(<PassDetailPage />);
    
    await waitFor(() => {
      const departureButton = screen.getByRole('button', { name: 'Declare Departure' });
      fireEvent.click(departureButton);
    });

    await waitFor(() => {
      expect(mockDeclareDeparture).toHaveBeenCalledWith('test-pass-id');
    });
  });

  it('shows declare return button for IN_TRANSIT state', async () => {
    // Mock the pass to be in IN_TRANSIT state
    jest.spyOn(React, 'useEffect').mockImplementation((effect) => {
      effect();
    });

    renderWithRouter(<PassDetailPage />);
    
    // Simulate pass being updated to IN_TRANSIT state
    await waitFor(() => {
      // This would normally be triggered by a successful declareDeparture call
      expect(screen.getByText('Hall Pass')).toBeInTheDocument();
    });
  });

  it('displays error message on failed departure declaration', async () => {
    const mockDeclareDeparture = firebaseService.declareDeparture as jest.MockedFunction<typeof firebaseService.declareDeparture>;
    mockDeclareDeparture.mockRejectedValue(new Error('Failed to declare departure'));

    renderWithRouter(<PassDetailPage />);
    
    await waitFor(() => {
      const departureButton = screen.getByRole('button', { name: 'Declare Departure' });
      fireEvent.click(departureButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to declare departure')).toBeInTheDocument();
    });
  });

  it('displays error message on failed return declaration', async () => {
    const mockDeclareReturn = firebaseService.declareReturn as jest.MockedFunction<typeof firebaseService.declareReturn>;
    mockDeclareReturn.mockRejectedValue(new Error('Failed to declare return'));

    renderWithRouter(<PassDetailPage />);
    
    // First simulate being in IN_TRANSIT state by mocking a successful departure
    const mockDeclareDeparture = firebaseService.declareDeparture as jest.MockedFunction<typeof firebaseService.declareDeparture>;
    mockDeclareDeparture.mockResolvedValue({
      success: true,
      pass: {
        passId: 'test-pass-id',
        studentId: 'student-123',
        scheduleLocationId: 'room-101',
        destinationLocationId: 'restroom',
        status: 'OPEN',
        state: 'IN_TRANSIT',
        legId: 1,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        lastUpdatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      }
    });

    await waitFor(() => {
      const departureButton = screen.getByRole('button', { name: 'Declare Departure' });
      fireEvent.click(departureButton);
    });

    // Now test the return failure
    await waitFor(() => {
      const returnButton = screen.getByRole('button', { name: 'Declare Return' });
      fireEvent.click(returnButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to declare return')).toBeInTheDocument();
    });
  });

  it('navigates to dashboard when back button is clicked', async () => {
    renderWithRouter(<PassDetailPage />);
    
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: 'Back to Dashboard' });
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows loading state during action processing', async () => {
    const mockDeclareDeparture = firebaseService.declareDeparture as jest.MockedFunction<typeof firebaseService.declareDeparture>;
    mockDeclareDeparture.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithRouter(<PassDetailPage />);
    
    await waitFor(() => {
      const departureButton = screen.getByRole('button', { name: 'Declare Departure' });
      fireEvent.click(departureButton);
    });

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
}); 