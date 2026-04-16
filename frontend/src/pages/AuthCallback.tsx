import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const errorParam = params.get('error');

        if (errorParam) {
          setError(`Authentication failed: ${errorParam}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // TODO: Exchange code for token from backend
        // For now, store mock data
        // In Phase 2 integration, add endpoint: POST /api/auth/token with { code }
        const mockUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        const mockToken = 'mock_token_' + Math.random().toString(36).substr(2, 20);

        setToken(mockToken, mockUserId);
        navigate('/dashboard');
      } catch (err) {
        setError('Authentication error');
        console.error(err);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [setToken, navigate]);

  return (
    <div className="text-center py-20">
      {error ? (
        <div>
          <p className="text-red-600 text-lg mb-2">{error}</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      ) : (
        <p className="text-lg text-gray-600">Processing authentication...</p>
      )}
    </div>
  );
};

export default AuthCallback;
