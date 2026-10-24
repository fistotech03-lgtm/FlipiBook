import React from 'react';
import { Icon } from '@iconify/react';

/**
 * AnalyticsPanel
 * Panel for configuring flipbook analytics and tracking (Google Analytics, stats, etc.)
 * Corresponds to "Analytics" in the CustomizedEditor sidebar.
 */
const AnalyticsPanel = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Header */}
      <div className="h-[8vh] flex items-center justify-between px-[1vw] border-b border-gray-100">
        <div className="flex items-center gap-[0.5vw]">
          <Icon icon="famicons:analytics" className="w-[1.5vw] h-[1.5vw] text-gray-700 font-semibold" />
          <span className="text-[1.1vw] font-semibold text-gray-900">Analytics</span>
        </div>
        <button
          onClick={onBack}
          className="w-[2vw] h-[2vw] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all active:scale-90"
        >
          <Icon icon="ph:arrow-left-bold" className="w-[1.1vw] h-[1.1vw]" />
        </button>
      </div>

      <div className="p-[1.5vw] text-[0.75vw] text-gray-500">
        Analytics and tracking metrics will appear here.
      </div>
    </div>
  );
};

export default AnalyticsPanel;
