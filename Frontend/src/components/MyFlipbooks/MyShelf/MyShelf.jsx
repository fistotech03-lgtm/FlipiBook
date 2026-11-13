import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import ReplaceMediaModal from '../../PageEditor/modals/ReplaceMediaModal';
import { useAuth } from '../../../context/AuthContext';
import { getInitialUser } from '../../../utils/authUtils';
import { useToast } from '../../CustomToast';

import {
  shelfOptions,
  covers,
  bluesheet,
  blueshelfwood,
  bluedecor,
  greensheet,
  greenLightSheet,
  lightShelfSheet,
  plantLightShadowSheet,
  blueFrameSheet,
  windowShelfSheet,
  orangeSheet,
  goldenShelfSheet,
} from './constants';

import LazyPreview from './LazyPreview';
import ShareShelfModal from './modals/ShareShelfModal';
import ChangeShelfModal from './modals/ChangeShelfModal';
import AddShelfModal from './modals/AddShelfModal';
import MoveBookModal from './modals/MoveBookModal';
import AddBooksModal from './modals/AddBooksModal';

import ShelvesOverview from './components/ShelvesOverview';
import ShelfDetailView from './components/ShelfDetailView';
import ShelfCustomizerSidebar from './components/ShelfCustomizerSidebar';

const MyShelf = ({
  onFoldersChange,
  selectedFolder: propSelectedFolder,
  onSelectFolder,
  currentView: propCurrentView,
  onViewChange,
  isShelfAddModalOpen,
  setIsShelfAddModalOpen,
}) => {
  const toast = useToast();
  const [internalCurrentView, setInternalCurrentView] = useState('overview'); // 'overview' | 'shelf_detail'
  const currentView = propCurrentView !== undefined ? propCurrentView : internalCurrentView;
  const setCurrentView = (v) => {
    setInternalCurrentView(v);
    onViewChange?.(v);
  };

  const [view, setView] = useState('shelf');
  const [showShelfModal, setShowShelfModal] = useState(false);
  const [showShareShelfModal, setShowShareShelfModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [hoveredInfoId, setHoveredInfoId] = useState(null);

  const [folders, setFolders] = useState([]);

  // Notify parent after render whenever folders change
  useEffect(() => {
    if (folders.length > 0) {
      onFoldersChange?.(folders);
    }
  }, [folders, onFoldersChange]);

  const [internalSelectedFolder, setInternalSelectedFolder] = useState('');
  const selectedFolder = (propSelectedFolder !== undefined && propSelectedFolder !== '') ? propSelectedFolder : internalSelectedFolder;
  const setSelectedFolder = (f) => {
    setInternalSelectedFolder(f);
    onSelectFolder?.(f);
  };

  const [isEditingShelfName, setIsEditingShelfName] = useState(false);
  const [editingShelfNameValue, setEditingShelfNameValue] = useState('');

  const [internalShowAddModal, setInternalShowAddModal] = useState(false);
  const showAddShelfModal = isShelfAddModalOpen !== undefined ? isShelfAddModalOpen : internalShowAddModal;
  const setShowAddShelfModal = (open) => {
    setInternalShowAddModal(open);
    setIsShelfAddModalOpen?.(open);
  };
  const [newShelfName, setNewShelfName] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [draggedBookIndex, setDraggedBookIndex] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [bookToMoveIndex, setBookToMoveIndex] = useState(null);
  const [targetMoveFolder, setTargetMoveFolder] = useState('');

  // State for the currently applied shelf and the draft shelf in the modal
  const [activeShelfStyle, setActiveShelfStyle] = useState(shelfOptions[0].id);
  const [draftShelfStyle, setDraftShelfStyle] = useState(shelfOptions[0].id);

  // States for right sidebar customization & decors
  const [selectedWallTheme, setSelectedWallTheme] = useState(null); // null means default blue wall
  const [selectedLightTheme, setSelectedLightTheme] = useState('light1');
  const [logoFixType, setLogoFixType] = useState('Fit'); // 'Fit' | 'Fill'
  const [logoOpacity, setLogoOpacity] = useState(80);
  const [lightOpacity, setLightOpacity] = useState(100);
  const [shelfLogo, setShelfLogo] = useState(null); // { url, name, size, dimensions }
  const [showLogoModal, setShowLogoModal] = useState(false);
  const logoInputRef = useRef(null);

  const handleLogoFile = (file) => {
    if (!file) return;

    const url = file.url || URL.createObjectURL(file);
    const sizeMB = file.size ? (file.size / (1024 * 1024)).toFixed(1) : '1.0';
    const sizeStr = file.size ? (file.size > 1024 * 1024 ? `${sizeMB}MB` : `${Math.round(file.size / 1024)}KB`) : '';

    const img = new Image();
    img.onload = () => {
      setShelfLogo({
        url,
        name: file.name || 'Shelf Logo.png',
        dimensions: `${img.naturalWidth} X ${img.naturalHeight}`,
        size: sizeStr || 'Image',
      });
    };
    img.src = url;
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    handleLogoFile(file);
  };

  const handleRemoveLogo = () => {
    if (shelfLogo?.url && shelfLogo.url.startsWith('blob:')) {
      URL.revokeObjectURL(shelfLogo.url);
    }
    setShelfLogo(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const [defaultLightType, setDefaultLightType] = useState('Turn on');
  const [showLightSwitch, setShowLightSwitch] = useState(true);
  const [decors, setDecors] = useState({
    plant: true,
    decor: true,
    lamp: true,
    leaf: true,
    lights: true,
    shelfPlant: true,
    globeDecor: true,
    basePlant: true,
    bookDecor: true,
    bookWithPot: true,
  });
  const [shelfStylesPage, setShelfStylesPage] = useState(1);
  const [selectedBookCountFilter, setSelectedBookCountFilter] = useState('All'); // 'All' | '8' | '4' | '2'
  const [isShelfFullscreen, setIsShelfFullscreen] = useState(false);

  const toggleShelfFullscreen = () => {
    setIsShelfFullscreen(prev => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isShelfFullscreen) {
        setIsShelfFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShelfFullscreen]);

  const [booksData, setBooksData] = useState([]);
  const [allCreatedBooks, setAllCreatedBooks] = useState([]);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [addBookSearch, setAddBookSearch] = useState('');
  const [selectedBookIdsToAdd, setSelectedBookIdsToAdd] = useState([]);
  const [isAddingBooks, setIsAddingBooks] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user: authUser } = useAuth() || {};
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const currentUserEmail = (() => {
    if (authUser?.emailId || authUser?.email) {
      return (authUser.emailId || authUser.email).toLowerCase();
    }
    const cookieUser = getInitialUser();
    if (cookieUser?.emailId || cookieUser?.email) {
      return (cookieUser.emailId || cookieUser.email).toLowerCase();
    }
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u?.emailId || u?.email) return (u.emailId || u.email).toLowerCase();
      }
      const storedProfile = localStorage.getItem('user_profile');
      if (storedProfile) {
        const p = JSON.parse(storedProfile);
        if (p?.emailId || p?.email) return (p.emailId || p.email).toLowerCase();
      }
    } catch (e) { }
    return '';
  })();

  const getShelfStorageKey = (folderName) => {
    const email = currentUserEmail ? currentUserEmail.toLowerCase() : 'guest';
    const name = folderName || 'default';
    return `flipibook_shelf_customization_${email}_${name}`;
  };

  const loadSavedShelfSettings = (folderName) => {
    try {
      const raw = localStorage.getItem(getShelfStorageKey(folderName));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const saveShelfSettings = (folderName, settings) => {
    try {
      localStorage.setItem(getShelfStorageKey(folderName), JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to save shelf settings:", e);
    }
  };

  // Check URL query parameters on initial mount (for shared links or direct shelf navigation)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlShelf = searchParams.get('shelf') || searchParams.get('folder');
      const urlLight = searchParams.get('light');

      if (urlShelf) {
        setSelectedFolder(urlShelf);
        setCurrentView('shelf_detail');
      }

      if (urlLight === 'off' || urlLight === 'false' || urlLight === '0') {
        setDefaultLightType('Turn off');
        setDecors(prev => ({ ...prev, lights: false }));
      } else if (urlLight === 'on' || urlLight === 'true' || urlLight === '1') {
        setDefaultLightType('Turn on');
        setDecors(prev => ({ ...prev, lights: true }));
      }
    } catch (e) { }
  }, []);

  useEffect(() => {
    const fetchMyBooks = async () => {
      setIsLoading(true);
      try {
        if (!currentUserEmail) {
          setIsLoading(false);
          return;
        }
        const timestamp = Date.now();
        const [creatorRes, listRes, shelfRes] = await Promise.all([
          axios.get(`${backendUrl}/api/explore/creator`, { withCredentials: true, params: { t: timestamp } }).catch(() => ({ data: {} })),
          axios.get(`${backendUrl}/api/flipbook/list`, { withCredentials: true, params: { t: timestamp } }).catch((err) => {
            console.error("Error fetching flipbook list:", err);
            return { data: {} };
          }),
          axios.get(`${backendUrl}/api/profile/my-shelf-books`, { withCredentials: true, params: { t: timestamp, emailId: currentUserEmail } }).catch(() => ({ data: {} }))
        ]);

        if (creatorRes.data?.profile) {
          setProfileData(creatorRes.data.profile);
        }

        const rawBooks = listRes.data?.books || [];
        const shelfBooks = shelfRes.data?.books || [];
        const actualMyShelf = shelfRes.data?.shelfCustomizations || shelfRes.data?.myShelf || (creatorRes.data?.profile?.myShelf) || (profileData?.myShelf);
        const removedFromShelfSet = new Set(actualMyShelf?.removedFromShelf || []);

        const actualCreatedBooks = rawBooks.filter(b => b.folder !== 'Recent Book' && !removedFromShelfSet.has(b.v_id));
        setAllCreatedBooks(actualCreatedBooks);

        const combinedBooksMap = new Map();
        actualCreatedBooks.forEach(b => {
          combinedBooksMap.set(b.v_id, b);
        });
        shelfBooks.forEach(b => {
          if (!removedFromShelfSet.has(b.v_id)) {
            if (!combinedBooksMap.has(b.v_id)) {
              combinedBooksMap.set(b.v_id, b);
            } else {
              const existing = combinedBooksMap.get(b.v_id);
              existing.folder = b.folder;
            }
          }
        });

        const actualBooks = Array.from(combinedBooksMap.values());
        const fetchedProfile = creatorRes.data?.profile || profileData;

        const formatted = actualBooks.map((b, idx) => {
          const isMyBook = !b.isAddedToShelf || (b.userEmail && b.userEmail.toLowerCase() === currentUserEmail);

          let aName = b.authorName;
          let aPic = b.authorPicture;
          let aBg = b.authorBgColor;
          let aLoc = b.city || b.location;

          if (isMyBook && fetchedProfile) {
            aName = aName || fetchedProfile.name;
            aPic = aPic || (fetchedProfile.picture !== 'color_only' ? fetchedProfile.picture : null);
            aBg = aBg || fetchedProfile.avatarBgColor;
            aLoc = aLoc || fetchedProfile.city || fetchedProfile.state;
          }

          aName = aName || (b.userEmail ? b.userEmail.split('@')[0] : 'Creator');
          aBg = aBg || '#4c5add';
          aLoc = aLoc || 'Coimbatore';

          const rawOrientation = b.orientation || b.Customized_Settings?.FlipbookInfo?.orientation || b.rawBook?.orientation;
          const rawW = Number(b.width || b.Customized_Settings?.FlipbookInfo?.width || b.rawBook?.width || 0);
          const rawH = Number(b.height || b.Customized_Settings?.FlipbookInfo?.height || b.rawBook?.height || 0);
          const isLandscape = rawOrientation === 'landscape' || (rawW > 0 && rawH > 0 && rawW > rawH);

          return {
            rawBook: b,
            v_id: b.v_id,
            shareId: b.Customized_Settings?.Visibility?.shareId || b.Visibility?.shareId || b.v_id,
            access: b.Customized_Settings?.Visibility?.access || b.Visibility?.access || 'public',
            title: b.title || b.flipbookName || `Flipbook ${idx + 1}`,
            cover: b.image || covers[idx % covers.length],
            pages: typeof b.pages === 'number' ? b.pages : (b.pages?.length || 0),
            views: b.views || '1.2k',
            rating: b.rating || 4.5,
            description: b.Customized_Settings?.FlipbookInfo?.quotes || b.quotes || '“Bring your content to life with a real, interactive experience”',
            category: b.Customized_Settings?.FlipbookInfo?.category || b.category || 'Product Catalogue',
            authorName: aName,
            authorPicture: aPic,
            authorBgColor: aBg,
            location: aLoc,
            orientation: rawOrientation,
            width: rawW,
            height: rawH,
            isLandscape
          };
        });

        setBooksData(formatted);

        // Re-group books into folders
        const folderMap = {};
        const folderDesignMap = {};
        const bookToFolderMap = new Map();

        if (actualMyShelf && actualMyShelf.folders && actualMyShelf.folders.length > 0) {
          actualMyShelf.folders.forEach(f => {
            const fName = f.folderName === 'My_Flipbooks' ? 'My Flipbooks' : (f.folderName || 'My Flipbooks');
            if (!folderMap[fName]) folderMap[fName] = [];
            folderDesignMap[fName] = f.shelf_design || 'customize4';

            if (f.books && Array.isArray(f.books)) {
              f.books.forEach(b => {
                const v_id = typeof b === 'string' ? b : b.v_id;
                if (v_id) bookToFolderMap.set(v_id, fName);
              });
            }
          });
        }

        formatted.forEach(b => {
          const folderName = bookToFolderMap.get(b.v_id);
          if (folderName && folderMap[folderName]) {
            folderMap[folderName].push(b);
          }
        });

        if (actualMyShelf && actualMyShelf.folders && actualMyShelf.folders.length > 0) {
          const globalDbOrder = new Map();
          actualMyShelf.folders.forEach(f => {
            const fName = f.folderName === 'My_Flipbooks' ? 'My Flipbooks' : (f.folderName || 'My Flipbooks');
            if (f.books && Array.isArray(f.books)) {
              f.books.forEach((b) => {
                const v_id = typeof b === 'string' ? b : b.v_id;
                if (v_id) {
                  globalDbOrder.set(`${fName}_${v_id}`, { row: b.row || 0, order: b.order || 0 });
                }
              });
            }
          });

          Object.keys(folderMap).forEach(fName => {
            folderMap[fName].sort((a, b) => {
              const aOrder = globalDbOrder.get(`${fName}_${a.v_id}`);
              const bOrder = globalDbOrder.get(`${fName}_${b.v_id}`);
              if (aOrder && bOrder) {
                if (aOrder.row !== bOrder.row) return aOrder.row - bOrder.row;
                return aOrder.order - bOrder.order;
              }
              if (aOrder) return -1;
              if (bOrder) return 1;
              return 0;
            });
          });
        }

        const newFolders = Object.keys(folderMap).map(folderName => {
          const saved = loadSavedShelfSettings(folderName);
          const rawDesign = folderDesignMap[folderName];
          const backendFolder = actualMyShelf?.folders?.find(f => (f.folderName === 'My_Flipbooks' ? 'My Flipbooks' : f.folderName) === folderName);
          return {
            name: folderName,
            shelf_design: backendFolder?.shelf_design || saved?.shelf_design || ((rawDesign === 1 || !rawDesign || rawDesign === 4) ? 'customize4' : rawDesign),
            defaultLightType: backendFolder?.defaultLightType || saved?.defaultLightType || 'Turn on',
            lights: backendFolder?.lights !== undefined ? backendFolder.lights : (saved?.lights !== undefined ? saved.lights : true),
            selectedWallTheme: backendFolder?.selectedWallTheme || saved?.selectedWallTheme || null,
            selectedLightTheme: backendFolder?.selectedLightTheme || saved?.selectedLightTheme || null,
            showLightSwitch: backendFolder?.showLightSwitch !== undefined ? backendFolder.showLightSwitch : (saved?.showLightSwitch !== undefined ? saved.showLightSwitch : true),
            lightOpacity: backendFolder?.lightOpacity !== undefined ? backendFolder.lightOpacity : (saved?.lightOpacity !== undefined ? saved.lightOpacity : 1),
            decors: backendFolder?.decors || saved?.decors || {},
            logo: backendFolder?.logo || saved?.logo || '',
            ...saved,
            books: folderMap[folderName] || []
          };
        });

        setFolders(newFolders);
        if (newFolders.length > 0) {
          const currentExists = selectedFolder && newFolders.some(f => f.name === selectedFolder);
          if (!currentExists) {
            setSelectedFolder(newFolders[0].name);
          }
        }

        if (actualMyShelf && actualMyShelf.folders) {
          newFolders.forEach(folder => {
            const dbFolder = actualMyShelf.folders.find(f => f.folderName === folder.name || (folder.name === 'My Flipbooks' && f.folderName === 'My_Flipbooks'));
            const dbBookCount = dbFolder && dbFolder.books ? dbFolder.books.length : 0;

            if (folder.books.length !== dbBookCount) {
              try {
                const bookIds = folder.books.map(b => b.v_id);
                axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
                  emailId: currentUserEmail,
                  folderName: folder.name,
                  bookIds
                }).catch(e => console.warn("Auto-sync warning:", e));
              } catch (e) { }
            }
          });
        }
      } catch (err) {
        console.error("Error fetching my shelf books:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyBooks();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMyBooks();
      }
    };

    const handlePageShow = (e) => {
      if (e.persisted) {
        fetchMyBooks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [backendUrl, currentUserEmail]);

  const handleRemoveBook = async (v_id) => {
    if (!v_id) return;

    setBooksData(prev => prev.filter(b => b.v_id !== v_id));
    setFolders(prev => prev.map(f => {
      if (f.name === selectedFolder) {
        return {
          ...f,
          books: f.books.filter(b => b.v_id !== v_id)
        };
      }
      return f;
    }));

    try {
      await axios.post(`${backendUrl}/api/profile/remove-from-shelf`, {
        emailId: currentUserEmail,
        bookId: v_id,
        folderName: selectedFolder
      });
    } catch (err) {
      console.error("Failed to remove book:", err);
    }
  };

  const handleAddBooksToShelf = async () => {
    if (!selectedBookIdsToAdd.length || !currentUserEmail || !selectedFolder) return;
    setIsAddingBooks(true);
    try {
      const booksToAppend = allCreatedBooks.filter(b => selectedBookIdsToAdd.includes(b.v_id));

      const formattedToAppend = booksToAppend.map((b, idx) => {
        let aName = b.authorName || profileData?.name || (b.userEmail ? b.userEmail.split('@')[0] : 'Creator');
        let aPic = b.authorPicture || (profileData?.picture !== 'color_only' ? profileData?.picture : null);
        let aBg = b.authorBgColor || profileData?.avatarBgColor || '#4c5add';
        let aLoc = b.city || b.location || profileData?.city || profileData?.state || 'Coimbatore';

        const rawOrientation = b.orientation || b.Customized_Settings?.FlipbookInfo?.orientation || b.rawBook?.orientation;
        const rawW = Number(b.width || b.Customized_Settings?.FlipbookInfo?.width || b.rawBook?.width || 0);
        const rawH = Number(b.height || b.Customized_Settings?.FlipbookInfo?.height || b.rawBook?.height || 0);
        const isLandscape = rawOrientation === 'landscape' || (rawW > 0 && rawH > 0 && rawW > rawH);

        return {
          rawBook: b,
          v_id: b.v_id,
          shareId: b.Customized_Settings?.Visibility?.shareId || b.Visibility?.shareId || b.v_id,
          access: b.Customized_Settings?.Visibility?.access || b.Visibility?.access || 'public',
          title: b.title || b.flipbookName || `Flipbook ${idx + 1}`,
          cover: b.image || covers[idx % covers.length],
          pages: typeof b.pages === 'number' ? b.pages : (b.pages?.length || 0),
          views: b.views || '1.2k',
          rating: b.rating || 4.5,
          description: b.Customized_Settings?.FlipbookInfo?.quotes || b.quotes || '“Bring your content to life with a real, interactive experience”',
          category: b.Customized_Settings?.FlipbookInfo?.category || b.category || 'Product Catalogue',
          authorName: aName,
          authorPicture: aPic,
          authorBgColor: aBg,
          location: aLoc,
          orientation: rawOrientation,
          width: rawW,
          height: rawH,
          isLandscape
        };
      });

      let updatedFolderBooks = [];
      setFolders(prev => prev.map(f => {
        if (f.name === selectedFolder) {
          const existingIds = new Set((f.books || []).map(b => b.v_id));
          const newUnique = formattedToAppend.filter(b => !existingIds.has(b.v_id));
          updatedFolderBooks = [...(f.books || []), ...newUnique];
          return {
            ...f,
            books: updatedFolderBooks
          };
        }
        return f;
      }));

      const bookIds = updatedFolderBooks.map(b => b.v_id);
      await axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
        emailId: currentUserEmail,
        folderName: selectedFolder,
        bookIds
      });

      setShowAddBookModal(false);
      setSelectedBookIdsToAdd([]);
      setAddBookSearch('');
    } catch (err) {
      console.error("Failed to add books to shelf:", err);
    } finally {
      setIsAddingBooks(false);
    }
  };

  const handleDeleteShelf = async (folderNameToDelete) => {
    if (!folderNameToDelete) return;

    // Optimistically remove shelf from state
    setFolders(prev => prev.filter(f => f.name !== folderNameToDelete));

    // Clear local storage key for that shelf
    try {
      localStorage.removeItem(getShelfStorageKey(folderNameToDelete));
    } catch (_) {}

    if (currentUserEmail) {
      try {
        await axios.post(`${backendUrl}/api/profile/delete-shelf`, {
          emailId: currentUserEmail,
          folderName: folderNameToDelete
        });
        toast?.success?.(`Shelf "${folderNameToDelete}" removed successfully!`);
      } catch (err) {
        console.error("Failed to delete shelf:", err);
        toast?.error?.("Failed to delete shelf from database.");
      }
    }
  };

  // Sync active shelf style and customization settings with the selected folder
  useEffect(() => {
    if (!selectedFolder) return;

    const searchParams = new URLSearchParams(window.location.search);
    const urlLight = searchParams.get('light');

    const saved = loadSavedShelfSettings(selectedFolder);
    const currentFolder = folders.find(f => f.name === selectedFolder);

    const savedDesign = saved?.shelf_design || currentFolder?.shelf_design;
    if (savedDesign) {
      const designId = String(savedDesign).startsWith('customize')
        ? savedDesign
        : (savedDesign === 1 ? 'customize4' : `customize${savedDesign}`);
      setActiveShelfStyle(designId);
    }

    let lightTypeToApply = saved?.defaultLightType || currentFolder?.defaultLightType;
    if (urlLight === 'off' || urlLight === 'false' || urlLight === '0') {
      lightTypeToApply = 'Turn off';
    } else if (urlLight === 'on' || urlLight === 'true' || urlLight === '1') {
      lightTypeToApply = 'Turn on';
    }

    if (lightTypeToApply) {
      setDefaultLightType(lightTypeToApply);
      setDecors(prev => ({ ...prev, lights: lightTypeToApply === 'Turn on' }));
    } else {
      setDefaultLightType('Turn on');
      setDecors(prev => ({ ...prev, lights: true }));
    }

    if (saved) {
      if (saved.selectedWallTheme !== undefined) setSelectedWallTheme(saved.selectedWallTheme);
      if (saved.selectedLightTheme) setSelectedLightTheme(saved.selectedLightTheme);
      if (saved.showLightSwitch !== undefined) setShowLightSwitch(saved.showLightSwitch);
      if (saved.lightOpacity !== undefined) setLightOpacity(saved.lightOpacity);
      if (saved.decors) {
        setDecors(prev => ({
          ...prev,
          ...saved.decors,
          lights: lightTypeToApply ? lightTypeToApply === 'Turn on' : (saved.lights !== undefined ? saved.lights : true)
        }));
      }
    }
  }, [folders, selectedFolder]);

  const handleSaveShelfName = async () => {
    const trimmed = editingShelfNameValue.trim();
    if (!trimmed || trimmed === selectedFolder) {
      setIsEditingShelfName(false);
      return;
    }

    // Check for duplicate shelf / folder name when renaming
    const isDuplicate = folders.some(
      f => f.name !== selectedFolder && (f.name || '').toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      toast?.error?.(`A shelf named "${trimmed}" already exists!`);
      return;
    }

    const oldName = selectedFolder;
    setSelectedFolder(trimmed);
    setIsEditingShelfName(false);

    setFolders(prev => prev.map(f => f.name === oldName ? { ...f, name: trimmed } : f));

    if (currentUserEmail) {
      try {
        await axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
          emailId: currentUserEmail,
          folderName: trimmed,
          oldFolderName: oldName
        }).catch(() => {});
      } catch (err) {
        console.error("Failed to rename shelf:", err);
      }
    }

    toast?.success?.("Shelf renamed successfully!");
  };

  const handleFlipbookSelect = (e) => {
    if (e.target.value === 'add_shelf') {
      setShowAddShelfModal(true);
    } else {
      setSelectedFolder(e.target.value);
      const targetFolder = folders.find(f => f.name === e.target.value);
      if (targetFolder) {
        const designId = String(targetFolder.shelf_design).startsWith('customize')
          ? targetFolder.shelf_design
          : ((!targetFolder.shelf_design || targetFolder.shelf_design === 1) ? 'customize4' : `customize${targetFolder.shelf_design}`);
        setActiveShelfStyle(designId);
      }
    }
  };

  const applyShelfStyle = async () => {
    const targetStyle = activeShelfStyle;
    setShowShelfModal(false);

    if (!selectedFolder) {
      toast?.error?.("No shelf selected.");
      return;
    }

    // Respect the user's current light switch toggle state
    const isLightOn = decors?.lights !== undefined ? decors.lights : (defaultLightType === 'Turn on');
    const effectiveLightType = isLightOn ? 'Turn on' : 'Turn off';
    setDefaultLightType(effectiveLightType);

    const settingsToSave = {
      shelf_design: targetStyle,
      defaultLightType: effectiveLightType,
      lights: isLightOn,
      selectedWallTheme: selectedWallTheme,
      selectedLightTheme: selectedLightTheme,
      showLightSwitch: showLightSwitch,
      lightOpacity: lightOpacity,
      decors: {
        ...decors,
        lights: isLightOn
      }
    };
    saveShelfSettings(selectedFolder, settingsToSave);

    const currentFolderData = folders.find(f => f.name === selectedFolder);
    const existingBooks = currentFolderData?.books || [];

    setFolders(prev => prev.map(f => {
      if (f.name === selectedFolder) {
        return {
          ...f,
          ...settingsToSave,
          books: f.books && f.books.length > 0 ? f.books : existingBooks
        };
      }
      return f;
    }));
    setDecors(prev => ({ ...prev, lights: isLightOn }));

    if (currentUserEmail) {
      try {
        const bookIds = existingBooks.map(b => b.v_id).filter(Boolean);
        await Promise.all([
          axios.post(`${backendUrl}/api/profile/update-shelf-design`, {
            emailId: currentUserEmail,
            folderName: selectedFolder,
            shelf_design: targetStyle,
            defaultLightType: effectiveLightType,
            lights: isLightOn,
            selectedWallTheme: selectedWallTheme,
            selectedLightTheme: selectedLightTheme,
            showLightSwitch: showLightSwitch,
            lightOpacity: lightOpacity,
            decors: {
              ...decors,
              lights: isLightOn
            },
            logo: shelfLogo
          }).catch(err => console.warn("Backend update-shelf-design notice:", err)),
          bookIds.length > 0
            ? axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
                emailId: currentUserEmail,
                folderName: selectedFolder,
                bookIds
              }).catch(() => {})
            : Promise.resolve()
        ]);
      } catch (err) {
        console.error("Failed to update shelf design:", err);
      }
    }

    toast?.success?.("Shelf changes saved successfully!");
  };

  const handleMoveSubmit = async () => {
    if (targetMoveFolder === '__add_shelf__') {
      if (!newShelfName.trim()) return;
      const newFolderName = newShelfName.trim();
      let updatedSourceBooks = [];
      let newFolderBooks = [];

      setFolders(prev => {
        const sourceFolderIdx = prev.findIndex(f => f.name === selectedFolder);
        if (sourceFolderIdx === -1) return prev;

        const newSourceBooks = [...prev[sourceFolderIdx].books];
        const [movedBook] = newSourceBooks.splice(bookToMoveIndex, 1);

        updatedSourceBooks = newSourceBooks;
        newFolderBooks = [movedBook];

        const updatedFolders = prev.map((f, idx) =>
          idx === sourceFolderIdx ? { ...f, books: newSourceBooks } : f
        );

        return [{ name: newFolderName, books: newFolderBooks }, ...updatedFolders];
      });

      if (currentUserEmail) {
        try {
          await axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
            emailId: currentUserEmail,
            folderName: newFolderName,
            bookIds: newFolderBooks.map(b => b.v_id)
          });
          await axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
            emailId: currentUserEmail,
            folderName: selectedFolder,
            bookIds: updatedSourceBooks.map(b => b.v_id)
          });
        } catch (e) {
          console.error("Failed to sync move", e);
        }
      }

      setNewShelfName('');
      setShowMoveModal(false);
      setBookToMoveIndex(null);
      return;
    }

    if (!targetMoveFolder || targetMoveFolder === selectedFolder) {
      setShowMoveModal(false);
      return;
    }

    let updatedSourceBooks = [];
    let updatedTargetBooks = [];

    setFolders(prev => {
      const sourceFolderIdx = prev.findIndex(f => f.name === selectedFolder);
      const targetFolderIdx = prev.findIndex(f => f.name === targetMoveFolder);
      if (sourceFolderIdx === -1 || targetFolderIdx === -1) return prev;

      const newFolders = [...prev];
      const newSourceBooks = [...newFolders[sourceFolderIdx].books];
      const [movedBook] = newSourceBooks.splice(bookToMoveIndex, 1);

      const newTargetBooks = [...newFolders[targetFolderIdx].books];
      newTargetBooks.push(movedBook);

      updatedSourceBooks = newSourceBooks;
      updatedTargetBooks = newTargetBooks;

      newFolders[sourceFolderIdx] = { ...newFolders[sourceFolderIdx], books: newSourceBooks };
      newFolders[targetFolderIdx] = { ...newFolders[targetFolderIdx], books: newTargetBooks };
      return newFolders;
    });

    if (currentUserEmail) {
      try {
        await axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
          emailId: currentUserEmail,
          folderName: targetMoveFolder,
          bookIds: updatedTargetBooks.map(b => b.v_id)
        });
        await axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
          emailId: currentUserEmail,
          folderName: selectedFolder,
          bookIds: updatedSourceBooks.map(b => b.v_id)
        });
      } catch (e) {
        console.error("Failed to sync move", e);
      }
    }

    setShowMoveModal(false);
    setBookToMoveIndex(null);
  };

  const handleDragStart = (e, index) => {
    setDraggedBookIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedBookIndex === null || draggedBookIndex === targetIndex) return;

    const currentFolder = folders.find(f => f.name === selectedFolder);
    if (!currentFolder) return;

    const draggedBookObj = filteredBooks[draggedBookIndex];
    if (!draggedBookObj) return;

    const actualDraggedIndex = currentFolder.books.findIndex(b => b.v_id === draggedBookObj.v_id);
    if (actualDraggedIndex === -1) return;

    const targetBookObj = filteredBooks[targetIndex];
    const newBooks = [...currentFolder.books];

    if (targetBookObj) {
      const actualTargetIndex = currentFolder.books.findIndex(b => b.v_id === targetBookObj.v_id);
      if (actualTargetIndex !== -1 && actualTargetIndex !== actualDraggedIndex) {
        const temp = newBooks[actualDraggedIndex];
        newBooks[actualDraggedIndex] = newBooks[actualTargetIndex];
        newBooks[actualTargetIndex] = temp;
      }
    } else {
      const [draggedBook] = newBooks.splice(actualDraggedIndex, 1);
      if (targetIndex >= newBooks.length) {
        while (newBooks.length < targetIndex) {
          newBooks.push(null);
        }
        newBooks.push(draggedBook);
      } else {
        newBooks.splice(targetIndex, 0, draggedBook);
      }
    }

    setFolders(prev => prev.map(folder => {
      if (folder.name === selectedFolder) {
        return { ...folder, books: newBooks };
      }
      return folder;
    }));

    setDraggedBookIndex(null);

    try {
      const bookIds = newBooks.filter(Boolean).map(b => b.v_id);
      await axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
        emailId: currentUserEmail,
        folderName: selectedFolder,
        bookIds
      });
    } catch (err) {
      console.error("Failed to update shelf order:", err);
    }
  };

  const handleDragEnd = () => {
    setDraggedBookIndex(null);
  };

  const activeFolderGlobal = folders.find(f => f.name === selectedFolder);

  const filteredBooks = activeFolderGlobal
    ? activeFolderGlobal.books.filter(b => {
      if (selectedStatus === 'All Status') return true;

      const isPublic = String(b.access).toLowerCase() === 'public';
      const isPrivate = String(b.access).toLowerCase() === 'private';
      const isPublished = b.rawBook?.isPublished === true || b.rawBook?.isPublished === 'true';

      if (selectedStatus === 'Published - Public' && isPublished && isPublic) return true;
      if (selectedStatus === 'Published - Private' && isPublished && isPrivate) return true;
      if (selectedStatus === 'Unpublished - Public' && !isPublished && isPublic) return true;
      if (selectedStatus === 'Unpublished - Private' && !isPublished && isPrivate) return true;

      if (selectedStatus === 'Private' && isPrivate) return true;
      if (selectedStatus === 'Public' && isPublic) return true;

      return false;
    })
    : [];

  const getShelfAssets = (style) => {
    switch (style) {
      case 'customize_green':
        return {
          type: 'green_shelf',
          bg: selectedWallTheme || greensheet,
          bgStretch: true,
          noZone: true,
          isGreenTheme: true,
        };
      case 'customize_greenlight':
        return {
          type: 'green_light_shelf',
          bg: selectedWallTheme || greenLightSheet,
          bgStretch: true,
          noZone: true,
          isGreenTheme: true,
        };
      case 'customize_light':
        return {
          type: 'light_shelf',
          bg: selectedWallTheme || lightShelfSheet,
          bgStretch: true,
          noZone: true,
        };
      case 'customize_plantlight':
        return {
          type: 'plant_light_shelf',
          bg: selectedWallTheme || plantLightShadowSheet,
          bgStretch: true,
          noZone: true,
        };
      case 'customize_bluerope':
        return {
          type: 'blue_rope_shelf',
          bg: selectedWallTheme || blueFrameSheet,
          bgStretch: true,
          noZone: true,
        };
      case 'customize_windowshelf':
        return {
          type: 'window_shelf',
          bg: selectedWallTheme || windowShelfSheet,
          bgStretch: true,
          noZone: true,
        };
      case 'customize_orange':
        return {
          type: 'orange_shelf',
          bg: selectedWallTheme || orangeSheet,
          bgStretch: true,
          noZone: true,
        };
      case 'customize_golden':
        return {
          type: 'golden_shelf',
          bg: selectedWallTheme || goldenShelfSheet,
          bgStretch: true,
          noZone: true,
        };
      case 'customize4':
      default:
        return {
          type: 'blue_shelf',
          bg: selectedWallTheme || bluesheet,
          bgStretch: true,
          noZone: true,
        };
    }
  };

  const activeAssets = getShelfAssets(activeShelfStyle);

  const globalBookCount = filteredBooks.length;
  const globalRowCount = Math.max(3, Math.ceil(globalBookCount / 6));

  const spacing = activeAssets.spacing ?? 32;
  const topOffset = activeAssets.topOffset ?? 6;
  const heightRatio = globalRowCount <= 3 ? 1 : (100 + (globalRowCount - 3) * spacing + 3) / 100;

  const newTopOffset = topOffset / heightRatio;
  const newSpacing = spacing / heightRatio;

  return (
    <div className="flex flex-col w-full h-full min-h-0 px-4 pb-2 pt-1 font-sans text-gray-800">
      {/* Header (shown in Overview and in List View) */}
      {(currentView === 'overview' || view === 'list') && (
        <div className="flex justify-between items-start mb-6 -mt-2">
          <div>
            <div className="flex items-center gap-3">
              {currentView === 'shelf_detail' && (
                <button
                  onClick={() => setCurrentView('overview')}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
                  title="Back to All Shelves"
                >
                  <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-2xl font-bold mb-1">My Shelf</h1>
            </div>
            <p className="text-[12px] mt-0.5 text-[#94a3b8]">Mange your subscription, payment methods, billing details and invoices.</p>
          </div>
          {currentView === 'shelf_detail' && (
            <div className="flex gap-3">
              <button
                onClick={() => setView('shelf')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${view === 'shelf' ? 'bg-gray-50 text-[#1e293b] shadow-inner border-gray-200' : 'bg-white text-[#94a3b8] hover:text-[#64748b] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-transparent hover:border-gray-50'}`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${view === 'shelf' ? 'text-gray-500' : 'text-[#94a3b8]'}`}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M 2 3 h 20 v 5 H 2 Z M 13.5 4 h 1.2 v 4 h -1.2 Z M 15.1 4 h 1.2 v 4 h -1.2 Z M 16.7 4 h 1.2 v 4 h -1.2 Z M 18.3 4 h 1.2 v 4 h -1.2 Z M 2 9.5 h 20 v 5 H 2 Z M 3.5 10.5 h 1.2 v 4 h -1.2 Z M 5.1 10.5 h 1.2 v 4 h -1.2 Z M 6.7 10.5 h 1.2 v 4 h -1.2 Z M 8.5 14.5 L 9.7 10.5 h 1.2 L 9.7 14.5 Z M 2 16 h 20 v 5 H 2 Z M 3.5 17 h 1.2 v 4 h -1.2 Z M 5.1 17 h 1.2 v 4 h -1.2 Z M 13.5 18.4 h 4 v 1.2 h -4 Z M 14.5 19.8 h 4 v 1.2 h -4 Z" />
                </svg>
                <span>Shelf View</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${view === 'list' ? 'bg-gray-50 text-[#1e293b] shadow-inner border-gray-200' : 'bg-white text-[#94a3b8] hover:text-[#64748b] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-transparent hover:border-gray-50'}`}
              >
                <Icon icon="circum:box-list" className={`w-5 h-5 ${view === 'list' ? 'text-gray-500' : 'text-[#94a3b8]'}`} />
                <span>List View</span>
              </button>
            </div>
          )}
        </div>
      )}

      {currentView === 'overview' ? (
        <ShelvesOverview
          folders={folders}
          setSelectedFolder={setSelectedFolder}
          setActiveShelfStyle={setActiveShelfStyle}
          setSelectedWallTheme={setSelectedWallTheme}
          setCurrentView={setCurrentView}
          setShowAddShelfModal={setShowAddShelfModal}
          onDeleteShelf={handleDeleteShelf}
        />
      ) : (
        <div className="flex-1 flex items-stretch gap-6 relative min-h-0">
          <ShelfDetailView
            view={view}
            setCurrentView={setCurrentView}
            isEditingShelfName={isEditingShelfName}
            setIsEditingShelfName={setIsEditingShelfName}
            editingShelfNameValue={editingShelfNameValue}
            setEditingShelfNameValue={setEditingShelfNameValue}
            handleSaveShelfName={handleSaveShelfName}
            selectedFolder={selectedFolder}
            activeShelfStyle={activeShelfStyle}
            setActiveShelfStyle={setActiveShelfStyle}
            isShelfFullscreen={isShelfFullscreen}
            toggleShelfFullscreen={toggleShelfFullscreen}
            setShowShareShelfModal={setShowShareShelfModal}
            applyShelfStyle={applyShelfStyle}
            activeAssets={activeAssets}
            newTopOffset={newTopOffset}
            newSpacing={newSpacing}
            isLoading={isLoading}
            filteredBooks={filteredBooks}
            folders={folders}
            handleFlipbookSelect={handleFlipbookSelect}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            draggedBookIndex={draggedBookIndex}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragEnd={handleDragEnd}
            handleRemoveBook={handleRemoveBook}
            setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
            setAddBookSearch={setAddBookSearch}
            setShowAddBookModal={setShowAddBookModal}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={currentUserEmail}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={showLightSwitch}
            lightOpacity={lightOpacity}
            selectedLightTheme={selectedLightTheme}
            selectedWallTheme={selectedWallTheme}
            shelfLogo={shelfLogo}
            setShowLogoModal={setShowLogoModal}
            logoOpacity={logoOpacity}
            logoFixType={logoFixType}
            selectedBookCountFilter={selectedBookCountFilter}
            setSelectedBookCountFilter={setSelectedBookCountFilter}
            shelfStylesPage={shelfStylesPage}
            setShelfStylesPage={setShelfStylesPage}
          />

          <ShelfCustomizerSidebar
            view={view}
            shelfLogo={shelfLogo}
            logoInputRef={logoInputRef}
            handleLogoUpload={handleLogoUpload}
            handleLogoFile={handleLogoFile}
            setShowLogoModal={setShowLogoModal}
            handleRemoveLogo={handleRemoveLogo}
            logoFixType={logoFixType}
            setLogoFixType={setLogoFixType}
            logoOpacity={logoOpacity}
            setLogoOpacity={setLogoOpacity}
            selectedWallTheme={selectedWallTheme}
            setSelectedWallTheme={setSelectedWallTheme}
            defaultLightType={defaultLightType}
            setDefaultLightType={setDefaultLightType}
            showLightSwitch={showLightSwitch}
            setShowLightSwitch={setShowLightSwitch}
            selectedLightTheme={selectedLightTheme}
            setSelectedLightTheme={setSelectedLightTheme}
            lightOpacity={lightOpacity}
            setLightOpacity={setLightOpacity}
            decors={decors}
            setDecors={setDecors}
            activeShelfStyle={activeShelfStyle}
            activeAssets={activeAssets}
            booksData={booksData}
          />
        </div>
      )}

      {/* Share Shelf Modal */}
      <ShareShelfModal
        isOpen={showShareShelfModal}
        onClose={() => setShowShareShelfModal(false)}
        selectedFolder={selectedFolder}
        defaultLightType={defaultLightType}
        toast={toast}
      />

      {/* Change Shelf Modal */}
      <ChangeShelfModal
        isOpen={showShelfModal}
        onClose={() => setShowShelfModal(false)}
        draftShelfStyle={draftShelfStyle}
        setDraftShelfStyle={setDraftShelfStyle}
        onApply={applyShelfStyle}
      />

      {/* Add Shelf Modal */}
      <AddShelfModal
        isOpen={showAddShelfModal}
        onClose={() => setShowAddShelfModal(false)}
        newShelfName={newShelfName}
        setNewShelfName={setNewShelfName}
        onAddShelf={async () => {
          if (newShelfName.trim()) {
            const createdName = newShelfName.trim();

            // Check for duplicate shelf / folder name (case-insensitive)
            const isDuplicate = folders.some(
              f => (f.name || '').toLowerCase() === createdName.toLowerCase()
            );

            if (isDuplicate) {
              toast?.error?.(`A shelf named "${createdName}" already exists!`);
              return;
            }

            setFolders(prev => [{ name: createdName, books: [], shelf_design: 'customize4' }, ...prev]);
            setSelectedFolder(createdName);
            setActiveShelfStyle('customize4');
            setSelectedWallTheme(null);
            setCurrentView('shelf_detail');

            if (currentUserEmail) {
              try {
                await axios.post(`${backendUrl}/api/profile/update-shelf-design`, {
                  emailId: currentUserEmail,
                  folderName: createdName,
                  shelf_design: 'customize4'
                });
                await axios.post(`${backendUrl}/api/profile/update-shelf-order`, {
                  emailId: currentUserEmail,
                  folderName: createdName,
                  bookIds: []
                });
              } catch (e) {
                console.error("Failed to persist new shelf", e);
              }
            }

            setNewShelfName('');
            setShowAddShelfModal(false);
          }
        }}
      />

      {/* Move Book Modal */}
      <MoveBookModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        folders={folders}
        targetMoveFolder={targetMoveFolder}
        setTargetMoveFolder={setTargetMoveFolder}
        newShelfName={newShelfName}
        setNewShelfName={setNewShelfName}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        onMoveSubmit={handleMoveSubmit}
      />

      {/* Add Books to Shelf Modal */}
      <AddBooksModal
        isOpen={showAddBookModal}
        onClose={() => setShowAddBookModal(false)}
        selectedFolder={selectedFolder}
        folders={folders}
        allCreatedBooks={allCreatedBooks}
        selectedBookIdsToAdd={selectedBookIdsToAdd}
        setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
        addBookSearch={addBookSearch}
        setAddBookSearch={setAddBookSearch}
        isAddingBooks={isAddingBooks}
        onAddBooksToShelf={handleAddBooksToShelf}
      />

      {/* ReplaceMediaModal for Add / Replace Logo */}
      {showLogoModal && (
        <ReplaceMediaModal
          show={showLogoModal}
          size="small"
          titleText="Add Logo"
          buttonText="Add Logo"
          mediaType="image"
          onClose={() => setShowLogoModal(false)}
          onReplace={(file) => {
            handleLogoFile(file);
            setShowLogoModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MyShelf;

