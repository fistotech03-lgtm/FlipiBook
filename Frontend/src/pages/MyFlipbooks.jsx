import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Folder, Plus, ArrowLeft, Search, MoreVertical, Trash2, Edit2, Copy, Eye, Wrench, PenTool, BarChart2, Share2, Download, FolderInput, SlidersHorizontal, CheckSquare, Check, X, Home, Library, ArrowRight, UploadCloud, Upload, ChevronLeft, ChevronRight, ChevronDown, ArrowDownUp, Globe, Lock, Settings, CloudUpload, GripVertical, RotateCcw, Heart } from 'lucide-react';
import { Icon } from '@iconify/react';

import AlertModal from '../components/AlertModal';
import CreateBookLayout from '../Layouts/CreateBookLayout';
import { convertPdfToImages, convertPdfWithInkscape, getPdfPageCount, getDocumentDetails, generatePdfPageSvg, getOfficeDocType, svgToDataUrl } from '../utils/pdfUtils';
import PdfProcessingLoader from '../components/PdfProcessingLoader';
import ShareModal from '../components/ShareModal';
import ExportModal from '../components/ExportModal';
import dashboardBannerImg from '../assets/Dashboard/Main.png';
import {
    FlipbooksSidebar,
    FlipbooksBanner,
    FlipbooksToolbar,
    FlipbookCard,
    FlipbooksEmptyState,
    FlipbookActionMenu,
    MoveToFolderModal,
    ConflictModal,
    ThreeDDashboard,
    CustomScrollbar
} from '../components/MyFlipbooks';

const resolveUploadsPath = (path) => path || '';
const getSupabaseBaseUrl = () => '';




const sortCategories = [
    {
        id: 'recent',
        title: 'Recent Activity',
        subtitle: 'Recent Activity',
        options: ['Recently Opened', 'Recently Modified', 'Recently Created']
    },
    {
        id: 'name',
        title: 'Name',
        subtitle: 'Recent Activity',
        options: ['Name (A â†’ Z)', 'Name (Z â†’ A)']
    },
    {
        id: 'performance',
        title: 'Performance',
        subtitle: 'Recent Activity',
        options: ['Most Viewed', 'Most Shared', 'Most Downloaded', 'Most Liked']
    },
    {
        id: 'size',
        title: 'File & Size',
        subtitle: 'Recent Activity',
        options: ['Largest File Size', 'Smallest File Size', 'Total Pages (High â†’ Low)', 'Total Pages (Low â†’ High)']
    }
];

const templates = [
    { id: 'corporate', label: 'A4', title: 'A4 Page', dim: '210 Ã— 297 mm', width: 'w-[2.0vw]', height: 'h-[2.8vw]' },
    { id: 'large_catalogue', label: 'A3', title: 'A3 Page', dim: '297 Ã— 420 mm', width: 'w-[2.7vw]', height: 'h-[3.8vw]' },
    { id: 'mini', label: 'A5', title: 'A5 Page', dim: '148 Ã— 210 mm', width: 'w-[1.4vw]', height: 'h-[2.0vw]' },
    { id: 'letter', label: 'Letter', title: 'Letter Page', dim: '216 Ã— 279 mm', width: 'w-[2.1vw]', height: 'h-[2.7vw]' },
    { id: 'legal', label: 'Legal', title: 'Legal Page', dim: '216 Ã— 356 mm', width: 'w-[2.0vw]', height: 'h-[3.4vw]' },
    { id: 'dl', label: 'DL', title: 'DL Flyer', dim: '99 Ã— 210 mm', width: 'w-[1.0vw]', height: 'h-[2.1vw]' },
    { id: 'square', label: 'Square', title: 'Square Page', dim: '210 Ã— 210 mm', width: 'w-[2.1vw]', height: 'h-[2.1vw]' },
];


const FOLDER_COLORS = [
    '#f59e0b', // Yellow / Amber
    '#f43f5e', // Coral / Red / Rose
    '#10b981', // Emerald / Green
    '#38bdf8', // Sky Blue
    '#8b5cf6', // Violet / Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#6366f1', // Indigo
];

