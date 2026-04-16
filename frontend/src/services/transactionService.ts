import axiosInstance from './api';

export interface Transaction {
  transactionId: string;
  accountFromId: string | null;
  accountToId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  status: 'completed' | 'failed';
  createdAt: string;
}

export interface TransactionRequest {
  accountFromId?: string | null;
  accountToId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
}

export async function createTransaction(data: TransactionRequest): Promise<Transaction> {
  const response = await axiosInstance.post<Transaction>('/transactions', data);
  return response.data;
}

export async function getAccountTransactions(accountId: string): Promise<Transaction[]> {
  const response = await axiosInstance.get<Transaction[]>(`/accounts/${accountId}/transactions`);
  return response.data;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const response = await axiosInstance.get<Transaction[]>('/transactions');
  return response.data;
}

// Convenience functions for specific transaction types
export async function deposit(accountId: string, amount: number): Promise<Transaction> {
  return createTransaction({
    accountFromId: null,
    accountToId: accountId,
    type: 'deposit',
    amount,
  });
}

export async function withdraw(accountId: string, amount: number): Promise<Transaction> {
  return createTransaction({
    accountFromId: accountId,
    accountToId: accountId,
    type: 'withdrawal',
    amount,
  });
}

export async function transfer(
  fromAccountId: string,
  toAccountId: string,
  amount: number
): Promise<Transaction> {
  return createTransaction({
    accountFromId: fromAccountId,
    accountToId: toAccountId,
    type: 'transfer',
    amount,
  });
}
