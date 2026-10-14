import React from 'react';
import {
    Check,
    Heart,
    Lock,
    Globe,
    Trash2,
    Eye,
    Wrench,
    PenTool,
    BarChart2,
    Share2,
    Download,
    MoreVertical,
    RotateCcw
} from 'lucide-react';
import { Icon } from '@iconify/react';
import LazyPreview from './LazyPreview';
import { getAssetBaseUrl } from '../../utils/assetUtils';

const defaultFormatDisplayDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return String(dateVal);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    } catch {
        return String(dateVal);
    }
};

const defaultFormatDisplaySize = (book) => {
    const raw = book.size || book.fileSize || book.pdfSize;
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'number' && raw > 0) {
        if (raw >= 1024 * 1024) return `${(raw / (1024 * 1024)).toFixed(2)} MB`;
        return `${(raw / 1024).toFixed(2)} KB`;
    }
    return '0 B';
};

const defaultRenderStatusBadge = (book) => {
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
};

export default function FlipbookCard({
    book,
    variant = 'default', // 'default' | 'favorites' | 'trash'
    selectedBooks,
    selectedIds,
    toggleBookSelection,
    toggleCardSelection,
    editingBookId,
    tempBookTitle,
    setTempBookTitle,
    saveBookEdit,
    handleBookKeyDown,
    handleToggleFavorite,
    onToggleFavorite,
    activeFolder,
    emailId,
    backendUrl,
    iframeBaseUrl,
    formatDisplayDate = defaultFormatDisplayDate,
    formatDisplaySize = defaultFormatDisplaySize,
    renderStatusBadge = defaultRenderStatusBadge,
    handleShareClick,
    onShareClick,
    handleDownloadClick,
    onDownloadClick,
    onViewBook,
    onCustomize,
    onOpenEditor,
    onRestoreBook,
    onDeleteBook,
    navigate,
    books = [],
    activeBookMenu,
    setActiveBookMenu,
    setMenuPosition
}) {
    const isTrash = variant === 'trash' || activeFolder === 'Trash';
    const isFavorites = variant === 'favorites';

    const bookKey = book.id || book._id || book.v_id || book.realName;
    const selectionList = selectedBooks || selectedIds || [];
    const isSelected =
        selectionList.includes(bookKey) ||
        selectionList.includes(book.id) ||
        selectionList.includes(book._id) ||
        selectionList.includes(book.v_id);

    const onToggleSelect = toggleBookSelection || toggleCardSelection;
    const isBookEditing = editingBookId === book.id || editingBookId === bookKey;

    // Resolve Physical Folder for Recent books
    let actualFolder = book.folder || activeFolder;
    if (actualFolder === 'Recent Book' || actualFolder === 'Recent') {
        const physical = books?.find(
            (b) => b.realName === book.realName && b.folder !== 'Recent Book' && b.folder !== 'Recent'
        );
        if (physical) actualFolder = physical.folder;
    }

    // Resolve Base URL for LazyPreview
    const userFolderSegment = book.userID || emailId?.replace(/[@.]/g, '_');
    const resolvedIframeBaseUrl =
        iframeBaseUrl ||
        getAssetBaseUrl(
            userFolderSegment,
            actualFolder || 'My_Flipbooks',
            book.realName || book.title
        );

    // Handlers
    const handleView = () => {
        if (onViewBook) {
            onViewBook(book);
            return;
        }
        const shareId =
            book.Visibility?.shareId ||
            book.Customized_Settings?.Visibility?.shareId ||
            book.shareId ||
            book.share?.shareId ||
            book.v_id ||
            encodeURIComponent(book.realName);
        const rawAcc = String(
            book.Visibility?.access ||
            book.Customized_Settings?.Visibility?.access ||
            book.share?.access ||
            'public'
        ).toLowerCase();
        const accessPrefix = rawAcc.includes('private')
            ? 'share=private'
            : rawAcc.includes('password')
            ? 'share=password'
            : rawAcc.includes('invite')
            ? 'share=invite'
            : 'share=public';
        window.open(`/${accessPrefix}/${shareId}`, '_blank');
    };

    const handleCustomEdit = () => {
        if (onCustomize) {
            onCustomize(book);
            return;
        }
        const pageCountVal =
            (Array.isArray(book.pages)
                ? book.pages.length
                : typeof book.pages === 'number'
                ? book.pages
                : book.pagesCount || (Array.isArray(book.pagesList) ? book.pagesList.length : 1)) || 1;
        const identifier = book.v_id || encodeURIComponent(book.realName);
        navigate?.(
            `/editor/customized_editor/${encodeURIComponent(actualFolder || 'My_Flipbooks')}/${identifier}`,
            { state: { flipbookName: book.realName, pageCount: pageCountVal } }
        );
    };

    const handleStandardEdit = () => {
        if (onOpenEditor) {
            onOpenEditor(book);
            return;
        }
        const identifier = book.v_id || encodeURIComponent(book.realName);
        navigate?.(`/editor/${encodeURIComponent(actualFolder || 'My_Flipbooks')}/${identifier}`, {
            state: { flipbookName: book.realName }
        });
    };

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        if (onToggleFavorite) onToggleFavorite(book);
        else if (handleToggleFavorite) handleToggleFavorite(book);
    };

    const handleShare = () => {
        if (onShareClick) onShareClick(book);
        else if (handleShareClick) handleShareClick(book);
    };

    const handleDownload = () => {
        if (onDownloadClick) onDownloadClick(book);
        else if (handleDownloadClick) handleDownloadClick(book);
    };

    const handleMoreClick = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const screenHeight = window.innerHeight;
        const spaceBelow = screenHeight - rect.bottom;
        const menuHeight = 160;
        const showAbove = spaceBelow < menuHeight;

        const pos = {
            top: showAbove ? rect.top - 5 : rect.bottom + 5,
            left: rect.right,
            isDropup: showAbove,
            activeId: bookKey
        };

        if (setMenuPosition) setMenuPosition(pos);
        if (setActiveBookMenu) {
            setActiveBookMenu(activeBookMenu === bookKey ? null : bookKey);
        }
    };

    const pageCountDisplay =
        (Array.isArray(book.pages)
            ? book.pages.length
            : typeof book.pages === 'number'
            ? book.pages
            : book.pageCount ||
              book.pagesCount ||
              (Array.isArray(book.pagesList) ? book.pagesList.length : 1)) || 1;

    return (
        <div className="flex items-center group w-full">
            {/* Checkbox Outside Card - Visible When Selection Mode Active */}
            <div
                className={`transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center overflow-hidden flex-shrink-0 ${
                    selectionList.length > 0 ? 'w-[1.6vw] opacity-100 mr-[0.75vw]' : 'w-0 opacity-0 mr-0'
                }`}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect?.(bookKey);
                }}
            >
                <div
                    className={`w-[1.1vw] h-[1.1vw] rounded-[0.2vw] border flex items-center justify-center transition-colors flex-shrink-0 ${
                        isSelected
                            ? 'bg-gray-700 border-gray-700 text-white'
                            : 'border-gray-400 bg-white hover:bg-gray-50'
                    }`}
                >
                    {isSelected && <Check size="0.75vw" className="text-white" strokeWidth={3} />}
                </div>
            </div>

            {/* The Card - Double click toggles selection */}
            <div
                onDoubleClick={() => onToggleSelect?.(bookKey)}
                className="flex-1 bg-white rounded-[0.9vw] p-[0.9vw] flex gap-[1.2vw] items-center border border-gray-100 shadow-sm hover:shadow-md transition-all relative cursor-pointer select-none"
            >
                {/* Thumbnail Box (4:3 Aspect Ratio with Stroke) */}
                <div className="w-[7.6vw] h-[5.7vw] aspect-[4/3] bg-gray-100 rounded-[0.6vw] overflow-hidden flex-shrink-0 border border-gray-200 shadow-xs flex items-center justify-center relative">
                    <LazyPreview
                        v_id={book.v_id}
                        emailId={emailId}
                        backendUrl={backendUrl}
                        iframeBaseUrl={resolvedIframeBaseUrl}
                        title={book.title || book.realName || book.flipbookName}
                        imageUrl={book.image || null}
                    />
                </div>

                {/* Content Details */}
                <div className="flex-1 flex flex-col justify-between min-h-[5.8vw] py-[0.1vw]">
                    {/* Top Line: Title + Heart + Status + Meta Details */}
                    <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-[0.5vw]">
                            {isBookEditing ? (
                                <input
                                    autoFocus
                                    type="text"
                                    value={tempBookTitle}
                                    onChange={(e) => setTempBookTitle?.(e.target.value)}
                                    onBlur={saveBookEdit}
                                    onKeyDown={handleBookKeyDown}
                                    className="text-[1.1vw] font-bold text-gray-800 border-b border-[#ea543a] focus:outline-none w-[16vw]"
                                />
                            ) : (
                                <div className="flex items-center gap-[0.4vw]">
                                    <h3 className="text-[1.1vw] font-bold text-[#1f2937] leading-tight">
                                        {book.title || book.realName || book.flipbookName}
                                    </h3>
                                    {!isTrash && (
                                        <button
                                            type="button"
                                            onClick={handleFavoriteClick}
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            className="p-[0.15vw] text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                                            title={
                                                isFavorites || book.isFavorite
                                                    ? 'Remove from Favorites'
                                                    : 'Add to Favorites'
                                            }
                                        >
                                            <Heart
                                                size="0.85vw"
                                                className={
                                                    isFavorites || book.isFavorite
                                                        ? 'text-red-500 fill-red-500'
                                                        : 'hover:text-red-500'
                                                }
                                            />
                                        </button>
                                    )}
                                </div>
                            )}
                            {renderStatusBadge(book)}
                        </div>

                        {/* Right: Meta Details */}
                        <div className="flex items-center gap-[1.5vw] text-[0.72vw] text-gray-400 font-medium whitespace-nowrap">
                            <span>
                                {activeFolder === 'Recent Book' || activeFolder === 'Recent'
                                    ? 'Last Updated on'
                                    : 'Created on'}{' '}
                                :{' '}
                                {formatDisplayDate(
                                    activeFolder === 'Recent Book' || activeFolder === 'Recent'
                                        ? book.mtime || book.updatedAt || book.updated || book.createdAt || book.created
                                        : book.createdAt || book.created || book.trashedAt
                                )}
                            </span>
                            <span>
                                Views :{' '}
                                {book.viewsCount !== undefined
                                    ? book.viewsCount
                                    : book.views !== undefined
                                    ? book.views
                                    : 0}
                            </span>
                            <span>Size : {formatDisplaySize(book)}</span>
                        </div>
                    </div>

                    {/* Subtitle: Pages */}
                    <p className="text-[0.72vw] text-gray-400 font-normal mt-[0.1vw] mb-[0.6vw]">
                        {pageCountDisplay} Pages
                    </p>

                    {/* Action Buttons Row */}
                    {isTrash ? (
                        /* Trash Screen Actions */
                        <div className="w-full flex items-center justify-end gap-[1.25vw] pt-[0.2vw]">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRestoreBook?.(book);
                                }}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0"
                            >
                                <RotateCcw size="0.85vw" />
                                <span>Restore</span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteBook?.(book);
                                }}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-red-500 hover:text-red-700 transition-colors whitespace-nowrap shrink-0"
                            >
                                <Trash2 size="0.85vw" />
                                <span>Delete Permanently</span>
                            </button>
                        </div>
                    ) : (
                        /* Standard & Favorites Actions */
                        <div className="w-full flex items-center justify-between pt-[0.2vw]">
                            {/* View Book */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleView();
                                }}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="flex items-center cursor-pointer gap-[0.35vw] text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                            >
                                <Eye size="0.85vw" />
                                <span>View Book</span>
                            </button>

                            {/* Customize */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCustomEdit();
                                }}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-[#ea543a] hover:text-[#d4452d] transition-colors whitespace-nowrap shrink-0"
                            >
                                <Wrench size="0.85vw" className="text-[#ea543a]" />
                                <span>Customize</span>
                            </button>

                            {/* Open in Editor */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStandardEdit();
                                }}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                            >
                                <PenTool size="0.85vw" />
                                <span>Open in Editor</span>
                            </button>

                            {/* Statistic */}
                            <button
                                type="button"
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                            >
                                <BarChart2 size="0.85vw" />
                                <span>Statistic</span>
                            </button>

                            {/* Share */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare();
                                }}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                            >
                                <Share2 size="0.85vw" />
                                <span>Share</span>
                            </button>

                            {/* Download */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload();
                                }}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                            >
                                <Download size="0.85vw" />
                                <span>Download</span>
                            </button>

                            {/* More Menu Trigger */}
                            <div className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={handleMoreClick}
                                    onDoubleClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-[0.25vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <MoreVertical size="0.85vw" />
                                    <span>More</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
