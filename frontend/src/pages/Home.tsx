import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-[#CC5500] mb-6">Welcome to Banking App</h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Secure, fast, and simple banking at your fingertips. Manage checking and savings accounts, 
        transfer money, and track your finances all in one place.
      </p>

      <div className="flex gap-4 justify-center mb-16">
        {isAuthenticated ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#CC5500] hover:bg-[#b34600] text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Go to Dashboard
          </button>
        ) : (
          <button
            onClick={login}
            className="bg-[#CC5500] hover:bg-[#b34600] text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Get Started
          </button>
        )}
      </div>

      <section className="grid md:grid-cols-3 gap-8 mt-20">
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-[#CC5500] mb-2">Multiple Accounts</h3>
          <p className="text-gray-600">Create and manage both checking and savings accounts with ease.</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-[#CC5500] mb-2">Savings Growth</h3>
          <p className="text-gray-600">Earn competitive APY on your savings account balance.</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-[#CC5500] mb-2">Secure</h3>
          <p className="text-gray-600">Enterprise-grade security with JWT authentication.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
