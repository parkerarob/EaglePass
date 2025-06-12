import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Pass } from '../types/models';

const DashboardPage = () => {
  const [viewMode, setViewMode] = useState<'student' | 'staff'>('student');

  // Mock active passes data - in a real app, this would fetch from Firestore
  const mockActivePasses: Pass[] = [
    {
      passId: 'pass-001',
      studentId: 'student-123',
      scheduleLocationId: 'room-101',
      destinationLocationId: 'restroom',
      status: 'OPEN',
      state: 'IN_TRANSIT',
      legId: 1,
      createdAt: { seconds: Date.now() / 1000 - 300, nanoseconds: 0 } as any,
      lastUpdatedAt: { seconds: Date.now() / 1000 - 60, nanoseconds: 0 } as any
    },
    {
      passId: 'pass-002',
      studentId: 'student-456',
      scheduleLocationId: 'room-102',
      destinationLocationId: 'nurse',
      status: 'OPEN',
      state: 'IN_CLASS',
      legId: 1,
      createdAt: { seconds: Date.now() / 1000 - 600, nanoseconds: 0 } as any,
      lastUpdatedAt: { seconds: Date.now() / 1000 - 600, nanoseconds: 0 } as any
    }
  ];

  const getLocationName = (locationId: string) => {
    const locations: Record<string, string> = {
      'room-101': 'Room 101 - Math',
      'room-102': 'Room 102 - English',
      'room-103': 'Room 103 - Science',
      'room-104': 'Room 104 - History',
      'room-105': 'Room 105 - Art',
      'restroom': 'Restroom',
      'nurse': 'Nurse Office',
      'office': 'Main Office',
      'library': 'Library',
      'counselor': 'Counselor Office'
    };
    return locations[locationId] || locationId;
  };

  const getStatusColor = (status: string, state: string) => {
    if (status === 'CLOSED') return 'bg-gray-100 text-gray-800';
    if (state === 'IN_TRANSIT') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (status: string, state: string) => {
    if (status === 'CLOSED') return 'Completed';
    if (state === 'IN_TRANSIT') return 'In Transit';
    return 'In Class';
  };

  const StudentView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
        <p className="text-gray-600">Manage your hall passes</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/pass/new"
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Pass
          </Link>
          
          <button
            onClick={() => setViewMode('staff')}
            className="flex items-center justify-center px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Staff View
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Passes</h2>
        <div className="text-center text-gray-500 py-8">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No recent passes</p>
          <p className="text-sm">Create your first pass to get started</p>
        </div>
      </div>
    </div>
  );

  const StaffView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600">Monitor active hall passes</p>
        </div>
        <button
          onClick={() => setViewMode('student')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Student View
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Active Passes ({mockActivePasses.length})
        </h2>
        
        {mockActivePasses.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No active passes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockActivePasses.map((pass) => (
              <div key={pass.passId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">Pass #{pass.passId.slice(-3)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pass.status, pass.state)}`}>
                      {getStatusText(pass.status, pass.state)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.floor((Date.now() - pass.createdAt.seconds * 1000) / 60000)}m ago
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">From:</span>
                    <p className="font-medium">{getLocationName(pass.scheduleLocationId)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">To:</span>
                    <p className="font-medium">{getLocationName(pass.destinationLocationId)}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <Link
                    to={`/pass/${pass.passId}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4">
      {viewMode === 'student' ? <StudentView /> : <StaffView />}
    </div>
  );
};

export default DashboardPage; 