export default function MyFlipbooks() {
    const navigate = useNavigate();

    // User Data
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const emailId = user?.emailId;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

    // Storage Analysis State (Synced with /api/usersetting/get-settings like ProfileModal)
    const [storage, setStorage] = useState(() => {
        try {
            const cached = localStorage.getItem('user_storage_settings');
            if (cached) return JSON.parse(cached);
        } catch (e) {}
        return { used: 0, total: 300 * 1024 * 1024 };
    });
    const [isLoadingStorage, setIsLoadingStorage] = useState(false);
    const [isUpgradeCardClosed, setIsUpgradeCardClosed] = useState(() => {
        try {
            return localStorage.getItem('hide_upgrade_card') === 'true' || sessionStorage.getItem('hide_upgrade_card') === 'true';
        } catch (e) {
            return false;
        }
    });

    const fetchLiveStorageSettings = useCallback(async () => {
        let targetEmail = emailId;
        if (!targetEmail) {
            try {
                const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('user_profile'));
                targetEmail = u?.emailId || u?.email;
            } catch (e) {}
        }
        if (!targetEmail || targetEmail === 'No Email' || targetEmail === 'guest@example.com') return;

        setIsLoadingStorage(true);
        try {
            const response = await fetch(`${backendUrl}/api/usersetting/get-settings?emailId=${encodeURIComponent(targetEmail)}`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    const newStorage = {
                        used: typeof data.usedStorage === 'number' ? data.usedStorage : 0,
                        total: typeof data.maxStorage === 'number' ? data.maxStorage : 300 * 1024 * 1024
                    };
                    setStorage(newStorage);
                    try {
                        localStorage.setItem('user_storage_settings', JSON.stringify(newStorage));
                        window.dispatchEvent(new Event('storage'));
                    } catch (e) {}
                }
            }
        } catch (error) {
            console.error("Error fetching live storage settings in MyFlipbooks:", error);
        } finally {
            setIsLoadingStorage(false);
        }
    }, [emailId, backendUrl]);

    useEffect(() => {
        fetchLiveStorageSettings();
    }, [fetchLiveStorageSettings]);

    const [activeFolder, setActiveFolder] = useState(() => {
        const saved = localStorage.getItem('last_active_folder');
        if (saved === 'Recent Book') return 'Recent';
        return saved || 'All Flipbook';
    });
    const [dashboardMode, setDashboardMode] = useState('books'); // 'books' | '3d'
    const [active3dFolder, setActive3dFolder] = useState('All Models');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [sortOption, setSortOption] = useState('Recently Created');
    const [activeSortCategory, setActiveSortCategory] = useState(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
    const [showUpgradeCard, setShowUpgradeCard] = useState(() => localStorage.getItem('hide_upgrade_card') !== 'true');
    const statusDropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);
    const folderDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusDropdownOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
            if (folderDropdownRef.current && !folderDropdownRef.current.contains(event.target)) {
                setIsFolderDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Template Carousel State
    const [templateIndex, setTemplateIndex] = useState(0);

    const nextTemplate = () => {
        if (templateIndex < templates.length - 5) {
            setTemplateIndex(templateIndex + 1);
        }
    };

    const prevTemplate = () => {
        if (templateIndex > 0) {
            setTemplateIndex(templateIndex - 1);
        }
    };

    // Persist Active Folder
    useEffect(() => {
        localStorage.setItem('last_active_folder', activeFolder);
    }, [activeFolder]);
    const [folders, setFolders] = useState([]);
    const [books, setBooks] = useState([]);

    // Data Fetching
    const fetchData = async () => {
        if (!emailId) return;
        setIsLoading(true);
        try {
            // Fetch Folders (already ordered with id and name according to UserFolder MongoDB schema)
            const folderRes = await axios.get(`${backendUrl}/api/flipbook/folders`, { params: { emailId } });
            // Filter out Quick Access / System Folders and map properly with persistent id
            let fetchedFolders = (folderRes.data.folders || []).filter(f => {
                const name = typeof f === 'string' ? f : f?.name;
                const lower = String(name || '').toLowerCase().trim();
                return (
                    lower !== 'public book' &&
                    lower !== 'recent book' &&
                    lower !== 'recent' &&
                    lower !== 'all flipbook' &&
                    lower !== 'all flipbooks' &&
                    lower !== 'favorites' &&
                    lower !== 'trash'
                );
            }).map(f => {
                if (typeof f === 'string') return { id: f, name: f };
                return { id: f.id || f.name, name: f.name };
            });

            // Ensure the default folder 'My_Flipbooks' is always present
            const hasDefaultFolder = fetchedFolders.some(f => f.name.toLowerCase() === 'my_flipbooks');
            if (!hasDefaultFolder) {
                fetchedFolders.unshift({ id: 'default_my_flipbooks', name: 'My_Flipbooks' });
            }

            setFolders(fetchedFolders);

            // Fetch Books
            const booksRes = await axios.get(`${backendUrl}/api/flipbook/list`, { params: { emailId } });
            const rawBooks = booksRes.data.books || [];
            const sanitizedBooks = rawBooks.map(b => {
                const f = b.folder || b.folderName;
                if (!f || f === 'All Flipbook' || f === 'All Flipbooks') {
                    return { ...b, folder: 'My_Flipbooks' };
                }
                return b;
            });
            setBooks(sanitizedBooks);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [emailId]);

    useEffect(() => {
        setSelectedBooks([]);
    }, [activeFolder]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createModalInitialView, setCreateModalInitialView] = useState('selection');
    const [selectedTemplateIdForModal, setSelectedTemplateIdForModal] = useState('corporate');
    const [initialDroppedFiles, setInitialDroppedFiles] = useState(null);

    const handleUploadBoxDragOver = (e) => {
        e.preventDefault();
    };

    const handleUploadBoxDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setInitialDroppedFiles(Array.from(e.dataTransfer.files));
            setCreateModalInitialView('upload');
            setIsCreateModalOpen(true);
        }
    };

    // Inline Folder Creation State
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderInputName, setNewFolderInputName] = useState('');
    const [creatingFolderName, setCreatingFolderName] = useState(null);
    const isSavingFolderRef = useRef(false);
    const folderListRef = useRef(null);

    // Auto-scroll to bottom when creating folder or loading item appears
    useEffect(() => {
        if ((isCreatingFolder || creatingFolderName) && folderListRef.current) {
            folderListRef.current.scrollTo({
                top: folderListRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [isCreatingFolder, creatingFolderName]);

    const [isLoading, setIsLoading] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(null);
    const isUploadCancelledRef = useRef(false);
    const createdFlipbookVIdRef = useRef(null);
    const [alertState, setAlertState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'error',
        showCancel: false,
        onConfirm: null
    });

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedFlipbook, setSelectedFlipbook] = useState(null);

    const handleShareClick = (book) => {
        let resolvedBook = { ...book };
        if (resolvedBook.folder === 'Recent Book' || resolvedBook.folder === 'Recent book') {
            const physicalBook = books.find(b => b.realName === book.realName && b.folder !== 'Recent Book' && b.folder !== 'Recent book');
            if (physicalBook) resolvedBook.folder = physicalBook.folder;
        }
        setSelectedFlipbook(resolvedBook);
        setIsShareModalOpen(true);
    };

    const handleDownloadClick = (book) => {
        let resolvedBook = { ...book };
        if (resolvedBook.folder === 'Recent Book' || resolvedBook.folder === 'Recent book') {
            const physicalBook = books.find(b => b.realName === book.realName && b.folder !== 'Recent Book' && b.folder !== 'Recent book');
            if (physicalBook) resolvedBook.folder = physicalBook.folder;
        }
        setSelectedFlipbook(resolvedBook);
        setIsExportModalOpen(true);
    };


    const showAlert = (title, message, type = 'error') => {
        setAlertState({
            isOpen: true,
            title,
            message,
            type,
            showCancel: false,
            onConfirm: () => setAlertState(prev => ({ ...prev, isOpen: false }))
        });
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleUploadPDF = async (files, customName) => {
        if (!files || files.length === 0) return;
        setIsCreateModalOpen(false);
        setIsLoading(true);
        isUploadCancelledRef.current = false;
        createdFlipbookVIdRef.current = null;

        const firstFile = files[0];
        const initialDocType = firstFile._docType || getOfficeDocType(firstFile.name);
        const initialDocLabel = initialDocType === 'word' ? 'Word document' : initialDocType === 'powerpoint' ? 'PowerPoint presentation' : 'file';
        const initialPageCount = firstFile._pageCount || 1;

        // INSTANT LOADER APPEARANCE (0ms latency - immediately on button click!)
        setProcessingProgress({
            current: 1,
            total: files.length,
            fileIndex: 0,
            totalFiles: files.length,
            pageCount: initialPageCount,
            message: files.length > 1
                ? `Converting queued ${initialDocLabel} 1 of ${files.length} (${firstFile.name})...`
                : `Converting ${initialDocLabel}: ${firstFile.name}...`,
            fileName: firstFile.name,
            stage: 'converting'
        });

        try {
            let totalPdfSize = 0;
            for (const file of files) {
                totalPdfSize += file.size || 0;
            }
            let allImages = [];

            // Step 1 â€” Extract all PDF pages into SVG blobs
            for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
                if (isUploadCancelledRef.current) return;
                const file = files[fileIndex];

                const docType = file._docType || getOfficeDocType(file.name);
                const docLabel = docType === 'word' ? 'Word document' : docType === 'powerpoint' ? 'PowerPoint presentation' : 'file';
                const detectedCount = file._pageCount || 1;

                setProcessingProgress({
                    current: fileIndex + 1,
                    total: files.length,
                    fileIndex,
                    totalFiles: files.length,
                    pageCount: detectedCount,
                    message: files.length > 1
                        ? `Converting queued ${docLabel} ${fileIndex + 1} of ${files.length} (${file.name})...`
                        : `Converting ${docLabel}: ${file.name}...`,
                    fileName: file.name,
                    stage: 'converting'
                });
                const images = await convertPdfWithInkscape(file, Infinity, backendUrl);
                if (isUploadCancelledRef.current) return;
                allImages = [...allImages, ...images];
            }

            if (isUploadCancelledRef.current) return;

            if (allImages.length === 0) {
                showAlert("Error", "No pages could be extracted from the selected files.");
                return;
            }

            const firstW = allImages[0].width;
            const firstH = allImages[0].height;
            const isUniform = allImages.every(img =>
                Math.abs(img.width - firstW) < 1 &&
                Math.abs(img.height - firstH) < 1
            );
            if (!isUniform) {
                showAlert("Uniformity Error", "Selected PDF pages have different dimensions. All pages in a flipbook must have the same size to ensure a professional layout.");
                return;
            }
            const maxWidth = firstW;
            const maxHeight = firstH;

            const now = new Date();
            const timeString = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            const defaultPrefix = initialDocType === 'word' ? 'Word_Flipbook_' : initialDocType === 'powerpoint' ? 'PPT_Flipbook_' : 'PDF_Flipbook_';
            let uniqueName = customName;
            if (!uniqueName || (uniqueName.startsWith('PDF_Flipbook_') && initialDocType !== 'pdf')) {
                uniqueName = customName ? customName.replace(/^PDF_Flipbook_/, defaultPrefix) : `${defaultPrefix}${timeString}`;
            }
            const targetFolder = (!activeFolder || activeFolder === 'All Flipbook' || activeFolder === 'All Flipbooks' || activeFolder === 'Recent Book' || activeFolder === 'Recent' || activeFolder === 'Trash' || activeFolder === 'Favorites') ? 'My_Flipbooks' : activeFolder;

            // Step 2 â€” Encode pages and save flipbook in a single high-speed request
            setProcessingProgress({
                current: 0,
                total: allImages.length,
                totalFiles: files.length,
                message: 'Saving pages & binding flipbook...',
                fileName: uniqueName,
                stage: 'saving'
            });
            const allPages = await Promise.all(allImages.map(async (img, idx) => {
                const pageIndex = idx + 1;
                const base64Url = img.dataUrl || (img.content ? svgToDataUrl(img.content) : "") || (img.blob ? await blobToBase64(img.blob) : "");
                const html = img.content || generatePdfPageSvg(base64Url, `Page ${pageIndex}`, maxWidth, maxHeight, true);
                return {
                    pageName: `Page ${pageIndex}`,
                    content: html,
                    pageNumber: pageIndex
                };
            }));

            if (isUploadCancelledRef.current) return;

            // For standard flipbooks (up to 20 pages), save in a single request!
            if (allPages.length <= 20) {
                setProcessingProgress({
                    current: allPages.length,
                    total: allPages.length,
                    totalFiles: files.length,
                    message: 'Saving pages & binding flipbook...',
                    fileName: uniqueName,
                    stage: 'saving'
                });
                const createRes = await axios.post(`${backendUrl}/api/flipbook/save`, {
                    emailId,
                    flipbookName: uniqueName,
                    pages: allPages,
                    overwrite: true,
                    folderName: targetFolder,
                    keepBase64: true,
                    fileSize: totalPdfSize || allImages.reduce((sum, img) => sum + (img.blob?.size || 0), 0)
                });
                const v_id = createRes.data.v_id;
                createdFlipbookVIdRef.current = v_id;

                if (isUploadCancelledRef.current) {
                    axios.delete(`${backendUrl}/api/flipbook/delete/${v_id}`, { params: { emailId } }).catch(() => {});
                    return;
                }

                setProcessingProgress({
                    current: allPages.length,
                    total: allPages.length,
                    totalFiles: files.length,
                    message: 'Opening flipbook...',
                    fileName: uniqueName,
                    stage: 'done'
                });

                // Navigate to the customized editor
                navigate(`/editor/customized_editor/${encodeURIComponent(targetFolder)}/${v_id}`);
                return;
            }

            // For extra large flipbooks (> 20 pages), save initial batch then batch remaining
            const initialBatch = allPages.slice(0, 20);
            const createRes = await axios.post(`${backendUrl}/api/flipbook/save`, {
                emailId,
                flipbookName: uniqueName,
                pages: initialBatch,
                overwrite: true,
                folderName: targetFolder,
                keepBase64: true,
                fileSize: totalPdfSize || allImages.reduce((sum, img) => sum + (img.blob?.size || 0), 0)
            });
            const v_id = createRes.data.v_id;
            createdFlipbookVIdRef.current = v_id;

            const BATCH_SIZE = 15;
            for (let i = 20; i < allPages.length; i += BATCH_SIZE) {
                if (isUploadCancelledRef.current) {
                    axios.delete(`${backendUrl}/api/flipbook/delete/${v_id}`, { params: { emailId } }).catch(() => {});
                    return;
                }
                const batchPages = allPages.slice(i, i + BATCH_SIZE);
                setProcessingProgress({
                    current: Math.min(i + BATCH_SIZE, allPages.length),
                    total: allPages.length,
                    totalFiles: files.length,
                    message: `Saving pages ${i + 1} to ${Math.min(i + BATCH_SIZE, allPages.length)} of ${allPages.length}...`,
                    fileName: uniqueName,
                    stage: 'saving'
                });
                await axios.post(`${backendUrl}/api/flipbook/save-pages-batch`, {
                    emailId,
                    v_id,
                    pages: batchPages,
                    keepBase64: true,
                    fileSize: totalPdfSize
                });
            }

            if (isUploadCancelledRef.current) {
                axios.delete(`${backendUrl}/api/flipbook/delete/${v_id}`, { params: { emailId } }).catch(() => {});
                return;
            }

            setProcessingProgress({
                current: allPages.length,
                total: allPages.length,
                totalFiles: files.length,
                message: 'Opening flipbook...',
                fileName: uniqueName,
                stage: 'done'
            });

            // Step 4 â€” Navigate to the customized editor
            navigate(`/editor/customized_editor/${encodeURIComponent(targetFolder)}/${v_id}`);

        } catch (error) {
            if (!isUploadCancelledRef.current) {
                console.error("PDF/Document conversion error:", error);
                const rawMsg = error.response?.data?.message || error.message || "";
                const isCorrupt = error.response?.data?.isCorrupted ||
                                  /corrupt|cannot be read|not be loaded|damaged|password|format error|failed to parse|invalid pdf|syntax error/i.test(rawMsg);
                const userMessage = isCorrupt
                    ? (rawMsg.includes("is corrupted") || rawMsg.includes("corrupted, unreadable") ? rawMsg : "Your file is corrupted, unreadable, or password-protected. Please check your document and try again.")
                    : (rawMsg || "Failed to process document. Please try again.");
                showAlert(isCorrupt ? "File Corrupted" : "Error", userMessage);
            }
        } finally {
            setIsLoading(false);
            setProcessingProgress(null);
            isUploadCancelledRef.current = false;
        }
    };

    const handleCancelUploadPDF = () => {
        isUploadCancelledRef.current = true;
        setIsLoading(false);
        setProcessingProgress(null);
        if (createdFlipbookVIdRef.current) {
            axios.delete(`${backendUrl}/api/flipbook/delete/${createdFlipbookVIdRef.current}`, { params: { emailId } }).catch(() => {});
            createdFlipbookVIdRef.current = null;
        }
    };

    const handleUseTemplate = async (templateData) => {
        setIsCreateModalOpen(false);
        if (!templateData) return;

        // Check Auto-Save Preference
        let isAutoSave = true;
        try {
            const storedSetting = localStorage.getItem('isAutoSaveEnabled');
            if (storedSetting !== null) isAutoSave = JSON.parse(storedSetting);
        } catch (e) { console.warn("Error reading auto-save setting", e); }

        // Check for Email - Mandatory for backend creation
        if (!emailId) {
            console.error("Cannot pre-create flipbook: No user email found.");
            navigate('/editor', { state: templateData });
            return;
        }

        // Always pre-create the flipbook record to ensure we have a stable v_id
        // for assets and saves, regardless of whether periodic auto-save is enabled.
        setIsLoading(true);
        console.log("Pre-creating flipbook record...");

        try {
            const pageCount = templateData.pageCount || 12;
            const pages = Array.from({ length: pageCount }, (_, i) => ({
                pageName: `Page ${i + 1}`,
                content: ''
            }));

            const now = new Date();
            const timeString = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            const uniqueName = templateData.flipbookName || `Flipbook_${timeString}`;
            const targetFolder = (!activeFolder || activeFolder === 'All Flipbook' || activeFolder === 'All Flipbooks' || activeFolder === 'Recent Book' || activeFolder === 'Recent' || activeFolder === 'Trash' || activeFolder === 'Favorites') ? 'My_Flipbooks' : activeFolder;

            console.log(`Saving new flipbook "${uniqueName}" to "${targetFolder}"...`);
            const res = await axios.post(`${backendUrl}/api/flipbook/save`, {
                emailId,
                flipbookName: uniqueName,
                pages: pages,
                overwrite: true,
                folderName: targetFolder,
                meta: {
                    width: templateData.width,
                    height: templateData.height,
                    templateId: templateData.templateId,
                    orientation: templateData.orientation
                }
            });

            console.log("Creation result:", res.data);

            if (res.data && res.data.v_id) {
                const redirectUrl = `/editor/${encodeURIComponent(targetFolder)}/${res.data.v_id}`;
                console.log("Navigating with v_id:", redirectUrl);
                navigate(redirectUrl, { state: templateData });
            } else {
                console.warn("Backend didn't return v_id, using fallback editor route");
                navigate('/editor', { state: templateData });
            }
        } catch (e) {
            console.error("Creation failed", e);
            showAlert('Creation Error', 'Backend creation failed. You can still edit, but must save manually.', 'warning');
            navigate('/editor', { state: templateData });
        } finally {
            setIsLoading(false);
        }
    };

    // Renaming States
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState('');

    // Folder Drag & Drop to Rearrange State
    const [dragFolderIndex, setDragFolderIndex] = useState(null);
    const [dragOverFolderIndex, setDragOverFolderIndex] = useState(null);

    // Save custom folder order to MongoDB UserFolder schema in backend
    const saveFolderOrder = async (updatedFolders) => {
        if (!emailId) return;
        const customOrder = updatedFolders
            .filter(f => f.name !== 'Recent Book')
            .map(f => ({ id: f.id, name: f.name }));
        try {
            await axios.post(`${backendUrl}/api/flipbook/folder/reorder`, {
                emailId,
                folders: customOrder
            });
        } catch (err) {
            console.error("Error persisting folder order in db:", err);
        }
    };

    const handleFolderDragStart = (e, index, folder) => {
        if (folder.name === 'Recent Book') {
            e.preventDefault();
            return;
        }
        setDragFolderIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    };

    const handleFolderDragOver = (e, index, folder) => {
        if (folder.name === 'Recent Book' || dragFolderIndex === null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverFolderIndex !== index) {
            setDragOverFolderIndex(index);
        }
    };

    const handleFolderDragLeave = (e, index) => {
        if (dragOverFolderIndex === index) {
            setDragOverFolderIndex(null);
        }
    };

    const handleFolderDrop = (e, dropIndex, targetFolder) => {
        e.preventDefault();
        if (targetFolder.name === 'Recent Book' || dragFolderIndex === null || dragFolderIndex === dropIndex) {
            setDragFolderIndex(null);
            setDragOverFolderIndex(null);
            return;
        }

        setFolders(prev => {
            const next = [...prev];
            const [movedItem] = next.splice(dragFolderIndex, 1);
            next.splice(dropIndex, 0, movedItem);
            saveFolderOrder(next);
            return next;
        });

        setDragFolderIndex(null);
        setDragOverFolderIndex(null);
    };

    const handleFolderDragEnd = () => {
        setDragFolderIndex(null);
        setDragOverFolderIndex(null);
    };

    // Menu Action State
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [folderMenuPos, setFolderMenuPos] = useState({ top: 0, left: 0, isDropup: false });

    // Open Inline Create
    const handleAddFolderClick = () => {
        setIsCreatingFolder(true);
        setNewFolderInputName('');
    };

    const saveNewFolder = async () => {
        if (isSavingFolderRef.current) return;
        const nameToCreate = newFolderInputName.trim();
        if (!nameToCreate) {
            setIsCreatingFolder(false);
            setNewFolderInputName('');
            return;
        }
        isSavingFolderRef.current = true;
        setIsCreatingFolder(false);
        setNewFolderInputName('');
        try {
            await handleCreateFolder(nameToCreate);
        } finally {
            isSavingFolderRef.current = false;
        }
    };

    // Create Folder - Fast, responsive, and shows inline loader
    const handleCreateFolder = async (name) => {
        setCreatingFolderName(name);
        try {
            const res = await axios.post(`${backendUrl}/api/flipbook/folder/create`, { emailId, folderName: name });
            const createdId = res.data?.id || name;
            
            // Instantly update folder list locally without heavy fetchData() flipbook reloads
            setFolders(prev => {
                const existing = prev.filter(f => f.name.toLowerCase() !== name.toLowerCase());
                const updated = [...existing, { id: createdId, name }];
                saveFolderOrder(updated);
                return updated;
            });
            setActiveFolder(name);
        } catch (err) {
            console.error(err);
            showAlert('Create Failed', err.response?.data?.message || err.message);
        } finally {
            setCreatingFolderName(null);
        }
    };

    const startEditing = (folder) => {
        setEditingId(folder.id);
        setTempName(folder.name);
    };

    const saveEdit = async () => {
        if (!editingId || !tempName.trim()) {
            setEditingId(null);
            return;
        }

        const folder = folders.find(f => f.id === editingId);
        const oldName = folder?.name;
        const newName = tempName.trim();
        const currentFolderId = folder?.id;

        if (!folder || oldName === newName) {
            setEditingId(null);
            return;
        }

        // Close editing immediately for instant UX
        setEditingId(null);

        // Optimistic UI updates: update folder name and matching books immediately
        setFolders(prev => prev.map(f => f.id === currentFolderId ? { ...f, name: newName } : f));
        if (activeFolder === oldName) setActiveFolder(newName);
        setBooks(prev => prev.map(b => b.folder === oldName ? { ...b, folder: newName } : b));

        try {
            await axios.post(`${backendUrl}/api/flipbook/folder/rename`, {
                emailId,
                oldName,
                newName,
                folderId: currentFolderId
            });
        } catch (err) {
            console.error(err);
            // Revert state on failure
            setFolders(prev => prev.map(f => f.id === currentFolderId ? { ...f, name: oldName } : f));
            if (activeFolder === newName) setActiveFolder(oldName);
            setBooks(prev => prev.map(b => b.folder === newName ? { ...b, folder: oldName } : b));
            const msg = err.response?.status === 409 ? 'Folder name already exists.' : (err.response?.data?.message || err.message);
            showAlert('Rename Failed', msg);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        }
    };

    // Delete Confirmation State
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        folderId: null,
        folderName: ''
    });

    const handleDeleteFolderClick = (folder) => {
        setActiveMenuId(null);
        if (folder.name?.toLowerCase() === 'my_flipbooks') {
            showAlert('Cannot Delete', 'My_Flipbooks is the default folder and cannot be deleted.');
            return;
        }
        setDeleteConfirmation({
            isOpen: true,
            folderId: folder.id,
            folderName: folder.name
        });
    };

    const confirmDelete = async () => {
        const folderId = deleteConfirmation.folderId;
        const folderName = deleteConfirmation.folderName;

        // Close modal immediately for instant response
        setDeleteConfirmation({ isOpen: false, folderId: null, folderName: '' });

        if (folderId && folderName) {
            // Optimistic update: remove folder and its books instantly
            setFolders(prev => {
                const next = prev.filter(f => f.name !== folderName && f.id !== folderId);
                saveFolderOrder(next);
                return next;
            });
            if (activeFolder === folderName) {
                setActiveFolder('Recent Book');
            }
            setBooks(prev => prev.filter(b => b.folder !== folderName));

            try {
                await axios.delete(`${backendUrl}/api/flipbook/folder`, {
                    data: { emailId, folderName, folderId }
                });
            } catch (err) {
                console.error("Delete folder error:", err);
                showAlert('Delete Failed', err.response?.data?.message || err.message);
                fetchData(); // Rollback / sync with server if failed
            }
        }
    };

    const handleDuplicateFolder = async (folder) => {
        setActiveMenuId(null);
        setIsLoading(true);
        try {
            const res = await axios.post(`${backendUrl}/api/flipbook/folder/duplicate`, {
                emailId, folderName: folder.name
            });
            const newName = res.data.newFolderName;

            await fetchData();

            startEditing({ id: newName, name: newName });

        } catch (err) {
            console.error(err);
            showAlert('Duplicate Failed', err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    /* Selection State */
    const [selectedBooks, setSelectedBooks] = useState([]);

    /* Menu State */
    const [activeBookMenu, setActiveBookMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, isDropup: false });

    // Book Renaming State
    const [editingBookId, setEditingBookId] = useState(null);
    const [tempBookTitle, setTempBookTitle] = useState('');

    // Book Delete Confirmation
    const [deleteBookConfirmation, setDeleteBookConfirmation] = useState({
        isOpen: false,
        bookId: null,
        bookTitle: ''
    });

    // Book Move State
    const [moveBookModal, setMoveBookModal] = useState({
        isOpen: false,
        bookId: null,
        isBulk: false // Added to track bulk move
    });

    // Conflict / Rename & Move State
    const [conflictModal, setConflictModal] = useState({
        isOpen: false,
        book: null,
        targetFolder: '',
        newName: ''
    });

    // --- Selection Logic ---
    const handleSelectAll = () => {
        if (selectedBooks.length === filteredBooks.length) {
            setSelectedBooks([]);
        } else {
            setSelectedBooks(filteredBooks.map(b => b.id));
        }
    };

    const toggleBookSelection = (id) => {
        setSelectedBooks(prev =>
            prev.includes(id) ? prev.filter(bookId => bookId !== id) : [...prev, id]
        );
    };

    const handleBulkTrash = () => {
        if (selectedBooks.length === 0) return;
        const targetBooks = books.filter(b => selectedBooks.includes(b.id));
        const publishedCount = targetBooks.filter(b => b.isPublished || b.published || b.is_published || b.status === 'publish' || b.meta?.isPublished).length;
        setDeleteBookConfirmation({
            isOpen: true,
            bookId: 'BULK',
            bookTitle: `${selectedBooks.length} Selected Books`,
            isTrash: true,
            isPublished: publishedCount > 0,
            publishedCount: publishedCount
        });
    };

    const handleBulkDelete = () => {
        if (selectedBooks.length === 0) return;
        if (activeFolder === 'Trash') {
            setDeleteBookConfirmation({
                isOpen: true,
                bookId: 'BULK',
                bookTitle: `${selectedBooks.length} Selected Books`,
                isTrash: false,
                isPermanent: true
            });
        } else if (activeFolder === 'Recent Book' || activeFolder === 'Recent') {
            setDeleteBookConfirmation({
                isOpen: true,
                bookId: 'BULK',
                bookTitle: `${selectedBooks.length} Selected Books`,
                isTrash: false,
                isRecent: true
            });
        } else {
            handleBulkTrash();
        }
    };

    const handleBulkPermanentDelete = () => {
        if (selectedBooks.length === 0) return;
        setDeleteBookConfirmation({
            isOpen: true,
            bookId: 'BULK',
            bookTitle: `${selectedBooks.length} Selected Books`,
            isTrash: false,
            isPermanent: true
        });
    };

    const handleBulkRestore = async () => {
        if (selectedBooks.length === 0) return;
        const selectedIds = [...selectedBooks];
        const targetBooks = books.filter(b => selectedIds.includes(b.id));
        const prevBooks = [...books];
        setBooks(prev => prev.map(b => selectedIds.includes(b.id) ? { ...b, trash: false, folder: b.originalFolder || 'My_Flipbooks' } : b));
        setSelectedBooks([]);
        try {
            await Promise.all(targetBooks.map(book =>
                axios.post(`${backendUrl}/api/flipbook/restore`, {
                    emailId,
                    bookName: book.realName,
                    v_id: book.v_id
                })
            ));
        } catch (err) {
            console.error(err);
            setBooks(prevBooks);
            showAlert('Restore Failed', err.response?.data?.message || err.message);
        }
    };

    const handleBulkMove = () => {
        if (selectedBooks.length === 0) return;
        setMoveBookModal({
            isOpen: true,
            bookId: 'BULK',
            isBulk: true
        });
    };

    // --- Book Handlers ---

    const handleDuplicateBook = async (book) => {
        setActiveBookMenu(null);
        setIsLoading(true);
        try {
            const res = await axios.post(`${backendUrl}/api/flipbook/duplicate`, {
                emailId,
                folderName: book.folder,
                bookName: book.realName
            });

            // Optimistic / Instant update: Insert the duplicated book into local state
            const newName = res.data.newBookName;
            const newId = `${book.folder}_${newName}`;
            const duplicatedBook = {
                ...book,
                id: newId,
                title: newName,
                realName: newName,
                created: new Date().toLocaleDateString("en-GB").replace(/\//g, "-") + " " + new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
                views: 0,
                viewsCount: 0,
                viewersCount: 0,
                mtime: new Date().toISOString()
            };

            setBooks(prev => [duplicatedBook, ...prev]);

            startEditingBook({ id: newId, title: newName, folder: book.folder, realName: newName });
        } catch (err) {
            console.error(err);
            showAlert('Duplicate Failed', err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleFavorite = async (book) => {
        const nextFav = !book.isFavorite;
        // Optimistically update all occurrences of this book in state (both real folder and recent view)
        setBooks(prev => prev.map(b => (b.v_id && b.v_id === book.v_id) || (book.realName && b.realName === book.realName) ? { ...b, isFavorite: nextFav } : b));
        try {
            await axios.post(`${backendUrl}/api/flipbook/favorite`, {
                emailId,
                bookName: book.realName || book.title,
                v_id: book.v_id,
                isFavorite: nextFav
            });
        } catch (err) {
            console.error("Failed to toggle favorite:", err);
            // Revert if failed
            setBooks(prev => prev.map(b => (b.v_id && b.v_id === book.v_id) || (book.realName && b.realName === book.realName) ? { ...b, isFavorite: !nextFav } : b));
        }
    };

    const handleRemoveFromRecent = async (book) => {
        setActiveBookMenu(null);
        setIsLoading(true);
        try {
            await axios.post(`${backendUrl}/api/flipbook/remove-recent`, {
                emailId,
                bookName: book.realName
            });
            await fetchData();
        } catch (err) {
            console.error(err);
            showAlert('Remove Failed', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrashBookClick = (book) => {
        setActiveBookMenu(null);
        const isPub = Boolean(book.isPublished || book.published || book.is_published || book.status === 'publish' || book.meta?.isPublished);
        setDeleteBookConfirmation({
            isOpen: true,
            bookId: book.id,
            bookTitle: book.title,
            isTrash: true,
            isPublished: isPub
        });
    };

    const handlePermanentDeleteBookClick = (book) => {
        setActiveBookMenu(null);
        setDeleteBookConfirmation({
            isOpen: true,
            bookId: book.id,
            bookTitle: book.title,
            isTrash: false,
            isPermanent: true
        });
    };

    const handleRestoreBook = async (book) => {
        setActiveBookMenu(null);
        const prevBooks = [...books];
        const restoreFolder = book.originalFolder || 'My_Flipbooks';
        setBooks(prev => prev.map(b => b.id === book.id ? { ...b, trash: false, folder: restoreFolder } : b));
        try {
            await axios.post(`${backendUrl}/api/flipbook/restore`, {
                emailId,
                bookName: book.realName,
                v_id: book.v_id
            });
        } catch (err) {
            console.error(err);
            setBooks(prevBooks);
            showAlert('Restore Failed', err.response?.data?.message || err.message);
        }
    };

    const handleEmptyTrashClick = () => {
        setDeleteBookConfirmation({
            isOpen: true,
            bookId: 'EMPTY_TRASH',
            bookTitle: 'All items in Trash',
            isEmptyTrash: true
        });
    };

    const confirmDeleteBook = async () => {
        const isTrashAction = Boolean(deleteBookConfirmation.isTrash);
        const isEmptyTrashAction = Boolean(deleteBookConfirmation.isEmptyTrash);
        const isRecent = activeFolder === 'Recent Book' || activeFolder === 'Recent' || Boolean(deleteBookConfirmation.isRecent);

        if (isEmptyTrashAction) {
            const previousBooks = [...books];
            const trashedBooks = books.filter(b => b.trash || b.folder === 'Trash');
            const freedBytes = trashedBooks.reduce((sum, b) => sum + (b.sizeBytes || b.fileSize || 0), 0);

            // Optimistically remove all trashed books
            setBooks(prev => prev.filter(b => !b.trash && b.folder !== 'Trash'));
            setSelectedBooks([]);
            setDeleteBookConfirmation({ isOpen: false, bookId: null, bookTitle: '' });

            // Optimistically update storage
            if (freedBytes > 0) {
                setStorage(prev => {
                    const updatedUsed = Math.max(0, (prev?.used || 0) - freedBytes);
                    const updated = { ...prev, used: updatedUsed };
                    try {
                        localStorage.setItem('user_storage_settings', JSON.stringify(updated));
                        window.dispatchEvent(new Event('storage'));
                    } catch (e) {}
                    return updated;
                });
            }

            try {
                await axios.post(`${backendUrl}/api/flipbook/empty-trash`, { emailId });
                await fetchLiveStorageSettings();
            } catch (err) {
                console.error(err);
                setBooks(previousBooks);
                showAlert('Empty Trash Failed', err.response?.data?.message || err.message);
                fetchLiveStorageSettings();
            }
            return;
        }

        const idsToProcess =
            deleteBookConfirmation.bookId === 'BULK'
                ? [...selectedBooks]
                : deleteBookConfirmation.bookId
                ? [deleteBookConfirmation.bookId]
                : [];

        const targetBooks = books.filter(b => idsToProcess.includes(b.id));
        const targetVIds = new Set(targetBooks.map(b => b.v_id).filter(Boolean));
        const targetRealNames = new Set(targetBooks.map(b => b.realName || b.title).filter(Boolean));

        const isTargetBook = (b) => {
            if (idsToProcess.includes(b.id)) return true;
            if (b.v_id && targetVIds.has(b.v_id)) return true;
            if ((b.realName && targetRealNames.has(b.realName)) || (b.title && targetRealNames.has(b.title))) return true;
            return false;
        };

        if (isTrashAction) {
            // Optimistic update: mark physical book as trashed and unpublished, and REMOVE completely from Recent list
            const previousBooks = [...books];
            setBooks(prev => {
                const matching = prev.filter(isTargetBook);
                const hasPhysicalMatch = matching.some(b => b.folder !== 'Recent Book' && b.folder !== 'Recent' && !String(b.id).startsWith('Recent_'));

                return prev.flatMap(b => {
                    if (!isTargetBook(b)) return [b];

                    const isRecentEntry = b.folder === 'Recent Book' || b.folder === 'Recent' || String(b.id).startsWith('Recent_');
                    if (isRecentEntry) {
                        // Virtual recent entry: drop it completely if physical counterpart exists
                        if (hasPhysicalMatch) return [];
                        // Otherwise convert it to trash entry
                        return [{
                            ...b,
                            id: b.id.replace(/^Recent_/, ''),
                            trash: true,
                            isPublished: false,
                            published: false,
                            folder: 'Trash',
                            originalFolder: b.actualFolder || b.originalFolder || 'My_Flipbooks'
                        }];
                    }

                    // Physical book: move to Trash
                    return [{
                        ...b,
                        trash: true,
                        isPublished: false,
                        published: false,
                        folder: 'Trash',
                        originalFolder: (b.folder !== 'Trash' && b.folder !== 'Recent Book' && b.folder !== 'Recent')
                            ? b.folder
                            : (b.originalFolder || 'My_Flipbooks')
                    }];
                });
            });

            if (deleteBookConfirmation.bookId === 'BULK') setSelectedBooks([]);
            else setSelectedBooks(prev => prev.filter(id => !idsToProcess.includes(id)));
            setDeleteBookConfirmation({ isOpen: false, bookId: null, bookTitle: '', isPublished: false });

            try {
                await Promise.all(targetBooks.map(async (book) => {
                    const isPub = Boolean(book.isPublished || book.published || book.is_published || book.status === 'publish');
                    if (isPub) {
                        await axios.post(`${backendUrl}/api/flipbook/unpublish`, {
                            emailId,
                            v_id: book.v_id
                        }).catch(e => console.warn("Unpublish during trash warning:", e));
                    }
                    return axios.post(`${backendUrl}/api/flipbook/trash`, {
                        emailId,
                        folderName: book.folder,
                        bookName: book.realName,
                        v_id: book.v_id
                    });
                }));
            } catch (err) {
                console.error(err);
                setBooks(previousBooks);
                showAlert('Move to Trash Failed', err.response?.data?.message || err.message);
            }
            return;
        }

        // Permanent Delete or Remove from Recent
        const endpoint = isRecent ? `${backendUrl}/api/flipbook/remove-recent` : `${backendUrl}/api/flipbook/delete`;
        const removedBooks = books.filter(b => idsToProcess.includes(b.id));
        const freedBytes = !isRecent ? removedBooks.reduce((sum, b) => sum + (b.sizeBytes || b.fileSize || 0), 0) : 0;

        setBooks(prev => prev.filter(b => !idsToProcess.includes(b.id)));
        if (deleteBookConfirmation.bookId === 'BULK') setSelectedBooks([]);
        else setSelectedBooks(prev => prev.filter(id => !idsToProcess.includes(id)));
        setDeleteBookConfirmation({ isOpen: false, bookId: null, bookTitle: '' });

        // Optimistically update storage if permanently deleting
        if (!isRecent && freedBytes > 0) {
            setStorage(prev => {
                const updatedUsed = Math.max(0, (prev?.used || 0) - freedBytes);
                const updated = { ...prev, used: updatedUsed };
                try {
                    localStorage.setItem('user_storage_settings', JSON.stringify(updated));
                    window.dispatchEvent(new Event('storage'));
                } catch (e) {}
                return updated;
            });
        }

        try {
            await Promise.all(removedBooks.map(book => {
                if (isRecent) {
                    return axios.post(endpoint, { emailId, bookName: book.realName });
                } else {
                    return axios.delete(endpoint, {
                        data: {
                            emailId,
                            folderName: book.originalFolder || book.folder,
                            bookName: book.realName,
                            v_id: book.v_id
                        }
                    });
                }
            }));
            if (!isRecent) {
                await fetchLiveStorageSettings();
            }
        } catch (err) {
            console.error(err);
            setBooks(prev => [...prev, ...removedBooks]);
            showAlert('Delete Failed', err.response?.data?.message || err.message);
            if (!isRecent) {
                fetchLiveStorageSettings();
            }
        }
    };

    const startEditingBook = (book) => {
        setActiveBookMenu(null);
        setEditingBookId(book.id);
        setTempBookTitle(book.title);
    };

    const saveBookEdit = async () => {
        if (editingBookId && tempBookTitle.trim()) {
            const book = books.find(b => b.id === editingBookId);

            // Frontend duplicate check (Global Uniqueness)
            const isDuplicate = books.some(b =>
                b.title.toLowerCase() === tempBookTitle.trim().toLowerCase() &&
                b.id !== editingBookId
            );

            if (isDuplicate) {
                showAlert('Name Exists', 'A flipbook with this name already exists (possibly in another folder). Please choose a unique name.');
                setEditingBookId(null); // Revert to previous name
                return; // Stop execution
            }

            if (book && book.title !== tempBookTitle.trim()) {
                setIsLoading(true);
                try {
                    await axios.post(`${backendUrl}/api/flipbook/rename`, {
                        emailId,
                        folderName: book.folder,
                        oldName: book.realName,
                        newName: tempBookTitle.trim()
                    });
                    await fetchData();
                } catch (err) {
                    console.error(err);
                    const msg = err.response?.status === 409 ? 'Flipbook name already exists.' : (err.response?.data?.message || err.message);
                    showAlert('Rename Failed', msg);
                } finally {
                    setIsLoading(false);
                }
            }
        }
        setEditingBookId(null);
    };

    const handleBookKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveBookEdit();
        }
    };

    const handleMoveBookClick = (book) => {
        setActiveBookMenu(null);
        setMoveBookModal({
            isOpen: true,
            bookId: book.id
        });
    };

    const confirmMoveBook = async (targetFolder) => {
        // Helper to perform the actual move request
        const performMove = async (book, targetId) => {
            await axios.post(`${backendUrl}/api/flipbook/move`, {
                emailId,
                bookName: book.realName,
                currentFolder: book.folder,
                targetFolder: targetId
            });
        };

        const isBulk = moveBookModal.bookId === 'BULK';
        const booksToMove = isBulk 
            ? books.filter(b => selectedBooks.includes(b.id)) 
            : books.filter(b => b.id === moveBookModal.bookId);

        // Close modal immediately so UI is instant
        setMoveBookModal({ isOpen: false, bookId: null, isBulk: false });
        setIsCreatingInMove(false);
        setNewMoveFolderName('');

        if (booksToMove.length === 0) return;

        // Optimistic UI update: instantly update folder for moved books
        const movedBookIds = booksToMove.map(b => b.id);
        setBooks(prev => prev.map(b => movedBookIds.includes(b.id) ? { ...b, folder: targetFolder } : b));
        if (isBulk) {
            setSelectedBooks([]);
        }

        try {
            for (const book of booksToMove) {
                await performMove(book, targetFolder);
            }
        } catch (err) {
            console.error("Move error:", err);
            if (err.response?.status === 409) {
                setConflictModal({
                    isOpen: true,
                    book: booksToMove[0],
                    targetFolder,
                    newName: booksToMove[0]?.realName
                });
            } else {
                showAlert('Move Failed', err.response?.data?.message || err.message);
            }
            fetchData();
        }
    };

    const handleRenameAndMove = async () => {
        const { book, newName, targetFolder } = conflictModal;
        if (!book || !newName.trim() || !targetFolder) return;

        // Close conflict modal immediately
        setConflictModal({ isOpen: false, book: null, targetFolder: '', newName: '' });

        const trimmedNewName = newName.trim();
        if (trimmedNewName === book.realName) {
            showAlert("Name Exists", "Please choose a different name to resolve the conflict.");
            return;
        }

        // Optimistic UI update
        setBooks(prev => prev.map(b => b.id === book.id ? { ...b, title: trimmedNewName, realName: trimmedNewName, folder: targetFolder } : b));

        try {
            // 1. Rename in Source
            await axios.post(`${backendUrl}/api/flipbook/rename`, {
                emailId,
                folderName: book.folder,
                oldName: book.realName,
                newName: trimmedNewName
            });

            // 2. Move to Target
            await axios.post(`${backendUrl}/api/flipbook/move`, {
                emailId,
                bookName: trimmedNewName,
                currentFolder: book.folder,
                targetFolder
            });
        } catch (err) {
            console.error(err);
            const msg = err.response?.status === 409 ? 'Name still conflicts (in source or target).' : err.message;
            showAlert('Action Failed', msg);
            fetchData();
        }
    };

    // --- Create Folder in Move Modal Logic ---
    const [isCreatingInMove, setIsCreatingInMove] = useState(false);
    const [newMoveFolderName, setNewMoveFolderName] = useState('');
    const moveModalListRef = useRef(null);

    useEffect(() => {
        if (isCreatingInMove && moveModalListRef.current) {
            moveModalListRef.current.scrollTo({
                top: moveModalListRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [isCreatingInMove]);

    const handleCreateFolderAndMove = async () => {
        if (!newMoveFolderName.trim()) return;
        const name = newMoveFolderName.trim();
        setFolders(prev => {
            const existing = prev.filter(f => f.name.toLowerCase() !== name.toLowerCase());
            const updated = [...existing, { id: name, name }];
            return updated.sort((a, b) => a.name.localeCompare(b.name));
        });
        try {
            axios.post(`${backendUrl}/api/flipbook/folder/create`, { emailId, folderName: name }).catch(console.error);
            await confirmMoveBook(name);
        } catch (err) { console.error(err); }
    };



    // Filter books by active folder, search query, and status
    const seenVIds = new Set();
    const filteredBooks = books.filter(book => {
        let matchesFolder = false;
        if (activeFolder === 'Trash') {
            matchesFolder = Boolean(book.trash || book.folder === 'Trash') && book.folder !== 'Recent Book' && book.folder !== 'Recent';
        } else if (activeFolder === 'All Flipbook' || activeFolder === 'All Flipbooks') {
            matchesFolder = !book.trash && book.folder !== 'Trash' && book.folder !== 'Recent Book' && book.folder !== 'Recent';
        } else if (activeFolder === 'Recent' || activeFolder === 'Recent Book') {
            matchesFolder = !book.trash && (book.folder === 'Recent Book' || book.folder === 'Recent');
        } else if (activeFolder === 'Favorites') {
            matchesFolder = !book.trash && book.folder !== 'Trash' && book.folder !== 'Recent Book' && book.folder !== 'Recent' && Boolean(book.isFavorite || book.favorite || book.isFav);
        } else {
            matchesFolder = !book.trash && book.folder === activeFolder;
        }

        if (activeFolder === 'All Flipbook' || activeFolder === 'All Flipbooks' || activeFolder === 'Favorites') {
            const key = book.v_id || `${book.realName}_${book.title}`;
            if (seenVIds.has(key)) return false;
            if (matchesFolder) seenVIds.add(key);
        }

        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.realName.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== 'All Status') {
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

            if (statusFilter === 'Public') matchesStatus = rawAcc.includes('public') && !rawAcc.includes('private') && !rawAcc.includes('password') && !rawAcc.includes('invite');
            else if (statusFilter === 'Private') matchesStatus = rawAcc.includes('private') || book.isPublic === false;
            else if (statusFilter === 'Protected') matchesStatus = rawAcc.includes('password') || rawAcc.includes('protect');
            else if (statusFilter === 'Email' || statusFilter === 'Invite') matchesStatus = rawAcc.includes('invite') || rawAcc.includes('email');
        }
        return matchesFolder && matchesSearch && matchesStatus;
    }).sort((a, b) => {
        const parseDate = (dateVal) => {
            if (!dateVal) return 0;
            // Handle numeric timestamps
            if (!isNaN(dateVal) && typeof dateVal !== 'boolean') {
                return new Date(Number(dateVal)).getTime();
            }

            if (typeof dateVal === 'string') {
                const [datePart, timePart, ampm] = dateVal.split(' ');
                const parts = datePart ? datePart.split(/[-/]/) : [];
                
                // Only if it looks like DD-MM-YYYY (year is at the end)
                if (parts.length === 3 && parts[2].length === 4) {
                    let year = parseInt(parts[2], 10);
                    let month = parseInt(parts[1], 10) - 1; // JS months are 0-11
                    let day = parseInt(parts[0], 10);
                    let hours = 0;
                    let minutes = 0;
                    
                    if (timePart) {
                        const timeSplit = timePart.split(':');
                        hours = parseInt(timeSplit[0] || '0', 10);
                        minutes = parseInt(timeSplit[1] || '0', 10);
                        
                        if (ampm) {
                            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                        }
                    }
                    
                    let customParsed = new Date(year, month, day, hours, minutes).getTime();
                    if (!isNaN(customParsed)) return customParsed;
                }
            }

            // Fallback for standard strings like ISO
            let parsed = new Date(dateVal).getTime();
            if (!isNaN(parsed)) return parsed;

            return 0;
        };

        if (sortOption === 'Recently Created') {
            if (activeFolder === 'Recent Book') {
                return parseDate(b.mtime || b.created) - parseDate(a.mtime || a.created);
            }
            return parseDate(b.createdAt || b.created) - parseDate(a.createdAt || a.created);
        }
        if (sortOption === 'Recently Opened' || sortOption === 'Recently Modified') {
            // Fallback to created date if opened/modified fields don't exist
            return parseDate(b.mtime || b.updatedAt || b.createdAt || b.created) - parseDate(a.mtime || a.updatedAt || a.createdAt || a.created);
        }
        if (sortOption === 'Name (A â†’ Z)') {
            return (a.title || '').localeCompare(b.title || '');
        }
        if (sortOption === 'Name (Z â†’ A)') {
            return (b.title || '').localeCompare(a.title || '');
        }
        if (sortOption === 'Most Viewed' || sortOption === 'Most Shared' || sortOption === 'Most Downloaded' || sortOption === 'Most Liked') {
            const getViews = (item) => (item.viewsCount !== undefined ? item.viewsCount : item.views) || 0;
            return getViews(b) - getViews(a);
        }
        if (sortOption === 'Largest File Size') {
            const getBytes = (b) => {
                if (b.sizeBytes && b.sizeBytes > 0) return b.sizeBytes;
                if (typeof b.size === 'string' && b.size !== '0 B' && b.size !== '0B') {
                    const num = parseFloat(b.size) || 0;
                    if (b.size.toUpperCase().includes('GB')) return num * 1024 * 1024 * 1024;
                    if (b.size.toUpperCase().includes('MB')) return num * 1024 * 1024;
                    if (b.size.toUpperCase().includes('KB')) return num * 1024;
                    return num;
                }
                return (b.pages || 1) * 450 * 1024;
            };
            return getBytes(b) - getBytes(a);
        }
        if (sortOption === 'Smallest File Size') {
            const getBytes = (b) => {
                if (b.sizeBytes && b.sizeBytes > 0) return b.sizeBytes;
                if (typeof b.size === 'string' && b.size !== '0 B' && b.size !== '0B') {
                    const num = parseFloat(b.size) || 0;
                    if (b.size.toUpperCase().includes('GB')) return num * 1024 * 1024 * 1024;
                    if (b.size.toUpperCase().includes('MB')) return num * 1024 * 1024;
                    if (b.size.toUpperCase().includes('KB')) return num * 1024;
                    return num;
                }
                return (b.pages || 1) * 450 * 1024;
            };
            return getBytes(a) - getBytes(b);
        }
        if (sortOption === 'Total Pages (High â†’ Low)') {
            return (parseInt(b.pages) || 0) - (parseInt(a.pages) || 0);
        }
        if (sortOption === 'Total Pages (Low â†’ High)') {
            return (parseInt(a.pages) || 0) - (parseInt(b.pages) || 0);
        }
        return 0;
    });

    const formatDisplayDate = (dateVal) => {
        if (!dateVal) return '';
        if (typeof dateVal === 'string' && dateVal.includes('-') && dateVal.includes(' ')) {
            const parts = dateVal.split(' ')[0].split('-');
            if (parts.length === 3 && parts[2].length === 4) return dateVal;
        }
        
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return dateVal;
        
        const pad = (n) => n.toString().padStart(2, '0');
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear();
        
        let hours = d.getHours();
        const minutes = pad(d.getMinutes());
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        return `${day}-${month}-${year} ${pad(hours)}:${minutes} ${ampm}`;
    };

    const formatDisplaySize = (book) => {
        if (book.size && book.size !== '0 B' && book.size !== '0B' && book.size !== '0 Bytes') {
            return book.size;
        }
        if (book.sizeBytes && book.sizeBytes > 0) {
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(book.sizeBytes) / Math.log(k));
            return `${parseFloat((book.sizeBytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
        }
        if (book.fileSize && book.fileSize > 0) {
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(book.fileSize) / Math.log(k));
            return `${parseFloat((book.fileSize / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
        }
        return '0 B';
    };

    const isAllSelected = filteredBooks.length > 0 && selectedBooks.length === filteredBooks.length;

    return (
        <CreateBookLayout
            isOpen={isCreateModalOpen}
            onClose={() => { setIsCreateModalOpen(false); setInitialDroppedFiles(null); }}
            onUpload={handleUploadPDF}
            onTemplate={handleUseTemplate}
            initialView={createModalInitialView}
            initialTemplateId={selectedTemplateIdForModal}
            existingFlipbooks={books.map(b => b.realName || b.title)}
            initialFiles={initialDroppedFiles}
        >
            <div className="flex bg-[#eef0f8] h-full">
                {/* Sidebar */}
                <FlipbooksSidebar
                    activeFolder={activeFolder}
                    setActiveFolder={setActiveFolder}
                    setSelectedBooks={setSelectedBooks}
                    books={books}
                    folders={folders}
                    handleAddFolderClick={handleAddFolderClick}
                    folderListRef={folderListRef}
                    editingId={editingId}
                    tempName={tempName}
                    setTempName={setTempName}
                    saveEdit={saveEdit}
                    handleKeyDown={handleKeyDown}
                    dragFolderIndex={dragFolderIndex}
                    dragOverFolderIndex={dragOverFolderIndex}
                    handleFolderDragStart={handleFolderDragStart}
                    handleFolderDragOver={handleFolderDragOver}
                    handleFolderDragLeave={handleFolderDragLeave}
                    handleFolderDrop={handleFolderDrop}
                    handleFolderDragEnd={handleFolderDragEnd}
                    activeMenuId={activeMenuId}
                    setActiveMenuId={setActiveMenuId}
                    folderMenuPos={folderMenuPos}
                    setFolderMenuPos={setFolderMenuPos}
                    isCreatingFolder={isCreatingFolder}
                    setIsCreatingFolder={setIsCreatingFolder}
                    newFolderInputName={newFolderInputName}
                    setNewFolderInputName={setNewFolderInputName}
                    saveNewFolder={saveNewFolder}
                    creatingFolderName={creatingFolderName}
                    storage={storage}
                    isLoadingStorage={isLoadingStorage}
                    isUpgradeCardClosed={isUpgradeCardClosed}
                    setIsUpgradeCardClosed={setIsUpgradeCardClosed}
                    navigate={navigate}
                    startEditing={startEditing}
                    handleDuplicateFolder={handleDuplicateFolder}
                    handleDeleteFolderClick={handleDeleteFolderClick}
                    FOLDER_COLORS={FOLDER_COLORS}
                    setIsCreateModalOpen={setIsCreateModalOpen}
                    dashboardMode={dashboardMode}
                    setDashboardMode={setDashboardMode}
                    active3dFolder={active3dFolder}
                    setActive3dFolder={setActive3dFolder}
                />

            {/* Main Content */}
            <main
                className="flex-1 ml-[18vw] px-[1vw] pt-[1vw] pb-[1vw] relative bg-[#f8f9fb] flex flex-col select-none h-[92vh] max-h-[92vh] overflow-hidden"
            >
                {dashboardMode === '3d' ? (
                    <ThreeDDashboard
                        navigate={navigate}
                        activeFolder={active3dFolder}
                    />
                ) : (
                    <>
                        {/* Welcome Banner */}
                        <FlipbooksBanner
                    user={user}
                    setCreateModalInitialView={setCreateModalInitialView}
                    setIsCreateModalOpen={setIsCreateModalOpen}
                    handleUploadBoxDragOver={handleUploadBoxDragOver}
                    handleUploadBoxDrop={handleUploadBoxDrop}
                    setSelectedTemplateIdForModal={setSelectedTemplateIdForModal}
                    navigate={navigate}
                />

                {/* Title & Filters Row */}
                <FlipbooksToolbar
                    activeFolder={activeFolder}
                    setActiveFolder={setActiveFolder}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    folders={folders}
                    isFolderDropdownOpen={isFolderDropdownOpen}
                    setIsFolderDropdownOpen={setIsFolderDropdownOpen}
                    folderDropdownRef={folderDropdownRef}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    isStatusDropdownOpen={isStatusDropdownOpen}
                    setIsStatusDropdownOpen={setIsStatusDropdownOpen}
                    statusDropdownRef={statusDropdownRef}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    isSortDropdownOpen={isSortDropdownOpen}
                    setIsSortDropdownOpen={setIsSortDropdownOpen}
                    sortDropdownRef={sortDropdownRef}
                    filteredBooks={filteredBooks}
                    selectedBooks={selectedBooks}
                    handleEmptyTrashClick={handleEmptyTrashClick}
                    handleBulkRestore={handleBulkRestore}
                    handleBulkPermanentDelete={handleBulkPermanentDelete}
                    handleBulkDelete={handleBulkDelete}
                    handleBulkMove={handleBulkMove}
                    isAllSelected={isAllSelected}
                    handleSelectAll={handleSelectAll}
                />

                {/* Content Area */}
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-[5vw]">
                        <div className="animate-spin rounded-full h-[3vw] w-[3vw] border-[0.25vw] border-orange-200 border-t-[#ea543a]"></div>
                        <p className="text-gray-500 mt-[1vw] font-medium text-[0.875vw]">Loading Flipbooks...</p>
                    </div>
                ) : filteredBooks.length > 0 ? (
                    <CustomScrollbar
                        color="#d1d5db"
                        hoverColor="#9ca3af"
                        width="0.35vw"
                        className="flex-1 pr-[0.3vw] pb-[2vw] z-10 space-y-[0.85vw] min-h-0"
                        onScroll={() => setActiveBookMenu(null)}
                    >
                        {filteredBooks.map((book) => {
                            let actualFolder = book.folder;
                            if (actualFolder === 'Recent Book' || actualFolder === 'Recent book') {
                                const physicalBook = books.find(b => b.realName === book.realName && b.folder !== 'Recent Book' && b.folder !== 'Recent book');
                                if (physicalBook) actualFolder = physicalBook.folder;
                            }

                            const iframeBaseUrl = getSupabaseBaseUrl(
                                user?.emailId?.replace(/[@.]/g, "_"),
                                actualFolder,
                                book.realName
                            );

                            return (
                                <FlipbookCard
                                    key={book.id}
                                    book={book}
                                    selectedBooks={selectedBooks}
                                    toggleBookSelection={toggleBookSelection}
                                    editingBookId={editingBookId}
                                    tempBookTitle={tempBookTitle}
                                    setTempBookTitle={setTempBookTitle}
                                    saveBookEdit={saveBookEdit}
                                    handleBookKeyDown={handleBookKeyDown}
                                    handleToggleFavorite={handleToggleFavorite}
                                    activeFolder={activeFolder}
                                    emailId={emailId}
                                    backendUrl={backendUrl}
                                    iframeBaseUrl={iframeBaseUrl}
                                    formatDisplayDate={formatDisplayDate}
                                    formatDisplaySize={formatDisplaySize}
                                    handleRestoreBook={handleRestoreBook}
                                    handlePermanentDeleteBookClick={handlePermanentDeleteBookClick}
                                    handleShareClick={handleShareClick}
                                    handleDownloadClick={handleDownloadClick}
                                    navigate={navigate}
                                    books={books}
                                    activeBookMenu={activeBookMenu}
                                    setActiveBookMenu={setActiveBookMenu}
                                    setMenuPosition={setMenuPosition}
                                />
                            );
                        })}
                    </CustomScrollbar>
                ) : (
                    <FlipbooksEmptyState
                        activeFolder={activeFolder}
                        setIsCreateModalOpen={setIsCreateModalOpen}
                    />
                )}
                    </>
                )}
            </main>

            {/* Fixed Book Menu Portal */}
            <FlipbookActionMenu
                activeBookMenu={activeBookMenu}
                setActiveBookMenu={setActiveBookMenu}
                menuPosition={menuPosition}
                books={books}
                activeFolder={activeFolder}
                handleRestoreBook={handleRestoreBook}
                handlePermanentDeleteBookClick={handlePermanentDeleteBookClick}
                startEditingBook={startEditingBook}
                handleMoveBookClick={handleMoveBookClick}
                handleDuplicateBook={handleDuplicateBook}
                handleToggleFavorite={handleToggleFavorite}
                handleRemoveFromRecent={handleRemoveFromRecent}
                handleTrashBookClick={handleTrashBookClick}
            />



            {/* Move Book Modal */}
            <MoveToFolderModal
                moveBookModal={moveBookModal}
                setMoveBookModal={setMoveBookModal}
                isCreatingInMove={isCreatingInMove}
                setIsCreatingInMove={setIsCreatingInMove}
                newMoveFolderName={newMoveFolderName}
                setNewMoveFolderName={setNewMoveFolderName}
                handleCreateFolderAndMove={handleCreateFolderAndMove}
                confirmMoveBook={confirmMoveBook}
                moveModalListRef={moveModalListRef}
                folders={folders}
                books={books}
                activeFolder={activeFolder}
            />

            {/* Folder Delete Alert */}
            <AlertModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, folderId: null, folderName: '' })}
                onConfirm={confirmDelete}
                type="error"
                title="Delete Folder"
                message={`Are you sure you want to delete "${deleteConfirmation.folderName}"? This action cannot be undone.`}
                showCancel={true}
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isLoading}
            />

            {/* Book Delete Alert */}
            <AlertModal
                isOpen={deleteBookConfirmation.isOpen}
                onClose={() => setDeleteBookConfirmation({ isOpen: false, bookId: null, bookTitle: '', isPublished: false })}
                onConfirm={confirmDeleteBook}
                type={deleteBookConfirmation.isTrash ? "warning" : "error"}
                title={
                    deleteBookConfirmation.isEmptyTrash
                        ? "Empty Trash"
                        : deleteBookConfirmation.isTrash
                        ? (deleteBookConfirmation.isPublished
                            ? (deleteBookConfirmation.bookId === 'BULK' ? "Unpublish & Move to Trash" : "Unpublish & Move to Trash")
                            : (deleteBookConfirmation.bookId === 'BULK' ? "Move Selected Flipbooks to Trash" : "Move Flipbook to Trash"))
                        : (deleteBookConfirmation.isRecent || activeFolder === 'Recent Book')
                        ? (deleteBookConfirmation.bookId === 'BULK' ? "Remove Selected Flipbooks" : "Remove Flipbook from Recent")
                        : (deleteBookConfirmation.bookId === 'BULK' ? "Permanently Delete Flipbooks" : "Permanently Delete Flipbook")
                }
                message={
                    deleteBookConfirmation.isEmptyTrash
                        ? "Are you sure you want to permanently delete all flipbooks in Trash? This action cannot be undone."
                        : deleteBookConfirmation.isTrash
                        ? (deleteBookConfirmation.isPublished
                            ? (deleteBookConfirmation.bookId === 'BULK'
                                ? `${deleteBookConfirmation.publishedCount} of the selected flipbooks are currently published. If you move them to Trash, they will be automatically unpublished and readers won't be able to access them. Do you want to unpublish and move to Trash?`
                                : `"${deleteBookConfirmation.bookTitle}" is currently published. If you move it to Trash, the flipbook will be unpublished and readers won't be able to access it. Do you want to unpublish and move to Trash?`)
                            : (deleteBookConfirmation.bookId === 'BULK'
                                ? `Are you sure you want to move ${deleteBookConfirmation.bookTitle} to Trash? You can restore them anytime.`
                                : `Are you sure you want to move "${deleteBookConfirmation.bookTitle}" to Trash? You can restore it anytime from the Trash folder.`))
                        : (deleteBookConfirmation.isRecent || activeFolder === 'Recent Book')
                        ? `Are you sure you want to remove "${deleteBookConfirmation.bookTitle}" from Recent Books?`
                        : `Are you sure you want to permanently delete "${deleteBookConfirmation.bookTitle}"? This action cannot be undone.`
                }
                showCancel={true}
                confirmText={
                    deleteBookConfirmation.isEmptyTrash
                        ? "Empty Trash"
                        : deleteBookConfirmation.isTrash
                        ? (deleteBookConfirmation.isPublished ? "Unpublish & Move" : "Move to trash")
                        : (deleteBookConfirmation.isRecent || activeFolder === 'Recent Book')
                        ? "Remove"
                        : "Delete Permanently"
                }
                cancelText="Cancel"
                isLoading={isLoading}
            />



            {/* PDF Processing Overlay */}
            <PdfProcessingLoader progress={processingProgress} onCancel={handleCancelUploadPDF} />

            {/* General Loading Overlay (without specific progress) */}
            <AnimatePresence>
                {isLoading && !processingProgress && (
                    <motion.div
                        key="myflipbooks-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="fixed top-[8vh] left-0 right-0 bottom-0 z-40 flex flex-col items-center justify-center bg-white gap-3"
                    >
                        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-[0.85vw] font-semibold text-gray-600 tracking-wide">Loading Flipbooks...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generic Alert Modal */}
            <AlertModal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                type={alertState.type}
                title={alertState.title}
                message={alertState.message}
                showCancel={alertState.showCancel}
                onConfirm={alertState.onConfirm}
                isLoading={isLoading}
            />

            {/* Conflict / Rename & Move Modal */}
            <ConflictModal
                conflictModal={conflictModal}
                setConflictModal={setConflictModal}
                handleRenameAndMove={handleRenameAndMove}
            />

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                currentBook={selectedFlipbook}
                flipbookThumbnail={selectedFlipbook?.image ? resolveUploadsPath(selectedFlipbook.image) : null}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                currentBook={selectedFlipbook}
                isFromMyFlipbooks={true}
            />
        </div>
        </CreateBookLayout>
    );
}
