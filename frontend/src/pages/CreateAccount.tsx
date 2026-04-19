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
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 text-[#CC5500] hover:text-[#b34600] text-sm font-medium"
      >
        ← Back to My Banking
      </button>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create a new account</h1>
        <p className="text-sm text-gray-600 mb-6">
          Choose an account type and give it an optional nickname.
        </p>

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Account type</label>
            <div className="grid grid-cols-2 gap-3">
              <TypeOption
                selected={accountType === 'checking'}
                onClick={() => setAccountType('checking')}
                disabled={isLoading}
                title="Checking"
                subtitle="No interest"
              />
              <TypeOption
                selected={accountType === 'savings'}
                onClick={() => setAccountType('savings')}
                disabled={isLoading}
                title="Savings"
                subtitle="Earn APY"
              />
            </div>
          </div>

          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-800 mb-2">
              Account name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="accountName"
              type="text"
              placeholder="e.g., Emergency Fund"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC5500] disabled:bg-gray-50"
              maxLength={100}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
              className="flex-1 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#CC5500] hover:bg-[#b34600] text-white py-2 rounded-md text-sm font-semibold transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface TypeOptionProps {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  subtitle: string;
}

const TypeOption: React.FC<TypeOptionProps> = ({ selected, onClick, disabled, title, subtitle }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`text-left border rounded-lg px-4 py-3 transition disabled:opacity-50 ${
      selected
        ? 'border-[#CC5500] bg-[#CC5500]/5 ring-2 ring-[#CC5500]/30'
        : 'border-gray-300 hover:border-gray-400 bg-white'
    }`}
  >
    <p className="text-sm font-semibold text-gray-900">{title}</p>
    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
  </button>
);

export default CreateAccount;
