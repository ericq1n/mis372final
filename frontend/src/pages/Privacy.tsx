import StrataWidget from '../components/StrataWidget';

const Privacy: React.FC = () => {
  return (
    <>
      <StrataWidget />
      <article className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-[#CC5500] uppercase tracking-wide mb-2">
          Privacy Policy
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your privacy matters</h1>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            LonghornBank collects only the information needed to create your account, keep your
            profile current, and provide banking features such as balances, transactions, transfers,
            and financial health reports.
          </p>
          <p>
            We use your information to authenticate you, protect your account, operate the service,
            improve reliability, and respond to support requests. We do not sell your personal
            information.
          </p>
          <p>
            Account activity and profile details are protected with access controls and authentication
            safeguards. You should keep your login information private and contact support if you
            notice activity you do not recognize.
          </p>
          <p>
            You may request help updating or reviewing your information by contacting LonghornBank
            support.
          </p>
        </div>
      </article>
    </>
  );
};

export default Privacy;
