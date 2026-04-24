import axiosInstance from './api';

export interface ReportStats {
  totalDeposited: number;
  totalWithdrawn: number;
  totalTransferred: number;
  netCashFlow: number;
  transactionCount: number;
}

export interface ReportResponse {
  report: string;
  month: string;
  generatedAt: string;
  stats: ReportStats;
  cached: boolean;
}

export interface AiReport {
  reportId: string;
  month: string;
  reportText: string;
  stats: ReportStats;
  createdAt: string;
}

export async function generateReport(): Promise<ReportResponse> {
  const response = await axiosInstance.post<ReportResponse>('/ai/report');
  return response.data;
}

export async function getReports(): Promise<AiReport[]> {
  const response = await axiosInstance.get<AiReport[]>('/ai/reports');
  return response.data;
}
