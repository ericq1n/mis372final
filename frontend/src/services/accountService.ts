import axiosInstance from './api';

export interface BankAccount {
  accountId: string;
  userId: string;
  accountNumber: string;
  accountName?: string;
  accountType: 'checking' | 'savings';
  balance: string | number;
  apy?: string | number;
  dateCreated?: string;
  active: boolean;
}

export interface Transaction {
  transactionId: string;
  accountFromId?: string;
  accountToId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  status: 'completed' | 'failed';
  createdAt: string;
}

export async function getAccounts(): Promise<BankAccount[]> {
  const response = await axiosInstance.get<BankAccount[]>('/accounts');
  return response.data;
}

export async function getAccount(accountId: string): Promise<BankAccount> {
  const response = await axiosInstance.get<BankAccount>(`/accounts/${accountId}`);
  return response.data;
}

export async function createAccount(data: {
  accountType: 'checking' | 'savings';
  accountName?: string;
}): Promise<BankAccount> {
  const response = await axiosInstance.post<BankAccount>('/accounts', data);
  return response.data;
}

export async function updateAccount(
  accountId: string,
  data: Partial<BankAccount>
): Promise<BankAccount> {
  const response = await axiosInstance.put<BankAccount>(`/accounts/${accountId}`, data);
  return response.data;
}

export async function getAccountTransactions(accountId: string): Promise<Transaction[]> {
  const response = await axiosInstance.get<Transaction[]>(`/accounts/${accountId}/transactions`);
  return response.data;
}
