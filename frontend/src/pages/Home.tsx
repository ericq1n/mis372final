import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import { useEffect } from 'react';

interface Feature {
  title: string;
  description: string;
  glyph: React.ReactNode;
}

const features: Feature[] = [
  {
    title: 'Deposit & withdraw',
    description: 'Add or remove funds from checking or savings with instant updates.',
    glyph: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="6" width="16" height="13" rx="2" />
        <path d="M8 6V4h8v2M12 10v6M9 13l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Transfer between accounts',
    description: 'Move money seamlessly between your checking and savings.',
    glyph: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8h14l-3-3M20 16H6l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Savings APY growth',
    description: 'Simulate monthly interest growth and watch your balance build with 3.00% APY.',
    glyph: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v18M8 7h6a3 3 0 010 6H8m0 0h7a3 3 0 010 6H7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, signIn } = useAuthContext();
  const isAuthed = !!state?.isAuthenticated;

  // Strata Chat Widget Integration
  useEffect(() => {
    // Inject script directly to DOM
    const script = document.createElement('script');
    script.src = "https://strata.fyi/widget.js";
    script.defer = true;
    script.id = "strata-widget-script"; // ID makes it easy to find later
    document.body.appendChild(script);
    const chatElement = document.createElement('strata-chat');
    chatElement.setAttribute('workspace', 'longhornbanking');
    chatElement.setAttribute('icon-url', 'https://giving.utexas.edu/wp-content/uploads/2022/01/0_Texas-Longhorns-01.png');
    chatElement.setAttribute('chat-title', 'Longhorn Banking');
    chatElement.id = "strata-widget-ui";
    document.body.appendChild(chatElement);

    // CLEANUP FUNCTION: Runs when the user leaves the Home page
    return () => {
      const existingScript = document.getElementById('strata-widget-script');
      const existingUI = document.getElementById('strata-widget-ui');
      
      if (existingScript) existingScript.remove();
      if (existingUI) existingUI.remove();
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#CC5500] text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5">Banking built for you</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Manage your checking and savings accounts, make transfers, and track your total
            balance — all in one secure place. Log in to get started.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            {isAuthed ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white text-[#CC5500] hover:bg-white/90 transition px-5 py-2.5 rounded-md text-sm font-semibold shadow"
              >
                Go to My Banking
              </button>
            ) : (
              <>
                <button
                  onClick={() => signIn()}
                  className="bg-white text-[#CC5500] hover:bg-white/90 transition px-5 py-2.5 rounded-md text-sm font-semibold shadow"
                >
                  Log In
                </button>
                <button
                //NOTE: NEED TO CREATE ASGARDEO CREATE ACCOUNT FEATURE
                  onClick={() => signIn()}
                  className="bg-transparent border border-white/70 text-white hover:bg-white/10 transition px-5 py-2.5 rounded-md text-sm font-semibold"
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-center text-xl font-semibold text-gray-900 mb-10">Everything you need</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
              >
                <div className="mx-auto mb-4 h-10 w-10 flex items-center justify-center rounded-full bg-[#CC5500]/10 text-[#CC5500]">
                  {f.glyph}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security callout */}
      <section className="bg-[#fdf0e0] border-y border-[#CC5500]/20">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-sm font-semibold text-[#CC5500]">Secure by default</p>
          <p className="text-sm text-[#8a3c08] mt-1">
            Authentication powered by Asgardeo with JWT token security. Your data is yours alone.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
