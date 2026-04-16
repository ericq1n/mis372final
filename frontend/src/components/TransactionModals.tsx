import { useState } from 'react';
import { deposit, withdraw, transfer } from '../services/transactionService';
import type { BankAccount } from '../services/accountService';

const getBalance = (balance: string | number): number => {
  return typeof balance === 'string' ? parseFloat(balance) : balance;
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: BankAccount;
  allAccounts?: BankAccount[];
}

export const DepositModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, account }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = async () => {
    setError('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await deposit(account.accountId, parseFloat(amount));
      setAmount('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-[#CC5500] mb-4">Deposit Funds</h2>
        <p className="text-gray-600 mb-6">
          Account: {account.accountName || `${account.accountType} Account`} (#{account.accountNumber})
        </p>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0"
          disabled={isLoading}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 disabled:bg-gray-100"
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            disabled={isLoading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const WithdrawModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, account }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    setError('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const balance = getBalance(account.balance);
    if (parseFloat(amount) > balance) {
      setError(`Insufficient funds. Available: $${balance.toFixed(2)}`);
      return;
    }

    setIsLoading(true);
    try {
      await withdraw(account.accountId, parseFloat(amount));
      setAmount('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-[#CC5500] mb-4">Withdraw Funds</h2>
        <p className="text-gray-600 mb-2">
          Account: {account.accountName || `${account.accountType} Account`} (#{account.accountNumber})
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Available: ${typeof account.balance === 'string' ? Number(account.balance).toFixed(2) : Number(account.balance).toFixed(2)}
        </p>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0"
          disabled={isLoading}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 disabled:bg-gray-100"
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={isLoading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TransferModal: React.FC<ModalProps> = ({
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

  const otherAccounts = allAccounts.filter((a) => a.accountId !== account.accountId && a.active);

  const handleTransfer = async () => {
    setError('');

    if (!toAccountId) {
      setError('Please select a destination account');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const balance = getBalance(account.balance);
    if (parseFloat(amount) > balance) {
      setError(`Insufficient funds. Available: $${balance.toFixed(2)}`);
      return;
    }

    setIsLoading(true);
    try {
      await transfer(account.accountId, toAccountId, parseFloat(amount));
      setAmount('');
      setToAccountId('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-[#CC5500] mb-4">Transfer Funds</h2>
        <p className="text-gray-600 mb-6">
          From: {account.accountName || `${account.accountType} Account`} (#{account.accountNumber})
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-2">To Account</label>
        <select
          value={toAccountId}
          onChange={(e) => setToAccountId(e.target.value)}
          disabled={isLoading || otherAccounts.length === 0}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 disabled:bg-gray-100"
        >
          <option value="">Select destination account</option>
          {otherAccounts.map((acc) => (
            <option key={acc.accountId} value={acc.accountId}>
              {acc.accountName || `${acc.accountType} Account`} (#{acc.accountNumber})
            </option>
          ))}
        </select>

        {otherAccounts.length === 0 && (
          <p className="text-orange-600 text-sm mb-4">No other active accounts available to transfer to</p>
        )}

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0"
          disabled={isLoading}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 disabled:bg-gray-100"
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={isLoading || otherAccounts.length === 0}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};
