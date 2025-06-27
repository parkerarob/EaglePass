import { useAuth } from './hooks/useAuth';
import { UserStatusHandler } from './components/auth/UserStatusHandler';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';

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
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome to your admin dashboard. System management and configuration features coming soon.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-purple-400" 
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
                  <h3 className="text-sm font-medium text-purple-800">
                    Admin Access Granted
                  </h3>
                  <div className="mt-2 text-sm text-purple-700">
                    <p>
                      You have full administrative access. User management, system configuration, and advanced features will be available soon.
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
    return <TeacherHome />;
  }
  
  // Default to student dashboard
  return <StudentHome />;
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
