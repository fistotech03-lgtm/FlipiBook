import React from "react";
import { Icon } from "@iconify/react";

export default function SaveAsModal({
  isOpen,
  onClose,
  saveAsNameInput,
  setSaveAsNameInput,
  onConfirmSaveAs
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[0.8vw] shadow-xl border border-gray-100 w-full max-w-[24vw] min-w-[300px] overflow-hidden transform animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-[1.2vw] py-[0.9vw] border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[0.95vw] font-bold text-gray-900 leading-tight">Save As New Model</h3>
          <button
            onClick={onClose}
            className="w-[1.6vw] h-[1.6vw] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon icon="lucide:x" className="w-[1vw] h-[1vw]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onConfirmSaveAs} className="p-[1.2vw] flex flex-col gap-[0.8vw]">
          <div>
            <label className="block text-[0.78vw] font-medium text-gray-700 mb-[0.35vw]">
              Model Name
            </label>
            <input
              type="text"
              value={saveAsNameInput}
              onChange={(e) => setSaveAsNameInput(e.target.value)}
              placeholder="Enter model name..."
              autoFocus
              className="w-full px-[0.75vw] py-[0.5vw] text-[0.82vw] text-gray-900 bg-gray-50/50 border border-gray-200 rounded-[0.4vw] focus:outline-none focus:ring-2 focus:ring-[#EC5137]/20 focus:border-[#EC5137] transition-all"
            />
          </div>

          <p className="text-[0.7vw] text-gray-500 leading-normal">
            Saves a duplicate copy of this model to your dashboard.
          </p>

          {/* Footer */}
          <div className="flex items-center justify-end gap-[0.5vw] pt-[0.4vw]">
            <button
              type="button"
              onClick={onClose}
              className="px-[0.9vw] py-[0.45vw] text-[0.78vw] font-medium text-gray-600 hover:bg-gray-100 rounded-[0.4vw] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!saveAsNameInput.trim()}
              className="px-[1.1vw] py-[0.45vw] bg-[#EC5137] hover:bg-[#d9482f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-[0.78vw] rounded-[0.4vw] shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Save As Copy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
