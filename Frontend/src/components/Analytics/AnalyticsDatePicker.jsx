import React, { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Icon } from '@iconify/react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format date as "11 Nov, 2026"
 */
function formatDisplayDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const month = SHORT_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

/**
 * Custom Date Range Picker Component
 * Props:
 * - startDate: Date | null
 * - endDate: Date | null
 * - onChange: ({ startDate, endDate }) => void
 */
const AnalyticsDatePicker = forwardRef(function AnalyticsDatePicker({
  startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  endDate = new Date(),
  onChange,
  className = '',
  defaultOpen = false
}, ref) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useRef(null);
  const presetsScrollRef = useRef(null);

  // Expose imperative methods like open()
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
    isOpen: () => isOpen
  }));

  // Temporary selection state when popover is open
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [hoverDate, setHoverDate] = useState(null);

  // Current calendar view (month and year)
  const [viewMonth, setViewMonth] = useState((startDate || new Date()).getMonth());
  const [viewYear, setViewYear] = useState((startDate || new Date()).getFullYear());

  // Keep in sync with incoming props
  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
    if (startDate) {
      setViewMonth(startDate.getMonth());
      setViewYear(startDate.getFullYear());
    }
  }, [startDate, endDate]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Generate calendar grid
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        date: new Date(viewYear, viewMonth - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        day: i,
        date: new Date(viewYear, viewMonth, i),
        isCurrentMonth: true,
      });
    }

    // Next month filler
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        date: new Date(viewYear, viewMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [viewMonth, viewYear]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isInRange = (d) => {
    if (!tempStart) return false;
    const targetTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const startTime = new Date(tempStart.getFullYear(), tempStart.getMonth(), tempStart.getDate()).getTime();

    const effectiveEnd = tempEnd || hoverDate;
    if (!effectiveEnd) {
      return targetTime === startTime;
    }

    const endTime = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth(), effectiveEnd.getDate()).getTime();
    const minTime = Math.min(startTime, endTime);
    const maxTime = Math.max(startTime, endTime);

    return targetTime >= minTime && targetTime <= maxTime;
  };

  const handleDayClick = (date) => {
    if (!tempStart || (tempStart && tempEnd)) {
      // First click in a new selection
      setTempStart(date);
      setTempEnd(null);
      setHoverDate(null);
    } else if (tempStart && !tempEnd) {
      // Second click finishes the range
      if (date < tempStart) {
        setTempEnd(tempStart);
        setTempStart(date);
      } else {
        setTempEnd(date);
      }
      setHoverDate(null);
    }
  };

  const applyRange = () => {
    if (tempStart && tempEnd) {
      onChange && onChange({ startDate: tempStart, endDate: tempEnd });
    } else if (tempStart && !tempEnd) {
      onChange && onChange({ startDate: tempStart, endDate: tempStart });
    }
    setIsOpen(false);
  };

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setTempStart(start);
    setTempEnd(end);
    setViewMonth(start.getMonth());
    setViewYear(start.getFullYear());
    onChange && onChange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  const displayLabel = useMemo(() => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    }
    if (startDate) return formatDisplayDate(startDate);
    return 'Select Date Range';
  }, [startDate, endDate]);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-[0.55vw] px-[1.1vw] py-[0.52vw] bg-white border border-slate-200 rounded-[0.4vw] text-[0.78vw] text-[#555555] hover:border-slate-300 transition-colors cursor-pointer whitespace-nowrap select-none"
      >
        <Icon icon="ic:outline-calendar-month" className="w-[1vw] h-[1vw] text-[#EC5137] shrink-0" />
        <span className="text-slate-300">|</span>
        <span className="text-[#555555]">{displayLabel}</span>
      </button>

      {/* Popover Calendar Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-[0.3vw] z-[120] w-[18vw] min-w-[270px] max-w-[320px] bg-white border border-slate-200/90 rounded-[0.7vw] shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-[0.9vw] text-slate-800 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-[0.5vw] border-b border-slate-100">
            <span className="text-[0.82vw] font-bold text-slate-900 tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-[0.2vw]">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-[0.3vw] rounded-[0.3vw] text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Previous Month"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="w-[0.8vw] h-[0.8vw]" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-[0.3vw] rounded-[0.3vw] text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Next Month"
              >
                <Icon icon="solar:alt-arrow-right-linear" className="w-[0.8vw] h-[0.8vw]" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons with horizontal scroll & chevron */}
          <div className="relative flex items-center py-[0.45vw] border-b border-slate-100">
            <div
              ref={presetsScrollRef}
              className="flex items-center gap-[0.35vw] overflow-x-auto scrollbar-none scroll-smooth flex-1 pr-[1.4vw]"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { label: 'Today', days: 1 },
                { label: 'Yesterday', days: 2 },
                { label: '7 Days', days: 7 },
                { label: '14 Days', days: 14 },
                { label: '30 Days', days: 30 },
                { label: '90 Days', days: 90 },
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset.days)}
                  className="px-[0.55vw] py-[0.22vw] text-[0.66vw] rounded-[0.25vw] bg-slate-100 text-slate-700 hover:bg-[#F05338] hover:text-white font-medium transition-colors shrink-0 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Scroll Right Chevron Arrow */}
            <button
              type="button"
              onClick={() => {
                if (presetsScrollRef.current) {
                  presetsScrollRef.current.scrollBy({ left: 80, behavior: 'smooth' });
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5vw] w-[1.2vw] flex items-center justify-center bg-gradient-to-l from-white via-white to-transparent text-slate-500 hover:text-slate-900 cursor-pointer z-10"
              title="More presets"
            >
              <Icon icon="solar:alt-arrow-right-linear" className="w-[0.7vw] h-[0.7vw]" />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-[0.2vw] py-[0.4vw] text-center text-[0.64vw] font-semibold text-slate-400">
            {DAYS.map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-[0.15vw]">
            {daysInMonth.map((cell, idx) => {
              const isStart = isSameDay(cell.date, tempStart);
              const isEnd = isSameDay(cell.date, tempEnd || hoverDate);
              const inRange = isInRange(cell.date);
              const isToday = isSameDay(cell.date, new Date());
              const colIndex = idx % 7;
              const isRowStart = colIndex === 0;
              const isRowEnd = colIndex === 6;

              return (
                <div
                  key={idx}
                  className={`relative py-[0.05vw] flex items-center justify-center ${
                    inRange && !isStart && !isEnd
                      ? 'bg-orange-50'
                      : inRange && isStart && !isEnd
                      ? 'bg-gradient-to-r from-transparent to-orange-50'
                      : inRange && isEnd && !isStart
                      ? 'bg-gradient-to-l from-transparent to-orange-50'
                      : ''
                  } ${
                    inRange && isRowStart ? 'rounded-l-[0.3vw]' : ''
                  } ${
                    inRange && isRowEnd ? 'rounded-r-[0.3vw]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleDayClick(cell.date)}
                    onMouseEnter={() => !tempEnd && setHoverDate(cell.date)}
                    className={`w-[1.7vw] h-[1.7vw] min-w-[24px] min-h-[24px] rounded-[0.35vw] text-[0.68vw] font-medium flex items-center justify-center transition-all cursor-pointer select-none ${
                      !cell.isCurrentMonth
                        ? 'text-slate-300'
                        : isStart || isEnd
                        ? 'text-white'
                        : inRange
                        ? 'text-[#E54833] font-semibold'
                        : 'text-slate-700'
                    } ${
                      isStart || isEnd
                        ? 'bg-[#E54833] shadow-xs font-semibold z-10'
                        : inRange
                        ? 'hover:bg-orange-100'
                        : 'hover:bg-slate-100'
                    } ${isToday && !isStart && !isEnd && !inRange ? 'border border-[#E54833]/50 font-semibold' : ''}`}
                  >
                    {cell.day}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end pt-[0.55vw] mt-[0.5vw] border-t border-slate-100 text-[0.68vw]">
            <div className="flex items-center gap-[0.35vw] shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-[0.55vw] py-[0.25vw] text-slate-600 hover:text-slate-900 rounded-[0.3vw] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyRange}
                className="px-[0.75vw] py-[0.25vw] bg-[#E54833] hover:bg-[#d63e2a] text-white rounded-[0.3vw] font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AnalyticsDatePicker;
