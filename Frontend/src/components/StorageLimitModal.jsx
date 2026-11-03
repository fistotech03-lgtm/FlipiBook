import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, AlertTriangle } from 'lucide-react';
import { formatStorageMB } from '../utils/storageValidation';

const StorageLimitModal = ({
  isOpen,
  onClose,
  storage,
  requiredSize = 0,
  isFull = false,
  onUpgrade
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const used = storage?.used || 0;
  const total = storage?.total > 0 ? storage.total : 300 * 1024 * 1024;
  const available = Math.max(0, total - used);
  const storagePercent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  const usedFormatted = formatStorageMB(used);
  const totalFormatted = formatStorageMB(total);
  const availableFormatted = formatStorageMB(available);
  const requiredFormatted = formatStorageMB(requiredSize);

  const handleUpgradeClick = () => {
    try {
      localStorage.removeItem('hide_upgrade_card');
      sessionStorage.removeItem('hide_upgrade_card');
    } catch (e) {}

    if (onUpgrade) {
      onUpgrade();
    } else {
      onClose();
      navigate('/settings/profile');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-[1vw] bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="bg-white rounded-[1.2vw] shadow-[0_1.5vw_4vw_rgba(0,0,0,0.18)] border border-slate-100 w-full max-w-[26vw] overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200 relative select-none"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-[1vw] right-[1vw] text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-[0.35vw] rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size="1vw" strokeWidth={2.2} />
        </button>

        <div className="p-[1.8vw] pb-[1.4vw] flex flex-col items-center text-center">
          {/* Top Storage Icon Badge */}
          <div className="w-[3.6vw] h-[3.6vw] rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#ea543a] mb-[1vw] shadow-xs">
            <div className="relative flex items-center justify-center">
              <svg width="1.8vw" height="1.8vw" viewBox="0 0 24 24" fill="none" stroke="#ea543a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="8.5" ry="2.8" />
                <path d="M3.5 5v7c0 1.55 3.8 2.8 8.5 2.8s8.5-1.25 8.5-2.8V5" />
                <path d="M3.5 12v7c0 1.55 3.8 2.8 8.5 2.8s8.5-1.25 8.5-2.8v-7" />
              </svg>
              <div className="absolute -top-[0.15vw] -right-[0.15vw] w-[0.55vw] h-[0.55vw] bg-[#ea543a] rounded-full ring-[0.15vw] ring-white"></div>
            </div>
          </div>

          {/* Heading */}
          <h3 className="text-[1.2vw] font-bold text-gray-900 tracking-tight mb-[0.4vw]">
            {isFull ? 'Storage Space Full' : 'Storage Limit Exceeded'}
          </h3>

          {/* Descriptive Message */}
          <p className="text-[0.78vw] text-gray-500 leading-relaxed mb-[1.2vw] px-[0.5vw]">
            {isFull ? (
              <>
                You have reached your total storage capacity of <strong className="text-gray-700">{totalFormatted}</strong>. No more storage space is available to upload new files.
              </>
            ) : requiredSize > 0 ? (
              <>
                Uploading this file requires <strong className="text-gray-700">{requiredFormatted}</strong>, but you only have <strong className="text-gray-700">{availableFormatted}</strong> available.
              </>
            ) : (
              <>
                Uploading this document will exceed your allocated storage capacity. Please upgrade your plan to continue uploading.
              </>
            )}
          </p>

          {/* Storage Widget Card (Matches screenshot layout) */}
          <div className="w-full bg-[#f8f9fb] border border-gray-200/80 rounded-[0.8vw] p-[1vw] text-left mb-[1.2vw] shadow-2xs">
            {/* Top Row: Icon + Storage title + percentage */}
            <div className="flex items-center justify-between mb-[0.5vw]">
              <div className="flex items-center gap-[0.5vw]">
                <div className="relative flex items-center justify-center">
                  <svg width="1vw" height="1vw" viewBox="0 0 24 24" fill="none" stroke="#ea543a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="8.5" ry="2.8" />
                    <path d="M3.5 5v7c0 1.55 3.8 2.8 8.5 2.8s8.5-1.25 8.5-2.8V5" />
                    <path d="M3.5 12v7c0 1.55 3.8 2.8 8.5 2.8s8.5-1.25 8.5-2.8v-7" />
                  </svg>
                  <div className="absolute -top-[0.08vw] -right-[0.1vw] w-[0.35vw] h-[0.35vw] bg-[#ea543a] rounded-full ring-2 ring-white"></div>
                </div>
                <span className="text-[0.85vw] font-semibold text-[#374151]">Storage</span>
              </div>
              <span className="text-[0.8vw] font-bold text-[#ea543a]">{storagePercent}%</span>
            </div>

            {/* Coral/Red Progress Bar */}
            <div className="w-full h-[0.4vw] bg-[#e5e7eb] rounded-full overflow-hidden mb-[0.5vw]">
              <div
                className="h-full bg-[#ea543a] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, storagePercent)}%` }}
              />
            </div>

            {/* Bottom Row Stats */}
            <div className="flex items-center justify-between text-[0.72vw] text-[#4b5563] font-semibold">
              <span>{usedFormatted} of {totalFormatted} used</span>
              <span className="text-gray-400 font-normal">({availableFormatted} free)</span>
            </div>
          </div>

          {/* Intimation callout */}
          <div className="w-full flex items-center gap-[0.5vw] text-amber-700 bg-amber-50/80 border border-amber-200/70 rounded-[0.5vw] px-[0.8vw] py-[0.5vw] text-[0.72vw] mb-[1.4vw] text-left">
            <AlertTriangle size="0.95vw" className="text-amber-500 flex-shrink-0" />
            <span>Upgrade your plan to unlock more storage and unlimited uploads.</span>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex items-center gap-[0.8vw]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-[0.65vw] px-[1vw] border border-gray-300 text-gray-700 font-semibold rounded-[0.6vw] text-[0.82vw] hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpgradeClick}
              className="flex-[1.4] py-[0.65vw] px-[1vw] bg-gradient-to-r from-[#ea543a] to-[#d9482f] text-white font-semibold rounded-[0.6vw] text-[0.82vw] shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-[0.45vw] cursor-pointer"
            >
              <span>Upgrade Plan</span>
              <ArrowRight size="0.9vw" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StorageLimitModal;
