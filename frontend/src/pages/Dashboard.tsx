import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import type { BankAccount } from '../services/accountService';
import AccountCard from '../components/AccountCard';
import { DepositModal, WithdrawModal, TransferModal } from '../components/TransactionModals';
import axios from 'axios';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state, getAccessToken } = useAuthContext();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        const token = await getAccessToken();
        const api = axios.create({
          baseURL: import.meta.env.VITE_API_BASE_URL,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const response = await api.get<BankAccount[]>('/accounts');
        setAccounts(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounts');
      } finally {
        setIsLoading(false);
      }
    };

    if (state?.isAuthenticated) {
      fetchAccounts();
    }
  }, [state?.isAuthenticated, getAccessToken]);

  const handleTransactionSuccess = async () => {
    try {
      const token = await getAccessToken();
      const api = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await api.get<BankAccount[]>('/accounts');
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to refresh accounts:', err);
    }
  };

  const handleTransaction = (account: BankAccount, type: 'deposit' | 'withdraw' | 'transfer') => {
    setSelectedAccount(account);
    if (type === 'deposit') {
      setDepositModalOpen(true);
    } else if (type === 'withdraw') {
      setWithdrawModalOpen(true);
    } else if (type === 'transfer') {
      setTransferModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Loading your accounts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
        <p className="text-gray-600">Manage your banking accounts here.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={() => navigate('/create-account')}
          className="bg-[#CC5500] hover:bg-[#b34600] text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          + Create New Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">You don't have any accounts yet. Click the button above to create one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.accountId}
              account={account}
              onDetails={() => navigate(`/accounts/${account.accountId}`)}
              onTransaction={(type) => handleTransaction(account, type)}
            />
          ))}
        </div>
      )}

      {selectedAccount && (
        <>
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            onSuccess={handleTransactionSuccess}
            account={selectedAccount}
          />
          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            onSuccess={handleTransactionSuccess}
            account={selectedAccount}
          />
          <TransferModal
            isOpen={transferModalOpen}
            onClose={() => setTransferModalOpen(false)}
            onSuccess={handleTransactionSuccess}
            account={selectedAccount}
            allAccounts={accounts}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
