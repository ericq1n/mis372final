import StrataWidget from '../components/StrataWidget';

const Support: React.FC = () => {
  return (
    <>
      <StrataWidget />
      <article className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-[#CC5500] uppercase tracking-wide mb-2">
          Support
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">How can we help?</h1>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            LonghornBank support can help with account access, profile updates, transaction questions,
            transfers, and general app issues.
          </p>
          <p>
            If you cannot sign in, first confirm that you are using the correct email address and try
            signing in again. If you still need help, include a short description of the issue and any
            error message you see.
          </p>
          <p>
            For questions about balances or recent transactions, review your dashboard and account
            detail pages before reaching out so support can help faster.
          </p>
          <p>
            For urgent security concerns, stop using the app on shared devices and contact support as
            soon as possible.
          </p>
        </div>
      </article>
    </>
  );
};

export default Support;
