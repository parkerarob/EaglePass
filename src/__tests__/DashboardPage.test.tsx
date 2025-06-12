import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DashboardPage', () => {
  it('renders student dashboard by default', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage your hall passes')).toBeInTheDocument();
    expect(screen.getByText('Create New Pass')).toBeInTheDocument();
    expect(screen.getByText('Staff View')).toBeInTheDocument();
  });

  it('shows quick actions in student view', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByRole('link', { name: /Create New Pass/i })).toHaveAttribute('href', '/pass/new');
    expect(screen.getByRole('button', { name: /Staff View/i })).toBeInTheDocument();
  });

  it('shows recent passes section in student view', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Recent Passes')).toBeInTheDocument();
    expect(screen.getByText('No recent passes')).toBeInTheDocument();
    expect(screen.getByText('Create your first pass to get started')).toBeInTheDocument();
  });

  it('switches to staff view when staff view button is clicked', () => {
    renderWithRouter(<DashboardPage />);
    
    const staffViewButton = screen.getByRole('button', { name: /Staff View/i });
    fireEvent.click(staffViewButton);

    expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monitor active hall passes')).toBeInTheDocument();
    expect(screen.getByText('Student View')).toBeInTheDocument();
  });

  it('shows active passes in staff view', () => {
    renderWithRouter(<DashboardPage />);
    
    // Switch to staff view
    const staffViewButton = screen.getByRole('button', { name: /Staff View/i });
    fireEvent.click(staffViewButton);

    expect(screen.getByText('Active Passes (2)')).toBeInTheDocument();
    expect(screen.getByText('Pass #001')).toBeInTheDocument();
    expect(screen.getByText('Pass #002')).toBeInTheDocument();
  });

  it('shows pass details in staff view', () => {
    renderWithRouter(<DashboardPage />);
    
    // Switch to staff view
    const staffViewButton = screen.getByRole('button', { name: /Staff View/i });
    fireEvent.click(staffViewButton);

    expect(screen.getByText('Room 101 - Math')).toBeInTheDocument();
    expect(screen.getByText('Restroom')).toBeInTheDocument();
    expect(screen.getByText('Room 102 - English')).toBeInTheDocument();
    expect(screen.getByText('Nurse Office')).toBeInTheDocument();
  });

  it('shows status badges in staff view', () => {
    renderWithRouter(<DashboardPage />);
    
    // Switch to staff view
    const staffViewButton = screen.getByRole('button', { name: /Staff View/i });
    fireEvent.click(staffViewButton);

    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('In Class')).toBeInTheDocument();
  });

  it('switches back to student view from staff view', () => {
    renderWithRouter(<DashboardPage />);
    
    // Switch to staff view
    const staffViewButton = screen.getByRole('button', { name: /Staff View/i });
    fireEvent.click(staffViewButton);

    // Switch back to student view
    const studentViewButton = screen.getByRole('button', { name: /Student View/i });
    fireEvent.click(studentViewButton);

    expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage your hall passes')).toBeInTheDocument();
  });

  it('has view details links in staff view', () => {
    renderWithRouter(<DashboardPage />);
    
    // Switch to staff view
    const staffViewButton = screen.getByRole('button', { name: /Staff View/i });
    fireEvent.click(staffViewButton);

    const viewDetailsLinks = screen.getAllByText('View Details →');
    expect(viewDetailsLinks).toHaveLength(2);
    expect(viewDetailsLinks[0].closest('a')).toHaveAttribute('href', '/pass/pass-001');
    expect(viewDetailsLinks[1].closest('a')).toHaveAttribute('href', '/pass/pass-002');
  });
}); 