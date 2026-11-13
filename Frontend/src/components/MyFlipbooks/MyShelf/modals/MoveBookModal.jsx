import React from 'react';
import { Icon } from '@iconify/react';

const MoveBookModal = ({
  isOpen,
  onClose,
  folders,
  targetMoveFolder,
  setTargetMoveFolder,
  newShelfName,
  setNewShelfName,
  openDropdown,
  setOpenDropdown,
  onMoveSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-[0.75vw] shadow-2xl border border-gray-100 w-[26vw] min-w-[320px] max-w-[90vw] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-[1.2vw] py-[0.8vw] border-b border-gray-100">
          <h2 className="text-[0.95vw] font-bold text-gray-900 leading-tight">Move to Folder</h2>
          <button onClick={onClose} className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 flex items-center justify-center cursor-pointer">
            <Icon icon="mdi:close" className="w-[1vw] h-[1vw]" />
          </button>
        </div>
        <div className="p-[1.2vw]">
          <label className="block text-[0.8vw] font-medium text-gray-700 mb-[0.4vw]">Select Destination Folder</label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'move_folder' ? null : 'move_folder')}
              className="flex items-center justify-between w-full h-[2vw] px-[0.8vw] bg-white border border-gray-300 rounded-[0.4vw] text-[0.8vw] font-medium shadow-2xs hover:bg-gray-50 focus:outline-none transition-colors cursor-pointer"
            >
              <span className="text-gray-700">{targetMoveFolder === '__add_shelf__' ? '+ Add Shelf' : targetMoveFolder}</span>
              <Icon icon={openDropdown === 'move_folder' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-[0.9vw] h-[0.9vw] text-gray-500" />
            </button>

            {openDropdown === 'move_folder' && (
              <div className="absolute z-50 w-full mt-[0.3vw] bg-white border border-gray-100 rounded-[0.45vw] shadow-xl py-[0.25vw] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {folders.map(folder => (
                  <div
                    key={folder.name}
                    className={`px-[0.8vw] py-[0.4vw] text-[0.8vw] font-medium cursor-pointer hover:bg-gray-50 transition-colors ${targetMoveFolder === folder.name ? 'bg-gray-50 text-[#FF5733] font-semibold' : 'text-gray-700'}`}
                    onClick={() => {
                      setTargetMoveFolder(folder.name);
                      setOpenDropdown(null);
                    }}
                  >
                    {folder.name}
                  </div>
                ))}
                <div
                  className={`px-[0.8vw] py-[0.4vw] text-[0.8vw] font-medium cursor-pointer border-t border-gray-100 hover:bg-gray-50 transition-colors ${targetMoveFolder === '__add_shelf__' ? 'bg-gray-50 text-[#FF5733] font-semibold' : 'text-gray-700'}`}
                  onClick={() => {
                    setTargetMoveFolder('__add_shelf__');
                    setOpenDropdown(null);
                  }}
                >
                  + Add Shelf
                </div>
              </div>
            )}
          </div>

          {targetMoveFolder === '__add_shelf__' && (
            <div className="mt-[0.8vw]">
              <label className="block text-[0.8vw] font-medium text-gray-700 mb-[0.3vw]">New Folder Name</label>
              <input
                type="text"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                className="w-full h-[2vw] px-[0.8vw] border border-gray-300 rounded-[0.4vw] focus:outline-none focus:border-gray-400 text-[0.8vw] font-medium shadow-2xs"
                placeholder="Enter new folder name"
                autoFocus
              />
            </div>
          )}
        </div>
        <div className="px-[1.2vw] py-[0.7vw] border-t border-gray-100 flex justify-end gap-[0.4vw] bg-white">
          <button onClick={onClose} className="px-[0.9vw] h-[2vw] border border-gray-300 rounded-[0.4vw] text-[0.8vw] font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-2xs hover:border-gray-400 transition-colors cursor-pointer">Cancel</button>
          <button
            onClick={onMoveSubmit}
            className="px-[1vw] h-[2vw] rounded-[0.4vw] text-[0.8vw] font-medium bg-[#FF5733] text-white hover:bg-[#E04D2D] active:scale-95 shadow-2xs transition-all cursor-pointer"
          >
            {targetMoveFolder === '__add_shelf__' ? 'Create & Move' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveBookModal;
