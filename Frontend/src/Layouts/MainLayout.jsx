import React from 'react';
import { Outlet } from 'react-router-dom';
import HomeNav from '../components/NavBar/HomeNav';
// import EditorNav from '../components/NavBar/EditorNav';

export default function MainLayout({ children }) {
  return (
    <div className="w-screen h-screen max-w-full max-h-screen overflow-hidden bg-[#F8FAFC] flex flex-col font-sans">
      <HomeNav />
      {/* EditorNav will be included later */}
      <main className="flex-1 overflow-hidden">
        {children || <Outlet />}
      </main>
    </div>
  );
}
