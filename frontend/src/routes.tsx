import { Routes, Route } from 'react-router-dom';
import React from 'react';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateAccount from './pages/CreateAccount';
import AccountDetail from './pages/AccountDetail';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  React.useEffect(() => {
    login();
  }, [login]);

  return (
    <div className="text-center py-20">
      <p className="text-lg text-gray-600 mb-4">Redirecting to login...</p>
    </div>
  );
};

export const AppRoutes: React.FC = () => {

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
        path="/"
      />

      {/* Login - Redirect to Asgardeo */}
      <Route
        path="/login"
        element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        }
      />

      {/* Auth Callback */}
      <Route
        element={
          <MainLayout>
            <AuthCallback />
          </MainLayout>
        }
        path="/auth/callback"
      />

      {/* Protected Routes */}
      <Route
        element={
          <MainLayout>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </MainLayout>
        }
        path="/dashboard"
      />

      <Route
        element={
          <MainLayout>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </MainLayout>
        }
        path="/profile"
      />

      {/* Create Account - Phase 3 */}
      <Route
        element={
          <MainLayout>
            <ProtectedRoute>
              <CreateAccount />
            </ProtectedRoute>
          </MainLayout>
        }
        path="/create-account"
      />

      {/* Account Detail - Phase 3 */}
      <Route
        element={
          <MainLayout>
            <ProtectedRoute>
              <AccountDetail />
            </ProtectedRoute>
          </MainLayout>
        }
        path="/accounts/:accountId"
      />

      {/* Not Found */}
      <Route
        element={
          <MainLayout>
            <NotFound />
          </MainLayout>
        }
        path="*"
      />
    </Routes>
  );
};

export default AppRoutes;
