import React from 'react';
import { RotateCcw, Trash2, Edit2, FolderInput, Plus, Heart } from 'lucide-react';

export default function FlipbookActionMenu({
    activeBookMenu,
    setActiveBookMenu,
    menuPosition,
    books,
    activeFolder,
    handleRestoreBook,
    handlePermanentDeleteBookClick,
    startEditingBook,
    handleMoveBookClick,
    handleDuplicateBook,
    handleToggleFavorite,
    handleRemoveFromRecent,
    handleTrashBookClick
}) {
    if (!activeBookMenu) return null;

    const book = books.find(b => b.id === activeBookMenu);
    if (!book) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setActiveBookMenu(null); }}></div>
            <div
                className="fixed z-[101] w-[12vw] min-w-[165px] bg-white rounded-[0.75vw] shadow-xl border border-gray-500 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                style={{
                    top: menuPosition.top,
                    left: menuPosition.left,
                    transform: menuPosition.isDropup ? 'translate(-100%, -100%)' : 'translate(-100%, 0)'
                }}
            >
                {activeFolder === 'Trash' ? (
                    <>
                        <button
                            onClick={() => handleRestoreBook(book)}
                            className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-700 hover:bg-blue-600 hover:text-white transition-colors border-b border-gray-50 group cursor-pointer"
                        >
                            <RotateCcw size="0.9vw" className="text-blue-600 group-hover:text-white" />
                            Restore
                        </button>
                        <button
                            onClick={() => handlePermanentDeleteBookClick(book)}
                            className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-red-500 hover:bg-red-500 hover:text-white transition-colors group cursor-pointer"
                        >
                            <Trash2 size="0.9vw" className="group-hover:text-white" />
                            Delete Permanently
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => startEditingBook(book)}
                            className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors border-b border-gray-50 group cursor-pointer"
                        >
                            <Edit2 size="0.9vw" className="group-hover:text-white" />
                            Rename
                        </button>
                        <button
                            onClick={() => handleMoveBookClick(book)}
                            className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-600 hover:bg-black hover:text-white transition-colors border-b border-gray-50 group cursor-pointer"
                        >
                            <FolderInput size="0.9vw" className="group-hover:text-white" />
                            Move to folder
                        </button>
                        {activeFolder !== 'Recent Book' && activeFolder !== 'Recent' && (
                            <button
                                onClick={() => handleDuplicateBook(book)}
                                className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-600 hover:bg-black hover:text-white transition-colors border-b border-gray-50 group cursor-pointer"
                            >
                                <Plus size="0.9vw" className="border border-current rounded-[0.125vw] p-[0.0625vw] group-hover:border-white" />
                                Duplicate
                            </button>
                        )}
                        <button
                            onClick={() => {
                                handleToggleFavorite(book);
                                setActiveBookMenu(null);
                            }}
                            className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-600 hover:bg-black hover:text-white transition-colors border-b border-gray-50 group cursor-pointer"
                        >
                            <Heart size="0.9vw" className={book.isFavorite ? "text-red-500 fill-red-500" : "group-hover:text-white"} />
                            {book.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                        <button
                            onClick={() => {
                                if (activeFolder === 'Recent Book' || activeFolder === 'Recent') {
                                    handleRemoveFromRecent(book);
                                } else {
                                    handleTrashBookClick(book);
                                }
                            }}
                            className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-red-500 hover:bg-red-500 hover:text-white transition-colors group cursor-pointer"
                        >
                            <Trash2 size="0.9vw" className="group-hover:text-white" />
                            {(activeFolder === 'Recent Book' || activeFolder === 'Recent') ? 'Remove' : 'Move to trash'}
                        </button>
                    </>
                )}
            </div>
        </>
    );
}
