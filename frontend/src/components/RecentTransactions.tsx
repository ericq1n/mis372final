import { useMemo, useState } from 'react';
import type { BankAccount } from '../services/accountService';
import type { Transaction } from '../services/transactionService';

interface RecentTransactionsProps {
  // All transactions. The component filters down to the active tab.
  transactions: Transaction[];
  // Accounts to expose as tabs. Render order is preserved.
  accounts: BankAccount[];
  // Optional: forces an initially-selected tab; defaults to the first account.
  initialAccountId?: string;
  // Called with the currently-selected account id (useful for "View all").
  onViewAll?: (accountId: string) => void;
  limit?: number;
}

function labelFor(t: Transaction, accountId: string): { text: string; negative: boolean } {
  if (t.type === 'deposit') return { text: 'Deposit', negative: false };
  if (t.type === 'withdrawal') return { text: 'Withdrawal', negative: true };
  if (t.accountFromId === accountId) return { text: 'Transfer out', negative: true };
  if (t.accountToId === accountId) return { text: 'Transfer in', negative: false };
  return { text: 'Transfer', negative: true };
}

function formatDate(d: string): string {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function tabLabel(a: BankAccount): string {
  if (a.accountName) return a.accountName;
  const typeLabel = a.accountType === 'savings' ? 'Savings Account' : 'Checking Account';
  return `${typeLabel} ${a.accountNumber}`;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  accounts,
  initialAccountId,
  onViewAll,
  limit = 5,
}) => {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialAccountId ?? accounts[0]?.accountId
  );

  // Derive a safe effective tab without calling setState inside an effect.
  // Falls back to the first account whenever the stored id is stale or the list is empty.
  const effectiveSelectedId = useMemo<string | undefined>(() => {
    if (accounts.length === 0) return undefined;
    if (selectedId && accounts.some((a) => a.accountId === selectedId)) return selectedId;
    return accounts[0]?.accountId;
  }, [accounts, selectedId]);

  const rows = useMemo(() => {
    if (!effectiveSelectedId) return [];
    return transactions
      .filter((t) => t.accountFromId === effectiveSelectedId || t.accountToId === effectiveSelectedId)
      .slice(0, limit);
  }, [transactions, effectiveSelectedId, limit]);

  const selectedAccount = accounts.find((a) => a.accountId === effectiveSelectedId);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-5 pt-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent transactions</h3>
        {onViewAll && effectiveSelectedId && rows.length > 0 && (
          <button
            onClick={() => onViewAll(effectiveSelectedId)}
            className="text-sm text-[#CC5500] hover:text-[#b34600] font-medium transition"
          >
            View all
          </button>
        )}
      </div>

      {/* Account tabs */}
      {accounts.length > 0 && (
        <div
          role="tablist"
          aria-label="Accounts"
          className="flex gap-1 px-5 pt-3 pb-2 border-b border-gray-100 overflow-x-auto"
        >
          {accounts.map((a) => {
            const isActive = a.accountId === effectiveSelectedId;
            return (
              <button
                key={a.accountId}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedId(a.accountId)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full border transition ${
                  isActive
                    ? 'bg-[#CC5500] text-white border-[#CC5500]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tabLabel(a)}
                <span
                  className={`ml-1.5 text-[10px] ${
                    isActive ? 'text-white/80' : 'text-gray-400'
                  }`}
                >
                  #{a.accountNumber.slice(-4)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="px-5 py-6 text-sm text-gray-500 text-center">
          {selectedAccount
            ? `No transactions yet for ${tabLabel(selectedAccount)}.`
            : 'No accounts to show.'}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.map((t) => {
            const { text, negative } = labelFor(t, effectiveSelectedId!);
            const amount = Number(t.amount).toFixed(2);
            return (
              <li key={t.transactionId} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{text}</p>
                  <p className="text-xs text-gray-500">{formatDate(t.createdAt)}</p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    negative ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {negative ? '-' : '+'}${amount}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentTransactions;
