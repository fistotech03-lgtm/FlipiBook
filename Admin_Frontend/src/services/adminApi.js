import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject active admin email if stored in memory/session
api.interceptors.request.use((config) => {
  const currentAdmin = window.__CURRENT_ADMIN__;
  if (currentAdmin?.email) {
    config.headers['x-user-email'] = currentAdmin.email;
  }
  return config;
});

// ── Dashboard & Analytics ───────────────────────────────────────────────────
export const getDashboardOverview = async () => {
  const res = await api.get('/api/admin/dashboard/overview');
  return res.data;
};

export const getMicroservicesHealth = async () => {
  const res = await api.get('/api/admin/dashboard/services-health');
  return res.data;
};

export const getAuditLogs = async (params = {}) => {
  const res = await api.get('/api/admin/dashboard/logs', { params });
  return res.data;
};

// ── User Management ─────────────────────────────────────────────────────────
export const getUsers = async (params = {}) => {
  const res = await api.get('/api/admin/users', { params });
  return res.data;
};

export const getUserDetails = async (id) => {
  const res = await api.get(`/api/admin/users/${id}`);
  return res.data;
};

export const updateUserRole = async (id, role) => {
  const res = await api.patch(`/api/admin/users/${id}/role`, { role });
  return res.data;
};

export const updateUserStatus = async (id, status, reason = '') => {
  const res = await api.patch(`/api/admin/users/${id}/status`, { status, reason });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/api/admin/users/${id}`);
  return res.data;
};

// ── Flipbook Moderation ─────────────────────────────────────────────────────
export const getFlipbooks = async (params = {}) => {
  const res = await api.get('/api/admin/flipbooks', { params });
  return res.data;
};

export const getFlipbookDetails = async (id) => {
  const res = await api.get(`/api/admin/flipbooks/${id}`);
  return res.data;
};

export const moderateFlipbook = async (id, updateFields) => {
  const res = await api.patch(`/api/admin/flipbooks/${id}/moderate`, updateFields);
  return res.data;
};

export const deleteFlipbook = async (id) => {
  const res = await api.delete(`/api/admin/flipbooks/${id}`);
  return res.data;
};

// ── Forum Moderation ────────────────────────────────────────────────────────
export const getForumDiscussions = async (params = {}) => {
  const res = await api.get('/api/admin/forum/discussions', { params });
  return res.data;
};

export const getForumStats = async () => {
  const res = await api.get('/api/admin/forum/stats');
  return res.data;
};

export const replyToDiscussion = async (id, payload) => {
  const res = await api.post(`/api/admin/forum/discussions/${id}/reply`, payload);
  return res.data;
};

export const updateDiscussionStatus = async (id, status) => {
  const res = await api.patch(`/api/admin/forum/discussions/${id}/status`, { status });
  return res.data;
};

export const toggleDiscussionFlags = async (id, flags) => {
  const res = await api.patch(`/api/admin/forum/discussions/${id}/flags`, flags);
  return res.data;
};

export const deleteDiscussion = async (id) => {
  const res = await api.delete(`/api/admin/forum/discussions/${id}`);
  return res.data;
};

// ── Support Tickets Moderation ──────────────────────────────────────────────
export const getAdminTickets = async (params = {}) => {
  const res = await api.get('/api/tickets', { params: { ...params, isAdmin: 'true' } });
  return res.data;
};

export const getAdminTicketById = async (id) => {
  const res = await api.get(`/api/tickets/${id}`);
  return res.data;
};

export const replyToTicket = async (id, payload) => {
  const res = await api.post(`/api/tickets/${id}/messages`, {
    ...payload,
    sender: 'admin'
  });
  return res.data;
};

export const updateTicketStatus = async (id, status) => {
  const res = await api.patch(`/api/tickets/${id}/status`, { status });
  return res.data;
};

export default api;
