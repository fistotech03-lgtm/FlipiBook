import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Icon } from '@iconify/react';
import { initialNotifications } from './notificationData';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications: externalNotifications,
  onUnreadCountChange,
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'

  // Sync external notifications if passed
  useEffect(() => {
    if (externalNotifications && Array.isArray(externalNotifications)) {
      setNotifications(externalNotifications);
    }
  }, [externalNotifications]);

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

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const handleItemClick = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
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

  return (
    <>
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
