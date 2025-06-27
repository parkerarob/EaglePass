import { useAuth } from '../../hooks/useAuth';
import type { UserProfile } from '../../lib/auth';

interface UserStatusHandlerProps {
  children: React.ReactNode;
}

function PendingApprovalScreen({ profile }: { profile: UserProfile }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Pending Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg 
                className="h-6 w-6 text-yellow-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Pending Approval
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your account is waiting for approval from a school administrator. 
              You'll receive access once your account has been reviewed.
            </p>

            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <div className="text-sm text-gray-700">
                <p><span className="font-medium">Email:</span> {profile.email}</p>
                <p><span className="font-medium">Role:</span> {profile.role}</p>
                <p><span className="font-medium">Submitted:</span> {profile.createdAt.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                If you need immediate access, please contact your school administrator.
              </p>
              
              <button
                onClick={logout}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectedScreen({ profile }: { profile: UserProfile }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Rejected Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg 
                className="h-6 w-6 text-red-600" 
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
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Access Denied
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your account request has been declined. If you believe this is an error, 
              please contact your school administrator.
            </p>

            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <div className="text-sm text-gray-700">
                <p><span className="font-medium">Email:</span> {profile.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuspendedScreen({ profile }: { profile: UserProfile }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Suspended Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
              <svg 
                className="h-6 w-6 text-orange-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Suspended
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your account has been temporarily suspended. Please contact your 
              school administrator for more information.
            </p>

            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <div className="text-sm text-gray-700">
                <p><span className="font-medium">Email:</span> {profile.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserStatusHandler({ children }: UserStatusHandlerProps) {
  const { profile, isApproved, isPending, isRejected, isSuspended } = useAuth();

  // If user is approved, render children (main app)
  if (isApproved) {
    return <>{children}</>;
  }

  // Handle different status screens
  if (profile) {
    if (isPending) {
      return <PendingApprovalScreen profile={profile} />;
    }
    
    if (isRejected) {
      return <RejectedScreen profile={profile} />;
    }
    
    if (isSuspended) {
      return <SuspendedScreen profile={profile} />;
    }
  }

  // Fallback to children if no profile or unknown status
  return <>{children}</>;
} 