import React from 'react';
import { Share2, Download, Heart, Trash2 } from 'lucide-react';

export default function FlipbookActionMenu({
    activeBookMenu,
    setActiveBookMenu,
    menuPosition,
    books,
    activeFolder,
    handleShareClick,
    handleDownloadClick,
    handleToggleFavorite,
    handleRemoveFromRecent,
    handleTrashBookClick
}) {
    if (!activeBookMenu) return null;

    const isRecentView = activeFolder === 'Recent Book' || activeFolder === 'Recent';
    let book = null;
    if (isRecentView) {
        book = books.find(b => (b.folder === 'Recent Book' || b.folder === 'Recent' || String(b.id).startsWith('Recent_')) && 
            (b.id === activeBookMenu || b.v_id === activeBookMenu || b._id === activeBookMenu || b.realName === activeBookMenu));
    }
    if (!book) {
        book = books.find(b => b.id === activeBookMenu || b.v_id === activeBookMenu || b._id === activeBookMenu || b.realName === activeBookMenu);
    }
    if (!book) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setActiveBookMenu(null); }}></div>
            <div
                className="fixed z-[101] w-[12vw] min-w-[165px] bg-white rounded-[0.75vw] shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                style={{
                    top: menuPosition.top,
                    left: menuPosition.left,
                    transform: menuPosition.isDropup ? 'translate(-100%, -100%)' : 'translate(-100%, 0)'
                }}
            >
                {/* Share Option */}
                <button
                    onClick={() => {
                        setActiveBookMenu(null);
                        handleShareClick?.(book);
                    }}
                    className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-700 hover:bg-black hover:text-white transition-colors border-b border-gray-100 group cursor-pointer"
                >
                    <Share2 size="0.9vw" className="group-hover:text-white" />
                    Share
                </button>

                {/* Download Option */}
                <button
                    onClick={() => {
                        setActiveBookMenu(null);
                        handleDownloadClick?.(book);
                    }}
                    className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-gray-700 hover:bg-black hover:text-white transition-colors border-b border-gray-100 group cursor-pointer"
                >
                    <Download size="0.9vw" className="group-hover:text-white" />
                    Download
                </button>

                {/* Trash / Remove Option */}
                {book?.isOtherUserBook || activeFolder === 'Favorites' ? (
                    <button
                        onClick={() => {
                            handleToggleFavorite?.(book);
                            setActiveBookMenu(null);
                        }}
                        className="w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.625vw] text-[0.75vw] font-medium text-red-500 hover:bg-red-500 hover:text-white transition-colors group cursor-pointer"
                    >
                        <Heart size="0.9vw" className="text-red-500 fill-red-500 group-hover:text-white group-hover:fill-white" />
                        Remove from Favorites
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setActiveBookMenu(null);
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
                )}
            </div>
        </>
    );
}
