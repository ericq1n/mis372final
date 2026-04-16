import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');

        setDebug(`URL params received. Code: ${code ? 'yes' : 'no'}`);

        if (errorParam) {
          const errorMsg = `${errorParam}${errorDescription ? ': ' + errorDescription : ''}`;
          setError(`Authentication failed: ${errorMsg}`);
          setDebug((prev) => prev + ` | Error from Asgardeo: ${errorMsg}`);
          setTimeout(() => navigate('/'), 5000);
          return;
        }

        if (!code) {
          setError('No authorization code received from Asgardeo');
          setDebug((prev) => prev + ' | No code in URL');
          setTimeout(() => navigate('/'), 5000);
          return;
        }

        // Exchange code for token via backend
        setDebug((prev) => prev + ' | Exchanging code for token...');
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        
        const response = await fetch(`${apiBaseUrl}/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || errorData.error || 'Token exchange failed');
        }

        const data = await response.json();
        setDebug((prev) => prev + ` | Token received, userId: ${data.userId}`);

        // Store token
        setToken(data.access_token, data.userId);
        
        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication error';
        setError(errorMessage);
        setDebug((prev) => prev + ` | Exception: ${errorMessage}`);
        console.error('Auth callback error:', err);
        setTimeout(() => navigate('/'), 5000);
      }
    };

    handleCallback();
  }, [setToken, navigate]);

  return (
    <div className="text-center py-20">
      {error ? (
        <div>
          <p className="text-red-600 text-lg mb-2">❌ {error}</p>
          <p className="text-gray-600 text-sm mb-6">Redirecting to home...</p>
        </div>
      ) : (
        <div>
          <p className="text-lg text-gray-600 mb-4">⏳ Processing authentication...</p>
        </div>
      )}
      {debug && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-left text-xs text-gray-700 max-w-md mx-auto">
          <p className="font-mono break-all">{debug}</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
