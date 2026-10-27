import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Mail,
  Calendar
} from 'lucide-react';
import { getUsers, updateUserRole, updateUserStatus, deleteUser } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

export default function UsersPage() {
  const { showToast } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      const res = await getUsers({
        page,
        limit: 15,
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      showToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsersList();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole, isAdmin: newRole === 'admin' } : u))
      );
      showToast(`User role updated to ${newRole}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to change role', 'error');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus, isActive: newStatus === 'active' } : u))
      );
      showToast(`User status set to ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to change status', 'error');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${userEmail}?`)) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setTotalCount((c) => Math.max(0, c - 1));
      showToast(`User ${userEmail} deleted`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="space-y-[1.1vw]">
      {/* Top Header & Toolbar (Matching MyFlipbooks style) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.4vw] font-bold text-slate-800 tracking-tight flex items-center gap-[0.45vw]">
            <Users className="w-[1.4vw] h-[1.4vw] text-[#ec5137]" />
            <span>User Directory & Governance</span>
          </h1>
          <p className="text-[0.78vw] text-slate-500 mt-[0.1vw]">
            Manage user roles, ban abusive accounts, and inspect platform memberships
          </p>
        </div>

        <button
          onClick={fetchUsersList}
          disabled={loading}
          className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.45vw] rounded-[0.6vw] text-[0.78vw] font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-[0.9vw] h-[0.9vw] text-[#ec5137] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Row matching MyFlipbooks toolbar */}
      <div className="bg-white rounded-[0.8vw] border border-slate-200/90 p-[0.75vw] shadow-xs flex items-center justify-between gap-[0.8vw]">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-[22vw]">
          <Search size="0.95vw" className="absolute left-[0.75vw] top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-[2.2vw] pr-[0.8vw] py-[0.45vw] bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-[0.55vw] text-[0.78vw] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ec5137] transition"
          />
        </form>

        {/* Dropdown Pills */}
        <div className="flex items-center gap-[0.65vw]">
          {/* Role Filter */}
          <div className="flex items-center gap-[0.35vw] px-[0.7vw] py-[0.4vw] rounded-[0.55vw] border border-slate-200 bg-white text-[0.78vw] text-slate-700 font-medium shadow-2xs">
            <Shield size="0.9vw" className="text-[#ec5137]" />
            <span className="text-slate-400">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-[0.35vw] px-[0.7vw] py-[0.4vw] rounded-[0.55vw] border border-slate-200 bg-white text-[0.78vw] text-slate-700 font-medium shadow-2xs">
            <Filter size="0.9vw" className="text-[#ec5137]" />
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          <span className="text-[0.78vw] text-slate-500 font-medium ml-[0.4vw]">
            Total: <strong className="text-slate-800 font-bold">{totalCount}</strong>
          </span>
        </div>
      </div>

      {/* Users Horizontal Cards List */}
      <div className="space-y-[0.65vw]">
        {loading ? (
          <div className="py-[4vw] text-center bg-white rounded-[0.8vw] border border-slate-200 shadow-xs">
            <Loader2 className="animate-spin text-[#ec5137] mx-auto mb-[0.5vw]" size="1.5vw" />
            <p className="text-[0.78vw] font-semibold text-slate-600">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-[3vw] text-center bg-white rounded-[0.8vw] border border-slate-200 p-[1.5vw] shadow-xs">
            <Users size="2vw" className="mx-auto text-slate-300 mb-[0.4vw]" />
            <p className="text-[0.88vw] font-bold text-slate-800">No users match the criteria</p>
            <p className="text-[0.72vw] text-slate-400 mt-[0.2vw]">Try resetting the search keyword or filter pills.</p>
          </div>
        ) : (
          users.map((user) => {
            const initials = user.name
              ? user.name.slice(0, 2).toUpperCase()
              : (user.emailId || user.email || 'US').slice(0, 2).toUpperCase();

            const isActive = user.status === 'active' || user.isActive !== false;
            const isBanned = user.status === 'banned';

            return (
              <div
                key={user._id}
                className="bg-white rounded-[0.8vw] border border-slate-200/90 p-[0.9vw] shadow-xs hover:shadow-sm hover:border-[#ec5137]/30 transition duration-150 flex items-center justify-between gap-[1vw]"
              >
                {/* User Info */}
                <div className="flex items-center gap-[0.8vw] min-w-0">
                  <div className="w-[2.6vw] h-[2.6vw] rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300/80 text-slate-700 font-bold text-[0.85vw] flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-[0.5vw]">
                      <h3 className="text-[0.88vw] font-bold text-slate-800 truncate">
                        {user.name || 'Unnamed Member'}
                      </h3>
                      {user.role === 'admin' ? (
                        <span className="px-[0.4vw] py-[0.1vw] rounded-[0.3vw] text-[0.65vw] font-bold bg-[#ec5137]/10 text-[#ec5137] border border-[#ec5137]/20 uppercase">
                          Admin
                        </span>
                      ) : (
                        <span className="px-[0.4vw] py-[0.1vw] rounded-[0.3vw] text-[0.65vw] font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          User
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-[0.25vw] px-[0.45vw] py-[0.1vw] rounded-[0.3vw] text-[0.68vw] font-semibold border ${
                          isBanned
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-[0.35vw] h-[0.35vw] rounded-full ${
                            isBanned ? 'bg-rose-500' : isActive ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{user.status || (user.isActive ? 'active' : 'inactive')}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-[0.6vw] text-[0.72vw] text-slate-400 mt-[0.1vw]">
                      <span className="flex items-center gap-[0.25vw] truncate">
                        <Mail size="0.75vw" className="text-slate-400" />
                        <span className="text-slate-600 font-medium truncate">{user.emailId || user.email}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-[0.25vw]">
                        <Calendar size="0.75vw" className="text-slate-400" />
                        <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions & Role Switcher */}
                <div className="flex items-center gap-[0.6vw]">
                  {/* Role Switcher */}
                  <div className="flex items-center gap-[0.3vw] bg-slate-50 border border-slate-200 rounded-[0.55vw] px-[0.6vw] py-[0.3vw] text-[0.72vw]">
                    <span className="text-slate-400 text-[0.68vw]">Role:</span>
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Status Switcher Buttons */}
                  {user.status !== 'banned' ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(user._id, 'banned')}
                      className="px-[0.7vw] py-[0.35vw] rounded-[0.55vw] border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[0.72vw] font-semibold transition cursor-pointer"
                      title="Ban account"
                    >
                      Ban
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(user._id, 'active')}
                      className="px-[0.7vw] py-[0.35vw] rounded-[0.55vw] border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[0.72vw] font-semibold transition cursor-pointer"
                      title="Reactivate account"
                    >
                      Activate
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user._id, user.emailId || user.email)}
                    className="p-[0.4vw] rounded-[0.45vw] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete user account"
                  >
                    <Trash2 size="0.95vw" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white rounded-[0.8vw] border border-slate-200/90 px-[0.9vw] py-[0.6vw] shadow-xs flex items-center justify-between text-[0.75vw]">
          <span className="text-slate-500 font-medium">
            Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-[0.35vw]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-[0.35vw] rounded-[0.4vw] border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft size="0.95vw" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-[0.35vw] rounded-[0.4vw] border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight size="0.95vw" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
