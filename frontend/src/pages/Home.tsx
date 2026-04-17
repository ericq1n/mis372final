export const Home: React.FC = () => {
  return (
    <div className="text-center py-32 px-4 min-h-screen flex flex-col justify-center">
      <h1 className="text-5xl font-bold text-[#CC5500] mb-6">Welcome to Banking App</h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Secure, fast, and simple banking at your fingertips. Manage checking and savings accounts, 
        transfer money, and track your finances all in one place.
      </p>

      <section className="grid grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto px-8">
        <div className="bg-gray-200 p-8 rounded-2xl border-4 border-black">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-[#CC5500] mb-2">Multiple Accounts</h3>
          <p className="text-gray-700 text-center">Create and manage both checking and savings accounts with ease.</p>
        </div>

        <div className="bg-gray-200 p-8 rounded-2xl border-4 border-black">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-[#CC5500] mb-2">Savings Growth</h3>
          <p className="text-gray-700 text-center">Earn competitive APY on your savings account balance.</p>
        </div>

        <div className="bg-gray-200 p-8 rounded-2xl border-4 border-black">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-[#CC5500] mb-2">Secure</h3>
          <p className="text-gray-700 text-center">Enterprise-grade security with JWT authentication.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
