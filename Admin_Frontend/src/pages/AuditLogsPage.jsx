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
        <span className="px-[0.5vw] py-[0.12vw] rounded-full text-[0.66vw] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
          {action}
        </span>
      );
    }
    if (action.includes('ROLE') || action.includes('STATUS')) {
      return (
        <span className="px-[0.5vw] py-[0.12vw] rounded-full text-[0.66vw] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
          {action}
        </span>
      );
    }
    if (action.includes('MODERATE') || action.includes('REPLY')) {
      return (
        <span className="px-[0.5vw] py-[0.12vw] rounded-full text-[0.66vw] font-mono font-medium bg-orange-50 text-[#ec5137] border border-orange-200">
          {action}
        </span>
      );
    }
    return (
      <span className="px-[0.5vw] py-[0.12vw] rounded-full text-[0.66vw] font-mono font-medium bg-gray-100 text-gray-700 border border-gray-200">
        {action}
      </span>
    );
  };

  const getTargetTypeBadge = (type = '') => {
    switch (type.toLowerCase()) {
      case 'user':
        return <span className="text-[0.72vw] text-sky-600 font-medium">User</span>;
      case 'flipbook':
        return <span className="text-[0.72vw] text-[#16A34A] font-medium">Flipbook</span>;
      case 'forumpost':
      case 'forum_post':
        return <span className="text-[0.72vw] text-purple-600 font-medium">Forum Post</span>;
      default:
        return <span className="text-[0.72vw] text-gray-500 font-normal">{type || 'General'}</span>;
    }
  };

  return (
    <div className="space-y-[1.2vw]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.35vw] font-semibold text-gray-800 tracking-tight flex items-center gap-[0.5vw]">
            <FileText className="w-[1.25vw] h-[1.25vw] text-[#ec5137]" />
            <span>Administrative Audit Trail</span>
          </h1>
          <p className="text-[0.74vw] text-gray-500 font-normal mt-[0.25vw]">
            Immutable logs of administrative operations, permissions modifications, and moderations
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-[0.45vw] px-[0.85vw] py-[0.42vw] rounded-[0.5vw] text-[0.78vw] font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-[0.9vw] h-[0.9vw] text-[#ec5137] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-[1vw] border border-gray-200 p-[0.9vw] shadow-sm flex flex-wrap items-center justify-between gap-[0.8vw]">
        <div className="flex flex-wrap items-center gap-[0.65vw]">
          {/* Action Filter */}
          <div className="flex items-center gap-[0.35vw] px-[0.7vw] py-[0.4vw] rounded-[0.5vw] border border-gray-200 bg-white text-[0.75vw] text-gray-700 font-medium shadow-xs">
            <Filter size="0.9vw" className="text-[#ec5137]" />
            <span className="text-gray-400 font-normal">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-medium text-gray-800 outline-none cursor-pointer"
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
          <div className="flex items-center gap-[0.35vw] px-[0.7vw] py-[0.4vw] rounded-[0.5vw] border border-gray-200 bg-white text-[0.75vw] text-gray-700 font-medium shadow-xs">
            <Layers size="0.9vw" className="text-[#ec5137]" />
            <span className="text-gray-400 font-normal">Target:</span>
            <select
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-medium text-gray-800 outline-none cursor-pointer"
            >
              <option value="">All Targets</option>
              <option value="user">User</option>
              <option value="flipbook">Flipbook</option>
              <option value="forumpost">Forum Post</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        <div className="text-[0.75vw] text-gray-500 font-normal">
          Showing <strong className="text-gray-800 font-semibold">{logs.length}</strong> of{' '}
          <strong className="text-gray-800 font-semibold">{total}</strong> recorded events
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[1vw] border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[0.75vw]">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8f9fa] text-gray-700 font-medium text-[0.76vw]">
                <th className="py-[0.75vw] px-[0.85vw]">Timestamp</th>
                <th className="py-[0.75vw] px-[0.85vw]">Admin Actor</th>
                <th className="py-[0.75vw] px-[0.85vw]">Action</th>
                <th className="py-[0.75vw] px-[0.85vw]">Target Type</th>
                <th className="py-[0.75vw] px-[0.85vw]">Target ID</th>
                <th className="py-[0.75vw] px-[0.85vw]">IP / Origin</th>
                <th className="py-[0.75vw] px-[0.85vw] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-normal">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-[3vw] text-center text-gray-500 font-medium">
                    <RefreshCw className="w-[1.2vw] h-[1.2vw] animate-spin mx-auto text-[#ec5137] mb-[0.4vw]" />
                    Fetching audit trail records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-[3vw] text-center text-gray-400 font-normal">
                    No administrative audit logs match current filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-[0.65vw] px-[0.85vw] font-mono text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-[0.65vw] px-[0.85vw] whitespace-nowrap">
                      <div className="flex items-center gap-[0.45vw]">
                        <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-medium text-[0.7vw] flex items-center justify-center shadow-xs">
                          {log.adminEmail ? log.adminEmail.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <span className="text-gray-800 font-medium">
                          {log.adminEmail || 'admin@flipibook.com'}
                        </span>
                      </div>
                    </td>
                    <td className="py-[0.65vw] px-[0.85vw] whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-[0.65vw] px-[0.85vw] whitespace-nowrap">
                      {getTargetTypeBadge(log.targetType)}
                    </td>
                    <td className="py-[0.65vw] px-[0.85vw] font-mono text-gray-500 whitespace-nowrap">
                      {log.targetId ? log.targetId.substring(0, 10) + '...' : '—'}
                    </td>
                    <td className="py-[0.65vw] px-[0.85vw] font-mono text-gray-400 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-[0.65vw] px-[0.85vw] text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-[0.35vw] rounded-[0.4vw] bg-white hover:bg-gray-50 border border-gray-300 text-gray-600 hover:text-gray-900 transition cursor-pointer shadow-xs active:scale-[0.98]"
                        title="View Full Metadata"
                      >
                        <Eye className="w-[0.9vw] h-[0.9vw] text-[#ec5137]" />
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
          <div className="py-[0.6vw] px-[0.9vw] border-t border-gray-100 bg-[#f8f9fa] flex items-center justify-between text-[0.75vw]">
            <span className="text-gray-500 font-normal">
              Page <strong className="text-gray-800 font-semibold">{page}</strong> of <strong className="text-gray-800 font-semibold">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-[0.35vw]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-[0.35vw] rounded-[0.4vw] border border-gray-200 hover:bg-white text-gray-600 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft size="0.95vw" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-[0.35vw] rounded-[0.4vw] border border-gray-200 hover:bg-white text-gray-600 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight size="0.95vw" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Metadata Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[1vw] bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-[1vw] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-[1.2vw] border-b border-gray-100 flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-[0.4vw]">
                <Shield className="w-[1vw] h-[1vw] text-[#ec5137]" />
                <h3 className="text-[0.98vw] font-medium text-gray-800">
                  Audit Log Metadata Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-700 p-[0.3vw] rounded-[0.4vw] transition cursor-pointer"
              >
                <X className="w-[1vw] h-[1vw]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-[1.2vw] overflow-y-auto space-y-[0.9vw]">
              <div className="grid grid-cols-2 gap-[0.8vw] text-[0.75vw]">
                <div className="p-[0.8vw] rounded-[0.6vw] bg-[#f8f9fa] border border-[#f0f2f5]">
                  <span className="text-gray-400 block mb-[0.2vw] font-normal">Action</span>
                  <span className="font-mono font-medium text-gray-800">{selectedLog.action}</span>
                </div>
                <div className="p-[0.8vw] rounded-[0.6vw] bg-[#f8f9fa] border border-[#f0f2f5]">
                  <span className="text-gray-400 block mb-[0.2vw] font-normal">Actor Email</span>
                  <span className="font-mono text-gray-700">{selectedLog.adminEmail}</span>
                </div>
                <div className="p-[0.8vw] rounded-[0.6vw] bg-[#f8f9fa] border border-[#f0f2f5]">
                  <span className="text-gray-400 block mb-[0.2vw] font-normal">Target Type</span>
                  <span className="font-medium text-[#ec5137]">{selectedLog.targetType}</span>
                </div>
                <div className="p-[0.8vw] rounded-[0.6vw] bg-[#f8f9fa] border border-[#f0f2f5]">
                  <span className="text-gray-400 block mb-[0.2vw] font-normal">Target ID</span>
                  <span className="font-mono text-gray-600 text-[0.72vw] break-all">{selectedLog.targetId || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="text-[0.74vw] text-gray-500 font-medium block mb-[0.4vw]">
                  Payload & Snapshot JSON
                </label>
                <pre className="p-[1vw] rounded-[0.6vw] bg-gray-900 border border-gray-800 font-mono text-[0.72vw] text-emerald-400 overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-[1vw] border-t border-gray-100 bg-[#f8f9fa] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-[0.85vw] py-[0.42vw] rounded-[0.5vw] bg-gray-800 hover:bg-gray-700 text-white text-[0.78vw] font-medium transition cursor-pointer active:scale-[0.98]"
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
