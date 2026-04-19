import { useMemo, useState } from 'react';
import type { BankAccount } from '../services/accountService';
import { deposit, withdraw } from '../services/transactionService';

type ActionType = 'deposit' | 'withdraw' | 'transfer';

interface AccountCardProps {
  account: BankAccount;
  onUpdated: () => Promise<void> | void;
  onTransferClick: () => void;
  onSimulateMonth?: () => Promise<void> | void;
  onDetails?: () => void;
  showDetailsLink?: boolean;
}

const getBalanceNumber = (balance: string | number): number =>
  typeof balance === 'string' ? parseFloat(balance) : balance;

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onUpdated,
  onTransferClick,
  onSimulateMonth,
  onDetails,
  showDetailsLink = false,
}) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  const isSavings = account.accountType === 'savings';
  const isBusy = pendingAction !== null;

  const typeLabel = isSavings ? 'Savings Account' : 'Checking Account';
  const balance = useMemo(() => getBalanceNumber(account.balance).toFixed(2), [account.balance]);

  const apyDisplay = useMemo(() => {
    if (!isSavings || !account.apy) return null;
    return `${Number(account.apy).toFixed(2)}%`;
  }, [account.apy, isSavings]);

  const resetAfter = (text: string) => {
    setMessage({ tone: 'ok', text });
    setAmount('');
    void onUpdated();
  };

  const handleDeposit = async () => {
    setMessage(null);
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setMessage({ tone: 'err', text: 'Enter a positive amount' });
      return;
    }
    setPendingAction('deposit');
    try {
      await deposit(account.accountId, value);
      resetAfter(`✓ Deposit successful +$${value.toFixed(2)}`);
    } catch (err) {
      setMessage({ tone: 'err', text: err instanceof Error ? err.message : 'Deposit failed' });
    } finally {
      setPendingAction(null);
    }
  };

  const handleWithdraw = async () => {
    setMessage(null);
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setMessage({ tone: 'err', text: 'Enter a positive amount' });
      return;
    }
    if (value > getBalanceNumber(account.balance)) {
      setMessage({ tone: 'err', text: 'Insufficient funds' });
      return;
    }
    setPendingAction('withdraw');
    try {
      await withdraw(account.accountId, value);
      resetAfter(`✓ Withdrawal successful -$${value.toFixed(2)}`);
    } catch (err) {
      setMessage({ tone: 'err', text: err instanceof Error ? err.message : 'Withdrawal failed' });
    } finally {
      setPendingAction(null);
    }
  };

  const handleTransfer = () => {
    setMessage(null);
    onTransferClick();
  };

  const handleSimulateMonth = async () => {
    if (!onSimulateMonth) return;
    setPendingAction('deposit');
    try {
      await onSimulateMonth();
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {typeLabel}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">${balance}</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            account.active
              ? 'bg-[#CC5500]/10 text-[#CC5500]'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {account.active ? 'Active' : 'Closed'}
        </span>
      </div>

      {account.active && (
        <>
          <div className="relative mb-3">
            <input
              type="number"
              placeholder="Enter amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isBusy}
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC5500] disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDeposit}
              disabled={isBusy}
              className="border border-gray-300 text-gray-800 text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
            >
              {pendingAction === 'deposit' ? '...' : 'Deposit'}
            </button>
            <button
              onClick={handleWithdraw}
              disabled={isBusy}
              className="border border-gray-300 text-gray-800 text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
            >
              {pendingAction === 'withdraw' ? '...' : 'Withdraw'}
            </button>
            <button
              onClick={handleTransfer}
              disabled={isBusy}
              className="border border-gray-300 text-gray-800 text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
            >
              Transfer Out
            </button>
          </div>

          {message && (
            <div
              className={`mt-3 text-sm rounded-md px-3 py-2 ${
                message.tone === 'ok'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {isSavings && apyDisplay && onSimulateMonth && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                APY: <span className="font-semibold text-[#CC5500]">{apyDisplay}</span> — simulate growth
              </span>
              <button
                onClick={handleSimulateMonth}
                disabled={isBusy}
                className="border border-gray-300 text-gray-800 font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
              >
                + 1 Month
              </button>
            </div>
          )}
        </>
      )}

      {showDetailsLink && onDetails && (
        <button
          onClick={onDetails}
          className="mt-4 w-full text-[#CC5500] hover:text-[#b34600] text-sm font-medium transition"
        >
          View details →
        </button>
      )}
    </div>
  );
};

export default AccountCard;
