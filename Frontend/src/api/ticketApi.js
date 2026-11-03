// Frontend/src/api/ticketApi.js

export const getBackendUrl = () => {
  const envUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');
  if (!envUrl || envUrl.includes('localhost:5000') || envUrl.includes('127.0.0.1:5000')) {
    return '';
  }
  return envUrl;
};

const getAuthHeaders = (currentUser) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  const email = (
    currentUser?.email ||
    currentUser?.emailId ||
    window.__CURRENT_USER_EMAIL__ ||
    ''
  ).toLowerCase().trim();

  if (email) {
    headers['x-user-email'] = email;
  }

  const role = (currentUser?.role || '').toLowerCase();
  const isAdmin = Boolean(
    currentUser?.isAdmin === true || 
    role === 'admin' || 
    role === 'staff' ||
    email.includes('admin') ||
    email.includes('fisto')
  );

  if (isAdmin) {
    headers['x-is-admin'] = 'true';
  }

  return headers;
};

/**
 * Fetch tickets with search, filtering, and pagination
 */
export const fetchTickets = async (params = {}, currentUser = null) => {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.category && params.category !== 'all') query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.email) query.append('email', params.email);
  if (params.isAdmin) query.append('isAdmin', 'true');
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const res = await fetch(`${getBackendUrl()}/api/tickets?${query.toString()}`, {
    headers: getAuthHeaders(currentUser),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tickets');
  return data;
};

/**
 * Get ticket details by ID
 */
export const fetchTicketById = async (id, currentUser = null) => {
  const res = await fetch(`${getBackendUrl()}/api/tickets/${id}`, {
    headers: getAuthHeaders(currentUser),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch ticket');
  return data.data;
};

/**
 * Create/Raise a new ticket
 */
export const createTicketApi = async (ticketData, currentUser = null) => {
  const res = await fetch(`${getBackendUrl()}/api/tickets`, {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    credentials: 'include',
    body: JSON.stringify(ticketData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to raise ticket');
  return data.data;
};

/**
 * Update ticket status ('open' or 'closed')
 */
export const updateTicketStatusApi = async (ticketId, status, currentUser = null) => {
  const res = await fetch(`${getBackendUrl()}/api/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(currentUser),
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update ticket status');
  return data.data;
};

/**
 * Post a reply message to ticket thread
 */
export const addTicketMessageApi = async (ticketId, messageData, currentUser = null) => {
  const res = await fetch(`${getBackendUrl()}/api/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    credentials: 'include',
    body: JSON.stringify(messageData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to post reply');
  return data.data;
};

/**
 * Cancel/Withdraw a ticket
 */
export const cancelTicketApi = async (ticketId, currentUser = null) => {
  const res = await fetch(`${getBackendUrl()}/api/tickets/${ticketId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(currentUser),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to cancel ticket');
  return data;
};

export const ticketApi = {
  fetchTickets,
  fetchTicketById,
  createTicket: createTicketApi,
  updateTicketStatus: updateTicketStatusApi,
  addTicketMessage: addTicketMessageApi,
  cancelTicket: cancelTicketApi
};

export default ticketApi;
