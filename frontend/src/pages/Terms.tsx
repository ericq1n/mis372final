import StrataWidget from '../components/StrataWidget';

const Terms: React.FC = () => {
  return (
    <>
      <StrataWidget />
      <article className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-[#CC5500] uppercase tracking-wide mb-2">
          Terms of Service
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Using LonghornBank</h1>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            By using LonghornBank, you agree to use the app responsibly and only for lawful personal
            banking activity. You are responsible for keeping your login credentials secure and for
            reviewing your account activity.
          </p>
          <p>
            LonghornBank provides tools for managing accounts, transactions, transfers, and financial
            summaries. Information shown in the app is provided for convenience and should be reviewed
            carefully before making financial decisions.
          </p>
          <p>
            You agree not to misuse the service, attempt unauthorized access, interfere with system
            operations, or submit false or harmful information.
          </p>
          <p>
            We may update these terms as the app changes. Continued use of LonghornBank means you
            accept the current terms.
          </p>
        </div>
      </article>
    </>
  );
};

export default Terms;
