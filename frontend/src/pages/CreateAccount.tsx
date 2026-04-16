import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAccount } from '../services/accountService';

export const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountType) {
      setError('Please select an account type');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createAccount({
        accountType,
        accountName: accountName || undefined,
      });
      navigate(`/accounts/${result.accountId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-[#CC5500] mb-6">Create New Account</h1>

      <form onSubmit={handleCreate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="accountType"
                value="checking"
                checked={accountType === 'checking'}
                onChange={(e) => setAccountType(e.target.value as 'checking')}
                disabled={isLoading}
                className="w-4 h-4 text-[#CC5500]"
              />
              <span className="ml-3 text-gray-700">Checking Account</span>
              <span className="ml-2 text-sm text-gray-500">(No interest)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="accountType"
                value="savings"
                checked={accountType === 'savings'}
                onChange={(e) => setAccountType(e.target.value as 'savings')}
                disabled={isLoading}
                className="w-4 h-4 text-[#CC5500]"
              />
              <span className="ml-3 text-gray-700">Savings Account</span>
              <span className="ml-2 text-sm text-gray-500">(Earn APY)</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
            Account Name (Optional)
          </label>
          <input
            id="accountName"
            type="text"
            placeholder="e.g., Emergency Fund"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100"
            maxLength={100}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            disabled={isLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#CC5500] hover:bg-[#b34600] text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Account Types</h3>
        <p className="text-sm text-blue-800 mb-2">
          <strong>Checking:</strong> For everyday transactions with unlimited deposits/withdrawals
        </p>
        <p className="text-sm text-blue-800">
          <strong>Savings:</strong> Earn interest (APY) on your balance
        </p>
      </div>
    </div>
  );
};

export default CreateAccount;
