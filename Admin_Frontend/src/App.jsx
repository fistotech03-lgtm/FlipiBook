import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import FlipbooksPage from './pages/FlipbooksPage';
import ForumModerationPage from './pages/ForumModerationPage';
import TicketsModerationPage from './pages/TicketsModerationPage';
import SystemTelemetryPage from './pages/SystemTelemetryPage';
import AuditLogsPage from './pages/AuditLogsPage';

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans antialiased flex flex-col">
      {/* 1. Full-Width Top Navbar: Exactly 7vh */}
      <AdminNavbar />

      {/* 2. Below Navbar: Exactly 93vh (18vw Sidebar + 82vw Content) */}
      <div className="flex w-screen h-[93vh] overflow-hidden">
        {/* Left Dark Sidebar: 18vw */}
        <AdminSidebar />

        {/* Right Main Content Canvas: 82vw x 93vh */}
        <main className="w-[82vw] h-[93vh] overflow-y-auto bg-[#f8fafc] p-[1.2vw] space-y-[1.2vw]">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/flipbooks" element={<FlipbooksPage />} />
            <Route path="/forum" element={<ForumModerationPage />} />
            <Route path="/tickets" element={<TicketsModerationPage />} />
            <Route path="/system" element={<SystemTelemetryPage />} />
            <Route path="/logs" element={<AuditLogsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
