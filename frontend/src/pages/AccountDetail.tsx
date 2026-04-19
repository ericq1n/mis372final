import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  closeAccount,
  getAccount,
  getAccounts,
  type BankAccount,
} from '../services/accountService';
import {
  deposit,
  getAccountTransactions,
  type Transaction,
} from '../services/transactionService';
import AccountCard from '../components/AccountCard';
import RecentTransactions from '../components/RecentTransactions';
import { TransferModal } from '../components/TransactionModals';
import ConfirmModal from '../components/ConfirmModal';

const toNumber = (v: string | number): number =>
  typeof v === 'string' ? parseFloat(v) : v;

export const AccountDetail: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const [account, setAccount] = useState<BankAccount | null>(null);
  const [allAccounts, setAllAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [transferOpen, setTransferOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    if (!accountId) return;
    const [acct, accts, txs] = await Promise.all([
      getAccount(accountId),
      getAccounts(),
      getAccountTransactions(accountId),
    ]);
    setAccount(acct);
    setAllAccounts(accts);
    setTransactions(txs);
  }, [accountId]);

  useEffect(() => {
    if (!accountId) {
      navigate('/dashboard');
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load account');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountId, navigate, load]);

  const handleSimulateMonth = useCallback(async () => {
    if (!account) return;
    const apy = Number(account.apy || 0);
    const bal = toNumber(account.balance);
    if (apy <= 0 || bal <= 0) return;
    const interest = parseFloat(((bal * apy) / 100 / 12).toFixed(2));
    if (interest <= 0) return;
    await deposit(account.accountId, interest);
    await load();
  }, [account, load]);

  const handleCloseAccount = useCallback(async () => {
    if (!account) return;
    await closeAccount(account.accountId);
    navigate('/dashboard');
  }, [account, navigate]);

  const typeLabel = useMemo(() => {
    if (!account) return '';
    return account.accountType === 'savings' ? 'Savings' : 'Checking';
  }, [account]);

  // Guard: a non-zero balance must be transferred out before closing.
  const closeDisabledReason = useMemo(() => {
    if (!account) return undefined;
    const bal = toNumber(account.balance);
    if (bal > 0) {
      return `This account still has a balance of $${bal.toFixed(
        2
      )}. Transfer the full balance to another account before closing.`;
    }
    return undefined;
  }, [account]);

  // Tabs only need to include accounts that actually appear in this detail
  // page's transactions (so transfers into closed accounts still get sensible
  // labels), but for the tab UX we mainly want the *active* ones.
  const tabAccounts = useMemo(() => {
    if (!account) return [];
    if (account.active) {
      return allAccounts.filter((a) => a.active || a.accountId === account.accountId);
    }
    return [account];
  }, [account, allAccounts]);

  if (isLoading) {
    return <div className="text-center py-20 text-gray-600">Loading account details...</div>;
  }

  if (error || !account) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 text-sm text-red-700">
          {error || 'Account not found'}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[#CC5500] hover:text-[#b34600] text-sm font-medium"
        >
          ← Back to My Banking
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 text-[#CC5500] hover:text-[#b34600] text-sm font-medium"
      >
        ← Back to My Banking
      </button>

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {account.accountName || `${typeLabel} Account`}
          </h1>
          <p className="text-sm text-gray-500">Account #{account.accountNumber}</p>
        </div>

        {account.active && (
          <button
            onClick={() => setCloseConfirmOpen(true)}
            className="bg-white border border-red-300 text-red-700 hover:bg-red-50 transition px-4 py-2 rounded-md text-sm font-medium"
          >
            Close account
          </button>
        )}
      </div>

      {!account.active && (
        <div className="mb-6 bg-gray-100 border border-gray-200 text-gray-700 rounded-md px-4 py-3 text-sm">
          This account is closed. It is read-only and can no longer receive or send funds.
        </div>
      )}

      <div className="mb-6">
        <AccountCard
          account={account}
          onUpdated={load}
          onTransferClick={() => setTransferOpen(true)}
          onSimulateMonth={account.accountType === 'savings' ? handleSimulateMonth : undefined}
        />
      </div>

      <RecentTransactions
        transactions={transactions}
        accounts={tabAccounts}
        initialAccountId={account.accountId}
        limit={50}
      />

      {account.active && (
        <TransferModal
          isOpen={transferOpen}
          onClose={() => setTransferOpen(false)}
          onSuccess={load}
          account={account}
          allAccounts={allAccounts.filter((a) => a.active)}
        />
      )}

      <ConfirmModal
        isOpen={closeConfirmOpen}
        onClose={() => setCloseConfirmOpen(false)}
        onConfirm={handleCloseAccount}
        title="Close this account?"
        description={
          <>
            <p className="mb-2">
              You're about to close{' '}
              <span className="font-semibold">
                {account.accountName || `${typeLabel} Account`} (#{account.accountNumber})
              </span>
              .
            </p>
            <p className="text-gray-600">
              Closed accounts are deactivated and can't be reopened. Your transaction history
              will still be visible for reference.
            </p>
          </>
        }
        confirmLabel="Close account"
        tone="danger"
        disabledReason={closeDisabledReason}
      />
    </div>
  );
};

export default AccountDetail;
