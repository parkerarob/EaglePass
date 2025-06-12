import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPass, type CreatePassData } from '../services/firebase';

const NewPassPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePassData>({
    scheduleLocationId: '',
    destinationLocationId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destinations = [
    { id: 'restroom', name: 'Restroom' },
    { id: 'nurse', name: 'Nurse Office' },
    { id: 'office', name: 'Main Office' },
    { id: 'library', name: 'Library' },
    { id: 'counselor', name: 'Counselor Office' }
  ];

  const scheduleLocations = [
    { id: 'room-101', name: 'Room 101 - Math' },
    { id: 'room-102', name: 'Room 102 - English' },
    { id: 'room-103', name: 'Room 103 - Science' },
    { id: 'room-104', name: 'Room 104 - History' },
    { id: 'room-105', name: 'Room 105 - Art' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await createPass(formData);
      navigate(`/pass/${result.passId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pass');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePassData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.scheduleLocationId && formData.destinationLocationId;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Pass</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="scheduleLocation" className="block text-sm font-medium text-gray-700 mb-1">
              Current Location
            </label>
            <select
              id="scheduleLocation"
              value={formData.scheduleLocationId}
              onChange={(e) => handleInputChange('scheduleLocationId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select your current location</option>
              {scheduleLocations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <select
              id="destination"
              value={formData.destinationLocationId}
              onChange={(e) => handleInputChange('destinationLocationId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select your destination</option>
              {destinations.map(destination => (
                <option key={destination.id} value={destination.id}>
                  {destination.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPassPage; 