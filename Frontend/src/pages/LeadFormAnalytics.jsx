import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { flipbookApi } from '../api';
import customizedEditorApi from '../api/customizedEditorApi';
import LazyPreview from '../components/MyFlipbooks/LazyPreview';
import AnalyticsDatePicker from '../components/Analytics/AnalyticsDatePicker';
import { getPaginationPages, formatFullDate, formatShortDate } from '../components/Analytics/analyticsUtils';
import { exportProfessionalExcel } from '../utils/excelExportHelper';
import { useToast } from '../components/CustomToast';

const STATUS_OPTIONS = ['All Status', 'New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const STATUS_MENU_OPTIONS = [
  { label: 'New', icon: 'carbon:add-alt' },
  { label: 'Contacted', icon: 'fluent:call-24-regular' },
  { label: 'Qualified', icon: 'iconoven:badge-check' },
  { label: 'Converted', icon: 'mdi:check-circle-outline' },
  { label: 'Lost', icon: 'griddy-icons:user-cancel' }
];

const DATE_RANGE_OPTIONS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 90 Days', value: 90 },
  { label: 'Custom Range', value: 'custom' },
  { label: 'All Time', value: 'all' }
];

// Helper to robustly extract lead fields regardless of label casing or structure
export const extractLeadDetails = (lead) => {
  if (!lead) return { name: '-', email: '-', phone: '-', message: '-', category: '-', product: '-' };

  const data = lead.leadData || {};
  const raw = lead.rawLeadData || {};
  const merged = { ...raw, ...data };

  // Find value helper
  const findVal = (keywords) => {
    // 1. Direct key match (case-insensitive)
    for (const key of Object.keys(merged)) {
      const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const kw of keywords) {
        if (lowerKey === kw || lowerKey.includes(kw)) {
          const val = merged[key];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return typeof val === 'object' ? JSON.stringify(val) : String(val).trim();
          }
        }
      }
    }
    return null;
  };

  const name =
    findVal(['fullname', 'yourname', 'firstname', 'clientname', 'customername', 'name', 'user']) ||
    lead.name ||
    '-';

  const email =
    findVal(['emailaddress', 'emailid', 'mailid', 'email', 'mail']) ||
    lead.email ||
    lead.userEmail ||
    '-';

  const phone =
    findVal(['phonenumber', 'contactnumber', 'mobilenumber', 'telephone', 'phone', 'mobile', 'cell', 'contact']) ||
    lead.phone ||
    '-';

  const message =
    findVal(['message', 'query', 'comments', 'comment', 'description', 'enquiry', 'details', 'feedback', 'notes']) ||
    '-';

  const category =
    findVal(['category', 'sector', 'department', 'type', 'industry']) ||
    '-';

  const product =
    findVal(['productname', 'product', 'item', 'model', 'equipment']) ||
    '-';

  return { name, email, phone, message, category, product };
};

