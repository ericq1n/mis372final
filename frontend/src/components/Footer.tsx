export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-4 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="font-semibold text-white">LonghornBank</span>
        <a href="#privacy" className="hover:text-white transition">Privacy</a>
        <a href="#terms" className="hover:text-white transition">Terms</a>
        <a href="#support" className="hover:text-white transition">Support</a>
        <span className="ml-auto text-gray-400">
          &copy; {year} LonghornBank. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
