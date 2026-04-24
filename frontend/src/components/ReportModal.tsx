import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import type { ReportStats } from '../services/aiService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: string;
  month: string;
  stats: ReportStats | null;
}

// Split the AI markdown into its three named sections
function parseSections(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = text.split(/^##\s+/m);
  for (const part of parts) {
    if (!part.trim()) continue;
    const newline = part.indexOf('\n');
    if (newline === -1) continue;
    const title = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();
    result[title] = content;
  }
  return result;
}

// Extract bullet lines from a section that uses "- item" syntax
function parseBullets(text: string): string[] {
  return text
    .split('\n')
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').trim());
}

const fmtDollar = (v: number) =>
  `$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtAxis = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`;

const BAR_COLORS = ['#22c55e', '#ef4444', '#3b82f6'];
const PIE_COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, report, month, stats }) => {
  if (!isOpen) return null;

  const sections = parseSections(report);
  const overview = sections['This Month\'s Overview'] ?? '';
  const workingBullets = parseBullets(sections['What\'s Working'] ?? '');
  const tipText = sections['One Thing to Try'] ?? '';

  const barData = stats
    ? [
        { name: 'Deposited', value: stats.totalDeposited },
        { name: 'Withdrawn', value: stats.totalWithdrawn },
        { name: 'Transferred', value: stats.totalTransferred },
      ]
    : [];

  const pieData = stats
    ? [
        { name: 'Deposits', value: stats.totalDeposited, color: PIE_COLORS[0] },
        { name: 'Withdrawals', value: stats.totalWithdrawn, color: PIE_COLORS[1] },
        { name: 'Transfers', value: stats.totalTransferred, color: PIE_COLORS[2] },
      ].filter((d) => d.value > 0)
    : [];

  const netPositive = stats ? stats.netCashFlow >= 0 : true;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Financial Health Report</h2>
            <p className="text-xs text-gray-500 mt-0.5">{month}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </header>

        {/* Scrollable body */}
        <div className="overflow-y-auto grow px-6 py-5 space-y-6">

          {/* Charts row */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Bar chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Cash Flow Breakdown
                </p>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip
                      formatter={(value) => [fmtDollar(Number(value ?? 0)), '']}
                      cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                      contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Net change pill */}
                <div className={`mt-3 flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium
                  ${netPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <span>Net change</span>
                  <span>{netPositive ? '+' : '−'}{fmtDollar(stats.netCashFlow)}</span>
                </div>
              </div>

              {/* Pie chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  By Transaction Type
                </p>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="46%"
                        outerRadius={58}
                        label={({ percent }: { percent?: number }) =>
                          (percent ?? 0) > 0.05 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ''
                        }
                        labelLine={false}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [fmtDollar(Number(value ?? 0)), '']}
                        contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-sm text-gray-400">
                    No transactions this month
                  </div>
                )}
              </div>
            </div>
          )}

          {/* This Month's Overview */}
          {overview && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                This Month's Overview
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{overview}</p>
            </div>
          )}

          {/* What's Working */}
          {workingBullets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                What's Working
              </h3>
              <ul className="space-y-1.5">
                {workingBullets.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* One Thing to Try */}
          {tipText && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                One Thing to Try
              </h3>
              <div className="flex gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                <span className="text-orange-500 text-base shrink-0 mt-0.5">💡</span>
                <p className="text-sm text-orange-900 leading-relaxed">{tipText}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
          {stats && (
            <p className="text-xs text-gray-400">
              {stats.transactionCount} transaction{stats.transactionCount !== 1 ? 's' : ''} this month
            </p>
          )}
          <button
            onClick={onClose}
            className="ml-auto bg-[#CC5500] hover:bg-[#b34600] text-white px-4 py-2 rounded-md text-sm font-semibold transition"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ReportModal;
