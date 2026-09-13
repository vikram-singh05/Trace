import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="min-h-screen relative z-0 flex flex-col">
      <div className="premium-bg" />
      <Navbar />
      <main className="flex-1 pt-24 pb-8">
        <div key={pathname} className="animate-page-enter h-full">
          <Outlet />
        </div>
      </main>
      {pathname !== '/messages' && <Footer />}
    </div>
  );
}
