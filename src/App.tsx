import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { useAuth } from '@/contexts/AuthContext';

// Separate component to handle root route redirection
const RootRedirect = () => {
  const { currentUser } = useAuth();
  return <Navigate to={currentUser ? "/dashboard" : "/login"} replace />;
};

// Temporary Dashboard component with sign-out button
const Dashboard = () => {
  const { signOut } = useAuth();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard (Coming Soon)</h1>
      <button
        onClick={signOut}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600">Unauthorized</h1>
                  <p className="mt-2 text-gray-600">
                    You don't have permission to access this page.
                  </p>
                </div>
              </div>
            }
          />
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 