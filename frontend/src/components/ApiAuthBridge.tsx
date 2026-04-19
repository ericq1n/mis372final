import { useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { setTokenGetter } from '../services/api';

/**
 * Wires the Asgardeo access-token getter into the shared axios instance.
 * Must be rendered inside <AuthProvider>. Renders nothing.
 */
export const ApiAuthBridge: React.FC = () => {
  const { getAccessToken } = useAuthContext();

  useEffect(() => {
    setTokenGetter(getAccessToken);
  }, [getAccessToken]);

  return null;
};

export default ApiAuthBridge;
