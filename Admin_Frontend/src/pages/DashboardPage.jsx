import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Eye,
  HardDrive,
  MessageSquare,
  Activity,
  ArrowRight,
  ShieldCheck,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardOverview } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import bannerIllustration from '../assets/Main.png';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { adminUser } = useAdmin();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await getDashboardOverview();
        setData(res.stats);
      } catch (err) {
        setError(err.message || 'Failed to load platform telemetry');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-[1.2vw]">
      {/* 1. Welcome Banner Card */}
      <div className="w-full relative rounded-[1vw] py-[1.1vw] px-[1.5vw] border border-gray-200 shadow-sm flex justify-between items-center overflow-hidden mb-[1.2vw] select-none bg-gradient-to-r from-white via-white to-[#fff8f6]">
        {/* Ambient Glows */}
        <div className="absolute -top-[5vw] right-[14vw] w-[18vw] h-[18vw] bg-gradient-to-br from-orange-400/10 via-rose-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-[4vw] right-[2vw] w-[14vw] h-[14vw] bg-gradient-to-tl from-amber-400/10 via-orange-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Left Side: Greeting & 3 Action Cards */}
        <div className="flex flex-col z-10 max-w-[65%]">
          <h1 className="text-[1.35vw] font-semibold text-gray-800 flex items-center gap-[0.45vw] tracking-tight leading-tight">
            <span>Welcome back,</span>
            <span className="text-[#ec5137]">
              {adminUser?.name || 'Administrator'}
            </span>
          </h1>

          <p className="text-[0.74vw] text-gray-500 font-normal mt-[0.25vw] mb-[0.9vw]">
            FlipiBook Executive Governance & Cluster Telemetry Console. Monitor infrastructure, govern accounts, and moderate publications.
          </p>

          {/* 3 Quick Action Cards */}
          <div className="flex items-center gap-[0.85vw]">
            {/* Card 1: Users */}
            <div
              onClick={() => navigate('/users')}
              className="w-[16.4vw] h-[5.6vw] bg-white rounded-[0.75vw] border border-gray-200 shadow-xs hover:border-[#ec5137] hover:shadow-sm hover:-translate-y-[1px] px-[0.85vw] py-[0.55vw] flex items-center justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden"
            >
              <div className="flex items-center gap-[0.75vw] min-w-0 flex-1">
                <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-[#fff1ee] border border-[#fecaca] flex items-center justify-center flex-shrink-0 text-[#ec5137] shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  <Users size="1.1vw" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[0.84vw] font-medium text-gray-800 leading-tight group-hover:text-[#ec5137] transition-colors truncate">
                    User Accounts
                  </h3>
                  <p className="text-[0.68vw] font-normal text-gray-500 leading-snug mt-[0.08vw] truncate">
                    {data?.users?.total || 0} Total
                  </p>
                  <span className="inline-block text-[0.6vw] text-gray-400 font-normal leading-none mt-[0.1vw]">
                    Manage roles & access
                  </span>
                </div>
              </div>
              <div className="w-[1.4vw] h-[1.4vw] rounded-full bg-gray-100 group-hover:bg-[#ec5137] text-gray-400 group-hover:text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-[0.4vw] group-hover:translate-x-[2px]">
                <ArrowRight size="0.75vw" strokeWidth={2.2} />
              </div>
            </div>

            {/* Card 2: Flipbooks */}
            <div
              onClick={() => navigate('/flipbooks')}
              className="w-[16.4vw] h-[5.6vw] bg-white rounded-[0.75vw] border border-gray-200 shadow-xs hover:border-[#ec5137] hover:shadow-sm hover:-translate-y-[1px] px-[0.85vw] py-[0.55vw] flex items-center justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden"
            >
              <div className="flex items-center gap-[0.75vw] min-w-0 flex-1">
                <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-[#fff1ee] border border-[#fecaca] flex items-center justify-center flex-shrink-0 text-[#ec5137] shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  <BookOpen size="1.1vw" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[0.84vw] font-medium text-gray-800 leading-tight group-hover:text-[#ec5137] transition-colors truncate">
                    Catalog Books
                  </h3>
                  <p className="text-[0.68vw] font-normal text-gray-500 leading-snug mt-[0.08vw] truncate">
                    {data?.flipbooks?.total || 0} Books
                  </p>
                  <span className="inline-block text-[0.6vw] text-gray-400 font-normal leading-none mt-[0.1vw]">
                    Moderate & showcase
                  </span>
                </div>
              </div>
              <div className="w-[1.4vw] h-[1.4vw] rounded-full bg-gray-100 group-hover:bg-[#ec5137] text-gray-400 group-hover:text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-[0.4vw] group-hover:translate-x-[2px]">
                <ArrowRight size="0.75vw" strokeWidth={2.2} />
              </div>
            </div>

            {/* Card 3: Telemetry */}
            <div
              onClick={() => navigate('/system')}
              className="w-[16.4vw] h-[5.6vw] bg-white rounded-[0.75vw] border border-gray-200 shadow-xs hover:border-[#ec5137] hover:shadow-sm hover:-translate-y-[1px] px-[0.85vw] py-[0.55vw] flex items-center justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden"
            >
              <div className="flex items-center gap-[0.75vw] min-w-0 flex-1">
                <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-[#fff1ee] border border-[#fecaca] flex items-center justify-center flex-shrink-0 text-[#ec5137] shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  <Activity size="1.1vw" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[0.84vw] font-medium text-gray-800 leading-tight group-hover:text-[#ec5137] transition-colors truncate">
                    Telemetry
                  </h3>
                  <p className="text-[0.68vw] font-normal text-gray-500 leading-snug mt-[0.08vw] truncate">
                    10 Services
                  </p>
                  <span className="inline-block text-[0.6vw] text-gray-400 font-normal leading-none mt-[0.1vw]">
                    Real-time ping monitor
                  </span>
                </div>
              </div>
              <div className="w-[1.4vw] h-[1.4vw] rounded-full bg-gray-100 group-hover:bg-[#ec5137] text-gray-400 group-hover:text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-[0.4vw] group-hover:translate-x-[2px]">
                <ArrowRight size="0.75vw" strokeWidth={2.2} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Official 3D Graphic */}
        <div className="relative flex-shrink-0">
          <img
            src={bannerIllustration}
            alt="FlipiBook Platform"
            className="h-[9.5vw] w-auto object-contain drop-shadow-md pointer-events-none"
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex items-center justify-center py-[4vw] bg-white rounded-[1vw] border border-slate-200 shadow-xs">
          <Loader2 className="animate-spin text-[#ec5137] mr-[0.5vw]" size="1.5vw" />
          <span className="text-[0.85vw] font-semibold text-slate-600">Gathering platform metrics...</span>
        </div>
      ) : error ? (
        <div className="p-[1vw] rounded-[0.8vw] bg-red-50 border border-red-200 text-red-700 text-[0.85vw] flex items-center gap-[0.6vw]">
          <ShieldCheck size="1.2vw" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* 2. Platform Telemetry Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[0.9vw]">
            {/* Metric 1 */}
            <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[0.72vw] font-medium text-gray-500 tracking-tight">
                  Registered Users
                </span>
                <div className="w-[2vw] h-[2vw] rounded-[0.5vw] bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size="1vw" />
                </div>
              </div>
              <div className="mt-[0.6vw]">
                <p className="text-[1.5vw] font-semibold text-gray-800 leading-tight">{data?.users?.total || 0}</p>
                <div className="mt-[0.25vw] flex items-center gap-[0.35vw] text-[0.72vw] text-gray-500 font-normal">
                  <span className="font-medium text-emerald-600">{data?.users?.active || 0} active</span>
                  <span>•</span>
                  <span>{data?.users?.admins || 0} admins</span>
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[0.72vw] font-medium text-gray-500 tracking-tight">
                  Total Flipbooks
                </span>
                <div className="w-[2vw] h-[2vw] rounded-[0.5vw] bg-orange-50 text-[#ec5137] flex items-center justify-center">
                  <BookOpen size="1vw" />
                </div>
              </div>
              <div className="mt-[0.6vw]">
                <p className="text-[1.5vw] font-semibold text-gray-800 leading-tight">{data?.flipbooks?.total || 0}</p>
                <div className="mt-[0.25vw] flex items-center gap-[0.35vw] text-[0.72vw] text-gray-500 font-normal">
                  <Eye size="0.85vw" className="text-amber-500" />
                  <span>{data?.flipbooks?.totalViews?.toLocaleString() || 0} Total views</span>
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[0.72vw] font-medium text-gray-500 tracking-tight">
                  Storage Allocation
                </span>
                <div className="w-[2vw] h-[2vw] rounded-[0.5vw] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HardDrive size="1vw" />
                </div>
              </div>
              <div className="mt-[0.6vw]">
                <p className="text-[1.5vw] font-semibold text-gray-800 leading-tight">{data?.flipbooks?.totalMB || 0} MB</p>
                <div className="mt-[0.25vw] text-[0.72vw] text-gray-500 font-normal">
                  Asset storage consumed
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[0.72vw] font-medium text-gray-500 tracking-tight">
                  Forum Issues
                </span>
                <div className="w-[2vw] h-[2vw] rounded-[0.5vw] bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MessageSquare size="1vw" />
                </div>
              </div>
              <div className="mt-[0.6vw]">
                <p className="text-[1.5vw] font-semibold text-gray-800 leading-tight">{data?.forum?.totalPosts || 0}</p>
                <div className="mt-[0.25vw] flex items-center gap-[0.35vw] text-[0.72vw] text-gray-500 font-normal">
                  <span className="font-medium text-amber-600">{data?.forum?.unanswered || 0} Awaiting review</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Recent Signups & Audit Activity Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1vw]">
            {/* Recent Registrations Card */}
            <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm">
              <div className="flex items-center justify-between pb-[0.75vw] border-b border-gray-100">
                <div className="flex items-center gap-[0.55vw]">
                  <Users size="1.05vw" className="text-[#ec5137]" />
                  <h3 className="text-[0.98vw] font-medium text-gray-800">Recent User Registrations</h3>
                </div>
                <Link to="/users" className="text-[0.74vw] font-medium text-[#ec5137] hover:underline flex items-center gap-[0.2vw]">
                  View Directory <ChevronRight size="0.85vw" />
                </Link>
              </div>

              <div className="mt-[0.6vw] divide-y divide-gray-100">
                {data?.recentUsers?.length > 0 ? (
                  data.recentUsers.map((u) => (
                    <div key={u._id} className="py-[0.55vw] flex items-center justify-between">
                      <div className="flex items-center gap-[0.65vw]">
                        <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-medium text-[0.75vw] text-gray-700">
                          {u.name ? u.name.slice(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div>
                          <p className="text-[0.78vw] font-medium text-gray-800">{u.name || 'Member'}</p>
                          <p className="text-[0.68vw] text-gray-500 font-normal">{u.emailId || u.email}</p>
                        </div>
                      </div>
                      <span className="text-[0.66vw] font-medium px-[0.6vw] py-[0.15vw] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {u.role || 'user'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-[1.5vw] text-center text-[0.75vw] text-gray-400 font-normal">No recent signups recorded.</p>
                )}
              </div>
            </div>

            {/* Audit Logs Quick Feed */}
            <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm">
              <div className="flex items-center justify-between pb-[0.75vw] border-b border-gray-100">
                <div className="flex items-center gap-[0.55vw]">
                  <ShieldCheck size="1.05vw" className="text-[#ec5137]" />
                  <h3 className="text-[0.98vw] font-medium text-gray-800">Administrative Audit Trail</h3>
                </div>
                <Link to="/logs" className="text-[0.74vw] font-medium text-[#ec5137] hover:underline flex items-center gap-[0.2vw]">
                  All Logs <ChevronRight size="0.85vw" />
                </Link>
              </div>

              <div className="mt-[0.6vw] divide-y divide-gray-100">
                {data?.recentLogs?.length > 0 ? (
                  data.recentLogs.map((log) => (
                    <div key={log._id} className="py-[0.55vw] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-[0.45vw]">
                          <span className="text-[0.75vw] font-mono font-medium text-gray-700">{log.action}</span>
                          <span className="text-[0.65vw] text-gray-400 font-mono font-normal">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[0.68vw] text-gray-500 font-normal mt-[0.1vw]">
                          Actor: <strong className="font-medium text-gray-700">{log.adminEmail}</strong>
                        </p>
                      </div>
                      <span className="text-[0.65vw] px-[0.45vw] py-[0.15vw] rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-200 uppercase">
                        {log.targetType || 'System'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-[1.5vw] text-center text-[0.75vw] text-gray-400 font-normal">No actions recorded in audit trail.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
