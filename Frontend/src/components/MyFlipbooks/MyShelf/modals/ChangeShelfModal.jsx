import React from 'react';
import { Icon } from '@iconify/react';
import { shelfOptions } from '../constants';

const ChangeShelfModal = ({
  isOpen,
  onClose,
  draftShelfStyle,
  setDraftShelfStyle,
  onApply
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-[0.75vw] shadow-2xl border border-gray-100 w-[42vw] min-w-[360px] max-w-[90vw] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-[1.2vw] py-[0.8vw] border-b border-gray-100">
          <div>
            <h2 className="text-[0.95vw] font-bold text-gray-900 leading-tight">Change Shelf</h2>
            <p className="text-[0.75vw] text-gray-500 font-medium mt-[0.1vw]">Choose a shelf style for your bookshelf</p>
          </div>
          <button
            onClick={onClose}
            className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
          >
            <Icon icon="mdi:close" className="w-[1vw] h-[1vw]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-[1.2vw] flex flex-col md:flex-row justify-center items-center gap-[1vw] bg-gray-50/50">
          {shelfOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => setDraftShelfStyle(option.id)}
              className={`w-full md:w-[12vw] cursor-pointer rounded-[0.5vw] border-2 overflow-hidden transition-all duration-200 group relative bg-white shadow-2xs ${
                draftShelfStyle === option.id
                  ? 'border-[#FF5733] ring-2 ring-orange-200/80 shadow-md'
                  : 'border-transparent hover:border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="bg-[#f0ece6] aspect-[4/3] flex items-center justify-center p-[0.8vw] relative">
                <img src={option.img} alt={option.name} className="w-full h-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
                {draftShelfStyle === option.id && (
                  <div className="absolute inset-0 bg-[#FF5733]/10"></div>
                )}
              </div>
              <div className={`p-[0.6vw] text-center border-t transition-colors ${draftShelfStyle === option.id ? 'bg-orange-50/50 border-orange-100' : 'bg-white border-gray-100'}`}>
                <p className={`text-[0.8vw] font-semibold ${draftShelfStyle === option.id ? 'text-[#FF5733]' : 'text-gray-700'}`}>
                  {option.name}
                </p>
              </div>
              {draftShelfStyle === option.id && (
                <div className="absolute top-[0.4vw] right-[0.4vw] bg-[#FF5733] text-white rounded-full p-[0.2vw] shadow-xs">
                  <Icon icon="mdi:check-bold" className="w-[0.8vw] h-[0.8vw]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-[1.2vw] py-[0.7vw] border-t border-gray-100 flex justify-end gap-[0.4vw] bg-white">
          <button
            onClick={onClose}
            className="px-[0.9vw] h-[2vw] border border-gray-300 rounded-[0.4vw] text-[0.8vw] font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-2xs hover:border-gray-400 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-[1vw] h-[2vw] rounded-[0.4vw] text-[0.8vw] font-medium bg-[#FF5733] text-white hover:bg-[#E04D2D] active:scale-95 shadow-2xs transition-all cursor-pointer"
          >
            Apply Shelf
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeShelfModal;
