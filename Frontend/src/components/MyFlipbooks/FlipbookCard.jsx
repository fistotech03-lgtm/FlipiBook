import React from 'react';
import { Check, Heart, Lock, Globe, RotateCcw, Trash2, Eye, Wrench, PenTool, BarChart2, Share2, Download, MoreVertical } from 'lucide-react';
import { Icon } from '@iconify/react';
import LazyPreview from './LazyPreview';

export default function FlipbookCard({
    book,
    selectedBooks,
    toggleBookSelection,
    editingBookId,
    tempBookTitle,
    setTempBookTitle,
    saveBookEdit,
    handleBookKeyDown,
    handleToggleFavorite,
    activeFolder,
    emailId,
    backendUrl,
    iframeBaseUrl,
    formatDisplayDate,
    formatDisplaySize,
    handleRestoreBook,
    handlePermanentDeleteBookClick,
    handleShareClick,
    handleDownloadClick,
    navigate,
    books,
    activeBookMenu,
    setActiveBookMenu,
    setMenuPosition
}) {
    const isBookEditing = editingBookId === book.id;
    const isSelected = selectedBooks.includes(book.id);

    return (
        <div className="flex items-center gap-[0.75vw] group w-full">
            {/* Checkbox Outside Card - Visible on Select */}
            <div
                className={`transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center overflow-hidden
                    ${selectedBooks.length > 0 ? 'w-[1.8vw] opacity-100 mr-[0.2vw]' : 'w-0 opacity-0'}
                `}
                onClick={(e) => { e.stopPropagation(); toggleBookSelection(book.id); }}
            >
                <div className={`w-[1.15vw] h-[1.15vw] rounded-[0.2vw] border flex items-center justify-center transition-colors flex-shrink-0
                    ${isSelected
                        ? 'bg-gray-800 border-gray-800 text-white'
                        : 'border-gray-400 bg-white hover:bg-gray-50'
                    }`}
                >
                    {isSelected && <Check size="0.75vw" className="text-white" strokeWidth={3} />}
                </div>
            </div>

            {/* The Card */}
            <div
                onDoubleClick={() => toggleBookSelection(book.id)}
                className="flex-1 bg-white rounded-[0.9vw] p-[0.9vw] flex gap-[1.2vw] items-center border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all relative"
            >
                {/* Thumbnail */}
                <div className="w-[6vw] h-[6vw] bg-gray-100 rounded-[0.6vw] overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center relative">
                    <LazyPreview
                        v_id={book.v_id}
                        emailId={emailId}
                        backendUrl={backendUrl}
                        iframeBaseUrl={iframeBaseUrl}
                        title={book.title}
                        imageUrl={book.image || null}
                    />
                </div>

                {/* Content Details */}
                <div className="flex-1 flex flex-col justify-between min-h-[5.8vw] py-[0.1vw]">
                    {/* Top Line: Title + Status + Heart & Meta */}
                    <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-[0.5vw]">
                            {isBookEditing ? (
                                <input
                                    autoFocus
                                    type="text"
                                    value={tempBookTitle}
                                    onChange={(e) => setTempBookTitle(e.target.value)}
                                    onBlur={saveBookEdit}
                                    onKeyDown={handleBookKeyDown}
                                    className="text-[1.1vw] font-bold text-gray-800 border-b border-[#ea543a] focus:outline-none w-[16vw]"
                                />
                            ) : (
                                <div className="flex items-center gap-[0.4vw]">
                                    <h3 className="text-[1.1vw] font-bold text-[#1f2937] leading-tight">{book.title}</h3>
                                    {activeFolder !== 'Trash' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleFavorite(book);
                                            }}
                                            className="p-[0.15vw] text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                                            title={book.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                        >
                                            <Heart
                                                size="0.85vw"
                                                className={book.isFavorite ? "text-red-500 fill-red-500" : "hover:text-red-500"}
                                            />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Visibility Pill Badge */}
                            {(() => {
                                const rawAcc = String(
                                    book.Visibility?.access || 
                                    book.Visibility?.type || 
                                    book.Customized_Settings?.Visibility?.access || 
                                    book.Customized_Settings?.Visibility?.type || 
                                    book.settings?.Visibility?.access || 
                                    book.settings?.Visibility?.type || 
                                    book.share?.access || 
                                    book.share?.type || 
                                    book.access || 
                                    (book.isPublic === false ? 'private' : 'public')
                                ).toLowerCase().trim();

                                if (rawAcc.includes('password') || rawAcc.includes('protect')) {
                                    return (
                                        <span className="flex items-center gap-[0.25vw] px-[0.5vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                                            <Icon icon="lucide:key-round" className="w-[0.6vw] h-[0.6vw]" />
                                            <span>Password</span>
                                        </span>
                                    );
                                }

                                if (rawAcc.includes('invite') || rawAcc.includes('email')) {
                                    return (
                                        <span className="flex items-center gap-[0.25vw] px-[0.5vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                                            <Icon icon="lucide:user-check" className="w-[0.6vw] h-[0.6vw]" />
                                            <span>Invite</span>
                                        </span>
                                    );
                                }

                                if (rawAcc.includes('private') || book.isPublic === false) {
                                    return (
                                        <span className="flex items-center gap-[0.25vw] px-[0.55vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-gray-100 text-gray-600">
                                            <Lock size="0.6vw" />
                                            <span>Private</span>
                                        </span>
                                    );
                                }

                                return (
                                    <span className="flex items-center gap-[0.25vw] px-[0.55vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-[#e8f7ee] text-[#16a34a]">
                                        <Globe size="0.6vw" />
                                        <span>Public</span>
                                    </span>
                                );
                            })()}
                        </div>

                        {/* Right: Meta Details */}
                        <div className="flex items-center gap-[1.5vw] text-[0.72vw] text-gray-400 font-medium">
                            <span>
                                {(activeFolder === 'Recent Book' || activeFolder === 'Recent') ? 'Last Updated on' : 'Created on'} : {(activeFolder === 'Recent Book' || activeFolder === 'Recent') ? formatDisplayDate(book.mtime || book.updatedAt || book.updated || book.createdAt || book.created) : (book.created || '20-11-2025')}
                            </span>
                            <span>Views : {book.viewsCount !== undefined ? book.viewsCount : (book.views !== undefined ? book.views : 245)}</span>
                            <span>Size : {formatDisplaySize(book)}</span>
                        </div>
                    </div>

                    {/* Subtitle: Pages */}
                    <p className="text-[0.72vw] text-gray-400 font-normal mt-[0.1vw] mb-[0.6vw]">
                        {book.pages || 12} Pages
                    </p>

                    {/* Action Buttons Row */}
                    <div className={`w-full flex items-center ${activeFolder === 'Trash' ? 'justify-end gap-[1.25vw]' : 'justify-between'} pt-[0.2vw]`}>
                        {activeFolder === 'Trash' ? (
                            <div className="flex items-center gap-[1.25vw] ml-auto">
                                <button
                                    onClick={() => handleRestoreBook(book)}
                                    className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0"
                                >
                                    <RotateCcw size="0.85vw" /> Restore
                                </button>
                                <button
                                    onClick={() => handlePermanentDeleteBookClick(book)}
                                    className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-red-500 hover:text-red-700 transition-colors whitespace-nowrap shrink-0"
                                >
                                    <Trash2 size="0.85vw" /> Delete Permanently
                                </button>
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={() => {
                                        const shareId = book.Visibility?.shareId || book.Customized_Settings?.Visibility?.shareId || book.shareId || book.share?.shareId || book.v_id || encodeURIComponent(book.realName);
                                        const rawAcc = String(book.Visibility?.access || book.Customized_Settings?.Visibility?.access || book.share?.access || 'public').toLowerCase();
                                        const accessPrefix = rawAcc.includes('private')
                                            ? 'share=private'
                                            : rawAcc.includes('password')
                                            ? 'share=password'
                                            : rawAcc.includes('invite')
                                            ? 'share=invite'
                                            : 'share=public';
                                        window.open(`/${accessPrefix}/${shareId}`, '_blank');
                                    }}
                                    className="flex items-center cursor-pointer gap-[0.35vw] text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                                >
                                    <Eye size="0.85vw" /> View Book
                                </button>

                                <button
                                    onClick={() => {
                                        let targetFolder = book.folder;
                                        if (targetFolder === 'Recent Book') {
                                            const physicalBook = books.find(b => b.realName === book.realName && b.folder !== 'Recent Book');
                                            if (physicalBook) targetFolder = physicalBook.folder;
                                        }
                                        const identifier = book.v_id || encodeURIComponent(book.realName);
                                        navigate(`/editor/customized_editor/${encodeURIComponent(targetFolder)}/${identifier}`, { state: { flipbookName: book.realName, pageCount: book.pages } });
                                    }}
                                    className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-[#ea543a] hover:text-[#d4452d] transition-colors whitespace-nowrap shrink-0"
                                >
                                    <Wrench size="0.85vw" className="text-[#ea543a]" /> Customize
                                </button>

                                <button
                                    onClick={() => {
                                        let targetFolder = book.folder;
                                        if (targetFolder === 'Recent Book') {
                                            const physicalBook = books.find(b => b.realName === book.realName && b.folder !== 'Recent Book');
                                            if (physicalBook) targetFolder = physicalBook.folder;
                                        }
                                        const identifier = book.v_id || encodeURIComponent(book.realName);
                                        navigate(`/editor/${encodeURIComponent(targetFolder)}/${identifier}`, { state: { flipbookName: book.realName } });
                                    }}
                                    className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                                >
                                    <PenTool size="0.85vw" /> Open in Editor
                                </button>

                                <button className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0">
                                    <BarChart2 size="0.85vw" /> Statistic
                                </button>

                                <button
                                    onClick={() => handleShareClick(book)}
                                    className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                                >
                                    <Share2 size="0.85vw" /> Share
                                </button>

                                <button
                                    onClick={() => handleDownloadClick(book)}
                                    className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                                >
                                    <Download size="0.85vw" /> Download
                                </button>

                                {/* More Options */}
                                <div className="relative shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const screenHeight = window.innerHeight;
                                            const spaceBelow = screenHeight - rect.bottom;
                                            const menuHeight = 160;
                                            const showAbove = spaceBelow < menuHeight;

                                            setMenuPosition({
                                                top: showAbove ? (rect.top - 5) : (rect.bottom + 5),
                                                left: rect.right,
                                                isDropup: showAbove,
                                                activeId: book.id
                                            });

                                            setActiveBookMenu(activeBookMenu === book.id ? null : book.id);
                                        }}
                                        className="flex items-center gap-[0.25vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <MoreVertical size="0.85vw" /> More
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
