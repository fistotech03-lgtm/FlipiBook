import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HomeNav from '../components/NavBar/HomeNav';

export default function MainLayout({ children }) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/my-flipbooks');

  return (
    <div className="w-screen h-screen max-w-full max-h-screen overflow-hidden bg-[#F8FAFC] flex flex-col font-sans">
      <header className="w-full flex-none bg-white z-[100]" style={{ height: '7vh' }}>
        <HomeNav />
      </header>
      <main className={`flex-1 ${isDashboard ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden custom-scrollbar'}`}>
        {children || <Outlet />}
      </main>
    </div>
  );
}
