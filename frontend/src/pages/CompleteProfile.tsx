import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { userService, type UserUpdatePayload } from '../services/userService';
import ProfileForm from '../components/ProfileForm';

export const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, refresh } = useCurrentUser();

  const handleSubmit = async (payload: UserUpdatePayload) => {
    await userService.updateMe(payload);
    await refresh();
    navigate('/dashboard');
  };

  if (isLoading || !user) {
    return <div className="text-center py-20 text-gray-600">Loading your profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to LonghornBank</h1>
        <p className="text-sm text-gray-600 mb-6">
          Before you can open an account, please finish setting up your profile. We use this
          information for account verification and communication.
        </p>
        <ProfileForm user={user} onSubmit={handleSubmit} submitLabel="Complete profile" />
      </div>
    </div>
  );
};

export default CompleteProfile;
