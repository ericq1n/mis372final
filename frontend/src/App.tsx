
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CompleteProfile from './pages/CompleteProfile';
import CreateAccount from './pages/CreateAccount';
import AccountDetail from './pages/AccountDetail';
import AiHealth from './pages/AiHealth';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout fullBleed>
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
        path="/complete-profile"
        element={
          <ProtectedRoute allowIncompleteProfile>
            <MainLayout>
              <CompleteProfile />
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
        path="/ai-health"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AiHealth />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy"
        element={
          <MainLayout>
            <Privacy />
          </MainLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <MainLayout>
            <Terms />
          </MainLayout>
        }
      />
      <Route
        path="/support"
        element={
          <MainLayout>
            <Support />
          </MainLayout>
        }
      />
      <Route
        path="/auth/callback"
        element={<Navigate to="/dashboard" replace />}
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
