import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import type { User } from '../services/userService';

export const Profile: React.FC = () => {
  const { userId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userId) return;
        const response = await userService.getUser(userId);
        setUser(response.data);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile</h1>

      <div className="bg-white p-8 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">First Name</label>
          <p className="text-gray-600">{user.firstName}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Last Name</label>
          <p className="text-gray-600">{user.lastName}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Email</label>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Phone</label>
          <p className="text-gray-600">{user.phone || 'Not set'}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Address</label>
          <p className="text-gray-600">{user.address || 'Not set'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">City</label>
            <p className="text-gray-600">{user.city || 'Not set'}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">State</label>
            <p className="text-gray-600">{user.state || 'Not set'}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Zip Code</label>
          <p className="text-gray-600">{user.zipCode || 'Not set'}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
          <p className="text-gray-600">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
        </div>

        <div className="mt-8">
          <button
            disabled
            className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
          >
            Edit Profile (Coming Next Phase)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
