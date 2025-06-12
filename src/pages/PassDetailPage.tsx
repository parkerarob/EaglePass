import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { declareDeparture, declareReturn } from '../services/firebase';
import type { Pass } from '../types/models';

const PassDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pass, setPass] = useState<Pass | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock pass data for now - in a real app, this would fetch from Firestore
  useEffect(() => {
    if (id) {
      // Simulate fetching pass data
      const mockPass: Pass = {
        passId: id,
        studentId: 'student-123',
        scheduleLocationId: 'room-101',
        destinationLocationId: 'restroom',
        status: 'OPEN',
        state: 'IN_CLASS',
        legId: 1,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        lastUpdatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };
      setPass(mockPass);
    }
  }, [id]);

  const handleDeparture = async () => {
    if (!pass) return;
    
    setError(null);
    setLoading(true);

    try {
      const result = await declareDeparture(pass.passId);
      setPass(result.pass);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to declare departure');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!pass) return;
    
    setError(null);
    setLoading(true);

    try {
      const result = await declareReturn(pass.passId);
      setPass(result.pass);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to declare return');
    } finally {
      setLoading(false);
    }
  };

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

  if (!pass) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Hall Pass</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pass.status, pass.state)}`}>
            {getStatusText(pass.status, pass.state)}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pass ID</label>
            <p className="text-sm text-gray-900 font-mono">{pass.passId}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">From</label>
            <p className="text-sm text-gray-900">{getLocationName(pass.scheduleLocationId)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <p className="text-sm text-gray-900">{getLocationName(pass.destinationLocationId)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Created</label>
            <p className="text-sm text-gray-900">
              {new Date(pass.createdAt.seconds * 1000).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {pass.status === 'OPEN' && pass.state === 'IN_CLASS' && (
            <button
              onClick={handleDeparture}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Declare Departure'}
            </button>
          )}

          {pass.status === 'OPEN' && pass.state === 'IN_TRANSIT' && (
            <button
              onClick={handleReturn}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Declare Return'}
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassDetailPage; 