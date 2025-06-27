import { useAuth } from './hooks/useAuth';
import { UserStatusHandler } from './components/auth/UserStatusHandler';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserApprovalPanel } from './components/admin/UserApprovalPanel';

function AdminDashboard() {
  const { logout, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                EaglePass Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {profile?.photoURL && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profile.photoURL}
                    alt={profile.displayName}
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {profile?.displayName}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  ({profile?.role})
                </span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <UserApprovalPanel />
        </div>
      </main>
    </div>
  );
}

function StudentDashboard() {
  const { logout, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                EaglePass
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {profile?.photoURL && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profile.photoURL}
                    alt={profile.displayName}
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {profile?.displayName}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  ({profile?.role})
                </span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {profile?.displayName}!
            </h2>
            <p className="text-gray-600 mb-6">
              Your EaglePass system is ready. Pass management features will be available soon.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-blue-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    System Status
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Authentication is now active with Google SSO and domain restriction. 
                      Pass creation and management features are coming next!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TeacherDashboard() {
  const { logout, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                EaglePass Teacher
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {profile?.photoURL && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profile.photoURL}
                    alt={profile.displayName}
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {profile?.displayName}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  ({profile?.role})
                </span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Teacher Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome to your teacher dashboard. Real-time pass monitoring and approval features coming soon.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-green-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Authentication Complete
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      You have teacher-level access. Student pass monitoring and real-time notifications will be available soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MainApp() {
  const { profile } = useAuth();

  // Route based on user role
  if (profile?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (profile?.role === 'teacher') {
    return <TeacherDashboard />;
  }
  
  // Default to student dashboard
  return <StudentDashboard />;
}

function App() {
  return (
    <UserStatusHandler>
      <ProtectedRoute>
        <MainApp />
      </ProtectedRoute>
    </UserStatusHandler>
  );
}

export default App;
