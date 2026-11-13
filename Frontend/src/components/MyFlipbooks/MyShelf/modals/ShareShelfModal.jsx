import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const ShareShelfModal = ({
  isOpen,
  onClose,
  selectedFolder,
  shelfId,
  defaultLightType,
  toast
}) => {
  const [shelfLinkCopied, setShelfLinkCopied] = useState(false);

  if (!isOpen) return null;

  const shareShelfUrl = typeof window !== 'undefined'
    ? (shelfId
        ? `${window.location.origin}/shelf/${shelfId}`
        : `${window.location.origin}/my-flipbooks?shelf=${encodeURIComponent(selectedFolder || 'My Shelf')}&light=${defaultLightType === 'Turn off' ? 'off' : 'on'}`)
    : (shelfId
        ? `https://flipibook.com/shelf/${shelfId}`
        : `https://flipibook.com/my-flipbooks?shelf=${encodeURIComponent(selectedFolder || 'My Shelf')}&light=${defaultLightType === 'Turn off' ? 'off' : 'on'}`);

  const handleSocialShare = (appName) => {
    const encUrl = encodeURIComponent(shareShelfUrl);
    const encTitle = encodeURIComponent(`Check out my bookshelf "${selectedFolder || 'My Shelf'}" on FlipiBook!`);
    switch (appName) {
      case 'WhatsApp':
        window.open(`https://api.whatsapp.com/send?text=${encTitle}%20${encUrl}`, '_blank');
        break;
      case 'Facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`, '_blank');
        break;
      case 'X / Twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encTitle}&url=${encUrl}`, '_blank');
        break;
      case 'LinkedIn':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`, '_blank');
        break;
      case 'Pinterest':
        window.open(`https://pinterest.com/pin/create/button/?url=${encUrl}&description=${encTitle}`, '_blank');
        break;
      case 'Telegram':
        window.open(`https://t.me/share/url?url=${encUrl}&text=${encTitle}`, '_blank');
        break;
      case 'Reddit':
        window.open(`https://reddit.com/submit?url=${encUrl}&title=${encTitle}`, '_blank');
        break;
      case 'Email':
        window.open(`mailto:?subject=${encTitle}&body=${encUrl}`, '_blank');
        break;
      case 'Embed':
        if (navigator.clipboard) {
          navigator.clipboard.writeText(`<iframe src="${shareShelfUrl}" width="100%" height="600" frameborder="0"></iframe>`);
          toast?.success?.("Embed code copied to clipboard!");
        }
        break;
      default:
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareShelfUrl);
          toast?.success?.("Link copied!");
        }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[0.75vw] shadow-2xl border border-gray-100 w-[34vw] min-w-[340px] max-w-[95vw] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-[1.2vw] py-[0.8vw] border-b border-gray-100">
          <div className="flex items-center gap-[0.6vw]">
            <div className="w-[2vw] h-[2vw] rounded-[0.4vw] bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5733]">
              <Icon icon="lucide:share-2" className="w-[1vw] h-[1vw]" />
            </div>
            <div>
              <h2 className="text-[0.95vw] font-bold text-gray-900 leading-tight">Share Shelf</h2>
              <p className="text-[0.75vw] text-gray-500 font-medium mt-[0.1vw]">
                Share this bookshelf collection with your audience or friends
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
            title="Close"
          >
            <Icon icon="mdi:close" className="w-[1vw] h-[1vw]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-[1.2vw] flex flex-col gap-[1vw] bg-white">
          {/* Share Link Box */}
          <div>
            <label className="block text-[0.8vw] font-semibold text-gray-700 mb-[0.3vw]">
              Shareable Shelf Link
            </label>
            <div className="flex items-center gap-[0.4vw] p-[0.3vw] pl-[0.7vw] border border-gray-300 rounded-[0.4vw] bg-white focus-within:border-gray-400 shadow-2xs transition-all">
              <Icon icon="lucide:link" className="w-[0.85vw] h-[0.85vw] text-gray-400 shrink-0" />
              <input
                type="text"
                readOnly
                value={shareShelfUrl}
                className="w-full bg-transparent text-[0.78vw] text-gray-700 font-medium focus:outline-none select-all truncate"
              />
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareShelfUrl);
                  }
                  setShelfLinkCopied(true);
                  setTimeout(() => setShelfLinkCopied(false), 2000);
                }}
                className={`flex items-center gap-[0.3vw] px-[0.8vw] h-[1.9vw] rounded-[0.4vw] text-[0.78vw] font-medium transition-all shrink-0 shadow-2xs cursor-pointer active:scale-95 ${
                  shelfLinkCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#FF5733] hover:bg-[#E04D2D] text-white'
                }`}
              >
                <Icon icon={shelfLinkCopied ? "lucide:check" : "lucide:copy"} className="w-[0.8vw] h-[0.8vw]" />
                <span>{shelfLinkCopied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Social Media Apps */}
          <div>
            <label className="block text-[0.8vw] font-semibold text-gray-700 mb-[0.4vw]">
              Share on Social Media
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-[0.6vw]">
              {[
                { name: 'WhatsApp', icon: 'logos:whatsapp-icon', bg: 'hover:bg-emerald-50 hover:border-emerald-200' },
                { name: 'Facebook', icon: 'logos:facebook', bg: 'hover:bg-blue-50 hover:border-blue-200' },
                { name: 'X / Twitter', icon: 'ri:twitter-x-fill', bg: 'hover:bg-gray-100 hover:border-gray-300', color: 'text-black' },
                { name: 'LinkedIn', icon: 'logos:linkedin-icon', bg: 'hover:bg-sky-50 hover:border-sky-200' },
                { name: 'Instagram', icon: 'skill-icons:instagram', bg: 'hover:bg-pink-50 hover:border-pink-200' },
                { name: 'Pinterest', icon: 'logos:pinterest', bg: 'hover:bg-red-50 hover:border-red-200' },
                { name: 'Telegram', icon: 'logos:telegram', bg: 'hover:bg-cyan-50 hover:border-cyan-200' },
                { name: 'Reddit', icon: 'logos:reddit-icon', bg: 'hover:bg-orange-50 hover:border-orange-200' },
                { name: 'Email', icon: 'fluent-emoji-flat:envelope', bg: 'hover:bg-gray-100 hover:border-gray-300' },
                { name: 'Embed', icon: 'lucide:code-2', bg: 'hover:bg-purple-50 hover:border-purple-200', color: 'text-purple-600' },
              ].map((app) => (
                <button
                  key={app.name}
                  type="button"
                  onClick={() => handleSocialShare(app.name)}
                  className={`flex flex-col items-center justify-center p-[0.6vw] rounded-[0.5vw] border border-gray-200 bg-white transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-[0.1vw] active:scale-95 ${app.bg}`}
                >
                  <div className="w-[2vw] h-[2vw] rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon icon={app.icon} className={`w-[1.2vw] h-[1.2vw] ${app.color || ''}`} />
                  </div>
                  <span className="text-[0.7vw] font-medium text-gray-700 mt-[0.3vw] group-hover:text-gray-900 truncate max-w-full">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-[1.2vw] py-[0.7vw] border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
          <span className="text-[0.72vw] text-gray-400 font-medium">
            Anyone with the link can view this shelf
          </span>
          <button
            onClick={onClose}
            className="px-[0.9vw] h-[2vw] border border-gray-300 rounded-[0.4vw] text-[0.8vw] font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareShelfModal;
