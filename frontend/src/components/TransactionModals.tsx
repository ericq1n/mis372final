import { useState } from 'react';
import { transfer } from '../services/transactionService';
import type { BankAccount } from '../services/accountService';

const getBalance = (balance: string | number): number =>
  typeof balance === 'string' ? parseFloat(balance) : balance;

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
      <header className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-gray-400 hover:text-gray-700 text-lg leading-none"
        >
          ×
        </button>
      </header>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  account: BankAccount;
  allAccounts?: BankAccount[];
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  account,
  allAccounts = [],
}) => {
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const otherAccounts = allAccounts.filter(
    (a) => a.accountId !== account.accountId && a.active
  );

  const handleTransfer = async () => {
    setError('');
    if (!toAccountId) {
      setError('Please select a destination account');
      return;
    }
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    const balance = getBalance(account.balance);
    if (value > balance) {
      setError(`Insufficient funds. Available: $${balance.toFixed(2)}`);
      return;
    }

    setIsLoading(true);
    try {
      await transfer(account.accountId, toAccountId, value);
      setAmount('');
      setToAccountId('');
      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC5500] disabled:bg-gray-50';

  return (
    <ModalShell title="Transfer funds" onClose={onClose}>
      <p className="text-sm text-gray-600 mb-4">
        From: <span className="font-medium text-gray-900">
          {account.accountName || `${account.accountType} Account`}
        </span> (#{account.accountNumber})
      </p>

      <label className="block text-xs font-medium text-gray-700 mb-1">To account</label>
      <select
        value={toAccountId}
        onChange={(e) => setToAccountId(e.target.value)}
        disabled={isLoading || otherAccounts.length === 0}
        className={`${inputCls} mb-4`}
      >
        <option value="">Select destination account</option>
        {otherAccounts.map((acc) => (
          <option key={acc.accountId} value={acc.accountId}>
            {acc.accountName || `${acc.accountType} Account`} (#{acc.accountNumber})
          </option>
        ))}
      </select>

      {otherAccounts.length === 0 && (
        <p className="text-[#CC5500] text-xs mb-4">
          No other active accounts available to transfer to.
        </p>
      )}

      <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
      <input
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        step="0.01"
        min="0"
        disabled={isLoading}
        className={`${inputCls} mb-3`}
      />

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleTransfer}
          disabled={isLoading || otherAccounts.length === 0}
          className="flex-1 bg-[#CC5500] hover:bg-[#b34600] text-white py-2 rounded-md text-sm font-semibold transition disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Transfer'}
        </button>
      </div>
    </ModalShell>
  );
};

// Deposit and withdraw are handled inline on AccountCard now. If you need
// modal versions in the future, add them here using ModalShell.
