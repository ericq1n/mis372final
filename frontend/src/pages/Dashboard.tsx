import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import { getAccounts, type BankAccount } from '../services/accountService';
import {
  deposit,
  getAllTransactions,
  type Transaction,
} from '../services/transactionService';
import { useCurrentUser } from '../context/CurrentUserContext';
import AccountCard from '../components/AccountCard';
import SummaryCard from '../components/SummaryCard';
import RecentTransactions from '../components/RecentTransactions';
import { TransferModal } from '../components/TransactionModals';

const toNumber = (v: string | number): number =>
  typeof v === 'string' ? parseFloat(v) : v;

const formatMoney = (v: number): string =>
  `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const { user } = useCurrentUser();

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [transferSource, setTransferSource] = useState<BankAccount | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [accts, txs] = await Promise.all([getAccounts(), getAllTransactions()]);
      setAccounts(accts);
      setTransactions(txs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    }
  }, []);

  useEffect(() => {
    if (!state?.isAuthenticated) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      await loadAll();
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [state?.isAuthenticated, loadAll]);

  // The dashboard only ever considers active accounts — closed accounts are
  // hidden entirely. They're still fetched so transfers from them in the past
  // can resolve, but they don't drive any UI on this page.
  const activeAccounts = useMemo(
    () => accounts.filter((a) => a.active),
    [accounts]
  );

  const { checkingTotal, savingsTotal, grandTotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const a of activeAccounts) {
      const bal = toNumber(a.balance);
      if (a.accountType === 'checking') c += bal;
      else if (a.accountType === 'savings') s += bal;
    }
    return { checkingTotal: c, savingsTotal: s, grandTotal: c + s };
  }, [activeAccounts]);

  const topApy = useMemo(() => {
    const apys = activeAccounts
      .filter((a) => a.accountType === 'savings' && a.apy)
      .map((a) => Number(a.apy));
    if (apys.length === 0) return null;
    return Math.max(...apys).toFixed(2);
  }, [activeAccounts]);

  const handleSimulateMonth = useCallback(
    async (account: BankAccount) => {
      const apy = Number(account.apy || 0);
      const bal = toNumber(account.balance);
      if (apy <= 0 || bal <= 0) return;
      const interest = parseFloat(((bal * apy) / 100 / 12).toFixed(2));
      if (interest <= 0) return;
      await deposit(account.accountId, interest);
      await loadAll();
    },
    [loadAll]
  );

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Loading your accounts...</p>
      </div>
    );
  }

  const firstName = user?.firstName || 'there';

  return (
    <div>
      {/* Greeting + CTA */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Here's a summary of your accounts as of today.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/ai-health')}
            className="bg-[#CC5500] hover:bg-[#b34600] text-white transition px-4 py-2 rounded-md text-sm font-medium shadow-sm"
          >
            AI Financial Health
          </button>
          <button
            onClick={() => navigate('/create-account')}
            className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 transition px-4 py-2 rounded-md text-sm font-medium shadow-sm"
          >
            + Create bank account
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="Checking"
          amount={formatMoney(checkingTotal)}
          caption="Available balance"
        />
        <SummaryCard
          label="Savings"
          amount={formatMoney(savingsTotal)}
          caption={topApy ? `${topApy}% APY` : 'No savings yet'}
        />
        <SummaryCard
          label="Total balance"
          amount={formatMoney(grandTotal)}
          caption="Checking + savings"
          highlight
        />
      </div>

      {/* Account cards */}
      {activeAccounts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-600 mb-4">
            You don't have any active accounts yet. Create one to get started.
          </p>
          <button
            onClick={() => navigate('/create-account')}
            className="bg-[#CC5500] hover:bg-[#b34600] text-white px-5 py-2 rounded-md text-sm font-semibold transition"
          >
            + Create bank account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {activeAccounts.map((account) => (
            <AccountCard
              key={account.accountId}
              account={account}
              onUpdated={loadAll}
              onTransferClick={() => setTransferSource(account)}
              onSimulateMonth={
                account.accountType === 'savings'
                  ? () => handleSimulateMonth(account)
                  : undefined
              }
              onDetails={() => navigate(`/accounts/${account.accountId}`)}
              showDetailsLink
            />
          ))}
        </div>
      )}

      {/* Recent transactions — toggle between the user's active accounts */}
      {activeAccounts.length > 0 && (
        <RecentTransactions
          accounts={activeAccounts}
          transactions={transactions}
          onViewAll={(accountId) => navigate(`/accounts/${accountId}`)}
        />
      )}

      {transferSource && (
        <TransferModal
          isOpen={true}
          onClose={() => setTransferSource(null)}
          onSuccess={loadAll}
          account={transferSource}
          allAccounts={activeAccounts}
        />
      )}
    </div>
  );
};

export default Dashboard;
