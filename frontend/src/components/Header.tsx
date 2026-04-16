import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';

export const Header: React.FC = () => {
  const { state, signOut, signIn } = useAuthContext();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#CC5500] text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left side navigation */}
        <div className="flex gap-6 items-center">
          <Link
            to="/"
            className={`text-lg font-semibold hover:opacity-80 transition ${isActive('/') ? 'underline' : ''}`}
          >
            Home
          </Link>

          {state?.isAuthenticated && (
            <Link
              to="/dashboard"
              className={`text-lg font-semibold hover:opacity-80 transition ${isActive('/dashboard') ? 'underline' : ''}`}
            >
              MyBanking
            </Link>
          )}
        </div>

        {/* Right side navigation */}
        <div className="flex gap-4 items-center">
          {state?.isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className={`hover:opacity-80 transition ${isActive('/profile') ? 'underline font-semibold' : ''}`}
              >
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-white text-[#CC5500] px-4 py-2 rounded font-semibold hover:bg-opacity-90 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="bg-white text-[#CC5500] px-4 py-2 rounded font-semibold hover:bg-opacity-90 transition"
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
