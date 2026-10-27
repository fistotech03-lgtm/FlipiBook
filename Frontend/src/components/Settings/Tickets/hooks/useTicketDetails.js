import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getStoredTickets, saveStoredTickets } from '../data/ticketData';
import { fetchTicketById, updateTicketStatusApi, addTicketMessageApi } from '../../../../api/ticketApi';
import { checkIsAdmin } from '../utils/ticketUtils';
import { processImageAttachmentsSequentially } from '../functions/imageCompressor';
import { useToast } from '../../../CustomToast';
import { useAuth } from '../../../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

export function useTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user: authUser } = useAuth();
  const outletContext = useOutletContext();
  const currentUser = outletContext?.user || authUser || null;

  const [tickets, setTickets] = useState(() => getStoredTickets());
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(true);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [isCompressingReply, setIsCompressingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const replyFileInputRef = useRef(null);

  // CC Recipients state
  const [ccList, setCcList] = useState([]);
  const [newCcEmail, setNewCcEmail] = useState('');

  // Accordion state
  const [infoOpen, setInfoOpen] = useState(true);
  const [ccOpen, setCcOpen] = useState(true);
  const [supportOpen, setSupportOpen] = useState(true);

  // Admin detection
  const isAdminUser = useMemo(() => {
    return checkIsAdmin(currentUser, authUser);
  }, [currentUser, authUser]);

  // Load ticket from Backend, fallback to local stored tickets
  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    setIsLoadingTicket(true);
    try {
      const email = currentUser?.email || currentUser?.emailId || '';
      const res = await fetchTicketById(ticketId, {
        isAdmin: isAdminUser,
        email: isAdminUser ? undefined : email
      });

      if (res && res.success && res.data) {
        setCurrentTicket(res.data);
        if (Array.isArray(res.data.cc)) {
          setCcList(res.data.cc);
        }
        setTickets(prev => {
          const exists = prev.some(t => t.id === res.data.id);
          const updated = exists ? prev.map(t => (t.id === res.data.id ? res.data : t)) : [res.data, ...prev];
          saveStoredTickets(updated);
          return updated;
        });
        return;
      }
    } catch (err) {
      console.warn('[TicketDetails] Failed to load ticket from backend, checking local:', err);
    } finally {
      setIsLoadingTicket(false);
    }

    // Fallback to local tickets
    const local = tickets.find(t => String(t.id) === String(ticketId));
    if (local) {
      setCurrentTicket(local);
      if (Array.isArray(local.cc)) {
        setCcList(local.cc);
      }
    }
  }, [ticketId, isAdminUser, currentUser, tickets]);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  // Periodic polling for new responses every 12 seconds
  useEffect(() => {
    if (!ticketId) return;
    const interval = setInterval(async () => {
      try {
        const email = currentUser?.email || currentUser?.emailId || '';
        const res = await fetchTicketById(ticketId, {
          isAdmin: isAdminUser,
          email: isAdminUser ? undefined : email
        });
        if (res && res.success && res.data) {
          setCurrentTicket(res.data);
          if (Array.isArray(res.data.cc)) {
            setCcList(res.data.cc);
          }
        }
      } catch (e) {}
    }, 12000);
    return () => clearInterval(interval);
  }, [ticketId, isAdminUser, currentUser]);

  const handleBack = () => {
    const basePath = location.pathname.startsWith('/settings/support') ? '/settings/support' : '/settings/tickets';
    navigate(basePath);
  };

  // Image attachments selection
  const handleImageFilesChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setReplyError('');
    setIsCompressingReply(true);

    try {
      const { attachments: newAttachments } = await processImageAttachmentsSequentially(files, replyAttachments);
      setReplyAttachments(newAttachments);
    } catch (err) {
      setReplyError(err.message || 'Error processing images');
    } finally {
      setIsCompressingReply(false);
      if (replyFileInputRef.current) {
        replyFileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (indexToRemove) => {
    setReplyAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Reply submission
  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && replyAttachments.length === 0) return;

    setIsSubmitting(true);
    setReplyError('');

    try {
      const senderRole = isAdminUser ? 'agent' : 'user';
      const senderName = currentUser?.name || (senderRole === 'agent' ? 'Flipibook Support' : 'You');
      const senderEmail = currentUser?.email || currentUser?.emailId || '';

      const res = await addTicketMessageApi(currentTicket.id, {
        message: replyText.trim(),
        sender: senderRole,
        senderName,
        senderEmail,
        attachments: replyAttachments
      });

      if (res && res.success && res.data) {
        const updatedTicket = res.data;
        setCurrentTicket(updatedTicket);
        const updatedTickets = tickets.map(t => (t.id === currentTicket.id ? updatedTicket : t));
        setTickets(updatedTickets);
        saveStoredTickets(updatedTickets);

        setReplyText('');
        setReplyAttachments([]);
        setShowReplyForm(false);
        if (toast?.showToast) {
          toast.showToast('Response added successfully!', 'success');
        }
      }
    } catch (err) {
      setReplyError(err.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status toggle (Close / Reopen)
  const handleToggleStatus = async () => {
    if (!currentTicket) return;
    const isCurrentlyClosed = currentTicket.status === 'closed' || currentTicket.status === 'resolved';
    const newStatus = isCurrentlyClosed ? 'open' : 'closed';

    setIsSubmitting(true);
    try {
      const res = await updateTicketStatusApi(currentTicket.id, newStatus);
      if (res && res.success && res.data) {
        const updatedTicket = res.data;
        setCurrentTicket(updatedTicket);
        const updatedTickets = tickets.map(t => (t.id === currentTicket.id ? updatedTicket : t));
        setTickets(updatedTickets);
        saveStoredTickets(updatedTickets);

        setShowCloseConfirm(false);
        if (toast?.showToast) {
          toast.showToast(`Ticket #${currentTicket.id} ${newStatus === 'closed' ? 'closed' : 'reopened'}`, 'success');
        }
      }
    } catch (err) {
      console.warn('Status update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add CC
  const handleAddCc = (e) => {
    e?.preventDefault();
    const email = newCcEmail.trim();
    if (!email || !email.includes('@')) return;
    if (ccList.includes(email)) {
      setNewCcEmail('');
      return;
    }
    const updated = [...ccList, email];
    setCcList(updated);
    setNewCcEmail('');
  };

  const handleRemoveCc = (index) => {
    setCcList(prev => prev.filter((_, idx) => idx !== index));
  };

  return {
    ticketId,
    currentTicket,
    isLoadingTicket,
    isAdminUser,
    currentUser,
    authUser,
    showReplyForm,
    setShowReplyForm,
    replyText,
    setReplyText,
    replyAttachments,
    isCompressingReply,
    replyError,
    isSubmitting,
    showCloseConfirm,
    setShowCloseConfirm,
    replyFileInputRef,
    ccList,
    newCcEmail,
    setNewCcEmail,
    infoOpen,
    setInfoOpen,
    ccOpen,
    setCcOpen,
    supportOpen,
    setSupportOpen,
    handleBack,
    handleImageFilesChange,
    removeAttachment,
    handleAddReply,
    handleToggleStatus,
    handleAddCc,
    handleRemoveCc,
    refreshTicket: loadTicket
  };
}
