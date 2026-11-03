import React, { useMemo } from 'react';
import {
    Check,
    Heart,
    Lock,
    Globe,
    Trash2,
    Wrench,
    PenTool,
    BarChart2,
    Share2,
    Download,
    MoreVertical,
    RotateCcw,
    Pencil
} from 'lucide-react';
import { Icon } from '@iconify/react';
import LazyPreview from './LazyPreview';
import { getAssetBaseUrl } from '../../utils/assetUtils';

const defaultFormatDisplayDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    try {
        if (typeof dateVal === 'string' && dateVal.includes('-') && dateVal.includes(' ')) {
            return dateVal.replace(/-/g, '/');
        }
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return String(dateVal).replace(/-/g, '/');
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    } catch {
        return String(dateVal).replace(/-/g, '/');
    }
};

const defaultFormatDisplaySize = (book) => {
    const raw = book?.sizeBytes ?? book?.fileSize ?? book?.size ?? book?.pdfSize;
    if (typeof raw === 'string' && !/^\d+(\.\d+)?$/.test(raw.trim())) return raw;
    const num = Number(raw);
    if (!isNaN(num) && num > 0) {
        if (num >= 1000000000) {
            const gb = num / 1000000000;
            return `${parseFloat(gb.toFixed(gb >= 10 ? 1 : 2))} GB`;
        }
        if (num >= 1000000) {
            const mb = num / 1000000;
            return `${parseFloat(mb.toFixed(mb >= 10 ? 1 : 2))} MB`;
        }
        if (num >= 1000) {
            return `${Math.round(num / 1000)} KB`;
        }
        return `${num} B`;
    }
    return '0 B';
};

const PAPER_SIZE_FORMATS = new Set([
    'a4', 'a3', 'a5', 'letter', 'legal', 'dl', 'square',
    'corporate', 'large_catalogue', 'mini', 'blank', 'custom'
]);

