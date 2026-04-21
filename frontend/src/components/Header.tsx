import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCurrentUser } from '../context/CurrentUserContext';
import Avatar from './Avatar';

const linkBase = 'text-sm font-medium text-white/90 hover:text-white transition';
const linkActive = 'text-white underline underline-offset-4';

export const Header: React.FC = () => {
  const { state, signIn } = useAuthContext();
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const isAuthed = !!state?.isAuthenticated;

  return (
    <header className="bg-[#CC5500] text-white shadow-sm">
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight">LonghornBank</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          {!isAuthed && (
            <NavLink
              to="/"
              end
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
            >
              Home
            </NavLink>
          )}

          {isAuthed && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
            >
              My Banking
            </NavLink>
          )}

          {isAuthed ? (
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              onClick={() => navigate('/profile')}
            />
          ) : (
            <button
              type="button"
              onClick={() => signIn()}
              className="bg-white text-[#CC5500] hover:bg-white/90 transition px-3 py-1.5 rounded-md text-sm font-semibold"
            >
              Log In
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
