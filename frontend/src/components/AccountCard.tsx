import { useMemo, useState } from 'react';
import type { BankAccount } from '../services/accountService';

interface AccountCardProps {
  account: BankAccount;
  onDetails: () => void;
  onTransaction: (type: 'deposit' | 'withdraw' | 'transfer') => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onDetails, onTransaction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const accountTypeLabel = useMemo(() => {
    return account.accountType === 'checking' ? 'Checking' : 'Savings';
  }, [account.accountType]);

  const displayApy = useMemo(() => {
    if (account.accountType === 'savings' && account.apy) {
      return Number(account.apy).toFixed(3);
    }
    return null;
  }, [account.accountType, account.apy]);

  const balanceDisplay = useMemo(() => {
    const balance = typeof account.balance === 'string' ? parseFloat(account.balance) : account.balance;
    return balance.toFixed(2);
  }, [account.balance]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-[#CC5500]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {account.accountName || `${accountTypeLabel} Account`}
          </h3>
          <p className="text-sm text-gray-500">Account #{account.accountNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          account.active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {account.active ? 'Active' : 'Frozen'}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Balance</p>
        <p className="text-3xl font-bold text-[#CC5500]">
          ${balanceDisplay}
        </p>
        {displayApy && (
          <p className="text-xs text-gray-600 mt-2">
            APY: {displayApy}%
          </p>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full mb-3 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition"
      >
        {isOpen ? 'Hide Actions' : 'Show Actions'}
      </button>

      {isOpen && account.active && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => {
              onTransaction('deposit');
              setIsOpen(false);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition"
          >
            Deposit
          </button>
          <button
            onClick={() => {
              onTransaction('withdraw');
              setIsOpen(false);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium transition"
          >
            Withdraw
          </button>
          <button
            onClick={() => {
              onTransaction('transfer');
              setIsOpen(false);
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg text-sm font-medium transition"
          >
            Transfer
          </button>
        </div>
      )}

      <button
        onClick={onDetails}
        className="w-full text-[#CC5500] hover:text-[#b34600] border border-[#CC5500] hover:border-[#b34600] py-2 rounded-lg font-medium transition"
      >
        View Details
      </button>
    </div>
  );
};

export default AccountCard;