const defaultRenderBookTypeBadge = (book) => {
    let type = (book?.bookType || '').toLowerCase().trim();
    const rawTpl = String(book?.templateId || '').toLowerCase().trim();
    const isRealTemplate = Boolean(
        book?.isTemplate ||
        book?.templateName ||
        book?.templateCategory ||
        (rawTpl && !PAPER_SIZE_FORMATS.has(rawTpl) && !rawTpl.startsWith('a') && rawTpl !== 'letter' && rawTpl !== 'legal' && rawTpl !== 'dl' && rawTpl !== 'square')
    );

    if (type === 'template' && !isRealTemplate) {
        type = 'plain';
    }

    if (!type || type === 'unknown') {
        const title = (book?.title || book?.flipbookName || book?.name || '').toLowerCase();
        if (title.startsWith('word_flipbook_') || title.endsWith('.docx') || title.endsWith('.doc')) type = 'word';
        else if (title.startsWith('ppt_flipbook_') || title.endsWith('.pptx') || title.endsWith('.ppt')) type = 'pptx';
        else if (isRealTemplate || (title.includes('template') && !title.includes('scratch'))) type = 'template';
        else if (title.startsWith('pdf_flipbook_') || title.endsWith('.pdf')) type = 'pdf';
        else type = 'plain';
    }

    switch (type) {
        case 'pdf':
            return (
                <span className="flex items-center gap-[0.25vw] px-[0.5vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60" title="PDF Document">
                    <Icon icon="lucide:file-text" className="w-[0.6vw] h-[0.6vw]" />
                    <span>PDF</span>
                </span>
            );
        case 'pptx':
            return (
                <span className="flex items-center gap-[0.25vw] px-[0.5vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60" title="PowerPoint Presentation">
                    <Icon icon="lucide:presentation" className="w-[0.6vw] h-[0.6vw]" />
                    <span>PPTX</span>
                </span>
            );
        case 'word':
            return (
                <span className="flex items-center gap-[0.25vw] px-[0.5vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-blue-50 text-blue-600 border border-blue-200/60" title="Word Document">
                    <Icon icon="lucide:file-type-2" className="w-[0.6vw] h-[0.6vw]" />
                    <span>Word</span>
                </span>
            );
        case 'template':
            return (
                <span className="flex items-center gap-[0.25vw] px-[0.5vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-purple-50 text-purple-600 border border-purple-200/60" title="Template Preset">
                    <Icon icon="lucide:layout-template" className="w-[0.6vw] h-[0.6vw]" />
                    <span>Template</span>
                </span>
            );
        case 'plain':
        default:
            return (
                <span className="flex items-center gap-[0.25vw] px-[0.5vw] py-[0.12vw] rounded-full text-[0.62vw] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60" title="Blank Canvas / Plain Flipbook">
                    <Icon icon="lucide:file-plus-2" className="w-[0.6vw] h-[0.6vw]" />
                    <span>Plain</span>
                </span>
            );
    }
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

function FlipbookCard({
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
    onStartEdit,
    startEditingBook,
    handleToggleFavorite,
    onToggleFavorite,
    activeFolder,
    emailId,
    backendUrl,
    iframeBaseUrl,
    formatDisplayDate = defaultFormatDisplayDate,
    formatDisplaySize = defaultFormatDisplaySize,
    renderStatusBadge = defaultRenderStatusBadge,
    renderBookTypeBadge = defaultRenderBookTypeBadge,
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
    const VIRTUAL_FOLDERS = new Set(['recent book', 'recent', 'all books', 'all flipbooks', 'favorites', 'trash']);
    let actualFolder = book.folder || activeFolder;
    if (!actualFolder || VIRTUAL_FOLDERS.has(String(actualFolder).trim().toLowerCase())) {
        const physical = books?.find(
            (b) => b.realName === book.realName && b.folder && !VIRTUAL_FOLDERS.has(String(b.folder).trim().toLowerCase())
        );
        actualFolder = (physical && physical.folder && !VIRTUAL_FOLDERS.has(String(physical.folder).trim().toLowerCase()))
            ? physical.folder
            : 'My_Flipbooks';
    }

    // Check if entered rename title already exists in the current folder
    const isDuplicateName = useMemo(() => {
        if (!isBookEditing || !tempBookTitle) return false;
        const trimmed = tempBookTitle.trim().toLowerCase();
        const currentTitle = (book.title || book.realName || book.flipbookName || '').trim().toLowerCase();
        if (!trimmed || trimmed === currentTitle) return false;

        const targetFolder = (actualFolder || book.folder || 'My Flipbooks').trim().toLowerCase();

        return (books || []).some((b) => {
            if (b.id === book.id || b.v_id === book.v_id || b._id === book._id) return false;
            if (book.realName && b.realName === book.realName) return false;
            if (b.trash || b.folder === 'Trash') return false;

            const bName = (b.title || b.realName || b.flipbookName || '').trim().toLowerCase();
            const bFolder = (b.folder || b.folderName || 'My Flipbooks').trim().toLowerCase();

            const isSameFolder =
                targetFolder === 'all flipbook' || targetFolder === 'all flipbooks' || targetFolder === 'recent' || targetFolder === 'recent book'
                    ? true
                    : bFolder === targetFolder;

            return bName === trimmed && isSameFolder;
        });
    }, [isBookEditing, tempBookTitle, book, actualFolder, books]);

    const handleSaveEditWithCheck = () => {
        if (isDuplicateName) return;
        saveBookEdit?.();
    };

    // Resolve Base URL for LazyPreview
    const userFolder = book.userID || book.userId || emailId?.replace(/[@.]/g, '_');
    const resolvedIframeBaseUrl =
        iframeBaseUrl ||
        getAssetBaseUrl(
            userFolder,
            actualFolder || 'default',
            book.realName || book.title || book.flipbookName
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
        const pagesArray = Array.isArray(book.pagesList) && book.pagesList.length > 0 
            ? book.pagesList 
            : Array.isArray(book.pages) && book.pages.length > 0 && typeof book.pages[0] === 'object'
            ? book.pages
            : undefined;

        const pageCountVal =
            (Array.isArray(book.pages)
                ? book.pages.length
                : typeof book.pages === 'number'
                ? book.pages
                : book.pagesCount || (Array.isArray(book.pagesList) ? book.pagesList.length : 1)) || 1;
        const folderVId = book.folder_v_id || (book.folder_id && String(book.folder_id).startsWith('fol_') ? book.folder_id : null) || 'fol_default';
        const identifier = book.v_id || encodeURIComponent(book.realName);
        navigate?.(
            `/editor/customized_editor/${encodeURIComponent(folderVId)}/${identifier}`,
            {
                state: {
                    flipbookName: book.realName,
                    pageCount: pageCountVal,
                    pages: pagesArray,
                    v_id: book.v_id,
                    folder_v_id: folderVId,
                    folderName: actualFolder || 'My_Flipbooks',
                    width: book.width,
                    height: book.height,
                    orientation: book.orientation
                }
            }
        );
    };

    const handleStandardEdit = () => {
        if (onOpenEditor) {
            onOpenEditor(book);
            return;
        }
        const pagesArray = Array.isArray(book.pagesList) && book.pagesList.length > 0 
            ? book.pagesList 
            : Array.isArray(book.pages) && book.pages.length > 0 && typeof book.pages[0] === 'object'
            ? book.pages
            : undefined;

        const folderVId = book.folder_v_id || (book.folder_id && String(book.folder_id).startsWith('fol_') ? book.folder_id : null) || 'fol_default';
        const identifier = book.v_id || encodeURIComponent(book.realName);
        navigate?.(`/editor/${encodeURIComponent(folderVId)}/${identifier}`, {
            state: {
                flipbookName: book.realName,
                pages: pagesArray,
                v_id: book.v_id,
                folder_v_id: folderVId,
                folderName: actualFolder || 'My_Flipbooks',
                width: book.width,
                height: book.height,
                orientation: book.orientation
            }
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
        <div className="flex items-center group w-full" data-card-item="true">
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

            {/* The Card - Double click toggles selection, and once selected, single click also toggles */}
            <div
                onClick={(e) => {
                    if (isBookEditing) return;
                    if (selectionList && selectionList.length > 0) {
                        e.stopPropagation();
                        onToggleSelect?.(bookKey);
                    }
                }}
                onDoubleClick={(e) => {
                    if (isBookEditing) return;
                    e.stopPropagation();
                    if (!selectionList || selectionList.length === 0) {
                        onToggleSelect?.(bookKey);
                    }
                }}
                className={`flex-1 bg-white rounded-[0.9vw] p-[0.9vw] flex gap-[1.2vw] items-center border transition-all relative cursor-pointer select-none ${
                    isSelected ? 'border-gray-400 shadow-md ring-1 ring-gray-300' : 'border-gray-100 shadow-sm hover:shadow-md'
                }`}
            >
                {/* Thumbnail Box (4:3 Aspect Ratio with Stroke) */}
                <div className="w-[7.6vw] h-[5.7vw] aspect-[4/3] bg-gray-100 rounded-[0.6vw] overflow-hidden flex-shrink-0 border border-gray-200 shadow-xs flex items-center justify-center relative">
                    <LazyPreview
                        v_id={book.v_id || book.id || book._id}
                        emailId={emailId}
                        backendUrl={backendUrl}
                        iframeBaseUrl={resolvedIframeBaseUrl}
                        title={book.title || book.realName || book.flipbookName}
                        imageUrl={book.image || null}
                        firstPageFileName={book.pagesList?.[0]?.fileName || (book.pagesList?.[0]?.name ? `${book.pagesList[0].name}.svg` : 'Page 1.svg')}
                        firstPageContent={book.pagesList?.[0]?.html || book.pagesList?.[0]?.content || null}
                    />
                </div>

                {/* Content Details */}
                <div className="flex-1 flex flex-col justify-between min-h-[5.8vw] py-[0.1vw]">
                    {/* Top Line: Title + Pencil + Status + BookType Badge ... Right: Views + Size */}
                    <div className="flex items-start justify-between w-full">
                        <div className="flex items-start gap-[0.5vw] flex-wrap">
                            {isBookEditing ? (
                                <div className="flex flex-col" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={tempBookTitle}
                                        onClick={(e) => e.stopPropagation()}
                                        onDoubleClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setTempBookTitle?.(e.target.value)}
                                        onBlur={handleSaveEditWithCheck}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSaveEditWithCheck();
                                            } else if (e.key === 'Escape') {
                                                e.preventDefault();
                                                if (setTempBookTitle) setTempBookTitle(book.title || book.realName || '');
                                                saveBookEdit?.();
                                            }
                                        }}
                                        className={`text-[1.1vw] font-bold bg-transparent border-b ${
                                            isDuplicateName
                                                ? 'border-red-500 text-red-500 focus:border-red-500'
                                                : 'border-black text-gray-900 focus:border-black'
                                        } focus:outline-none min-w-[12vw] max-w-[20vw] px-[0.1vw] py-0`}
                                    />
                                    {isDuplicateName && (
                                        <p className="text-red-500 text-[0.62vw] font-medium mt-[0.2vw] whitespace-nowrap">
                                            This name already exists
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-[0.4vw]">
                                    <h3 className="text-[1.1vw] font-bold text-[#1f2937] leading-tight">
                                        {book.title || book.realName || book.flipbookName}
                                    </h3>
                                    {!isTrash && !book.isOtherUserBook && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onStartEdit) onStartEdit(book);
                                                else if (startEditingBook) startEditingBook(book);
                                            }}
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            className="p-[0.2vw] text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded hover:bg-gray-100"
                                            title="Rename Flipbook"
                                        >
                                            <Pencil size="0.75vw" />
                                        </button>
                                    )}
                                    {isFavorites && (
                                        <button
                                            type="button"
                                            onClick={handleFavoriteClick}
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            className="p-[0.15vw] text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                            title="Remove from Favorites"
                                        >
                                            <Heart
                                                size="0.85vw"
                                                className="text-red-500 fill-red-500 hover:scale-110 transition-transform"
                                            />
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-[0.5vw] pt-[0.1vw]">
                                {renderStatusBadge(book)}
                                {renderBookTypeBadge(book)}
                            </div>
                        </div>

                        {/* Right: Meta Details (Views and Size) */}
                        <div className="flex items-center gap-[1.5vw] text-[0.72vw] text-gray-400 font-medium whitespace-nowrap">
                            <span>
                                Views :{' '}
                                {book.viewsCount !== undefined
                                    ? book.viewsCount
                                    : book.views !== undefined
                                    ? book.views
                                    : 0}
                            </span>
                            <span
                                title={
                                    book.originalFileSize && book.originalFileSize !== book.fileSize
                                        ? `Extracted Flipbook: ${formatDisplaySize(book)} (Imported PDF: ${(book.originalFileSize / (1024 * 1024)).toFixed(2)} MB)`
                                        : undefined
                                }
                            >
                                Size : {formatDisplaySize(book)}
                            </span>
                        </div>
                    </div>

                    {/* Subtitle: Pages and Created on moved below book title */}
                    <div className="flex items-center gap-[0.75vw] text-[0.72vw] text-gray-400 font-normal mt-[0.2vw] mb-[0.6vw]">
                        <span>{pageCountDisplay} Pages</span>
                        <span className="text-gray-300">•</span>
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
                    </div>

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
                                className="flex items-center cursor-pointer text-[0.75vw] font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0"
                            >
                                <span>View Book</span>
                            </button>

                            {/* Customize (Normal text-gray-600 color like others) */}
                            {!isFavorites && !book.isOtherUserBook && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCustomEdit();
                                    }}
                                    onDoubleClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                                >
                                    <Wrench size="0.85vw" />
                                    <span>Customize</span>
                                </button>
                            )}

                            {/* Open in Editor */}
                            {!isFavorites && !book.isOtherUserBook && (
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
                            )}

                            {/* Statistic */}
                            {!isFavorites && !book.isOtherUserBook && (
                                <button
                                    type="button"
                                    onDoubleClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-[0.35vw] cursor-pointer text-[0.75vw] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
                                >
                                    <BarChart2 size="0.85vw" />
                                    <span>Statistic</span>
                                </button>
                            )}

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

export default React.memo(FlipbookCard);
