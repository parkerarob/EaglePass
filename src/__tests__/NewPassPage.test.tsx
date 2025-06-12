import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewPassPage from '../pages/NewPassPage';
import * as firebaseService from '../services/firebase';

// Mock Firebase service
jest.mock('../services/firebase', () => ({
  createPass: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NewPassPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the create pass form', () => {
    renderWithRouter(<NewPassPage />);
    
    expect(screen.getByText('Create New Pass')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Pass' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('has disabled submit button when form is incomplete', () => {
    renderWithRouter(<NewPassPage />);
    
    const submitButton = screen.getByRole('button', { name: 'Create Pass' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is complete', () => {
    renderWithRouter(<NewPassPage />);
    
    const scheduleLocationSelect = screen.getByLabelText('Current Location');
    const destinationSelect = screen.getByLabelText('Destination');
    const submitButton = screen.getByRole('button', { name: 'Create Pass' });

    fireEvent.change(scheduleLocationSelect, { target: { value: 'room-101' } });
    fireEvent.change(destinationSelect, { target: { value: 'restroom' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('calls createPass and navigates on successful form submission', async () => {
    const mockCreatePass = firebaseService.createPass as jest.MockedFunction<typeof firebaseService.createPass>;
    mockCreatePass.mockResolvedValue({
      passId: 'test-pass-id',
      pass: {
        passId: 'test-pass-id',
        studentId: 'student-123',
        scheduleLocationId: 'room-101',
        destinationLocationId: 'restroom',
        status: 'OPEN',
        state: 'IN_CLASS',
        legId: 1,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        lastUpdatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      }
    });

    renderWithRouter(<NewPassPage />);
    
    const scheduleLocationSelect = screen.getByLabelText('Current Location');
    const destinationSelect = screen.getByLabelText('Destination');
    const submitButton = screen.getByRole('button', { name: 'Create Pass' });

    fireEvent.change(scheduleLocationSelect, { target: { value: 'room-101' } });
    fireEvent.change(destinationSelect, { target: { value: 'restroom' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreatePass).toHaveBeenCalledWith({
        scheduleLocationId: 'room-101',
        destinationLocationId: 'restroom'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/pass/test-pass-id');
    });
  });

  it('displays error message on failed form submission', async () => {
    const mockCreatePass = firebaseService.createPass as jest.MockedFunction<typeof firebaseService.createPass>;
    mockCreatePass.mockRejectedValue(new Error('Failed to create pass'));

    renderWithRouter(<NewPassPage />);
    
    const scheduleLocationSelect = screen.getByLabelText('Current Location');
    const destinationSelect = screen.getByLabelText('Destination');
    const submitButton = screen.getByRole('button', { name: 'Create Pass' });

    fireEvent.change(scheduleLocationSelect, { target: { value: 'room-101' } });
    fireEvent.change(destinationSelect, { target: { value: 'restroom' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create pass')).toBeInTheDocument();
    });
  });

  it('navigates to dashboard when cancel button is clicked', () => {
    renderWithRouter(<NewPassPage />);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows loading state during form submission', async () => {
    const mockCreatePass = firebaseService.createPass as jest.MockedFunction<typeof firebaseService.createPass>;
    mockCreatePass.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithRouter(<NewPassPage />);
    
    const scheduleLocationSelect = screen.getByLabelText('Current Location');
    const destinationSelect = screen.getByLabelText('Destination');
    const submitButton = screen.getByRole('button', { name: 'Create Pass' });

    fireEvent.change(scheduleLocationSelect, { target: { value: 'room-101' } });
    fireEvent.change(destinationSelect, { target: { value: 'restroom' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
}); 