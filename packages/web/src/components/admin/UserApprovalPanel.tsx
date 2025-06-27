import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  getPendingUsers, 
  updateUserStatus, 
  updateUserRole 
} from '../../lib/auth';
import type { UserProfile, UserRole, UserStatus } from '../../lib/auth';

export function UserApprovalPanel() {
  const { profile: currentUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = getPendingUsers((users) => {
      setPendingUsers(users);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser?.uid]);

  const handleUserAction = async (
    userId: string, 
    action: 'approve' | 'reject',
    newRole?: UserRole
  ) => {
    if (!currentUser?.uid) return;

    setProcessingUsers(prev => new Set(prev).add(userId));

    try {
      // Update status
      const status: UserStatus = action === 'approve' ? 'approved' : 'rejected';
      await updateUserStatus(userId, status, currentUser.uid);

      // Update role if specified and approving
      if (action === 'approve' && newRole) {
        await updateUserRole(userId, newRole, currentUser.uid);
      }

      // Remove from pending list
      setPendingUsers(prev => prev.filter(user => user.uid !== userId));
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user. Please try again.`);
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <svg 
          className="animate-spin h-8 w-8 text-blue-600" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Pending User Approvals
        </h3>

        {pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No pending approvals
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              All user requests have been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <UserApprovalCard
                key={user.uid}
                user={user}
                isProcessing={processingUsers.has(user.uid)}
                onApprove={(role) => handleUserAction(user.uid, 'approve', role)}
                onReject={() => handleUserAction(user.uid, 'reject')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface UserApprovalCardProps {
  user: UserProfile;
  isProcessing: boolean;
  onApprove: (role: UserRole) => void;
  onReject: () => void;
}

function UserApprovalCard({ user, isProcessing, onApprove, onReject }: UserApprovalCardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {user.photoURL ? (
              <img
                className="h-10 w-10 rounded-full"
                src={user.photoURL}
                alt={user.displayName}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <svg 
                  className="h-6 w-6 text-gray-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.displayName}
              </p>
              <p className="text-sm text-gray-500">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Requested Role:</span>
              <span className="ml-1 capitalize">{user.role}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Submitted:</span>
              <span className="ml-1">{user.createdAt.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              disabled={isProcessing}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        <div className="ml-4 flex flex-col space-y-2">
          <button
            onClick={() => onApprove(selectedRole)}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg 
                className="-ml-1 mr-2 h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            )}
            Approve
          </button>

          <button
            onClick={onReject}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg 
                className="-ml-1 mr-2 h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            )}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
