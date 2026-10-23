import React, { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HomeNav from '../components/NavBar/HomeNav';
import BackToTop from '../components/BackToTop';

export default function MainLayout({ children }) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/my-flipbooks');
  const mainRef = useRef(null);

  // Automatically scroll back to top whenever the route pathname changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="w-screen h-screen max-w-full max-h-screen overflow-hidden bg-[#F8FAFC] flex flex-col font-sans relative">
      <header className="w-full flex-none bg-white z-[100]" style={{ height: '7vh' }}>
        <HomeNav />
      </header>
      <main
        ref={mainRef}
        className={`flex-1 ${isDashboard ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden custom-scrollbar'}`}
      >
        {children || <Outlet />}
      </main>
      {!isDashboard && <BackToTop scrollContainerRef={mainRef} />}
    </div>
  );
}
