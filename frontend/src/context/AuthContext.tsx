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

  const login = () => {
    const clientId = import.meta.env.VITE_ASGARDEO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_ASGARDEO_REDIRECT_URI;
    const org = import.meta.env.VITE_ASGARDEO_ORG;
    
    const asgardeoLoginUrl = `https://api.asgardeo.io/t/${org}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email`;
    window.location.href = asgardeoLoginUrl;
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
