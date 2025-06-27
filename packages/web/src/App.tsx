import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { UserStatusHandler } from './components/auth/UserStatusHandler';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';
import AdminHome from './pages/AdminHome';

// Navigation component for role-based navigation
function Navigation() {
  const { profile, logout } = useAuth();
  const location = useLocation();

  if (!profile) return null;

  const navItems = [
    { path: '/student', label: 'Student Dashboard', roles: ['student'] },
    { path: '/teacher', label: 'Teacher Dashboard', roles: ['teacher'] },
    { path: '/admin', label: 'Admin Dashboard', roles: ['admin'] },
  ].filter(item => item.roles.includes(profile.role));

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">EaglePass</h1>
            <div className="flex space-x-4">
              {navItems.map(item => (
                <a
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {profile.photoURL && (
                <img
                  className="h-8 w-8 rounded-full"
                  src={profile.photoURL}
                  alt={profile.displayName}
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {profile.displayName}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                ({profile.role})
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
    </nav>
  );
}

// Role-based route component
function RoleRoute({ 
  allowedRoles, 
  children, 
  fallbackPath 
}: { 
  allowedRoles: string[], 
  children: React.ReactNode, 
  fallbackPath: string 
}) {
  const { profile } = useAuth();
  
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
}

// Main app content with routing
function MainApp() {
  const { profile } = useAuth();

  if (!profile) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Routes>
        {/* Student routes */}
        <Route 
          path="/student" 
          element={
            <RoleRoute allowedRoles={['student', 'teacher', 'admin']} fallbackPath="/teacher">
              <StudentHome />
            </RoleRoute>
          } 
        />
        
        {/* Teacher routes */}
        <Route 
          path="/teacher" 
          element={
            <RoleRoute allowedRoles={['teacher', 'admin']} fallbackPath="/admin">
              <TeacherHome />
            </RoleRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={
            <RoleRoute allowedRoles={['admin']} fallbackPath="/teacher">
              <AdminHome />
            </RoleRoute>
          } 
        />
        
        {/* Default redirect based on role */}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={
                profile.role === 'admin' ? '/admin' : 
                profile.role === 'teacher' ? '/teacher' : 
                '/student'
              } 
              replace 
            />
          } 
        />
        
        {/* Catch all other routes */}
        <Route 
          path="*" 
          element={
            <Navigate 
              to={
                profile.role === 'admin' ? '/admin' : 
                profile.role === 'teacher' ? '/teacher' : 
                '/student'
              } 
              replace 
            />
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <UserStatusHandler>
      <ProtectedRoute>
        <Router>
          <MainApp />
        </Router>
      </ProtectedRoute>
    </UserStatusHandler>
  );
}

export default App;
