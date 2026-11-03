import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStoredTickets, saveStoredTickets } from '../data/ticketData';
import { fetchTickets, cancelTicketApi } from '../../../../api/ticketApi';
import { checkIsAdmin, matchesDateFilter } from '../utils/ticketUtils';
import { useToast } from '../../../CustomToast';
import { useAuth } from '../../../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

export function useTickets(itemsPerPage = 8) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user: authUser } = useAuth();
  const outletContext = useOutletContext();
  const currentUser = outletContext?.user || authUser || null;

  const [tickets, setTickets] = useState(() => getStoredTickets());
  const [hasLoadedOnce, setHasLoadedOnce] = useState(() => getStoredTickets().length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'closed'
  const [categoryFilter, setCategoryFilter] = useState('all'); // module ID
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'custom'
  const [customDate, setCustomDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Admin detection
  const isAdminUser = useMemo(() => {
    return checkIsAdmin(currentUser, authUser);
  }, [currentUser, authUser]);

  // Load tickets from backend with fallback to localStorage
  const loadTicketsFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const email = currentUser?.email || currentUser?.emailId || '';
      const res = await fetchTickets({
        isAdmin: isAdminUser,
        email: isAdminUser ? undefined : email,
        limit: 100
      });

      if (res && res.success && Array.isArray(res.data)) {
        setTickets(res.data);
        saveStoredTickets(res.data);
      }
    } catch (err) {
      console.warn('[Tickets] Backend unreachable or error, using local tickets:', err);
      setTickets(getStoredTickets());
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, [isAdminUser, currentUser]);

  useEffect(() => {
    loadTicketsFromBackend();
  }, [loadTicketsFromBackend]);

  // Check URL query parameters (e.g. /tickets?raise=1)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('raise') === '1') {
        setIsRaiseModalOpen(true);
      }
    } catch (e) {}
  }, [location.search]);

  // Listen for background sync updates when ticket is created
  useEffect(() => {
    const handleSync = (e) => {
      const { tempId, ticket: backendTicket } = e.detail || {};
      if (tempId && backendTicket) {
        setTickets(prev => {
          const updated = prev.map(t => (t.id === tempId ? backendTicket : t));
          saveStoredTickets(updated);
          return updated;
        });
      }
    };
    window.addEventListener('ticketCreatedSync', handleSync);
    return () => window.removeEventListener('ticketCreatedSync', handleSync);
  }, []);

  // Sync to storage
  useEffect(() => {
    if (tickets && tickets.length > 0) {
      saveStoredTickets(tickets);
    }
  }, [tickets]);

  // Compute counts (Total, Open, Closed)
  const counts = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length;
    const closed = tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length;
    return { total, open, closed };
  }, [tickets]);

  // Filtered & sorted tickets (chronological, newest first)
  const filteredTickets = useMemo(() => {
    const list = [...tickets].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (dateA && dateB) return dateB - dateA;
      return 0;
    });

    return list.filter((ticket) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = String(ticket.id).toLowerCase().includes(q);
        const matchesSub = (ticket.subject || '').toLowerCase().includes(q);
        const matchesDesc = (ticket.description || '').toLowerCase().includes(q);
        const matchesRequester = (ticket.requester?.name || '').toLowerCase().includes(q) ||
                                 (ticket.requester?.email || '').toLowerCase().includes(q);
        if (!matchesId && !matchesSub && !matchesDesc && !matchesRequester) return false;
      }

      // 2. Status Tab filter
      if (statusFilter === 'open') {
        if (ticket.status === 'closed' || ticket.status === 'resolved') return false;
      } else if (statusFilter === 'closed') {
        if (ticket.status !== 'closed' && ticket.status !== 'resolved') return false;
      }

      // 3. Category/Module filter
      if (categoryFilter !== 'all') {
        const ticketMod = (ticket.moduleId || '').toLowerCase();
        const ticketDept = (ticket.department || ticket.moduleName || '').toLowerCase();
        const target = categoryFilter.toLowerCase();
        if (ticketMod !== target && !ticketDept.includes(target.replace('-', ' '))) {
          return false;
        }
      }

      // 4. Date Posted filter
      if (!matchesDateFilter(ticket, dateFilter, customDate)) {
        return false;
      }

      return true;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter, dateFilter, customDate]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, dateFilter, customDate]);

  // Paginated tickets calculation
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  // Raise ticket
  const handleRaiseTicket = (newTicket) => {
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveStoredTickets(updated);
    if (toast?.showToast) {
      toast.showToast(`Ticket #${newTicket.id} raised successfully!`, 'success');
    }
    const basePath = location.pathname.startsWith('/settings/support') ? '/settings/support' : '/settings/tickets';
    navigate(`${basePath}/${newTicket.id}`);
  };

  // Delete / Cancel ticket
  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;
    const ticketId = ticketToDelete.id;
    try {
      await cancelTicketApi(ticketId);
    } catch (e) {
      console.warn('Backend cancel failed, proceeding with local delete:', e);
    }
    const updated = tickets.filter(t => t.id !== ticketId);
    setTickets(updated);
    saveStoredTickets(updated);
    setTicketToDelete(null);
    if (toast?.showToast) {
      toast.showToast(`Ticket #${ticketId} cancelled and deleted`, 'info');
    }
  };

  const handleSelectTicket = (ticket) => {
    const basePath = location.pathname.startsWith('/settings/support') ? '/settings/support' : '/settings/tickets';
    navigate(`${basePath}/${ticket.id}`);
  };

  const hasActiveFilters = Boolean(
    searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all' || customDate
  );

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
    setCustomDate('');
    setCurrentPage(1);
  };

  return {
    currentUser,
    authUser,
    isAdminUser,
    tickets,
    filteredTickets,
    paginatedTickets,
    counts,
    isLoading,
    hasLoadedOnce,
    totalPages,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate,
    isRaiseModalOpen,
    setIsRaiseModalOpen,
    ticketToDelete,
    setTicketToDelete,
    hasActiveFilters,
    clearFilters,
    handleRaiseTicket,
    handleConfirmDelete,
    handleSelectTicket,
    refreshTickets: loadTicketsFromBackend
  };
}