export default function LeadFormAnalytics() {
  const navigate = useNavigate();
  const { bookId: routeBookId } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const userEmail = useMemo(() => {
    return (user?.emailId || user?.email || '').toLowerCase();
  }, [user]);

  // Flipbooks state
  const [flipbooks, setFlipbooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(routeBookId || null);
  const [booksSearch, setBooksSearch] = useState('');
  const [sidebarSortBy, setSidebarSortBy] = useState('views'); // 'views', 'name', 'newest', 'oldest'
  const [isSidebarSortOpen, setIsSidebarSortOpen] = useState(false);
  const [focusedSidebarSortIndex, setFocusedSidebarSortIndex] = useState(-1);
  const sidebarSortRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sidebarSortOptions = useMemo(() => [
    { label: 'Most leads', value: 'leads' },
    { label: 'Alphabetical', value: 'name' },
    { label: 'Date (Newest)', value: 'newest' },
    { label: 'Date (Oldest)', value: 'oldest' },
  ], []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarSortRef.current && !sidebarSortRef.current.contains(e.target)) {
        setIsSidebarSortOpen(false);
      }
    };
    if (isSidebarSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarSortOpen]);

  const handleSidebarSortKeyDown = (e) => {
    if (!isSidebarSortOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsSidebarSortOpen(true);
        const idx = sidebarSortOptions.findIndex(opt => opt.value === sidebarSortBy);
        setFocusedSidebarSortIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSidebarSortIndex(prev => (prev + 1) % sidebarSortOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSidebarSortIndex(prev => (prev - 1 + sidebarSortOptions.length) % sidebarSortOptions.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedSidebarSortIndex >= 0 && focusedSidebarSortIndex < sidebarSortOptions.length) {
        setSidebarSortBy(sidebarSortOptions[focusedSidebarSortIndex].value);
        setIsSidebarSortOpen(false);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsSidebarSortOpen(false);
    }
  };

  // Leads state
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange, setDateRange] = useState(7);
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [searchLeadQuery, setSearchLeadQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected lead for right-hand drawer
  const [selectedLead, setSelectedLead] = useState(null);
  const [highlightedLeadId, setHighlightedLeadId] = useState(null);

  // Drawer status dropdown, activity popup & note input states
  const [drawerStatusOpen, setDrawerStatusOpen] = useState(false);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState(null); // { leadId, newStatus, currentStatus }
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityType, setActivityType] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  const [isActivityTypeDropdownOpen, setIsActivityTypeDropdownOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeNoteMenuId, setActiveNoteMenuId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  // Dropdown menus state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [statusFocusedIndex, setStatusFocusedIndex] = useState(-1);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [dateFocusedIndex, setDateFocusedIndex] = useState(-1);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

  // Sync route param with selectedBookId
  useEffect(() => {
    if (routeBookId && routeBookId !== selectedBookId) {
      setSelectedBookId(routeBookId);
    } else if (!routeBookId && selectedBookId) {
      setSelectedBookId(null);
    }
  }, [routeBookId]);

  // Fetch creator's flipbooks
  useEffect(() => {
    if (!userEmail) return;
    const fetchBooks = async () => {
      try {
        const res = await flipbookApi.getBooks({ emailId: userEmail });
        const list = res.data?.books || res.data?.flipbooks || [];
        if (Array.isArray(list)) {
          setFlipbooks(list.filter(b => !b.trash));
        }
      } catch (err) {
        console.error('Error fetching flipbooks:', err);
      }
    };
    fetchBooks();
  }, [userEmail]);

  // Fetch leads from backend (fetches all creator leads so sidebar badges always reflect accurate totals)
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customizedEditorApi.getLeads({
        limit: 1000
      });
      const fetched = res.data?.leads || [];
      setLeads(fetched);
    } catch (err) {
      console.warn('Backend leads API unavailable:', err);
      setLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Close note context menu when clicking outside
  useEffect(() => {
    if (!activeNoteMenuId) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.note-menu-container')) {
        setActiveNoteMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeNoteMenuId]);

  // Keep selectedLead in sync with leads list
  useEffect(() => {
    if (selectedLead) {
      const found = leads.find(l => (l.leadId || l._id) === (selectedLead.leadId || selectedLead._id));
      if (found) {
        setSelectedLead(found);
      }
    }
  }, [leads]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  // Trigger status update confirmation
  const requestStatusUpdate = (leadId, newStatus) => {
    setActiveActionMenuId(null);
    setDrawerStatusOpen(false);

    const lead = leads.find(l => (l.leadId || l._id) === leadId) || selectedLead;
    const currentStatus = lead?.status || 'New';

    if (currentStatus.toLowerCase() === newStatus.toLowerCase()) return;

    setStatusChangeConfirm({
      leadId,
      newStatus,
      currentStatus
    });
  };

  // Perform confirmed status update
  const confirmStatusUpdate = async () => {
    if (!statusChangeConfirm) return;
    const { leadId, newStatus, currentStatus } = statusChangeConfirm;
    setStatusChangeConfirm(null);

    // Briefly highlight the updated row for 3 seconds
    setHighlightedLeadId(leadId);
    setTimeout(() => {
      setHighlightedLeadId((prev) => (prev === leadId ? null : prev));
    }, 3000);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = formatShortDate(now);
    const newTimelineItem = {
      title: 'Status Updated',
      subtitle: `${currentStatus} → ${newStatus} • ${dateFormatted}, ${timeStr}`,
      timestamp: now.toISOString()
    };

    setLeads(prev =>
      prev.map(l => {
        if (l.leadId === leadId || l._id === leadId) {
          const currentTimeline = Array.isArray(l.timeline) ? l.timeline : [];
          return {
            ...l,
            status: newStatus,
            timeline: [...currentTimeline, newTimelineItem]
          };
        }
        return l;
      })
    );

    if (selectedLead && (selectedLead.leadId === leadId || selectedLead._id === leadId)) {
      setSelectedLead(prev => ({
        ...prev,
        status: newStatus,
        timeline: [...(Array.isArray(prev.timeline) ? prev.timeline : []), newTimelineItem]
      }));
    }

    try {
      await customizedEditorApi.updateLeadStatus(leadId, newStatus);
      if (toast?.success) {
        toast.success(`Status updated to ${newStatus} successfully!`);
      }
    } catch (err) {
      console.warn('Could not persist status to backend:', err);
      if (toast?.error) {
        toast.error('Failed to update lead status');
      }
    }
  };

  // Save Activity Handler (records to activity & timeline, plus internal notes if note)
  const handleSaveActivity = async () => {
    if (!selectedLead) return;
    const resolvedType = activityType.trim() || 'Activity';
    const targetLeadId = selectedLead.leadId || selectedLead._id;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = formatShortDate(now);

    const desc = activityDetails.trim() || `${resolvedType} recorded`;
    const newTimelineItem = {
      title: resolvedType,
      subtitle: `${desc} • ${dateFormatted}, ${timeFormatted}`,
      timestamp: now.toISOString()
    };

    const newNoteObj = activityDetails.trim()
      ? {
          noteId: 'n-' + Date.now(),
          text: `[${resolvedType}] ${activityDetails.trim()}`,
          createdAt: now.toISOString()
        }
      : null;

    setLeads(prev =>
      prev.map(l => {
        if (l.leadId === targetLeadId || l._id === targetLeadId) {
          const currentTimeline = Array.isArray(l.timeline) ? l.timeline : [];
          const currentNotes = Array.isArray(l.internalNotes) ? l.internalNotes : [];
          return {
            ...l,
            timeline: [...currentTimeline, newTimelineItem],
            internalNotes: newNoteObj ? [...currentNotes, newNoteObj] : currentNotes
          };
        }
        return l;
      })
    );

    setSelectedLead(prev => {
      const currentTimeline = Array.isArray(prev.timeline) ? prev.timeline : [];
      const currentNotes = Array.isArray(prev.internalNotes) ? prev.internalNotes : [];
      return {
        ...prev,
        timeline: [...currentTimeline, newTimelineItem],
        internalNotes: newNoteObj ? [...currentNotes, newNoteObj] : currentNotes
      };
    });

    setIsActivityModalOpen(false);
    setActivityDetails('');
    setActivityType('Note');
    if (toast?.success) {
      toast.success('Activity saved successfully!');
    }

    if (newNoteObj) {
      try {
        await customizedEditorApi.addLeadNote(targetLeadId, newNoteObj.text);
      } catch (err) {
        console.warn('Could not persist activity note to backend:', err);
      }
    }
  };

  // Add Note to lead
  const handleSaveNote = async () => {
    if (!newNoteText.trim() || !selectedLead) return;
    const text = newNoteText.trim();
    const targetLeadId = selectedLead.leadId || selectedLead._id;
    const newNoteObj = {
      noteId: 'n-' + Date.now(),
      text,
      createdAt: new Date().toISOString()
    };

    setLeads(prev =>
      prev.map(l => {
        if (l.leadId === targetLeadId || l._id === targetLeadId) {
          const notes = Array.isArray(l.internalNotes) ? l.internalNotes : [];
          return { ...l, internalNotes: [...notes, newNoteObj] };
        }
        return l;
      })
    );

    setSelectedLead(prev => ({
      ...prev,
      internalNotes: [...(Array.isArray(prev.internalNotes) ? prev.internalNotes : []), newNoteObj]
    }));

    setNewNoteText('');
    setIsAddingNote(false);
    if (toast?.success) {
      toast.success('Note saved successfully!');
    }

    try {
      await customizedEditorApi.addLeadNote(targetLeadId, text);
    } catch (err) {
      console.warn('Could not persist note to backend:', err);
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId) => {
    setActiveActionMenuId(null);
    if (selectedLead && (selectedLead.leadId === leadId || selectedLead._id === leadId)) {
      setSelectedLead(null);
    }
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    setLeads(prev => prev.filter(l => l.leadId !== leadId && l._id !== leadId));
    try {
      await customizedEditorApi.deleteLead(leadId);
    } catch (err) {
      console.warn('Could not delete lead on backend:', err);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveActionMenuId(null);
      }
      if (!e.target.closest('.status-dropdown-container')) {
        setStatusDropdownOpen(false);
      }
      if (!e.target.closest('.date-dropdown-container')) {
        setDateDropdownOpen(false);
      }
      if (!e.target.closest('.drawer-status-container')) {
        setDrawerStatusOpen(false);
      }
      if (
        !e.target.closest('.lead-detail-drawer') &&
        !e.target.closest('.lead-row-clickable') &&
        !e.target.closest('.action-menu-container') &&
        !e.target.closest('.modal-container')
      ) {
        setSelectedLead(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Leads filtered by status & date range (used for sidebar counts and as base for filteredLeads)
  const dateAndStatusFilteredLeads = useMemo(() => {
    let result = [...leads];

    if (statusFilter !== 'All Status') {
      result = result.filter(l => (l.status || 'New').toLowerCase() === statusFilter.toLowerCase());
    }

    if (dateRange === 'custom') {
      const start = customRange.startDate ? new Date(customRange.startDate).setHours(0, 0, 0, 0) : 0;
      const end = customRange.endDate ? new Date(customRange.endDate).setHours(23, 59, 59, 999) : Infinity;
      result = result.filter(l => {
        const d = new Date(l.submittedAt || l.createdAt || Date.now()).getTime();
        return d >= start && d <= end;
      });
    } else if (dateRange !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (Number(dateRange) - 1));
      cutoff.setHours(0, 0, 0, 0);
      result = result.filter(l => {
        const d = new Date(l.submittedAt || l.createdAt || Date.now());
        return d >= cutoff;
      });
    }

    return result;
  }, [leads, statusFilter, dateRange, customRange]);

  // Actual leads count per book computed accurately from filtered leads
  const leadsPerBook = useMemo(() => {
    const counts = {};
    dateAndStatusFilteredLeads.forEach(l => {
      const vId = l.v_id || l.bookId;
      if (vId) counts[vId] = (counts[vId] || 0) + 1;
    });
    return counts;
  }, [dateAndStatusFilteredLeads]);

  // Filter & sort flipbooks list for sidebar
  const filteredFlipbooks = useMemo(() => {
    const q = booksSearch.trim().toLowerCase();
    const list = q
      ? flipbooks.filter(b => (b.title || b.bookName || '').toLowerCase().includes(q))
      : [...flipbooks];

    return list.sort((a, b) => {
      if (sidebarSortBy === 'leads') {
        const leadsA = leadsPerBook[a.v_id || a._id] || 0;
        const leadsB = leadsPerBook[b.v_id || b._id] || 0;
        return leadsB - leadsA;
      }
      if (sidebarSortBy === 'name') {
        const nameA = (a.title || a.bookName || '').toLowerCase();
        const nameB = (b.title || b.bookName || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sidebarSortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sidebarSortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return 0;
    });
  }, [flipbooks, booksSearch, sidebarSortBy, leadsPerBook]);

  // Filter leads based on selected book and search
  const filteredLeads = useMemo(() => {
    let result = [...dateAndStatusFilteredLeads];

    if (selectedBookId) {
      result = result.filter(l => l.v_id === selectedBookId || l.bookId === selectedBookId);
    }

    if (searchLeadQuery.trim()) {
      const q = searchLeadQuery.toLowerCase();
      result = result.filter(l => {
        const details = extractLeadDetails(l);
        return (
          details.name.toLowerCase().includes(q) ||
          ((!selectedBookId || selectedBookId === 'all') && (l.flipbookName || '').toLowerCase().includes(q)) ||
          details.email.toLowerCase().includes(q) ||
          details.phone.toLowerCase().includes(q) ||
          details.message.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [dateAndStatusFilteredLeads, selectedBookId, searchLeadQuery]);

  // Compute stat card metrics dynamically from filteredLeads and calculate real percentage change vs previous period
  const stats = useMemo(() => {
    // Current period counts
    const total = filteredLeads.length;
    const newCount = filteredLeads.filter(l => (l.status || 'New').toLowerCase() === 'new').length;
    const contactedCount = filteredLeads.filter(l => (l.status || '').toLowerCase() === 'contacted').length;
    const qualifiedCount = filteredLeads.filter(l => (l.status || '').toLowerCase() === 'qualified').length;
    const convertedCount = filteredLeads.filter(l => (l.status || '').toLowerCase() === 'converted').length;

    // Determine period span in days
    let days = 7;
    if (typeof dateRange === 'number') {
      days = dateRange;
    } else if (dateRange === 'custom' && customRange.startDate && customRange.endDate) {
      const diffTime = Math.abs(new Date(customRange.endDate) - new Date(customRange.startDate));
      days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Previous period range for comparison
    const now = new Date();
    const prevEnd = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

    const prevLeads = leads.filter(l => {
      if (selectedBookId && l.v_id !== selectedBookId && l.bookId !== selectedBookId) return false;
      const d = new Date(l.submittedAt || l.createdAt || Date.now());
      return d >= prevStart && d < prevEnd;
    });

    const prevTotal = prevLeads.length;
    const prevNew = prevLeads.filter(l => (l.status || 'New').toLowerCase() === 'new').length;
    const prevContacted = prevLeads.filter(l => (l.status || '').toLowerCase() === 'contacted').length;
    const prevQualified = prevLeads.filter(l => (l.status || '').toLowerCase() === 'qualified').length;
    const prevConverted = prevLeads.filter(l => (l.status || '').toLowerCase() === 'converted').length;

    // Helper to calculate percentage growth
    const getChange = (curr, prev) => {
      if (prev === 0) {
        if (curr > 0) return { pct: 100, isUp: true, formatted: '+100%' };
        return { pct: 0, isUp: true, formatted: '+0.0%' };
      }
      const diff = ((curr - prev) / prev) * 100;
      const isUp = diff >= 0;
      return {
        pct: Math.abs(diff),
        isUp,
        formatted: `${isUp ? '+' : '-'}${Math.abs(diff).toFixed(1)}%`
      };
    };

    // Build day-by-day counts (up to 7 slices) for rendering actual dynamic sparklines
    const numPoints = 7;
    const getPoints = (filterFn) => {
      const pts = [];
      const bucketDuration = (days * 24 * 60 * 60 * 1000) / numPoints;
      const startTime = now.getTime() - days * 24 * 60 * 60 * 1000;
      for (let i = 0; i < numPoints; i++) {
        const bStart = startTime + i * bucketDuration;
        const bEnd = bStart + bucketDuration;
        const count = filteredLeads.filter(l => {
          const t = new Date(l.submittedAt || l.createdAt || Date.now()).getTime();
          return t >= bStart && t < bEnd && (!filterFn || filterFn(l));
        }).length;
        pts.push(count);
      }
      return pts;
    };

    // Helper to turn array of counts into smooth SVG path data
    const makeSparkline = (dataArr) => {
      if (!dataArr || dataArr.length === 0) return { pathD: 'M 0 38 L 100 38', areaD: 'M 0 38 L 100 38 L 100 45 L 0 45 Z' };
      const max = Math.max(...dataArr, 1);
      const points = dataArr.map((val, idx) => {
        const x = (idx / (dataArr.length - 1)) * 100;
        // Map value to y between 8 (high) and 38 (baseline)
        const y = 38 - (val / max) * 30;
        return { x, y };
      });

      // Generate smooth bezier curve through points
      let pathD = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        pathD += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
      }

      const areaD = `${pathD} L 100,45 L 0,45 Z`;
      return { pathD, areaD };
    };

    // Pre-curated reference wave shapes matching the exact target design
    // Each wave has an appealing undulating multi-crest line and smooth gradient base
    const referenceWaves = {
      purple: {
        pathD: 'M 0 34 C 15 34, 25 18, 40 18 C 55 18, 65 30, 78 12 C 88 -2, 95 10, 100 8',
        areaD: 'M 0 34 C 15 34, 25 18, 40 18 C 55 18, 65 30, 78 12 C 88 -2, 95 10, 100 8 L 100 45 L 0 45 Z'
      },
      red: {
        pathD: 'M 0 36 C 14 36, 26 22, 42 22 C 54 22, 64 32, 78 12 C 88 -1, 95 14, 100 12',
        areaD: 'M 0 36 C 14 36, 26 22, 42 22 C 54 22, 64 32, 78 12 C 88 -1, 95 14, 100 12 L 100 45 L 0 45 Z'
      },
      amber: {
        pathD: 'M 0 36 C 15 36, 24 22, 38 22 C 50 22, 62 34, 76 14 C 86 0, 94 12, 100 10',
        areaD: 'M 0 36 C 15 36, 24 22, 38 22 C 50 22, 62 34, 76 14 C 86 0, 94 12, 100 10 L 100 45 L 0 45 Z'
      },
      blue: {
        pathD: 'M 0 36 C 16 36, 25 20, 40 20 C 52 20, 64 32, 78 12 C 88 -1, 95 12, 100 10',
        areaD: 'M 0 36 C 16 36, 25 20, 40 20 C 52 20, 64 32, 78 12 C 88 -1, 95 12, 100 10 L 100 45 L 0 45 Z'
      },
      green: {
        pathD: 'M 0 35 C 16 35, 26 18, 42 18 C 54 18, 64 30, 78 10 C 88 -2, 95 12, 100 9',
        areaD: 'M 0 35 C 16 35, 26 18, 42 18 C 54 18, 64 30, 78 10 C 88 -2, 95 12, 100 9 L 100 45 L 0 45 Z'
      }
    };

    return {
      total,
      newCount,
      avgContactTime: contactedCount > 0 ? '20 min' : '-',
      qualifiedCount,
      convertedCount,
      periodLabel: `vs previous ${days} days`,
      changes: {
        total: getChange(total, prevTotal),
        newCount: getChange(newCount, prevNew),
        contacted: getChange(contactedCount, prevContacted),
        qualified: getChange(qualifiedCount, prevQualified),
        converted: getChange(convertedCount, prevConverted)
      },
      sparklines: {
        total: referenceWaves.purple,
        newCount: referenceWaves.red,
        contacted: referenceWaves.amber,
        qualified: referenceWaves.blue,
        converted: referenceWaves.green
      }
    };
  }, [filteredLeads, leads, selectedBookId, dateRange, customRange]);

  // Format date range string for display
  const dateRangeDisplay = useMemo(() => {
    if (dateRange === 'custom') {
      return `${formatShortDate(customRange.startDate)}, ${new Date(customRange.startDate).getFullYear()} - ${formatShortDate(customRange.endDate)}, ${new Date(customRange.endDate).getFullYear()}`;
    }
    const end = new Date();
    const start = new Date();
    if (typeof dateRange === 'number') {
      // For N days inclusive of today, subtract (N - 1) days
      start.setDate(end.getDate() - (dateRange - 1));
    } else {
      start.setDate(end.getDate() - 29);
    }
    return `${formatShortDate(start)}, ${start.getFullYear()} - ${formatShortDate(end)}, ${end.getFullYear()}`;
  }, [dateRange, customRange]);

  // Export Excel
  const handleExportCSV = async () => {
    if (filteredLeads.length === 0) return;

    const columns = [
      { header: 'S.No', key: 'sno', width: 8, align: 'center' },
      { header: 'Lead Name', key: 'name', width: 22, align: 'left' },
      { header: 'Email Address', key: 'email', width: 28, align: 'left' },
      { header: 'Phone Number', key: 'phone', width: 18, align: 'left' },
      { header: 'Status', key: 'status', width: 16, align: 'center' },
      { header: 'Flipbook Name', key: 'flipbook', width: 25, align: 'left' },
      { header: 'Submission Date', key: 'date', width: 22, align: 'center' },
      { header: 'Message / Notes', key: 'message', width: 40, align: 'left' }
    ];

    const data = filteredLeads.map((l, idx) => {
      const d = extractLeadDetails(l);
      const dateStr = new Date(l.submittedAt || l.createdAt || Date.now()).toLocaleString();
      return {
        sno: idx + 1,
        name: d.name !== '-' ? d.name : 'Anonymous',
        email: d.email || l.userEmail || '-',
        phone: d.phone || '-',
        status: l.status || 'New',
        flipbook: l.flipbookName || 'Flipbook',
        date: dateStr,
        message: d.message || '-'
      };
    });

    const statusCounts = filteredLeads.reduce((acc, curr) => {
      const st = curr.status || 'New';
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});

    const selectedBookObj = selectedBookId && selectedBookId !== 'all'
      ? flipbooks.find(b => (b.v_id || b._id) === selectedBookId)
      : null;

    const metadata = [
      { label: 'Flipbook Filter', value: selectedBookObj?.title || selectedBookObj?.bookName || 'All Flipbooks' },
      { label: 'Status Filter', value: statusFilter },
      { label: 'Date Range', value: typeof dateRange === 'number' ? `Last ${dateRange} Days` : dateRange },
      { label: 'Search Keyword', value: searchLeadQuery || 'None' },
      { label: 'Total Leads in Export', value: filteredLeads.length },
      { label: 'Export Date', value: new Date().toLocaleString() }
    ];

    const chartConfig = {
      title: 'Leads by Status Distribution',
      type: 'donut',
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Count',
          data: Object.values(statusCounts),
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
        }
      ]
    };

    const summaryCards = [
      { title: 'Total Leads', value: filteredLeads.length, color: 'F05338' },
      { title: 'New Leads', value: statusCounts['New'] || 0, color: '3B82F6' },
      { title: 'Contacted', value: statusCounts['Contacted'] || 0, color: 'F59E0B' },
      { title: 'Qualified', value: statusCounts['Qualified'] || 0, color: '8B5CF6' },
      { title: 'Converted', value: statusCounts['Converted'] || 0, color: '10B981' }
    ];

    await exportProfessionalExcel({
      filename: `Leads_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetTitle: 'Leads Records',
      reportName: 'Leads & Enquiries Detailed Report',
      columns,
      data,
      metadata,
      summaryCards,
      chartConfig,
      totalRowLabelCol: 'name'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + pageSize);
  const pageItems = getPaginationPages(safeCurrentPage, totalPages);

  // Helper for timeline - For a newly submitted form, only 'Form Submitted' & 'Lead Created' exist.
  // 'Status Updated' only appears after an actual status update occurred and recorded in lead.timeline.
  const getFullTimeline = (lead) => {
    if (!lead) return [];
    const submittedDate = new Date(lead.submittedAt || lead.createdAt || Date.now());
    const dateFormatted = formatShortDate(submittedDate);
    const timeFormatted = submittedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const baseEvents = [
      {
        title: 'Form Submitted',
        subtitle: `${dateFormatted} • ${timeFormatted}`,
        timestamp: submittedDate.toISOString()
      },
      {
        title: 'Lead Created',
        subtitle: `${dateFormatted} • ${timeFormatted}`,
        timestamp: submittedDate.toISOString()
      }
    ];

    const rawTimeline = Array.isArray(lead.timeline) ? lead.timeline : [];
    // Only pick real updates beyond the initial creation
    const activityEvents = rawTimeline.filter(
      ev => ev.title !== 'Form Submitted' && ev.title !== 'Lead Created'
    );

    return [...baseEvents, ...activityEvents];
  };

  // Status color pill generator
  const renderStatusBadge = (status) => {
    const s = (status || 'New').toLowerCase();
    if (s === 'contacted') {
      return (
        <span className="inline-block px-[0.8vw] py-[0.22vw] rounded-full text-[0.82vw] font-semibold bg-[#FEF3C7] text-[#D97706]">
          Contacted
        </span>
      );
    }
    if (s === 'qualified') {
      return (
        <span className="inline-block px-[0.8vw] py-[0.22vw] rounded-full text-[0.82vw] font-semibold bg-[#E0F2FE] text-[#0284C7]">
          Qualified
        </span>
      );
    }
    if (s === 'converted') {
      return (
        <span className="inline-block px-[0.8vw] py-[0.22vw] rounded-full text-[0.82vw] font-semibold bg-[#DCFCE7] text-[#16A34A]">
          Converted
        </span>
      );
    }
    if (s === 'lost') {
      return (
        <span className="inline-block px-[0.8vw] py-[0.22vw] rounded-full text-[0.82vw] font-semibold bg-slate-100 text-slate-600">
          Lost
        </span>
      );
    }
    return (
      <span className="inline-block px-[0.8vw] py-[0.22vw] rounded-full text-[0.82vw] font-semibold bg-[#FEE2E2] text-[#EF4444]">
        New
      </span>
    );
  };

  // Get avatar initials and background color
  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-[#EDE9FE] text-[#7C3AED]',
      'bg-[#FEE2E2] text-[#EF4444]',
      'bg-[#E0F2FE] text-[#0284C7]',
      'bg-[#DCFCE7] text-[#16A34A]',
      'bg-[#FEF3C7] text-[#D97706]'
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  // Status button background
  const getStatusButtonBg = (status) => {
    const s = (status || 'New').toLowerCase();
    if (s === 'contacted') return 'bg-[#F59E0B] text-white';
    if (s === 'qualified') return 'bg-[#0284C7] text-white';
    if (s === 'converted') return 'bg-[#10B981] text-white';
    if (s === 'lost') return 'bg-slate-600 text-white';
    return 'bg-[#EC5137] text-white';
  };

  return (
    <div className="h-[calc(100vh-7vh)] min-h-[calc(100vh-56px)] bg-white flex flex-col relative overflow-hidden">
      <div className="flex-1 flex overflow-hidden h-full bg-white">
        {/* Left Sidebar: Flipbooks List */}
        <aside className="w-[20vw] min-w-[270px] max-w-[360px] bg-white border-r border-slate-200/90 flex flex-col h-full shrink-0">
          {/* Search bar & Sort/Filter Button */}
          <div className="px-[0.9vw] pt-[0.95vw] pb-[0.5vw] flex items-center gap-[0.5vw]">
            <div className="relative flex-1 flex items-center">
              <Icon
                icon="lineicons:search-2"
                className="absolute left-[0.75vw] w-[0.95vw] h-[0.95vw] text-[#757575] pointer-events-none"
              />
              <input
                type="text"
                value={booksSearch}
                onChange={(e) => setBooksSearch(e.target.value)}
                placeholder="Search Flipbooks..."
                className="w-full pl-[2.1vw] pr-[1.8vw] py-[0.6vw] text-[0.86vw] bg-white border border-slate-400 rounded-[0.55vw] placeholder-slate-500 focus:outline-none focus:border-[#EC5137] transition-colors"
              />
              {booksSearch && (
                <button
                  type="button"
                  onClick={() => setBooksSearch('')}
                  className="absolute right-[0.5vw] text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center p-[0.15vw]"
                  title="Clear search"
                >
                  <Icon icon="solar:close-circle-bold" className="w-[0.8vw] h-[0.8vw]" />
                </button>
              )}
            </div>
            <div className="relative shrink-0" ref={sidebarSortRef}>
              <button
                title="Sort Flipbooks"
                type="button"
                onClick={() => setIsSidebarSortOpen(prev => !prev)}
                onKeyDown={handleSidebarSortKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isSidebarSortOpen}
                className={`p-[0.6vw] rounded-[0.55vw] border border-slate-400 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                  isSidebarSortOpen ? 'border-[#EC5137] ring-2 ring-[#EC5137]/20 text-[#EC5137]' : 'text-[#444444]'
                }`}
              >
                <Icon icon="iconoir:sort" className="w-[1.1vw] h-[1.1vw]" />
              </button>

              {isSidebarSortOpen && (
                <div
                  role="listbox"
                  onMouseLeave={() => setFocusedSidebarSortIndex(-1)}
                  className="absolute right-0 mt-[0.35vw] w-[10.5vw] min-w-[155px] bg-white border border-slate-200 rounded-[0.55vw] shadow-lg py-[0.3vw] z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-[0.75vw] py-[0.25vw] text-[0.72vw] font-semibold tracking-wider uppercase text-slate-500">
                    Sort By
                  </div>
                  {sidebarSortOptions.map((opt, idx) => {
                    const isCurrent = sidebarSortBy === opt.value;
                    const isFocused = focusedSidebarSortIndex === idx;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => {
                          setSidebarSortBy(opt.value);
                          setIsSidebarSortOpen(false);
                          setFocusedSidebarSortIndex(-1);
                        }}
                        onMouseEnter={() => setFocusedSidebarSortIndex(idx)}
                        onMouseLeave={() => setFocusedSidebarSortIndex(-1)}
                        className={`w-full text-left px-[0.75vw] py-[0.42vw] text-[0.84vw] font-normal transition-colors flex items-center justify-between cursor-pointer ${
                          isFocused ? 'bg-orange-50/80 text-[#EC5137]' : isCurrent ? 'bg-orange-50/50 text-[#EC5137]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isCurrent && (
                          <Icon icon="solar:check-read-linear" className="w-[0.8vw] h-[0.8vw] text-[#EC5137]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto px-[0.9vw] py-[0.75vw] space-y-[0.85vw]">
            {/* All Flipbooks option */}
            <div
              onClick={() => {
                setSelectedBookId(null);
                navigate('/lead-form');
              }}
              className={`relative flex items-center p-[0.65vw] rounded-[0.75vw] cursor-pointer transition-all ${
                !selectedBookId
                  ? 'bg-[#F4F5F7]'
                  : 'bg-white hover:bg-slate-50/80'
              }`}
            >
              {/* Red badge in top-right corner */}
              {dateAndStatusFilteredLeads.length > 0 && (
                <span className="absolute -top-[0.35vw] -right-[0.2vw] min-w-[1.35vw] h-[1.35vw] px-[0.25vw] rounded-full bg-[#EF5335] text-white text-[0.66vw] font-medium flex items-center justify-center shadow-xs z-10 leading-none">
                  {dateAndStatusFilteredLeads.length}
                </span>
              )}

              <div className="flex items-center gap-[0.85vw] min-w-0 pr-[0.8vw]">
                <div className="w-[4.6vw] h-[3.1vw] rounded-[0.45vw] bg-[#FFF0EC] flex items-center justify-center text-[#EF5335] shrink-0">
                  <Icon icon="solar:book-bookmark-minimalistic-linear" className="w-[1.45vw] h-[1.45vw]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[0.9vw] font-medium text-[#111827] truncate leading-snug">
                    All Flipbooks
                  </h4>
                  <p className="text-[0.78vw] text-slate-500 truncate mt-[0.25vw]">
                    Total Leads : {dateAndStatusFilteredLeads.length.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Flipbooks */}
            {filteredFlipbooks.map((book) => {
              const bId = book.v_id || book._id;
              const isSelected = selectedBookId === bId;
              const count = leadsPerBook[bId] || 0;
              const viewsCount = book.viewsCount ?? book.views ?? 0;
              const dateDisplay = book.createdAt
                ? formatFullDate(book.createdAt)
                : '-';

              return (
                <div
                  key={bId}
                  onClick={() => {
                    setSelectedBookId(bId);
                    navigate(`/lead-form/${bId}`);
                  }}
                  className={`relative flex items-center p-[0.65vw] rounded-[0.75vw] cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#F4F5F7]'
                      : 'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  {/* Red badge in top-right corner */}
                  {count > 0 && (
                    <span className="absolute -top-[0.35vw] -right-[0.2vw] min-w-[1.35vw] h-[1.35vw] px-[0.25vw] rounded-full bg-[#EF5335] text-white text-[0.66vw] font-medium flex items-center justify-center shadow-xs z-10 leading-none">
                      {count}
                    </span>
                  )}

                  <div className="flex items-center gap-[0.85vw] min-w-0 pr-[0.8vw]">
                    <div className="w-[4.6vw] h-[3.1vw] rounded-[0.45vw] bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {book.thumbnailUrl || book.coverImage ? (
                        <img
                          src={book.thumbnailUrl || book.coverImage}
                          alt={book.title || book.bookName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <LazyPreview
                          v_id={book.v_id}
                          emailId={userEmail}
                          title={book.title || book.bookName}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[0.9vw] font-medium text-[#111827] truncate leading-snug">
                        {book.title || book.bookName || 'Untitled'}
                      </h4>
                      <p className="text-[0.78vw] text-slate-500 truncate mt-[0.25vw]">
                        {viewsCount.toLocaleString()} Views &nbsp; {dateDisplay}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredFlipbooks.length === 0 && (
              <div className="text-center py-[2vw] text-slate-400 text-[0.72vw]">
                No flipbooks found
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto p-[1.5vw] space-y-[1.2vw]">
          {/* Hero Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[1.6vw] font-semibold text-slate-900 leading-tight">
                Lead Form Analytics
              </h1>
              <p className="text-[0.9vw] text-slate-500 mt-[0.2vw]">
                Monitor lead form engagement across all your flipbooks.
              </p>
            </div>
            <div className="flex items-center gap-[0.65vw]">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-[0.4vw] px-[0.95vw] py-[0.5vw] text-[0.88vw] font-medium text-slate-700 bg-white border border-slate-200 rounded-[0.55vw] hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                <Icon
                  icon="solar:restart-linear"
                  className={`w-[1vw] h-[1vw] text-slate-500 ${refreshing ? 'animate-spin' : ''}`}
                />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-[0.4vw] px-[0.95vw] py-[0.5vw] text-[0.88vw] font-medium text-slate-700 bg-white border border-slate-200 rounded-[0.55vw] hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                <Icon icon="solar:download-minimalistic-linear" className="w-[1vw] h-[1vw] text-slate-500" />
                <span>Download file</span>
              </button>
            </div>
          </div>

          {/* 5 Stat Cards */}
          <div className="grid grid-cols-5 gap-[0.8vw]">
            {/* Card 1: Total Leads */}
            <div className="bg-white rounded-[0.9vw] px-[1vw] py-[0.62vw] border border-slate-100 shadow-[1px_1px_2px_rgb(0_0_0_/_30%)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#7C3AED]">Total Leads</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] shrink-0">
                  <Icon icon="lets-icons:view-fill" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.1vw] mb-[0.25vw]">
                <h3 className="text-[1.75vw] font-medium text-slate-900 leading-none">
                  {stats.total.toLocaleString()}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.78vw] font-medium ${
                      stats.changes.total.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.total.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.total.formatted}</span>
                  </span>
                  <p className="text-[0.78vw] text-slate-400 mt-[0.02vw] whitespace-nowrap">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5.8vw] h-[2.2vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.total.areaD} fill="url(#gradPurpleExact)" />
                  <path
                    d={stats.sparklines.total.pathD}
                    stroke="#7C3AED"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradPurpleExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 2: New */}
            <div className="bg-white rounded-[0.9vw] px-[1vw] py-[0.62vw] border border-slate-100 shadow-[1px_1px_2px_rgb(0_0_0_/_30%)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#EF4444]">New</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] shrink-0">
                  <Icon icon="fluent:form-sparkle-20-filled" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.1vw] mb-[0.25vw]">
                <h3 className="text-[1.75vw] font-medium text-slate-900 leading-none">
                  {stats.newCount.toLocaleString()}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.78vw] font-medium ${
                      stats.changes.newCount.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.newCount.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.newCount.formatted}</span>
                  </span>
                  <p className="text-[0.78vw] text-slate-400 mt-[0.02vw] whitespace-nowrap">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5.8vw] h-[2.2vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.newCount.areaD} fill="url(#gradRedExact)" />
                  <path
                    d={stats.sparklines.newCount.pathD}
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradRedExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 3: Contacted */}
            <div className="bg-white rounded-[0.9vw] px-[1vw] py-[0.62vw] border border-slate-100 shadow-[1px_1px_2px_rgb(0_0_0_/_30%)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#D97706]">Contacted</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
                  <Icon icon="boxicons:skip-next-filled" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.1vw] mb-[0.25vw]">
                <h3 className="text-[1.75vw] font-medium text-slate-900 leading-none">
                  {stats.avgContactTime}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.78vw] font-medium ${
                      stats.changes.contacted.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.contacted.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.contacted.formatted}</span>
                  </span>
                  <p className="text-[0.78vw] text-slate-400 mt-[0.02vw] whitespace-nowrap">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5.8vw] h-[2.2vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.contacted.areaD} fill="url(#gradAmberExact)" />
                  <path
                    d={stats.sparklines.contacted.pathD}
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradAmberExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97706" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 4: Qualified */}
            <div className="bg-white rounded-[0.9vw] px-[1vw] py-[0.62vw] border border-slate-100 shadow-[1px_1px_2px_rgb(0_0_0_/_30%)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#0284C7]">Qualified</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] shrink-0">
                  <Icon icon="heroicons-solid:cursor-click" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.1vw] mb-[0.25vw]">
                <h3 className="text-[1.75vw] font-medium text-slate-900 leading-none">
                  {stats.qualifiedCount.toLocaleString()}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.78vw] font-medium ${
                      stats.changes.qualified.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.qualified.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.qualified.formatted}</span>
                  </span>
                  <p className="text-[0.78vw] text-slate-400 mt-[0.02vw] whitespace-nowrap">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5.8vw] h-[2.2vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.qualified.areaD} fill="url(#gradBlueExact)" />
                  <path
                    d={stats.sparklines.qualified.pathD}
                    stroke="#0284C7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradBlueExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 5: Converted */}
            <div className="bg-white rounded-[0.9vw] px-[1vw] py-[0.62vw] border border-slate-100 shadow-[1px_1px_2px_rgb(0_0_0_/_30%)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[0.8vw] font-medium text-[#16A34A]">Converted</span>
                <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                  <Icon icon="gg:math-divide" className="w-[1.3vw] h-[1.3vw]" />
                </div>
              </div>
              <div className="mt-[0.1vw] mb-[0.25vw]">
                <h3 className="text-[1.75vw] font-medium text-slate-900 leading-none">
                  {stats.convertedCount.toLocaleString()}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-[0.1vw]">
                <div>
                  <span
                    className={`inline-flex items-center gap-[0.15vw] text-[0.78vw] font-medium ${
                      stats.changes.converted.isUp ? 'text-[#16A34A]' : 'text-[#EF4444]'
                    }`}
                  >
                    <Icon
                      icon="carbon:growth"
                      className={`w-[0.75vw] h-[0.75vw] ${!stats.changes.converted.isUp ? 'rotate-180' : ''}`}
                    />
                    <span>{stats.changes.converted.formatted}</span>
                  </span>
                  <p className="text-[0.78vw] text-slate-400 mt-[0.02vw] whitespace-nowrap">{stats.periodLabel}</p>
                </div>
                <svg className="w-[5.8vw] h-[2.2vw] overflow-visible" viewBox="0 0 100 45" fill="none">
                  <path d={stats.sparklines.converted.areaD} fill="url(#gradGreenExact)" />
                  <path
                    d={stats.sparklines.converted.pathD}
                    stroke="#16A34A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradGreenExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Filters Bar: Activity Status & Date Range */}
          <div className="bg-white rounded-[0.8vw] border border-[#D9D9D9] px-[1.2vw] py-[0.7vw] shadow-2xs">
            <div className="grid grid-cols-3 gap-[1.2vw] items-end">
              {/* Activity Status Dropdown */}
              <div
                className="relative status-dropdown-container w-full"
                onKeyDown={(e) => {
                  if (!statusDropdownOpen) {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setStatusDropdownOpen(true);
                      const currentIdx = STATUS_OPTIONS.findIndex(
                        (o) => o.toLowerCase() === statusFilter.toLowerCase()
                      );
                      setStatusFocusedIndex(currentIdx >= 0 ? currentIdx : 0);
                    }
                    return;
                  }

                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setStatusFocusedIndex((prev) => (prev + 1) % STATUS_OPTIONS.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setStatusFocusedIndex((prev) => (prev <= 0 ? STATUS_OPTIONS.length - 1 : prev - 1));
                  } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (statusFocusedIndex >= 0 && statusFocusedIndex < STATUS_OPTIONS.length) {
                      setStatusFilter(STATUS_OPTIONS[statusFocusedIndex]);
                      setStatusDropdownOpen(false);
                      setCurrentPage(1);
                    }
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setStatusDropdownOpen(false);
                  }
                }}
              >
                <label className="block text-[0.82vw] font-medium text-[#555555] mb-[0.35vw]">
                  Activity Status
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = !statusDropdownOpen;
                    setStatusDropdownOpen(next);
                    if (next) {
                      const currentIdx = STATUS_OPTIONS.findIndex(
                        (o) => o.toLowerCase() === statusFilter.toLowerCase()
                      );
                      setStatusFocusedIndex(currentIdx >= 0 ? currentIdx : 0);
                    }
                  }}
                  className="w-full flex items-center justify-between px-[0.85vw] py-[0.52vw] text-[0.78vw] bg-white border border-[#D9D9D9] rounded-[0.4vw] text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors cursor-pointer"
                  tabIndex={0}
                  aria-haspopup="listbox"
                  aria-expanded={statusDropdownOpen}
                >
                  <span className="flex items-center gap-[0.4vw]">
                    <Icon icon="hugeicons:tick-02" className="w-[0.95vw] h-[0.95vw] text-slate-500" />
                    <span>{statusFilter}</span>
                  </span>
                  <Icon icon="solar:alt-arrow-down-linear" className="w-[0.75vw] h-[0.75vw] text-slate-400" />
                </button>

                {statusDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute z-20 top-full left-0 mt-[0.2vw] w-full bg-white border border-slate-200 rounded-[0.4vw] shadow-lg py-[0.3vw]"
                  >
                    {STATUS_OPTIONS.map((opt, idx) => {
                      const isSelected = statusFilter.toLowerCase() === opt.toLowerCase();
                      const isFocused = statusFocusedIndex === idx;
                      return (
                        <div
                          key={opt}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setStatusFocusedIndex(idx)}
                          onClick={() => {
                            setStatusFilter(opt);
                            setStatusDropdownOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`px-[0.85vw] py-[0.4vw] text-[0.78vw] cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'font-semibold text-[#4A3AFF] bg-indigo-50/60'
                              : isFocused
                              ? 'bg-slate-100 text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && (
                            <Icon icon="hugeicons:tick-02" className="w-[0.85vw] h-[0.85vw]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date Range Dropdown */}
              <div
                className="relative date-dropdown-container w-full"
                onKeyDown={(e) => {
                  if (!dateDropdownOpen) {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setDateDropdownOpen(true);
                      const currentIdx = DATE_RANGE_OPTIONS.findIndex((o) => o.value === dateRange);
                      setDateFocusedIndex(currentIdx >= 0 ? currentIdx : 0);
                    }
                    return;
                  }

                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setDateFocusedIndex((prev) => (prev + 1) % DATE_RANGE_OPTIONS.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setDateFocusedIndex((prev) => (prev <= 0 ? DATE_RANGE_OPTIONS.length - 1 : prev - 1));
                  } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (dateFocusedIndex >= 0 && dateFocusedIndex < DATE_RANGE_OPTIONS.length) {
                      setDateRange(DATE_RANGE_OPTIONS[dateFocusedIndex].value);
                      setDateDropdownOpen(false);
                      setCurrentPage(1);
                    }
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setDateDropdownOpen(false);
                  }
                }}
              >
                <label className="block text-[0.82vw] font-medium text-[#555555] mb-[0.35vw]">
                  Date Range
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = !dateDropdownOpen;
                    setDateDropdownOpen(next);
                    if (next) {
                      const currentIdx = DATE_RANGE_OPTIONS.findIndex((o) => o.value === dateRange);
                      setDateFocusedIndex(currentIdx >= 0 ? currentIdx : 0);
                    }
                  }}
                  className="w-full flex items-center justify-between px-[0.85vw] py-[0.52vw] text-[0.78vw] bg-white border border-[#D9D9D9] rounded-[0.4vw] text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors cursor-pointer"
                  tabIndex={0}
                  aria-haspopup="listbox"
                  aria-expanded={dateDropdownOpen}
                >
                  <span className="flex items-center gap-[0.4vw]">
                    <Icon icon="ic:outline-calendar-month" className="w-[0.95vw] h-[0.95vw] text-slate-500" />
                    <span>
                      {DATE_RANGE_OPTIONS.find(d => d.value === dateRange)?.label || 'Last 7 Days'}
                    </span>
                  </span>
                  <Icon icon="solar:alt-arrow-down-linear" className="w-[0.75vw] h-[0.75vw] text-slate-400" />
                </button>

                {dateDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute z-20 top-full left-0 mt-[0.2vw] w-full bg-white border border-slate-200 rounded-[0.4vw] shadow-lg py-[0.3vw]"
                  >
                    {DATE_RANGE_OPTIONS.map((opt, idx) => {
                      const isSelected = dateRange === opt.value;
                      const isFocused = dateFocusedIndex === idx;
                      return (
                        <div
                          key={opt.value}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setDateFocusedIndex(idx)}
                          onClick={() => {
                            setDateRange(opt.value);
                            setDateDropdownOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`px-[0.85vw] py-[0.4vw] text-[0.78vw] cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'font-semibold text-[#4A3AFF] bg-indigo-50/60'
                              : isFocused
                              ? 'bg-slate-100 text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && (
                            <Icon icon="hugeicons:tick-02" className="w-[0.85vw] h-[0.85vw]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date Range Display / Date Picker */}
              <div className="w-full">
                {dateRange === 'custom' ? (
                  <AnalyticsDatePicker
                    startDate={customRange.startDate}
                    endDate={customRange.endDate}
                    onChange={({ startDate, endDate }) => {
                      setCustomRange({ startDate, endDate });
                      setCurrentPage(1);
                    }}
                  />
                ) : (
                  <div
                    onClick={() => setDateRange('custom')}
                    className="flex items-center gap-[0.4vw] px-[0.85vw] py-[0.52vw] text-[0.78vw] bg-white border border-[#D9D9D9] rounded-[0.4vw] text-slate-600 hover:border-slate-400 transition-colors cursor-pointer whitespace-nowrap"
                    title="Click to select custom date range"
                  >
                    <Icon icon="ic:outline-calendar-month" className="w-[0.95vw] h-[0.95vw] text-slate-500" />
                    <span className="text-slate-300">|</span>
                    <span>{dateRangeDisplay}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leads Table Container */}
          <div className="bg-white rounded-[0.9vw] border border-[#D9D9D9] p-[1.2vw] shadow-2xs space-y-[0.85vw]">
            {/* Table Header and Controls */}
            <div className="flex items-center justify-between pb-[0.4vw]">
              <div>
                <h3 className="text-[1.2vw] font-medium text-slate-900 leading-tight">
                  Total Leads <span className="text-[#EF5335]">({filteredLeads.length})</span>
                </h3>
                <p className="text-[0.82vw] text-slate-400 mt-[0.1vw]">
                  Review date-wise form activity and submission performance.
                </p>
              </div>
              <div className="flex items-center gap-[0.6vw]">
                {/* Search Leads */}
                <div className="relative flex items-center">
                  <Icon
                    icon="lineicons:search-2"
                    className="absolute left-[0.65vw] w-[1.05vw] h-[1.05vw] text-[#EC5137] pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchLeadQuery}
                    onChange={(e) => {
                      setSearchLeadQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search Leads..."
                    className="w-[17vw] pl-[2vw] pr-[2vw] py-[0.5vw] text-[0.9vw] bg-white border border-slate-300 rounded-[0.45vw] focus:outline-none focus:border-[#EC5137] transition-colors"
                  />
                  {searchLeadQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchLeadQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-[0.5vw] text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center p-[0.15vw]"
                      title="Clear search"
                    >
                      <Icon icon="solar:close-circle-bold" className="w-[1.05vw] h-[1.05vw]" />
                    </button>
                  )}
                </div>

                {/* Download file button */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-[0.35vw] px-[0.9vw] py-[0.5vw] text-[0.9vw] font-medium text-[#EC5137] bg-[#FFF5F2] hover:bg-[#FEE2E2] rounded-[0.45vw] transition-colors cursor-pointer"
                >
                  <Icon icon="bi:download" className="w-[0.95vw] h-[0.95vw] text-[#EC5137]" />
                  <span>Download file</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-[0.75vw] border border-[#E5E7EB]">
              <table className="w-full text-left text-[0.88vw] [&_th]:border-r [&_th]:border-[#E5E7EB] [&_th:last-child]:border-r-0 [&_td]:border-r [&_td]:border-[#E5E7EB] [&_td:last-child]:border-r-0">
                <thead>
                  <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB] text-[#111827] font-medium text-[0.9vw]">
                    <th className="py-[0.75vw] px-[0.9vw] text-center w-[4vw]">S.No</th>
                    <th className="py-[0.75vw] px-[0.9vw]">Name</th>
                    {(!selectedBookId || selectedBookId === 'all') && (
                      <th className="py-[0.75vw] px-[0.9vw] min-w-[13vw] whitespace-nowrap">Book Name</th>
                    )}
                    <th className="py-[0.75vw] px-[0.9vw]">Email</th>
                    <th className="py-[0.75vw] px-[0.9vw]">Phone Number</th>
                    <th className="py-[0.75vw] px-[0.9vw] w-[30%]">Message</th>
                    <th className="py-[0.75vw] px-[0.9vw] text-center">Status</th>
                    <th className="py-[0.75vw] px-[0.9vw]">Date & time</th>
                    <th className="py-[0.75vw] px-[0.9vw] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {paginatedLeads.map((lead, idx) => {
                    const details = extractLeadDetails(lead);
                    const name = details.name;
                    const email = details.email;
                    const phone = details.phone;
                    const message = details.message;
                    const status = lead.status || 'New';
                    const d = new Date(lead.submittedAt || lead.createdAt || Date.now());
                    const datePart = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const leadKey = lead.leadId || lead._id;
                    const isRowSelected = selectedLead && (selectedLead.leadId === leadKey || selectedLead._id === leadKey);
                    const isRowHighlighted = highlightedLeadId === leadKey;

                    return (
                      <tr
                        key={leadKey}
                        className={`lead-row-clickable transition-all duration-500 ${
                          isRowHighlighted
                            ? 'bg-amber-100/70 ring-1 ring-amber-300'
                            : isRowSelected
                            ? 'bg-orange-50/50'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* S.No */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-center text-slate-500 font-medium"
                        >
                          {startIndex + idx + 1}
                        </td>

                        {/* Name with Avatar - Clickable */}
                        <td
                          className="py-[0.65vw] px-[0.8vw]"
                        >
                          <div className="flex items-center gap-[0.55vw]">
                            <div
                              className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center text-[0.65vw] font-bold shrink-0 ${getAvatarColor(
                                name
                              )}`}
                            >
                              {getAvatarInitials(name)}
                            </div>
                            <span className="font-normal text-[#374151] hover:text-[#F05338] transition-colors">
                              {name}
                            </span>
                          </div>
                        </td>

                        {/* Book Name (shown when All Flipbooks is selected) */}
                        {(!selectedBookId || selectedBookId === 'all') && (
                          <td
                            className="py-[0.65vw] px-[0.8vw] text-slate-700 font-medium"
                          >
                            {lead.flipbookName || '-'}
                          </td>
                        )}

                        {/* Email */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-slate-600"
                        >
                          {email}
                        </td>

                        {/* Phone */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-slate-600"
                        >
                          {phone}
                        </td>

                        {/* Message */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-slate-600 max-w-[20vw] truncate"
                        >
                          {message}
                        </td>

                        {/* Status */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-center"
                        >
                          {renderStatusBadge(status)}
                        </td>

                        {/* Date & Time */}
                        <td
                          className="py-[0.65vw] px-[0.8vw] text-slate-600 whitespace-nowrap"
                        >
                          <div className="font-medium">{datePart}</div>
                          <div className="text-[0.82vw] text-slate-500">{timePart}</div>
                        </td>

                        {/* Action Menu (Triple dots) */}
                        <td className="py-[0.65vw] px-[0.8vw] text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                            }}
                            className="p-[0.3vw] text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Open lead details"
                          >
                            <Icon icon="akar-icons:more-vertical-fill" className="w-[0.9vw] h-[0.9vw]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedLeads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-[3vw] text-center text-slate-400 text-[0.75vw]">
                        No leads matching your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-[0.84vw] text-slate-500 pt-[0.4vw] border-t border-[#F3F3F3]">
              <span>
                Showing {filteredLeads.length > 0 ? startIndex + 1 : 0}–
                {Math.min(startIndex + pageSize, filteredLeads.length)} of {filteredLeads.length} Leads
              </span>
              {totalPages > 1 ? (
                <div className="flex items-center gap-[0.3vw]">
                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`w-[1.6vw] h-[1.6vw] rounded-[0.3vw] flex items-center justify-center text-[0.82vw] font-medium transition-colors ${
                      safeCurrentPage <= 1
                        ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                    }`}
                    aria-label="Previous page"
                  >
                    <Icon icon="solar:alt-arrow-left-linear" className="w-[0.8vw] h-[0.8vw]" />
                  </button>
                  {pageItems.map((page, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={page === '...'}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      className={`w-[1.6vw] h-[1.6vw] rounded-[0.3vw] flex items-center justify-center text-[0.82vw] font-medium transition-colors ${
                        page === '...'
                          ? 'cursor-default text-slate-400'
                          : safeCurrentPage === page
                          ? 'bg-[#F05338] text-white shadow-xs cursor-pointer'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={`w-[1.6vw] h-[1.6vw] rounded-[0.3vw] flex items-center justify-center text-[0.82vw] font-medium transition-colors ${
                      safeCurrentPage >= totalPages
                        ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                    }`}
                    aria-label="Next page"
                  >
                    <Icon icon="solar:alt-arrow-right-linear" className="w-[0.8vw] h-[0.8vw]" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-[0.3vw]">
                  <button
                    type="button"
                    className="w-[1.6vw] h-[1.6vw] rounded-[0.3vw] flex items-center justify-center text-[0.7vw] font-medium bg-[#F05338] text-white cursor-default"
                  >
                    1
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Side Lead Detail Drawer as Floating Overlay with pure horizontal slide animation */}
        <AnimatePresence>
          {selectedLead && (() => {
            const drawerDetails = extractLeadDetails(selectedLead);
            return (
              <React.Fragment key="lead-detail-drawer-wrapper">
                <motion.div
                  key="lead-detail-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedLead(null)}
                  className="fixed inset-0 top-[7vh] bg-black/25 z-[104]"
                />
                <motion.aside
                  key="lead-detail-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="lead-detail-drawer fixed right-0 top-[7vh] bottom-0 w-[23vw] min-w-[320px] max-w-[380px] bg-white border-l border-slate-200/90 shadow-[-8px_0_28px_rgba(0,0,0,0.08)] flex flex-col z-[105] overflow-hidden"
              >
                {/* Header: Avatar, Name, Email, Status pill, Close Button */}
                <div className="px-[1.2vw] py-[0.9vw] border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-[0.7vw] min-w-0">
                    <div
                      className={`w-[2.4vw] h-[2.4vw] rounded-full flex items-center justify-center text-[0.8vw] font-bold shrink-0 ${getAvatarColor(
                        drawerDetails.name
                      )}`}
                    >
                      {getAvatarInitials(drawerDetails.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-[0.45vw]">
                        <h3 className="text-[1.05vw] font-semibold text-slate-800 truncate leading-tight">
                          {drawerDetails.name}
                        </h3>
                        <span className="shrink-0">{renderStatusBadge(selectedLead.status)}</span>
                      </div>
                      <p className="text-[0.8vw] text-slate-500 truncate mt-[0.1vw]">
                        {drawerDetails.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="p-[0.3vw] text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Close drawer"
                  >
                    <Icon icon="iconoir:cancel" className="w-[1.2vw] h-[1.2vw]" />
                  </button>
                </div>

                {/* Action Buttons: Status selector & Add Activity */}
                <div className="p-[1vw] border-b border-slate-100 grid grid-cols-2 gap-[0.6vw]">
                  {/* Status Dropdown Button */}
                  <div className="relative drawer-status-container">
                    <button
                      type="button"
                      onClick={() => setDrawerStatusOpen(!drawerStatusOpen)}
                      className={`w-full flex items-center justify-between px-[0.8vw] py-[0.5vw] rounded-[0.4vw] text-[0.9vw] font-medium transition-colors shadow-xs cursor-pointer ${getStatusButtonBg(
                        selectedLead.status
                      )}`}
                    >
                      <span>{selectedLead.status || 'New'}</span>
                      <Icon icon="icon-park-outline:down" className="w-[0.75vw] h-[0.75vw]" />
                    </button>

                    {drawerStatusOpen && (
                      <div className="absolute top-full left-0 mt-[0.2vw] w-full bg-white border border-slate-200 rounded-[0.4vw] shadow-xl py-[0.3vw] z-50">
                        {STATUS_MENU_OPTIONS.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() =>
                              requestStatusUpdate(selectedLead.leadId || selectedLead._id, item.label)
                            }
                            className={`w-full text-left px-[0.85vw] py-[0.5vw] text-[0.8vw] flex items-center gap-[0.5vw] hover:bg-slate-50 transition-colors cursor-pointer ${
                              (selectedLead.status || 'New').toLowerCase() === item.label.toLowerCase()
                                ? 'text-[#F05338] font-semibold bg-orange-50/50'
                                : 'text-slate-700'
                            }`}
                          >
                            <Icon icon={item.icon} className="w-[0.95vw] h-[0.95vw] text-slate-500" />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Activity Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsActivityModalOpen(true);
                      setActivityType('');
                      setActivityDetails('');
                    }}
                    className="w-full flex items-center justify-center gap-[0.3vw] px-[0.8vw] py-[0.5vw] rounded-[0.4vw] text-[0.9vw] font-medium text-[#555555] bg-[#F3F3F3] hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Icon icon="ci:add-plus" className="w-[0.85vw] h-[0.85vw] text-[#000000]" />
                    <span>Add Activity</span>
                  </button>
                </div>

                {/* Scrollable Details Content */}
                <div className="flex-1 overflow-y-auto p-[1.2vw] space-y-[1.2vw]">
                  {/* Section 1: Lead Form Preview */}
                  <div>
                    <h4 className="text-[1.02vw] font-medium text-[#111827] mb-[0.65vw]">
                      Lead Form Preview
                    </h4>
                    <div className="space-y-[0.45vw] text-[0.9vw]">
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="boxicons:form" className="w-[0.95vw] h-[0.95vw] text-[#EF4444]" />
                        <span className="text-[#555555] font-normal w-[5.5vw]">Form Name</span>
                        <span className="text-slate-800 font-normal truncate">
                          {selectedLead.formName || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="basil:book-open-outline" className="w-[0.95vw] h-[0.95vw] text-[#EF4444]" />
                        <span className="text-[#555555] font-normal w-[5.5vw]">Flipbook</span>
                        <span className="text-slate-800 font-normal truncate">
                          {selectedLead.flipbookName || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="ic:outline-calendar-month" className="w-[0.95vw] h-[0.95vw] text-[#EF4444]" />
                        <span className="text-[#555555] font-normal w-[5.5vw]">Date</span>
                        <span className="text-slate-800 font-normal">
                          {selectedLead.submittedAt || selectedLead.createdAt ? (
                            `${new Date(selectedLead.submittedAt || selectedLead.createdAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}, ${new Date(selectedLead.submittedAt || selectedLead.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}`
                          ) : (
                            '-'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contact Information */}
                  <div className="pt-[0.4vw] border-t border-[#F3F3F3]">
                    <h4 className="text-[1.02vw] font-medium text-[#111827] mb-[0.65vw]">
                      Contact Information
                    </h4>
                    <div className="space-y-[0.45vw] text-[0.9vw]">
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="boxicons:user" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                        <span className="text-[#555555] font-normal w-[5.5vw]">Full Name</span>
                        <span className="text-slate-800 font-normal">
                          {drawerDetails.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="codicon:mail" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                        <span className="text-[#555555] font-normal w-[5.5vw]">Email</span>
                        <span className="text-slate-800 font-normal">
                          {drawerDetails.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-[0.5vw]">
                        <Icon icon="doodle-icons:call" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                        <span className="text-[#555555] font-normal w-[5.5vw]">Phone</span>
                        <span className="text-slate-800 font-normal">
                          {drawerDetails.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Lead Form Details - Only rendered or shown with actual values / '-' */}
                  {(drawerDetails.category !== '-' || drawerDetails.product !== '-' || drawerDetails.message !== '-') && (
                    <div className="pt-[0.4vw] border-t border-[#F3F3F3]">
                      <h4 className="text-[1.02vw] font-medium text-[#111827] mb-[0.65vw]">
                        Lead Form Details
                      </h4>
                      <div className="space-y-[0.5vw] text-[0.88vw]">
                        {drawerDetails.category !== '-' && (
                          <div className="flex items-start gap-[0.5vw]">
                            <span className="text-[#555555] font-normal w-[5.5vw]">Category</span>
                            <span className="text-slate-800 font-normal">
                              {drawerDetails.category}
                            </span>
                          </div>
                        )}
                        {drawerDetails.product !== '-' && (
                          <div className="flex items-start gap-[0.5vw]">
                            <span className="text-[#555555] font-normal w-[5.5vw]">Product</span>
                            <span className="text-slate-800 font-normal">
                              {drawerDetails.product}
                            </span>
                          </div>
                        )}
                        {drawerDetails.message !== '-' && (
                          <div className="flex items-start gap-[0.5vw]">
                            <span className="text-[#555555] font-normal w-[5.5vw]">Description</span>
                            <span className="text-slate-800 font-normal flex-1">
                              {drawerDetails.message}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Section 4: Internal Notes */}
                <div className="pt-[0.4vw] border-t border-[#F3F3F3]">
                  <h4 className="text-[1.02vw] font-medium text-[#111827] mb-[0.65vw]">
                    Internal Notes
                  </h4>
                  <div className="space-y-[0.4vw]">
                    {Array.isArray(selectedLead.internalNotes) && selectedLead.internalNotes.length > 0 ? (
                      [...selectedLead.internalNotes].reverse().map((note, idx) => {
                        const noteKey = note.noteId || note._id || idx;
                        const isEditing = editingNoteId === noteKey;
                        const isMenuOpen = activeNoteMenuId === noteKey;
                        return (
                          <div key={noteKey} className="relative flex items-start gap-[0.45vw]">
                            <div className="flex-1 px-[0.75vw] py-[0.55vw] bg-[#F3F4F6] rounded-[0.45vw] text-[0.88vw] text-[#4B5563]">
                              {isEditing ? (
                                <div className="space-y-[0.4vw]">
                                  <textarea
                                    value={editingNoteText}
                                    onChange={(e) => setEditingNoteText(e.target.value)}
                                    rows={2}
                                    className="w-full p-[0.4vw] text-[0.74vw] bg-white border border-slate-300 rounded-[0.35vw] focus:outline-none focus:border-[#EC5137]"
                                    autoFocus
                                  />
                                  <div className="flex items-center justify-end gap-[0.4vw]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingNoteId(null);
                                        setEditingNoteText('');
                                      }}
                                      className="px-[0.55vw] py-[0.2vw] text-[0.68vw] text-slate-600 hover:text-slate-800 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const trimmed = editingNoteText.trim();
                                        if (!trimmed) return;
                                        const updateNotes = (notes = []) =>
                                          notes.map((n, i) =>
                                            (n.noteId || n._id || i) === noteKey ? { ...n, text: trimmed } : n
                                          );
                                        setSelectedLead((prev) =>
                                          prev ? { ...prev, internalNotes: updateNotes(prev.internalNotes) } : prev
                                        );
                                        setLeads((prev) =>
                                          prev.map((l) =>
                                            (l.leadId || l._id) === (selectedLead.leadId || selectedLead._id)
                                              ? { ...l, internalNotes: updateNotes(l.internalNotes) }
                                              : l
                                          )
                                        );
                                        setEditingNoteId(null);
                                        setEditingNoteText('');
                                      }}
                                      className="px-[0.65vw] py-[0.22vw] text-[0.68vw] font-medium bg-[#EC5137] text-white rounded-[0.3vw] hover:opacity-90 cursor-pointer"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="leading-relaxed">{note.text}</p>
                              )}
                            </div>

                            <div className="relative shrink-0 note-menu-container">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNoteMenuId(isMenuOpen ? null : noteKey);
                                }}
                                className="w-[1.9vw] h-[1.9vw] bg-[#F3F4F6] hover:bg-slate-200 rounded-[0.45vw] flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                                title="Note options"
                              >
                                <Icon icon="akar-icons:more-vertical-fill" className="w-[0.8vw] h-[0.8vw]" />
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 mt-[0.25vw] w-[7.2vw] min-w-[105px] bg-white border border-slate-200 rounded-[0.45vw] shadow-lg py-[0.25vw] z-50">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(noteKey);
                                      setEditingNoteText(note.text || '');
                                      setActiveNoteMenuId(null);
                                    }}
                                    className="w-full text-left px-[0.72vw] py-[0.38vw] text-[0.78vw] text-slate-700 hover:bg-slate-50 flex items-center gap-[0.4vw] cursor-pointer"
                                  >
                                    <Icon icon="solar:pen-linear" className="w-[0.82vw] h-[0.82vw] text-slate-500" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filterNotes = (notes = []) =>
                                        notes.filter((n, i) => (n.noteId || n._id || i) !== noteKey);
                                      setSelectedLead((prev) =>
                                        prev ? { ...prev, internalNotes: filterNotes(prev.internalNotes) } : prev
                                      );
                                      setLeads((prev) =>
                                        prev.map((l) =>
                                          (l.leadId || l._id) === (selectedLead.leadId || selectedLead._id)
                                            ? { ...l, internalNotes: filterNotes(l.internalNotes) }
                                            : l
                                        )
                                      );
                                      setActiveNoteMenuId(null);
                                    }}
                                    className="w-full text-left px-[0.72vw] py-[0.38vw] text-[0.78vw] text-red-600 hover:bg-red-50 flex items-center gap-[0.4vw] cursor-pointer"
                                  >
                                    <Icon icon="solar:trash-bin-minimalistic-linear" className="w-[0.82vw] h-[0.82vw]" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-[0.8vw] text-center text-slate-400 text-[0.76vw] italic bg-slate-50/50 rounded-[0.4vw] border border-dashed border-slate-200">
                        No internal notes added yet.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setNewNoteText('');
                        setIsAddingNote(true);
                      }}
                      className="w-full py-[0.58vw] text-[0.88vw] font-medium text-[#F05338] bg-[#FFE8E2] hover:bg-[#FFD9CF] rounded-[0.4vw] transition-colors flex items-center justify-center gap-[0.35vw] cursor-pointer"
                    >
                      <Icon icon="solar:add-circle-linear" className="w-[0.95vw] h-[0.95vw]" />
                      <span>Add Notes</span>
                    </button>
                  </div>
                </div>

                {/* Section 5: Activity and Timeline */}
                <div className="pt-[0.4vw] border-t border-[#F3F3F3]">
                  <h4 className="text-[0.9vw] font-medium text-[#111827] mb-[0.65vw]">
                    Activity and Timeline
                  </h4>
                  <div className="relative pl-[1.35vw] space-y-[1vw]">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[0.425vw] -translate-x-1/2 top-[0.45vw] bottom-[0.45vw] w-[2px] bg-[#EF5335]/80" />

                    {(() => {
                      const timelineList = getFullTimeline(selectedLead);
                      return timelineList.map((item, idx) => {
                        const isLast = idx === timelineList.length - 1;
                        return (
                          <div key={idx} className="relative flex items-start gap-[0.6vw]">
                            <div
                              className={`absolute -left-[1.35vw] top-[0.18vw] w-[0.85vw] h-[0.85vw] rounded-full ${
                                isLast && timelineList.length > 2 ? 'bg-[#D1D5DB]' : 'bg-[#EF5335]'
                              }`}
                            />
                            <div>
                              <div className="text-[0.82vw] font-normal text-[#374151] leading-snug">
                                {item.title}
                              </div>
                              <div className="text-[0.8vw] text-[#555555] mt-[0.15vw]">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
              </motion.aside>
              </React.Fragment>
            );
        })()}
        </AnimatePresence>
        {/* Add Activity Modal Dialog */}
        <AnimatePresence>
          {isActivityModalOpen && (
            <div className="modal-container fixed inset-0 z-[200] flex items-center justify-center p-[1vw] bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-[400px] max-w-[92vw] bg-white rounded-xl shadow-2xl px-5 py-3.5 flex flex-col gap-3 relative border border-slate-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FDEEE9] flex items-center justify-center text-[#E54833] shrink-0">
                      <Icon icon="carbon:activity" className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Add Activity
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(false)}
                    className="p-1 text-[#9c9c9c] hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <Icon icon="iconoir:cancel" className="w-5 h-5" />
                  </button>
                </div>

                {/* Field 1: Activity Type Free Text Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">
                    Activity Type
                  </label>
                  <input
                    type="text"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    placeholder="e.g. Note, Call, Meeting, Follow-up..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#9c9c9c] rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#E54833] transition-colors"
                  />
                </div>

                {/* Field 2: Details Textarea */}
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">
                    Details
                  </label>
                  <textarea
                    value={activityDetails}
                    onChange={(e) => setActivityDetails(e.target.value)}
                    placeholder="Describe the activity..."
                    rows={3}
                    className="w-full p-3 text-sm bg-white border border-[#9c9c9c] rounded-lg placeholder-slate-400 focus:outline-none focus:border-[#E54833] transition-colors resize-none"
                  />
                </div>

                {/* Bottom Action Buttons: Cancel & Save Activity */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(false)}
                    className="flex items-center gap-[0.3vw] px-[1vw] py-[0.5vw] text-[0.88vw] font-medium text-slate-600 bg-white border border-[#9c9c9c] hover:bg-slate-50 rounded-[0.45vw] transition-colors cursor-pointer"
                  >
                    <Icon icon="iconoir:cancel" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveActivity}
                    className="flex items-center gap-[0.35vw] px-[1.1vw] py-[0.5vw] text-[0.88vw] font-semibold text-white bg-[#E54833] hover:bg-[#d63e2a] rounded-[0.45vw] shadow-sm transition-colors cursor-pointer"
                  >
                    <Icon icon="charm:tick" className="w-[0.9vw] h-[0.9vw] text-white" />
                    <span>Save Activity</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Notes Modal Dialog */}
        <AnimatePresence>
          {isAddingNote && (
            <div className="modal-container fixed inset-0 z-[200] flex items-center justify-center p-[1vw] bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-[400px] max-w-[92vw] bg-white rounded-xl shadow-2xl px-5 py-3.5 flex flex-col gap-3 relative border border-slate-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FDEEE9] flex items-center justify-center text-[#E54833] shrink-0">
                      <Icon icon="fluent:notepad-edit-16-regular" className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Add Notes
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteText('');
                    }}
                    className="p-1 text-[#9c9c9c] hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <Icon icon="iconoir:cancel" className="w-5 h-5" />
                  </button>
                </div>

                {/* Field: Note Textarea */}
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">
                    Enter New Note
                  </label>
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter internal note..."
                    rows={3}
                    className="w-full p-3 text-sm bg-white border border-[#9c9c9c] rounded-lg placeholder-slate-400 focus:outline-none focus:border-[#E54833] transition-colors resize-none"
                  />
                </div>

                {/* Bottom Action Buttons: Cancel & Save Note */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteText('');
                    }}
                    className="flex items-center gap-[0.3vw] px-[1vw] py-[0.5vw] text-[0.88vw] font-medium text-slate-600 bg-white border border-[#9c9c9c] hover:bg-slate-50 rounded-[0.45vw] transition-colors cursor-pointer"
                  >
                    <Icon icon="iconoir:cancel" className="w-[0.85vw] h-[0.85vw] text-slate-500" />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="button"
                    disabled={!newNoteText.trim()}
                    onClick={handleSaveNote}
                    className={`flex items-center gap-[0.35vw] px-[1.1vw] py-[0.5vw] text-[0.88vw] font-semibold text-white rounded-[0.45vw] shadow-sm transition-colors ${
                      newNoteText.trim()
                        ? 'bg-[#E54833] hover:bg-[#d63e2a] cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Icon icon="charm:tick" className="w-[0.9vw] h-[0.9vw] text-white" />
                    <span>Save Note</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal for Status Change */}
        <AnimatePresence>
          {statusChangeConfirm && (
            <div className="modal-container fixed inset-0 z-[200] flex items-center justify-center p-[1vw] bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-[380px] max-w-[92vw] bg-white rounded-xl shadow-2xl p-5 flex flex-col gap-3 relative border border-slate-100"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                      <Icon icon="mingcute:alert-line" className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Confirm Status Change
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStatusChangeConfirm(null)}
                    className="p-1 text-[#9c9c9c] hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <Icon icon="iconoir:cancel" className="w-5 h-5" />
                  </button>
                </div>

                {/* Message */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  Change lead status from{' '}
                  <span className="font-semibold text-slate-900">
                    {statusChangeConfirm.currentStatus}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-[#E54833]">
                    {statusChangeConfirm.newStatus}
                  </span>
                  ?
                </p>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStatusChangeConfirm(null)}
                    className="px-3.5 py-1.5 text-sm font-medium text-slate-600 bg-white border border-[#9c9c9c] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={confirmStatusUpdate}
                    className="px-4 py-1.5 text-sm font-semibold text-white bg-[#E54833] hover:bg-[#d63e2a] rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
