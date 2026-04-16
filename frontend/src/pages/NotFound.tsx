import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-[#CC5500] mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      <p className="text-gray-500 mb-8">Sorry, the page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="bg-[#CC5500] hover:bg-[#b34600] text-white px-6 py-3 rounded-lg font-semibold transition inline-block"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
