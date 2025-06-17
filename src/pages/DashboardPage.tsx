import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePass, closePass } from '@/services/passService';
import { Pass } from '@/models/firestoreModels';

const DashboardPage: React.FC = () => {
  const { signOut, currentUser } = useAuth();
  const [activePass, setActivePass] = useState<Pass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivePass = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const pass = await getActivePass(currentUser.id);
        setActivePass(pass);
      } catch (err) {
        setError('Failed to fetch active pass.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivePass();
  }, [currentUser]);

  const handleClosePass = async () => {
    if (!activePass || !currentUser) return;
    try {
      await closePass(activePass.id, currentUser.id);
      setActivePass(null); // Optimistically update UI
    } catch (err) {
      setError('Failed to close pass. Please try again.');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
        >
          Sign Out
        </button>
      </div>
      <p className="mb-6">Welcome, {currentUser?.displayName || 'student'}!</p>
      
      {activePass ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Active Pass</p>
          <p>You are currently out of class.</p>
          {/* We would look up the destination name in a real app */}
          <p>Destination ID: {activePass.destinationLocationId}</p> 
          <button 
            onClick={handleClosePass}
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Class
          </button>
        </div>
      ) : (
        <div className="text-center">
            <p className="mb-4">You do not have an active pass.</p>
            <Link to="/new-pass">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create New Pass
                </button>
            </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 