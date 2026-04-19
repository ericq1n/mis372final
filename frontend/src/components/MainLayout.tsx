import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  /**
   * When false, children are wrapped in a constrained page container.
   * Set true for marketing / full-bleed pages (e.g. Home) that manage
   * their own section widths.
   */
  fullBleed?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, fullBleed = false }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#fdf6ec]">
      <Header />
      <main className="flex-1 w-full">
        {fullBleed ? (
          children
        ) : (
          <div className="max-w-6xl mx-auto w-full px-6 py-8">{children}</div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
