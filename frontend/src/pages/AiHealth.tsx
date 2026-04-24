import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateReport, getReports, type AiReport } from '../services/aiService';
import ReportModal from '../components/ReportModal';

const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

const fmtMoney = (v: number) =>
  `$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AiHealth: React.FC = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState<AiReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AiReport | null>(null);

  const loadReports = useCallback(async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch {
      setError('Failed to load report history.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadReports();
      setIsLoading(false);
    })();
  }, [loadReports]);

  const thisMonthReport = reports.find((r) => r.month === currentMonth) ?? null;

  const handleGenerate = useCallback(async () => {
    setError('');
    setIsGenerating(true);
    try {
      const data = await generateReport();
      // Refresh the list so the new report appears
      await loadReports();
      // Open it immediately
      setSelectedReport({
        reportId: '',
        month: data.month,
        reportText: data.report,
        stats: data.stats,
        createdAt: data.generatedAt,
      });
      setModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [loadReports]);

  const handleView = (report: AiReport) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const pastReports = reports.filter((r) => r.month !== currentMonth);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-gray-700 transition text-sm"
          aria-label="Back to dashboard"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Financial Health</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monthly reports powered by Azure AI · rate-limited to 5 generations per 15 min
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Current month card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Current Month
            </p>
            <h2 className="text-lg font-semibold text-gray-900">{currentMonth}</h2>
            {thisMonthReport ? (
              <p className="text-sm text-green-600 mt-1">
                Report generated · {thisMonthReport.stats.transactionCount} transaction
                {thisMonthReport.stats.transactionCount !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No report generated yet for this month</p>
            )}
          </div>

          {thisMonthReport ? (
            <button
              onClick={() => handleView(thisMonthReport)}
              className="bg-[#CC5500] hover:bg-[#b34600] text-white px-4 py-2 rounded-md text-sm font-semibold transition shrink-0"
            >
              View Report
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#CC5500] hover:bg-[#b34600] disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm font-semibold transition shrink-0"
            >
              {isGenerating ? 'Generating…' : 'Generate Report'}
            </button>
          )}
        </div>

        {/* Stats preview if report exists */}
        {thisMonthReport && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-0.5">Deposited</p>
              <p className="text-sm font-semibold text-green-600">
                +{fmtMoney(thisMonthReport.stats.totalDeposited)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-0.5">Withdrawn</p>
              <p className="text-sm font-semibold text-red-500">
                -{fmtMoney(thisMonthReport.stats.totalWithdrawn)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-0.5">Net Change</p>
              <p className={`text-sm font-semibold ${thisMonthReport.stats.netCashFlow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {thisMonthReport.stats.netCashFlow >= 0 ? '+' : '−'}
                {fmtMoney(thisMonthReport.stats.netCashFlow)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Past reports */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Previous Reports
          {pastReports.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({pastReports.length})
            </span>
          )}
        </h3>

        {isLoading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Loading report history…</p>
        ) : pastReports.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">No previous reports yet.</p>
            <p className="text-gray-400 text-xs mt-1">
              Reports from past months will appear here after you generate them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastReports.map((report) => (
              <div
                key={report.reportId}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{report.month}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {report.stats.transactionCount} transaction
                        {report.stats.transactionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                      <span className="text-green-600 font-medium">
                        +{fmtMoney(report.stats.totalDeposited)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-red-500 font-medium">
                        -{fmtMoney(report.stats.totalWithdrawn)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span
                        className={`font-semibold ${
                          report.stats.netCashFlow >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        Net {report.stats.netCashFlow >= 0 ? '+' : '−'}
                        {fmtMoney(report.stats.netCashFlow)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleView(report)}
                    className="text-sm text-[#CC5500] hover:text-[#b34600] font-medium transition shrink-0"
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report modal */}
      {selectedReport && (
        <ReportModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          report={selectedReport.reportText}
          month={selectedReport.month}
          stats={selectedReport.stats}
        />
      )}
    </div>
  );
};

export default AiHealth;
