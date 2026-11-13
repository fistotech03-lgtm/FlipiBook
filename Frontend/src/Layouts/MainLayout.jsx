import React, { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HomeNav from '../components/NavBar/HomeNav';

export default function MainLayout({ children }) {
  const location = useLocation();
  const mainRef = useRef(null);
  const isDashboard = location.pathname.startsWith('/my-flipbooks') || location.pathname.startsWith('/guide');

  // Scroll to top of both window and the scrollable main container on route changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="w-screen h-screen max-w-full max-h-screen overflow-hidden bg-[#F8FAFC] flex flex-col font-sans">
      <header className="w-full flex-none bg-white z-[100] h-14 sm:h-16 md:h-[7vh] min-h-[52px]">
        <HomeNav />
      </header>
      {/* Scrollable container for page views */}
      <main
        ref={mainRef}
        className={`flex-1 ${isDashboard ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden custom-scrollbar'}`}
      >
        {children || <Outlet />}
      </main>
    </div>
  );
}
