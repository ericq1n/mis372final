import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { userService, type User } from '../services/userService';

interface CurrentUserContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

export const CurrentUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state } = useAuthContext();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const refresh = useCallback(async () => {
    if (!state?.isAuthenticated) {
      setUser(null);
      return;
    }
    // Only show loading state on initial load, not on background refresh
    if (isInitialLoad) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const resp = await userService.getMe();
      setUser(resp.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
      setUser(null);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [state?.isAuthenticated, isInitialLoad]);

  // Re-fetch whenever auth state flips. The dependency on `refresh`
  // is enough — it closes over isAuthenticated.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <CurrentUserContext.Provider value={{ user, isLoading, error, refresh }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error('useCurrentUser must be used inside <CurrentUserProvider>');
  }
  return ctx;
}
