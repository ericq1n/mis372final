import type { Transaction } from '../services/transactionService';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No transactions yet</p>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return { icon: '📥', color: 'text-blue-600', label: 'Deposit' };
      case 'withdrawal':
        return { icon: '📤', color: 'text-orange-600', label: 'Withdrawal' };
      case 'transfer':
        return { icon: '💸', color: 'text-purple-600', label: 'Transfer' };
      default:
        return { icon: '📊', color: 'text-gray-600', label: 'Transaction' };
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const transactionType = getTransactionIcon(transaction.type);
              const isWithdrawal = transaction.type === 'withdrawal' || transaction.type === 'transfer';

              return (
                <tr key={transaction.transactionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{transactionType.icon}</span>
                      <span className={`font-medium ${transactionType.color}`}>
                        {transactionType.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold ${
                    isWithdrawal ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {isWithdrawal ? '-' : '+'}${Number(transaction.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status === 'completed' ? 'Completed' : 'Failed'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
