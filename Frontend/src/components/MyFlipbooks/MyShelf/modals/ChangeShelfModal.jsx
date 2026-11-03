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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-[700px] max-w-[90vw] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Change Shelf</h2>
            <p className="text-sm text-gray-500 mt-1">Choose a shelf style for your My Shelf</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2 cursor-pointer"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col md:flex-row justify-center items-center gap-6 bg-gray-50/50">
          {shelfOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => setDraftShelfStyle(option.id)}
              className={`w-full md:w-[220px] cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 group relative bg-white shadow-sm ${
                draftShelfStyle === option.id
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-transparent hover:border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="bg-[#f0ece6] aspect-[4/3] flex items-center justify-center p-4 relative">
                <img src={option.img} alt={option.name} className="w-full h-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
                {draftShelfStyle === option.id && (
                  <div className="absolute inset-0 bg-blue-500/10"></div>
                )}
              </div>
              <div className={`p-3 text-center border-t transition-colors ${draftShelfStyle === option.id ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100'}`}>
                <p className={`text-sm font-semibold ${draftShelfStyle === option.id ? 'text-blue-700' : 'text-gray-700'}`}>
                  {option.name}
                </p>
              </div>
              {draftShelfStyle === option.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-sm">
                  <Icon icon="mdi:check-bold" className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            Apply Shelf
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeShelfModal;

