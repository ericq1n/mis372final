
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateAccount from './pages/CreateAccount';
import AccountDetail from './pages/AccountDetail';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-account"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateAccount />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts/:accountId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AccountDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth/callback"
        element={<Navigate to="/" replace />}
      />
      <Route
        path="*"
        element={
          <MainLayout>
            <NotFound />
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
