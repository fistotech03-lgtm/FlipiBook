import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { X } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../context/AuthContext';
import { resolveUploadsPath } from '../../utils/assets/assetUtils';
import notificationSound from '../../assets/Notification/Notification.mp3';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return '';
  const ts = new Date(dateValue).getTime();
  if (Number.isNaN(ts)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(ts).toLocaleDateString();
};

const isTodayDate = (dateValue) => {
  if (!dateValue) return true;
  const d = new Date(dateValue);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

export default function NotificationDrawer({
  isOpen,
  onClose,
  onOpen,
  notifications: externalNotifications,
  onUnreadCountChange,
}) {
  const { user } = useAuth();
  const userEmail = (user?.emailId || user?.email || '').trim().toLowerCase();

  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [toastNotification, setToastNotification] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const playedIdsRef = useRef(new Set());
  const toastTimerRef = useRef(null);
  const toastClearTimerRef = useRef(null);

  const mapNotificationDoc = useCallback((n) => ({
    id: n._id,
    type: n.type,
    title: n.title,
    detail: n.detail || '',
    time: formatRelativeTime(n.createdAt),
    timestamp: n.createdAt ? new Date(n.createdAt).getTime() : Date.now(),
    unread: !n.isRead,
    avatar: n.actorPicture ? resolveUploadsPath(n.actorPicture) : null,
    group: isTodayDate(n.createdAt) ? 'Today' : 'Earlier',
    bookId: n.bookId || '',
    bookUrl: n.bookUrl || '',
  }), []);

  const fetchNotifications = useCallback(async () => {
    if (!userEmail) {
      setNotifications([]);
      return;
    }
    try {
      const res = await axios.get(`${BACKEND_URL}/api/notifications`, {
        params: { email: userEmail },
        withCredentials: true,
      });
      if (res.data?.success && Array.isArray(res.data.notifications)) {
        setNotifications(res.data.notifications.map(mapNotificationDoc));
      }
    } catch (err) {
      console.warn('[NotificationDrawer] Failed to fetch notifications:', err?.message);
    }
  }, [userEmail, mapNotificationDoc]);

  useEffect(() => {
    if (externalNotifications && Array.isArray(externalNotifications)) {
      setNotifications(externalNotifications);
      return;
    }
    fetchNotifications();
  }, [externalNotifications, fetchNotifications]);

  // Real-time Socket.IO subscription for instant notifications
  useEffect(() => {
    if (!userEmail || externalNotifications) return;

    const socket = io(BACKEND_URL || undefined, {
      path: '/socket.io',
      auth: { email: userEmail },
      withCredentials: true,
      transports: ['polling', 'websocket'],
    });

    const handleNewNotification = (doc) => {
      if (!doc || !doc._id) return;
      const mapped = mapNotificationDoc(doc);
      if (!playedIdsRef.current.has(mapped.id)) {
        playedIdsRef.current.add(mapped.id);
        try {
          const audio = new Audio(notificationSound);
          audio.volume = 0.7;
          audio.play().catch(() => {});
        } catch {
          // Ignore browser autoplay restrictions
        }

        // Show floating rounded notification card below navbar when drawer is closed
        if (!isOpen) {
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          if (toastClearTimerRef.current) clearTimeout(toastClearTimerRef.current);
          setToastNotification(mapped);
          setIsToastVisible(false);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsToastVisible(true);
            });
          });
          toastTimerRef.current = setTimeout(() => {
            setIsToastVisible(false);
            toastClearTimerRef.current = setTimeout(() => {
              setToastNotification(null);
            }, 320);
          }, 4500);
        }
      }
      setNotifications((prev) => {
        if (prev.some((item) => item.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.disconnect();
    };
  }, [userEmail, externalNotifications, mapNotificationDoc, isOpen]);

  // Hide floating toast card if drawer opens, and clean up timers on unmount
  useEffect(() => {
    if (isOpen && toastNotification) {
      setIsToastVisible(false);
      setToastNotification(null);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastClearTimerRef.current) clearTimeout(toastClearTimerRef.current);
    }
  }, [isOpen, toastNotification]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastClearTimerRef.current) clearTimeout(toastClearTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOpen && !externalNotifications) {
      fetchNotifications();
    }
  }, [isOpen, externalNotifications, fetchNotifications]);

  // Compute unread counts
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  const allCount = notifications.length;

  // Inform parent of unread count if callback provided
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    if (!userEmail || externalNotifications) return;
    try {
      await axios.patch(
        `${BACKEND_URL}/api/notifications/read-all`,
        { email: userEmail },
        { withCredentials: true }
      );
    } catch (err) {
      console.warn('[NotificationDrawer] Failed to mark all as read:', err?.message);
    }
  };

  const handleItemClick = async (id) => {
    const clicked = notifications.find((n) => n.id === id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
    if (userEmail && !externalNotifications && clicked?.unread) {
      try {
        await axios.patch(
          `${BACKEND_URL}/api/notifications/${id}/read`,
          { email: userEmail },
          { withCredentials: true }
        );
      } catch (err) {
        console.warn('[NotificationDrawer] Failed to mark notification as read:', err?.message);
      }
    }

    if (clicked?.type === 'book_published') {
      const targetUrl = clicked.bookUrl || (clicked.bookId ? `/share/${clicked.bookId}` : '');
      if (targetUrl) {
        if (onClose) onClose();
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => n.unread);
    }
    return notifications;
  }, [notifications, activeTab]);

  const todayList = useMemo(() => {
    return filteredNotifications.filter((n) => n.group === 'Today');
  }, [filteredNotifications]);

  const earlierList = useMemo(() => {
    return filteredNotifications.filter((n) => n.group === 'Earlier');
  }, [filteredNotifications]);

  const renderIconOrAvatar = (item) => {
    if (item.avatar) {
      return (
        <img
          src={item.avatar}
          alt={item.title}
          className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-full object-cover shrink-0 border border-gray-100 shadow-xs"
        />
      );
    }

    if (item.type === 'book_published') {
      return (
        <div className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-[0.6vw] bg-[#FFF2EE] flex items-center justify-center shrink-0">
          <Icon icon="lucide:book-open" className="w-[1.2vw] h-[1.2vw] min-w-[17px] min-h-[17px] text-[#EC5137]" />
        </div>
      );
    }

    if (item.type === 'new_follower' || item.type === 'follow') {
      return (
        <div className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-[0.6vw] bg-[#EFF6FF] flex items-center justify-center shrink-0">
          <Icon icon="lucide:user-plus" className="w-[1.2vw] h-[1.2vw] min-w-[17px] min-h-[17px] text-[#2563EB]" />
        </div>
      );
    }

    if (item.type === 'pdf') {
      return (
        <div className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-[0.6vw] bg-[#FDE8E8] flex items-center justify-center shrink-0">
          <Icon icon="bi:file-earmark-pdf-fill" className="w-[1.2vw] h-[1.2vw] min-w-[17px] min-h-[17px] text-[#E02424]" />
        </div>
      );
    }

    if (item.type === 'views') {
      return (
        <div className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-[0.6vw] bg-[#E1EFFE] flex items-center justify-center shrink-0">
          <Icon icon="carbon:view" className="w-[1.2vw] h-[1.2vw] min-w-[17px] min-h-[17px] text-[#1C64F2]" />
        </div>
      );
    }

    if (item.type === 'comment') {
      return (
        <div className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-[0.6vw] bg-[#FEF08A]/40 flex items-center justify-center shrink-0">
          <Icon icon="fluent:chat-20-filled" className="w-[1.2vw] h-[1.2vw] min-w-[17px] min-h-[17px] text-[#D97706]" />
        </div>
      );
    }

    // Default bell or alert
    return (
      <div className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-[0.6vw] bg-gray-100 flex items-center justify-center shrink-0">
        <Icon icon="lucide:bell" className="w-[1.2vw] h-[1.2vw] min-w-[17px] min-h-[17px] text-gray-500" />
      </div>
    );
  };

  const renderItem = (item) => (
    <div
      key={item.id}
      onClick={() => handleItemClick(item.id)}
      className="flex items-start justify-between gap-[0.75vw] p-[0.65vw] rounded-[0.75vw] hover:bg-gray-50/80 transition-colors cursor-pointer group"
    >
      <div className="flex items-start gap-[0.75vw] min-w-0 flex-1">
        {renderIconOrAvatar(item)}
        <div className="flex flex-col min-w-0 pr-[0.3vw]">
          <h4 className="text-[clamp(12px,0.85vw,15px)] font-semibold text-gray-900 leading-snug group-hover:text-black">
            {item.title}
          </h4>
          {item.detail ? (
            <p className="text-[clamp(11px,0.75vw,13px)] text-gray-400 font-normal leading-relaxed mt-[0.2vh] truncate">
              {item.detail}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-[0.35vw] shrink-0 pt-[0.2vh]">
        <span className="text-[clamp(10px,0.72vw,12px)] text-gray-400 font-normal whitespace-nowrap">
          {item.time}
        </span>
        {item.unread && (
          <span className="w-[0.45vw] h-[0.45vw] min-w-[6px] min-h-[6px] rounded-full bg-[#1877F2] shrink-0" />
        )}
      </div>
    </div>
  );

  const dismissToastSmoothly = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (toastClearTimerRef.current) clearTimeout(toastClearTimerRef.current);
    setIsToastVisible(false);
    toastClearTimerRef.current = setTimeout(() => {
      setToastNotification(null);
    }, 320);
  };

  const handleToastCardClick = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (toastClearTimerRef.current) clearTimeout(toastClearTimerRef.current);
    setIsToastVisible(false);
    setToastNotification(null);
    if (onOpen) onOpen();
  };

  return (
    <>
      {/* Floating Rounded Notification Toast Card (Top-Right below Navbar) */}
      {toastNotification && !isOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleToastCardClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleToastCardClick();
          }}
          className={`fixed top-[8vh] right-[1.4vw] z-[95] w-[23vw] min-w-[280px] max-w-[400px] bg-white rounded-[1.1vw] border border-gray-200/90 shadow-[0_0.8vw_2vw_rgba(0,0,0,0.14)] px-[0.9vw] py-[1.1vh] flex items-center gap-[0.7vw] cursor-pointer hover:bg-gray-50/90 transition-all duration-300 ease-out transform ${
            isToastVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-[1.2vh] scale-95 pointer-events-none'
          }`}
        >
          {toastNotification.avatar ? (
            <img
              src={toastNotification.avatar}
              alt={toastNotification.title}
              className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-full object-cover shrink-0 border border-gray-100 shadow-xs"
            />
          ) : toastNotification.type === 'book_published' ? (
            <div className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-full bg-[#FFF2EE] flex items-center justify-center shrink-0">
              <Icon icon="lucide:book-open" className="w-[1.15vw] h-[1.15vw] min-w-[16px] min-h-[16px] text-[#EC5137]" />
            </div>
          ) : (
            <div className="w-[2.4vw] h-[2.4vw] min-w-[34px] min-h-[34px] rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <Icon icon="lucide:user-plus" className="w-[1.15vw] h-[1.15vw] min-w-[16px] min-h-[16px] text-[#2563EB]" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[clamp(12px,0.85vw,15px)] font-semibold text-gray-900 leading-snug line-clamp-1">
              {toastNotification.title}
            </p>
            {toastNotification.detail ? (
              <p className="text-[clamp(11px,0.75vw,13px)] text-gray-500 truncate mt-[0.2vh]">
                {toastNotification.detail}
              </p>
            ) : (
              <p className="text-[clamp(10px,0.7vw,12px)] text-gray-400 mt-[0.2vh]">Just now</p>
            )}
          </div>

          <div className="flex items-center gap-[0.4vw] shrink-0">
            <span className="w-[0.45vw] h-[0.45vw] min-w-[6px] min-h-[6px] rounded-full bg-[#1877F2]" />
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={(e) => {
                e.stopPropagation();
                dismissToastSmoothly();
              }}
              className="p-[0.25vw] rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-[0.95vw] h-[0.95vw] min-w-[14px] min-h-[14px]" />
            </button>
          </div>
        </div>
      )}

      {/* Backdrop overlay - positioned below navbar so navbar remains uncovered */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed top-14 sm:top-16 md:top-[7vh] bottom-0 left-0 right-0 bg-black/20 backdrop-blur-[1px] z-[80] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-in Drawer from Right - positioned below navbar */}
      <aside
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        className={`fixed top-14 sm:top-16 md:top-[7vh] right-0 bottom-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[93vh] w-[85vw] sm:w-[26vw] min-w-[320px] max-w-[440px] bg-white border-l border-gray-200/80 shadow-[-1vw_0_2.5vw_rgba(0,0,0,0.12)] z-[90] flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-[1.3vw] pt-[2.2vh] pb-[1.4vh] border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-[0.8vw]">
            <div>
              <h2 className="text-[clamp(18px,1.4vw,24px)] font-bold text-gray-900 tracking-tight leading-tight">
                Notifications
              </h2>
              <p className="text-[clamp(11px,0.78vw,13px)] text-gray-400 font-normal mt-[0.3vh]">
                Stay update with your activity
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="p-[0.3vw] rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer -mt-[0.2vh] -mr-[0.2vw]"
            >
              <X className="w-[1.25vw] h-[1.25vw] min-w-[18px] min-h-[18px]" />
            </button>
          </div>

          {/* Filter Pills and Mark as Read */}
          <div className="flex items-center justify-between gap-[0.6vw] mt-[1.6vh] pt-[0.3vh]">
            <div className="flex items-center gap-[0.45vw]">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-[0.8vw] py-[0.45vh] rounded-full text-[clamp(11px,0.75vw,13px)] font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#EC5137] text-white shadow-xs'
                    : 'bg-[#F1F3F5] text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({allCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={`px-[0.8vw] py-[0.45vh] rounded-full text-[clamp(11px,0.75vw,13px)] font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'unread'
                    ? 'bg-[#EC5137] text-white shadow-xs'
                    : 'bg-[#F1F3F5] text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-[clamp(10.5px,0.72vw,12px)] text-gray-400 hover:text-gray-700 hover:underline transition-colors font-normal cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto px-[1vw] py-[1.2vh] space-y-[1.6vh] custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="h-[35vh] flex flex-col items-center justify-center text-gray-400 gap-[1vh]">
              <Icon icon="lucide:bell-off" className="w-[2vw] h-[2vw] min-w-[28px] min-h-[28px] text-gray-300" />
              <p className="text-[clamp(12px,0.85vw,14px)] font-medium text-gray-400">No notifications found</p>
            </div>
          ) : (
            <>
              {/* Today Section */}
              {todayList.length > 0 && (
                <div>
                  <h3 className="text-[clamp(12.5px,0.88vw,15px)] font-bold text-gray-900 px-[0.5vw] mb-[0.6vh]">
                    Today
                  </h3>
                  <div className="space-y-[0.3vh]">
                    {todayList.map(renderItem)}
                  </div>
                </div>
              )}

              {/* Earlier Section */}
              {earlierList.length > 0 && (
                <div className="pt-[1vh]">
                  <h3 className="text-[clamp(12.5px,0.88vw,15px)] font-bold text-gray-900 px-[0.5vw] mb-[0.6vh]">
                    Earlier
                  </h3>
                  <div className="space-y-[0.3vh]">
                    {earlierList.map(renderItem)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
