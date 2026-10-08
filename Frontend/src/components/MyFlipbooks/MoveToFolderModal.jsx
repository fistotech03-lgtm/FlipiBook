import React from 'react';
import { Plus, X, Check, Folder } from 'lucide-react';

export default function MoveToFolderModal({
    moveBookModal,
    setMoveBookModal,
    isCreatingInMove,
    setIsCreatingInMove,
    newMoveFolderName,
    setNewMoveFolderName,
    handleCreateFolderAndMove,
    confirmMoveBook,
    moveModalListRef,
    folders,
    books,
    activeFolder
}) {
    if (!moveBookModal.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[1.5vw] w-full max-w-[25vw] p-[1.5vw] shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-[1vw]">
                    <h3 className="text-[1.25vw] font-bold text-[#343868]">Move to Folder</h3>
                    {!isCreatingInMove ? (
                        <button
                            onClick={() => setIsCreatingInMove(true)}
                            className="flex items-center gap-[0.35vw] px-[0.75vw] py-[0.35vw] rounded-full border border-gray-200 shadow-sm text-gray-600 font-medium text-[0.75vw] bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <Plus size="0.85vw" /> New Folder
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsCreatingInMove(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <X size="1vw" />
                        </button>
                    )}
                </div>

                <div className="space-y-[0.5vw] max-h-[15vw] overflow-y-auto custom-scrollbar pr-[0.25vw] mb-[1.25vw] scroll-smooth" ref={moveModalListRef}>
                    {/* Create Folder Input */}
                    {isCreatingInMove && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 mb-[0.75vw]">
                            <label className="block text-[0.75vw] font-medium text-gray-500 mb-[0.25vw]">New Folder Name</label>
                            <div className="w-full flex items-center gap-[0.5vw] p-[0.35vw] rounded-[0.75vw] border border-[#3b4190] bg-[#3b4190]/5">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Enter folder name..."
                                    value={newMoveFolderName}
                                    onChange={(e) => setNewMoveFolderName(e.target.value)}
                                    className="flex-1 px-[0.5vw] py-[0.25vw] bg-transparent text-[0.85vw] font-medium focus:outline-none text-[#343868] placeholder-gray-400"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolderAndMove()}
                                />
                                <button onClick={handleCreateFolderAndMove} className="p-[0.35vw] bg-[#3b4190] text-white rounded-[0.5vw] hover:bg-[#2f3575] transition-colors cursor-pointer">
                                    <Check size="0.9vw" />
                                </button>
                            </div>
                        </div>
                    )}

                    {folders.filter(f => f.name !== 'Recent Book').map(folder => {
                        let isCurrent = false;

                        if (moveBookModal.bookId === 'BULK') {
                            if (activeFolder !== 'Recent Book') {
                                isCurrent = folder.name === activeFolder;
                            }
                        } else {
                            const book = books.find(b => b.id === moveBookModal.bookId);
                            if (book) {
                                let currentRealFolder = book.folder;
                                if (book.folder === 'Recent Book') {
                                    const physicalBook = books.find(b => b.realName === book.realName && b.folder !== 'Recent Book');
                                    if (physicalBook) currentRealFolder = physicalBook.folder;
                                }
                                isCurrent = folder.name === currentRealFolder;
                            }
                        }

                        return (
                            <button
                                key={folder.id}
                                onClick={() => confirmMoveBook(folder.name)}
                                disabled={isCurrent}
                                className={`w-full flex items-center gap-[0.75vw] px-[1vw] py-[0.75vw] rounded-[0.75vw] border text-[0.85vw] font-medium transition-all group text-left cursor-pointer
                               ${isCurrent
                                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-[#3b4190] hover:bg-blue-50/50 hover:text-[#3b4190]'
                                    }
                           `}
                            >
                                <Folder size="1vw" className={isCurrent ? "text-gray-300" : "text-gray-400 group-hover:text-[#3b4190]"} />
                                <span className="truncate flex-1">{folder.name}</span>
                                {isCurrent && <span className="text-[0.65vw] text-gray-400 font-normal ml-2">(Current)</span>}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => {
                        setMoveBookModal({ isOpen: false, bookId: null, isBulk: false });
                        setIsCreatingInMove(false);
                        setNewMoveFolderName('');
                    }}
                    className="w-full py-[0.65vw] rounded-[0.75vw] border border-gray-300 text-gray-600 text-[0.85vw] font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
