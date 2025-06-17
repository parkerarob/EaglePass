import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import NewPassPage from '@/pages/NewPassPage';

// Separate component to handle root route redirection
const RootRedirect = () => {
  const { currentUser } = useAuth();
  // Redirect to dashboard if logged in, otherwise to login
  return <Navigate to={currentUser ? "/dashboard" : "/login"} replace />;
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
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-pass"
            element={
              <ProtectedRoute>
                <NewPassPage />
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