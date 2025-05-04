import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      {/* Add padding to account for fixed header - use a consistent value */}
      <main className="flex-grow pt-16 pb-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
