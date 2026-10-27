import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X,
  Shield,
  Layers,
  Calendar,
  SlidersHorizontal
} from 'lucide-react';
import { getAuditLogs } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

export default function AuditLogsPage() {
  const { showToast } = useAdmin();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page,
        limit: 20,
        action: actionFilter || undefined,
        targetType: targetTypeFilter || undefined
      });
      if (res.success) {
        setLogs(res.logs || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      showToast('Could not load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, targetTypeFilter]);

  const getActionBadge = (action = '') => {
    if (action.includes('DELETE')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          {action}
        </span>
      );
    }
    if (action.includes('ROLE') || action.includes('STATUS')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          {action}
        </span>
      );
    }
    if (action.includes('MODERATE') || action.includes('REPLY')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-orange-50 text-[#c23d26] border border-orange-200">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {action}
      </span>
    );
  };

  const getTargetTypeBadge = (type = '') => {
    switch (type.toLowerCase()) {
      case 'user':
        return <span className="text-xs text-sky-600 font-semibold">User</span>;
      case 'flipbook':
        return <span className="text-xs text-emerald-600 font-semibold">Flipbook</span>;
      case 'forumpost':
      case 'forum_post':
        return <span className="text-xs text-purple-600 font-semibold">Forum Post</span>;
      default:
        return <span className="text-xs text-slate-500 font-medium">{type || 'General'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#ec5137]" />
            <span>Administrative Audit Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable logs of administrative operations, permissions modifications, and moderations
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#ec5137] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar (Matching MyFlipbooks pills) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium shadow-2xs">
            <Filter size={13} className="text-[#ec5137]" />
            <span className="text-slate-400">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">All Actions</option>
              <option value="UPDATE_USER_ROLE">UPDATE_USER_ROLE</option>
              <option value="UPDATE_USER_STATUS">UPDATE_USER_STATUS</option>
              <option value="DELETE_USER">DELETE_USER</option>
              <option value="MODERATE_FLIPBOOK">MODERATE_FLIPBOOK</option>
              <option value="DELETE_FLIPBOOK">DELETE_FLIPBOOK</option>
              <option value="FORUM_OFFICIAL_REPLY">FORUM_OFFICIAL_REPLY</option>
              <option value="FORUM_UPDATE_STATUS">FORUM_UPDATE_STATUS</option>
              <option value="FORUM_PIN_TOGGLE">FORUM_PIN_TOGGLE</option>
              <option value="FORUM_LOCK_TOGGLE">FORUM_LOCK_TOGGLE</option>
              <option value="FORUM_DELETE_POST">FORUM_DELETE_POST</option>
            </select>
          </div>

          {/* Target Type Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium shadow-2xs">
            <Layers size={13} className="text-[#ec5137]" />
            <span className="text-slate-400">Target:</span>
            <select
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">All Targets</option>
              <option value="user">User</option>
              <option value="flipbook">Flipbook</option>
              <option value="forumpost">Forum Post</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800 font-bold">{logs.length}</strong> of{' '}
          <strong className="text-slate-800 font-bold">{total}</strong> recorded events
        </div>
      </div>

      {/* Table (Clean White Container) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">IP / Origin</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#ec5137] mb-2" />
                    Fetching audit trail records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No administrative audit logs match current filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                          {log.adminEmail ? log.adminEmail.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <span className="text-slate-800 font-medium">
                          {log.adminEmail || 'admin@flipibook.com'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getTargetTypeBadge(log.targetType)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.targetId ? log.targetId.substring(0, 10) + '...' : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                        title="View Full Metadata"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#ec5137]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="py-3 px-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Metadata Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#ec5137]" />
                <h3 className="text-sm font-bold text-slate-800">
                  Audit Log Metadata Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">Action</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLog.action}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">Actor Email</span>
                  <span className="font-mono text-slate-700">{selectedLog.adminEmail}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">Target Type</span>
                  <span className="font-bold text-[#ec5137]">{selectedLog.targetType}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">Target ID</span>
                  <span className="font-mono text-slate-600 text-[11px] break-all">{selectedLog.targetId || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-bold block mb-2">
                  Payload & Snapshot JSON
                </label>
                <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
