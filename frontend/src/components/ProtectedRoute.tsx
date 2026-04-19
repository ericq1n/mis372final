import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCurrentUser } from '../context/CurrentUserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  // Pages like /complete-profile need to render for users whose profile
  // isn't done yet, without bouncing them back to themselves.
  allowIncompleteProfile?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowIncompleteProfile = false,
}) => {
  const { state } = useAuthContext();
  const { user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (!state?.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Wait for the first /users/me fetch before deciding where to send the user.
  if (isLoading || !user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user.profileComplete && !allowIncompleteProfile) {
    return <Navigate to="/complete-profile" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
