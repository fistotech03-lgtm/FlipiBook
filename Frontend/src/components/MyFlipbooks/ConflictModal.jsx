import React from 'react';
import { CheckSquare } from 'lucide-react';

export default function ConflictModal({ conflictModal, setConflictModal, handleRenameAndMove }) {
    if (!conflictModal.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[1vw] w-full max-w-[28vw] p-[1.5vw] shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="text-center mb-[1.5vw]">
                    <div className="w-[3vw] h-[3vw] bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-[0.75vw]">
                        <CheckSquare size="1.5vw" className="text-orange-600" />
                    </div>
                    <h3 className="text-[1.25vw] font-semibold text-gray-900 mb-[0.5vw]">Flipbook Already Exists</h3>
                    <p className="text-[0.875vw] text-gray-500">
                        A flipbook named <span className="font-semibold text-gray-800">"{conflictModal.book?.realName}"</span> already exists in <span className="font-semibold text-[#3b4190]">{conflictModal.targetFolder}</span>.
                    </p>
                    <p className="text-[0.875vw] text-gray-500 mt-[0.25vw]">Please rename it to continue moving.</p>
                </div>

                <div className="mb-[1.5vw]">
                    <label className="block text-[0.75vw] font-semibold text-gray-700 uppercase mb-[0.5vw]">New Name</label>
                    <input
                        autoFocus
                        type="text"
                        value={conflictModal.newName}
                        onChange={(e) => setConflictModal(prev => ({ ...prev, newName: e.target.value }))}
                        className="w-full px-[1vw] py-[0.75vw] rounded-[0.75vw] border border-gray-300 focus:border-[#3b4190] focus:ring-2 focus:ring-blue-100 outline-none text-gray-800 font-medium transition-all text-[0.875vw]"
                    />
                </div>

                <div className="flex gap-[0.75vw]">
                    <button
                        onClick={() => setConflictModal({ isOpen: false, book: null, targetFolder: '', newName: '' })}
                        className="flex-1 py-[0.625vw] rounded-[0.75vw] border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-[0.875vw]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRenameAndMove}
                        className="flex-1 py-[0.625vw] rounded-[0.75vw] bg-[#3b4190] text-white font-semibold hover:bg-[#323675] transition-colors shadow-lg shadow-blue-900/20 text-[0.875vw]"
                    >
                        Rename & Move
                    </button>
                </div>
            </div>
        </div>
    );
}
