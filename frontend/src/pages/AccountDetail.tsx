import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccount } from '../services/accountService';
import { getAccountTransactions } from '../services/transactionService';
import type { BankAccount } from '../services/accountService';
import type { Transaction } from '../services/transactionService';
import AccountCard from '../components/AccountCard';
import TransactionTable from '../components/TransactionTable';
import { DepositModal, WithdrawModal } from '../components/TransactionModals';

export const AccountDetail: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  useEffect(() => {
    if (!accountId) {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [accountData, transactionsData] = await Promise.all([
          getAccount(accountId),
          getAccountTransactions(accountId),
        ]);
        setAccount(accountData);
        setTransactions(transactionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load account details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accountId, navigate]);

  const handleTransactionSuccess = async () => {
    if (!accountId) return;
    try {
      const [accountData, transactionsData] = await Promise.all([
        getAccount(accountId),
        getAccountTransactions(accountId),
      ]);
      setAccount(accountData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Failed to refresh account data:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Loading account details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-red-600 hover:text-red-800 underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Account not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-[#CC5500] hover:text-[#b34600] underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-[#CC5500] hover:text-[#b34600] font-medium flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>

      <div className="mb-8">
        <AccountCard
          account={account}
          onDetails={() => {}}
          onTransaction={(type) => {
            if (type === 'deposit') {
              setDepositModalOpen(true);
            } else if (type === 'withdraw') {
              setWithdrawModalOpen(true);
            }
          }}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
        <TransactionTable transactions={transactions} />
      </div>

      {account.active && (
        <>
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            onSuccess={handleTransactionSuccess}
            account={account}
          />
          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            onSuccess={handleTransactionSuccess}
            account={account}
          />
        </>
      )}
    </div>
  );
};

export default AccountDetail;
