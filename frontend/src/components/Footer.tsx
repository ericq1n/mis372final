import { Link } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';

export const Footer: React.FC = () => {
  const { state, signOut } = useAuthContext();

  return (
    <footer className="bg-[#CC5500] text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="text-sm">&copy; 2026 Banking App. All rights reserved.</div>

          <div className="flex gap-6">
            <Link to="/" className="hover:opacity-80 transition">
              Home
            </Link>

            {state?.isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:opacity-80 transition">
                  Dashboard
                </Link>
                <Link to="/profile" className="hover:opacity-80 transition">
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hover:opacity-80 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
