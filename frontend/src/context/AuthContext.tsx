import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  login: () => void;
  logout: () => void;
  setToken: (token: string, userId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// PKCE helpers
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return base64;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserIdState] = useState<string | null>(null);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('authToken');
    const storedUserId = sessionStorage.getItem('userId');
    
    if (storedToken && storedUserId) {
      setTokenState(storedToken);
      setUserIdState(storedUserId);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async () => {
    try {
      const clientId = import.meta.env.VITE_ASGARDEO_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_ASGARDEO_REDIRECT_URI;
      const org = import.meta.env.VITE_ASGARDEO_ORG;

      // Generate PKCE parameters
      const codeVerifier = generateRandomString(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const nonce = generateRandomString(32);

      // Store for later use in callback
      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
      sessionStorage.setItem('nonce', nonce);

      // Build authorization URL with PKCE
      const asgardeoLoginUrl = new URL(
        `https://api.asgardeo.io/t/${org}/oauth2/authorize`
      );
      asgardeoLoginUrl.searchParams.set('response_type', 'code');
      asgardeoLoginUrl.searchParams.set('client_id', clientId);
      asgardeoLoginUrl.searchParams.set('redirect_uri', redirectUri);
      asgardeoLoginUrl.searchParams.set('scope', 'openid profile email');
      asgardeoLoginUrl.searchParams.set('code_challenge', codeChallenge);
      asgardeoLoginUrl.searchParams.set('code_challenge_method', 'S256');
      asgardeoLoginUrl.searchParams.set('nonce', nonce);

      window.location.href = asgardeoLoginUrl.toString();
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to initiate login. Check browser console.');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    setTokenState(null);
    setUserIdState(null);
    setIsAuthenticated(false);
  };

  const setToken = (newToken: string, newUserId: string) => {
    sessionStorage.setItem('authToken', newToken);
    sessionStorage.setItem('userId', newUserId);
    setTokenState(newToken);
    setUserIdState(newUserId);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userId, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
