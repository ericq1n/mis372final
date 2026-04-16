
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateAccount from './pages/CreateAccount';
import AccountDetail from './pages/AccountDetail';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  const { state, signIn } = useAuthContext();

  if (!state?.isAuthenticated) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-[#CC5500] mb-6">Welcome to Banking App</h1>
          <p className="text-xl text-gray-600 mb-8">
            Secure, fast, and simple banking at your fingertips.
          </p>
          <button
            onClick={() => signIn()}
            className="bg-[#CC5500] hover:bg-[#b34600] text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Get Started
          </button>
        </div>
      </MainLayout>
    );
  }

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
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <MainLayout>
            <Profile />
          </MainLayout>
        }
      />
      <Route
        path="/create-account"
        element={
          <MainLayout>
            <CreateAccount />
          </MainLayout>
        }
      />
      <Route
        path="/accounts/:accountId"
        element={
          <MainLayout>
            <AccountDetail />
          </MainLayout>
        }
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
