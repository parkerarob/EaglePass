import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createPass } from '@/services/passService';
import { canCreatePass } from '@/services/emergencyService';

const NewPassPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to create a pass.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check for emergency freeze
      const isPassCreationAllowed = await canCreatePass();
      if (!isPassCreationAllowed) {
        throw new Error('Pass creation is disabled due to an emergency.');
      }

      await createPass({
        studentId: currentUser.id,
        originLocationId: 'classroom-1', // Placeholder
        destinationLocationId: 'library', // Placeholder - in reality, this would be looked up from the destination name
      });
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create pass. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Pass</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label htmlFor="destination" className="block text-gray-700 text-sm font-bold mb-2">
            Destination
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Library, Office"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={loading}
          />
        </div>
        
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

        <div className="flex items-center justify-between">
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Get Pass'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewPassPage;
