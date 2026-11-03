import { TICKET_MODULES, TICKET_STATUSES, TICKET_PRIORITIES } from '../data/ticketData';

/**
 * Checks whether the current authenticated user is an administrator or staff member.
 */
export function checkIsAdmin(currentUser, authUser) {
  const email = (currentUser?.email || currentUser?.emailId || authUser?.email || authUser?.emailId || '').toLowerCase().trim();
  const role = (currentUser?.role || authUser?.role || '').toLowerCase();
  const isAdminProp = currentUser?.isAdmin === true || authUser?.isAdmin === true;

  return Boolean(
    isAdminProp || 
    role === 'admin' || 
    role === 'staff' ||
    email.includes('admin') ||
    email.includes('fisto')
  );
}

/**
 * Matches a ticket against date filter criteria (today, week, month, custom, or all).
 */
export function matchesDateFilter(ticket, filter, customDate = '') {
  if (!filter || filter === 'all') return true;

  const dateStr = (ticket.createdAt || ticket.submittedAt || '').toLowerCase();
  const now = new Date();

  if (filter === 'today') {
    if (dateStr.includes('just now') || dateStr.includes('today') || dateStr.includes('hour') || dateStr.includes('min')) {
      return true;
    }
    const parsed = new Date(ticket.createdAt);
    if (!isNaN(parsed.getTime())) {
      return parsed.toDateString() === now.toDateString();
    }
    return false;
  }

  if (filter === 'week') {
    if (dateStr.includes('just now') || dateStr.includes('today') || dateStr.includes('yesterday') || dateStr.includes('hour') || dateStr.includes('min')) {
      return true;
    }
    const matchDays = dateStr.match(/(\d+)\s*days?\s*ago/);
    if (matchDays && parseInt(matchDays[1], 10) <= 7) return true;

    const parsed = new Date(ticket.createdAt);
    if (!isNaN(parsed.getTime())) {
      const diffDays = (now.getTime() - parsed.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }
    return false;
  }

  if (filter === 'month') {
    if (dateStr.includes('just now') || dateStr.includes('today') || dateStr.includes('yesterday') || dateStr.includes('day') || dateStr.includes('hour')) {
      return true;
    }
    const matchDays = dateStr.match(/(\d+)\s*days?\s*ago/);
    if (matchDays && parseInt(matchDays[1], 10) <= 30) return true;

    const parsed = new Date(ticket.createdAt);
    if (!isNaN(parsed.getTime())) {
      const diffDays = (now.getTime() - parsed.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 30;
    }
    return false;
  }

  if (filter === 'custom') {
    if (!customDate) return true;
    const targetDate = new Date(customDate).toDateString();
    const parsed = new Date(ticket.createdAt || ticket.submittedAt);
    if (!isNaN(parsed.getTime())) {
      return parsed.toDateString() === targetDate;
    }
    return false;
  }

  return true;
}

/**
 * Resolves module details (color, icon, label) for a ticket.
 */
export function getModuleInfo(moduleId, department = '', moduleName = '') {
  const found = TICKET_MODULES.find(m => m.id === moduleId);
  if (found) return found;

  return {
    id: moduleId || 'general',
    name: department || moduleName || 'General Support',
    shortName: department || moduleName || 'General',
    color: '#64748b'
  };
}

/**
 * Returns status badge details for a ticket.
 */
export function getStatusBadge(status) {
  const isClosed = status === 'closed' || status === 'resolved';
  if (isClosed) {
    return {
      id: 'closed',
      label: 'Closed',
      color: 'bg-stone-100 text-stone-600 border-stone-200',
      dot: 'bg-stone-400'
    };
  }
  return {
    id: 'open',
    label: 'Open',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500'
  };
}

/**
 * Returns priority badge details for a ticket.
 */
export function getPriorityBadge(priority = 'medium') {
  const p = TICKET_PRIORITIES.find(item => item.id === priority.toLowerCase());
  return p || { id: 'medium', label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-200' };
}

/**
 * Formats a raw date/time string with date and time.
 */
export function formatDateTime(rawVal) {
  if (!rawVal) return 'Recently';
  if (typeof rawVal === 'string' && (rawVal.includes('ago') || rawVal.includes('Just now') || rawVal.includes('Today') || rawVal.includes('Yesterday'))) {
    return rawVal;
  }
  const d = new Date(rawVal);
  if (!isNaN(d.getTime())) {
    const datePart = d.toLocaleDateString(undefined, { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
    const timePart = d.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${datePart}, ${timePart}`;
  }
  return String(rawVal);
}

/**
 * Formats a raw date/time string with date only.
 */
export function formatDateOnly(rawVal) {
  if (!rawVal) return 'Recently';
  if (typeof rawVal === 'string' && (rawVal.includes('ago') || rawVal.includes('Just now') || rawVal.includes('Today') || rawVal.includes('Yesterday'))) {
    return rawVal;
  }
  const d = new Date(rawVal);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  }
  return String(rawVal);
}

