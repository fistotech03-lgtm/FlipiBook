import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import ReplaceMediaModal from '../PageEditor/properties/ReplaceMediaModal';
import { useAuth } from '../../context/AuthContext';
import { getInitialUser } from '../../utils/authUtils';
const resolveUploadsPath = (path) => path || '';

import bookShelf1 from '../../assets/Bookshelf/Book_shelf1.webp';
import textureScreen2 from '../../assets/Bookshelf/classicwood/classic woodtexture.webp';
import bookShelf2 from '../../assets/Bookshelf/classicwood/classicwoodshelf.webp';
import darkOakTex1 from '../../assets/Bookshelf/Darkoak/texture_screen1.webp';
import darkOakTex2 from '../../assets/Bookshelf/Darkoak/texture_screen2.webp';
import darkOakTex3 from '../../assets/Bookshelf/Darkoak/texture_screen3.webp';
import darkOakShelf from '../../assets/Bookshelf/Darkoak/darkoakshelf.webp';

import mwWall1 from '../../assets/Bookshelf/modernwhite/wall1.webp';
import book1 from '../../assets/Bookshelf/Bookcover/book1.webp';
import book2 from '../../assets/Bookshelf/Bookcover/book2.webp';
import book3 from '../../assets/Bookshelf/Bookcover/book3.webp';
import book4 from '../../assets/Bookshelf/Bookcover/book4.webp';
import book5 from '../../assets/Bookshelf/Bookcover/book5.webp';
import book6 from '../../assets/Bookshelf/Bookcover/book6.webp';

const initialBooks = [
  book1, book2, book3, book4, book5, book6,
  book1, book2, book3, book4, book5, book6,
  book1, book2, book3, book4, book5, book6,
  book1
];

import customize1 from '../../assets/Bookshelf/customize_shelf/customize1.svg';
import customize2 from '../../assets/Bookshelf/customize_shelf/customize2.svg';
import customize3 from '../../assets/Bookshelf/customize_shelf/customize3.svg';
import listFrame from '../../assets/Bookshelf/list_frame.svg';

import cover1 from '../../assets/Explore/c-bg1.png';
import cover2 from '../../assets/Explore/c-bg2.png';
import cover3 from '../../assets/Explore/c-bg3.png';
import cover4 from '../../assets/Explore/c-bg4.png';
import cover5 from '../../assets/Explore/c-bg5.png';

import blueshade from '../../assets/Bookshelf/blueshelf/blueshade.svg';
import bluesheet from '../../assets/Bookshelf/blueshelf/bluesheet.webp';
import blueshelfwood from '../../assets/Bookshelf/blueshelf/blueshelfwood.webp';
import bluedecor from '../../assets/Bookshelf/blueshelf/bluedecor.webp';
import blueLamp from '../../assets/Bookshelf/blueshelf/Lamp.png';
import blueBookWithPot from '../../assets/Bookshelf/blueshelf/bookwithpot.png';
import greenshade from '../../assets/Bookshelf/greenshelf/greenshade.svg';
import greensheet from '../../assets/Bookshelf/greenshelf/greenshelf.webp';
import greenWoodshelf from '../../assets/Bookshelf/greenshelf/woodshelf.svg';
import greenShelfShadow from '../../assets/Bookshelf/greenshelf/shelfshadow.svg';
import greenLamp from '../../assets/Bookshelf/greenshelf/lamp.svg';
import greenDecor from '../../assets/Bookshelf/greenshelf/decor.svg';
import greenBase from '../../assets/Bookshelf/greenshelf/base.png';
import lightShelfImg from '../../assets/Bookshelf/light_shelf/light-sheld.svg';
import goldenLightSheet from '../../assets/Bookshelf/light_shelf/goldenlightsheet.png';
import lightShelfSpotlights from '../../assets/Bookshelf/light_shelf/light.png';
import lightShelfTopTier from '../../assets/Bookshelf/light_shelf/lightwithshelf.png';
import lightShelfBottomTier from '../../assets/Bookshelf/light_shelf/shelf.png';
import lightShelfLamp from '../../assets/Bookshelf/light_shelf/lamp.png';
import lightShelfPlant from '../../assets/Bookshelf/light_shelf/plantpot.png';
import lightShelfBase from '../../assets/Bookshelf/light_shelf/base.png';
import plantLightShelfImg from '../../assets/Bookshelf/plant-light/plantlight-shelf.svg';
import plantLightSheet from '../../assets/Bookshelf/plant-light/sheet.png';
import plantLightBase from '../../assets/Bookshelf/plant-light/base.png';
import plantLightShelf1 from '../../assets/Bookshelf/plant-light/shelf1.png';
import plantLightShelf2 from '../../assets/Bookshelf/plant-light/shelf2.png';
import plantLightPlant from '../../assets/Bookshelf/plant-light/plant.png';
import plantLightDecor from '../../assets/Bookshelf/plant-light/decor.png';
import plantLightLeaf from '../../assets/Bookshelf/plant-light/leaf.png';
import plantLightLamp from '../../assets/Bookshelf/plant-light/lamp.png';
import greenLightShelfImg from '../../assets/Bookshelf/greenlight/greenlight.svg';
import greenLightSheet from '../../assets/Bookshelf/greenlight/greenlighsheet.png';
import greenLightShelfPlank from '../../assets/Bookshelf/greenlight/greenshelf.png';
import greenLightLamp from '../../assets/Bookshelf/greenlight/lamp.png';
import greenLightPlant from '../../assets/Bookshelf/greenlight/plant.png';
import greenLightFixture from '../../assets/Bookshelf/greenlight/light.png';
import greenLightBase from '../../assets/Bookshelf/greenlight/base.png';

// Wall Theme Assets
import walltheme1 from '../../assets/Bookshelf/Wall_themes/walltheme_1.webp';
import walltheme2 from '../../assets/Bookshelf/Wall_themes/walltheme_2.webp';
import walltheme3 from '../../assets/Bookshelf/Wall_themes/walltheme_3.webp';
import walltheme4 from '../../assets/Bookshelf/Wall_themes/walltheme_4.webp';
import walltheme5 from '../../assets/Bookshelf/Wall_themes/walltheme_5.webp';
import walltheme6 from '../../assets/Bookshelf/Wall_themes/walltheme_6.webp';
import walltheme7 from '../../assets/Bookshelf/Wall_themes/walltheme_7.webp';
import walltheme8 from '../../assets/Bookshelf/Wall_themes/walltheme_8.webp';

// Light Theme Assets
import lightTheme1 from '../../assets/Bookshelf/Light_theme/Light_theme1.svg';
import lightTheme2 from '../../assets/Bookshelf/Light_theme/Light_theme2.svg';
import lightTheme3 from '../../assets/Bookshelf/Light_theme/Light_theme3.svg';

const wallThemeList = [
  { id: 'theme1', img: walltheme1 },
  { id: 'theme2', img: walltheme2 },
  { id: 'theme3', img: walltheme3 },
  { id: 'theme4', img: walltheme4 },
  { id: 'theme5', img: walltheme5 },
  { id: 'theme6', img: walltheme6 },
  { id: 'theme7', img: walltheme7 },
  { id: 'theme8', img: walltheme8 },
];

const lightThemeList = [
  { id: 'light1', img: lightTheme1, glowColor: 'rgba(245, 158, 11, 0.28)' },
  { id: 'light2', img: lightTheme2, glowColor: 'rgba(255, 255, 255, 0.25)' },
  { id: 'light3', img: lightTheme3, glowColor: 'rgba(56, 189, 248, 0.28)' },
];

const covers = [cover1, cover2, cover3, cover4, cover5];

const shelfOptions = [
  { id: 'customize4', name: 'Blue Shelf', img: blueshade },
  { id: 'customize_green', name: 'Green Shelf', img: greenshade },
  { id: 'customize_greenlight', name: 'Green-Light Shelf', img: greenLightShelfImg },
];

const MyShelf = () => {
  const [currentView, setCurrentView] = useState('overview'); // 'overview' | 'shelf_detail'
  const [view, setView] = useState('shelf');
  const [showShelfModal, setShowShelfModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [hoveredInfoId, setHoveredInfoId] = useState(null);
  const [folders, setFolders] = useState([
    { name: 'My Flipbooks', books: [] }
  ]);
  const [selectedFolder, setSelectedFolder] = useState('My Flipbooks');
  const [showAddShelfModal, setShowAddShelfModal] = useState(false);
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
  const [activeSidebarTab, setActiveSidebarTab] = useState('customize'); // 'customize' | 'books'
  const [selectedWallTheme, setSelectedWallTheme] = useState(null); // null means default blue wall
  const [selectedLightTheme, setSelectedLightTheme] = useState('light1');
  const [logoFixType, setLogoFixType] = useState('Fit'); // 'Fit' | 'Fill'
  const [showLogoFixDropdown, setShowLogoFixDropdown] = useState(false);
  const [logoOpacity, setLogoOpacity] = useState(80);
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
  const [decors, setDecors] = useState({
    plant: true,
    lamp: true,
    lights: true,
  });
  const [shelfStylesPage, setShelfStylesPage] = useState(1);

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

  useEffect(() => {
    const fetchMyBooks = async () => {
      setIsLoading(true);
      try {
        if (!currentUserEmail) {
          setIsLoading(false);
          return;
        }
        const timestamp = Date.now();
        const axiosOpts = { withCredentials: true };
        const [creatorRes, listRes, shelfRes] = await Promise.all([
          axios.get(`${backendUrl}/api/explore/creator`, { params: { emailId: currentUserEmail, t: timestamp }, ...axiosOpts }).catch(() => ({ data: {} })),
          axios.get(`${backendUrl}/api/flipbook/list`, { params: { emailId: currentUserEmail, t: timestamp }, ...axiosOpts }).catch((err) => {
            console.error("Error fetching flipbook list:", err);
            return { data: {} };
          }),
          axios.get(`${backendUrl}/api/profile/my-shelf-books`, { params: { emailId: currentUserEmail, t: timestamp }, ...axiosOpts }).catch(() => ({ data: {} }))
        ]);

        if (creatorRes.data?.profile) {
          setProfileData(creatorRes.data.profile);
        }

        const rawBooks = listRes.data?.books || [];
        const shelfBooks = shelfRes.data?.books || [];
        const actualMyShelf = shelfRes.data?.myShelf || (creatorRes.data?.profile?.myShelf) || (profileData?.myShelf);
        const removedFromShelfSet = new Set(actualMyShelf?.removedFromShelf || []);

        // Filter out 'Recent Book' virtual tags so we only show actual folder contents, or filter by specific folder
        const actualCreatedBooks = rawBooks.filter(b => b.folder !== 'Recent Book' && !removedFromShelfSet.has(b.v_id));
        setAllCreatedBooks(actualCreatedBooks);

        // Combine created books and shelf books, avoiding duplicates if a user somehow added their own book to the shelf
        const combinedBooksMap = new Map();
        actualCreatedBooks.forEach(b => {
          combinedBooksMap.set(b.v_id, b);
        });
        shelfBooks.forEach(b => {
          if (!removedFromShelfSet.has(b.v_id)) {
            if (!combinedBooksMap.has(b.v_id)) {
              combinedBooksMap.set(b.v_id, b);
            } else {
              // Update folder if the shelf explicitly categorized it differently
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
            location: aLoc
          };
        });

        setBooksData(formatted);

        // Re-group books into folders
        const folderMap = {};

        // First, initialize folderMap with any existing folders from the profile
        const folderDesignMap = {};
        const bookToFolderMap = new Map();
        
        if (actualMyShelf && actualMyShelf.folders) {
          actualMyShelf.folders.forEach(f => {
            const fName = f.folderName === 'My_Flipbooks' ? 'My Flipbooks' : (f.folderName || 'My Flipbooks');
            if (!folderMap[fName]) folderMap[fName] = [];
            folderDesignMap[fName] = f.shelf_design || 4;
            
            if (f.books && Array.isArray(f.books)) {
              f.books.forEach(b => {
                const v_id = typeof b === 'string' ? b : b.v_id;
                if (v_id) bookToFolderMap.set(v_id, fName);
              });
            }
          });
        }

        formatted.forEach(b => {
          let folderName = bookToFolderMap.get(b.v_id) || b.rawBook.folder || 'My Flipbooks';
          if (folderName === 'My_Flipbooks') {
            folderName = 'My Flipbooks';
          }
          if (!folderMap[folderName]) folderMap[folderName] = [];
          folderMap[folderName].push(b);
        });

        // Sort books based on their row and order from DB
        if (actualMyShelf && actualMyShelf.folders) {
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

          // Apply sorting based on folder mapping
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
              return 0; // Keep existing order if both missing
            });
          });
        }

        const newFolders = Object.keys(folderMap).map(folderName => ({
          name: folderName,
          books: folderMap[folderName],
          shelf_design: (folderDesignMap[folderName] === 1 || !folderDesignMap[folderName]) ? 4 : folderDesignMap[folderName]
        }));

        // Ensure 'My Flipbooks' always exists
        if (!newFolders.some(f => f.name === 'My Flipbooks')) {
          newFolders.unshift({ name: 'My Flipbooks', books: [], shelf_design: folderDesignMap['My Flipbooks'] || 4 });
        }

        setFolders(newFolders);

        // The active shelf style will be synced by the useEffect depending on selectedFolder

        // Auto-sync migration for missing legacy books or removed books
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

    // Optimistically update local state immediately so book vanishes instantly
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
      // Find full book objects from allCreatedBooks
      const booksToAppend = allCreatedBooks.filter(b => selectedBookIdsToAdd.includes(b.v_id));
      
      const formattedToAppend = booksToAppend.map((b, idx) => {
        let aName = b.authorName || profileData?.name || (b.userEmail ? b.userEmail.split('@')[0] : 'Creator');
        let aPic = b.authorPicture || (profileData?.picture !== 'color_only' ? profileData?.picture : null);
        let aBg = b.authorBgColor || profileData?.avatarBgColor || '#4c5add';
        let aLoc = b.city || b.location || profileData?.city || profileData?.state || 'Coimbatore';

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
          location: aLoc
        };
      });

      // Update state
      let updatedFolderBooks = [];
      setFolders(prev => prev.map(f => {
        if (f.name === selectedFolder) {
          // Avoid duplicates
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

      // Persist to backend
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

  // Sync active shelf style with the selected folder
  useEffect(() => {
    const currentFolder = folders.find(f => f.name === selectedFolder);
    if (currentFolder && currentFolder.shelf_design) {
      const designId = currentFolder.shelf_design === 1 ? 'customize4' : `customize${currentFolder.shelf_design}`;
      setActiveShelfStyle(designId);
    }
  }, [folders, selectedFolder]);

  const handleFlipbookSelect = (e) => {
    if (e.target.value === 'add_shelf') {
      setShowAddShelfModal(true);
    } else {
      setSelectedFolder(e.target.value);
      const targetFolder = folders.find(f => f.name === e.target.value);
      if (targetFolder) {
        const designId = (!targetFolder.shelf_design || targetFolder.shelf_design === 1) ? 'customize4' : `customize${targetFolder.shelf_design}`;
        setActiveShelfStyle(designId);
      }
    }
  };

  const openShelfModal = () => {
    setDraftShelfStyle(activeShelfStyle);
    setShowShelfModal(true);
  };

  const applyShelfStyle = async () => {
    setActiveShelfStyle(draftShelfStyle);
    setShowShelfModal(false);

    if (!currentUserEmail || !selectedFolder) return;
    try {
      const shelfDesignNum = parseInt(draftShelfStyle.replace('customize', '')) || 1;
      await axios.post(`${backendUrl}/api/profile/update-shelf-design`, {
        emailId: currentUserEmail,
        folderName: selectedFolder,
        shelf_design: shelfDesignNum
      });

      setFolders(prev => prev.map(f => f.name === selectedFolder ? { ...f, shelf_design: shelfDesignNum } : f));
    } catch (err) {
      console.error("Failed to update shelf design:", err);
    }
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

    const newBooks = [...currentFolder.books];
    const [draggedBook] = newBooks.splice(actualDraggedIndex, 1);

    const targetBookObj = filteredBooks[targetIndex];
    let actualTargetIndex;
    if (targetBookObj) {
      actualTargetIndex = currentFolder.books.findIndex(b => b.v_id === targetBookObj.v_id);
    } else {
      actualTargetIndex = newBooks.length;
    }

    newBooks.splice(actualTargetIndex, 0, draggedBook);

    setFolders(prev => prev.map(folder => {
      if (folder.name === selectedFolder) {
        return { ...folder, books: newBooks };
      }
      return folder;
    }));
    
    setDraggedBookIndex(null);

    try {
      const bookIds = newBooks.map(b => b.v_id);
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
    const bookCount = filteredBooks.length;
    const calculatedRowCount = Math.max(3, Math.ceil(bookCount / 6));

    switch (style) {
      case 'customize1':
        return {
          type: 'rows',
          bg: mwWall1,
          rowAsset: bookShelf1,
          rowCount: calculatedRowCount,
          bgStretch: false,
          noZone: true,
          padding: 'px-6',
          topOffset: 6,
          spacing: 32,
          bookWidth: '11.5%',
          bookStyle: { bottom: '21%', padding: '0 14%' }
        };
      case 'customize2':
        return {
          type: 'rows',
          bg: textureScreen2,
          rowAsset: bookShelf2,
          rowCount: calculatedRowCount,
          bgStretch: true,
          noZone: true,
          padding: 'px-0',
          rowPadding: '0 1.5%',
          topOffset: 29.7,
          spacing: 32.15,
          bookWidth: '13%',
          bookStyle: { bottom: '76%', padding: '0 10%' }
        };
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
          bg: selectedWallTheme || goldenLightSheet,
          bgStretch: true,
          noZone: true,
        };
      case 'customize_plantlight':
        return {
          type: 'plant_light_shelf',
          bg: selectedWallTheme || plantLightSheet,
          bgStretch: true,
          noZone: true,
        };
      case 'customize4':
        return {
          type: 'rows',
          bg: selectedWallTheme || bluesheet,
          rowAsset: blueshelfwood,
          rowCount: 2,
          bgStretch: true,
          noZone: true,
          decorBottom: bluedecor,
          padding: 'px-0',
          rowPadding: '0 4% 0 26%',
          topOffset: 16.5,
          spacing: 27.5,
          justify: 'justify-center gap-[2vw]',
          bookWidth: '15%',
          bookStyle: { bottom: '51%', padding: '0 6% 0 0' }
        };
      case 'customize3':
        return {
          type: 'rows',
          bg: [darkOakTex1, darkOakTex2, darkOakTex3],
          rowAsset: darkOakShelf,
          rowCount: calculatedRowCount,
          bgStretch: false,
          noZone: true,
          padding: 'px-0',
          rowPadding: '0 4%',
          topOffset: 5,
          spacing: 33,
          bookWidth: '11.5%',
          bookStyle: { bottom: '10%', padding: '0 10%' }
        };
      default:
        return {
          type: 'rows',
          bg: selectedWallTheme || bluesheet,
          rowAsset: blueshelfwood,
          rowCount: 2,
          bgStretch: true,
          noZone: true,
          decorBottom: bluedecor,
          padding: 'px-0',
          rowPadding: '0 4.5% 0 34.5%',
          topOffset: 16.5,
          spacing: 27.5,
          bookWidth: '21%',
          bookStyle: { bottom: '51%', padding: '0 8%' }
        };
    }
  };

  const activeAssets = getShelfAssets(activeShelfStyle);

  // Global variables for height and scroll calculation
  const globalBookCount = filteredBooks.length;
  const globalRowCount = Math.max(3, Math.ceil(globalBookCount / 6));

  // Calculate dynamic shelf positioning to perfectly preserve physical pixels
  const spacing = activeAssets.spacing ?? 32;
  const topOffset = activeAssets.topOffset ?? 6;
  // Container grows exactly by 'spacing' for each new shelf, plus a tiny 3% extra for breathing room
  const heightRatio = globalRowCount <= 3 ? 1 : (100 + (globalRowCount - 3) * spacing + 3) / 100;

  // Scale percentages inversely so physical positions remain identical
  const newTopOffset = topOffset / heightRatio;
  const newSpacing = spacing / heightRatio;

  return (
    <div className="flex flex-col w-full h-full px-4 pb-0 pt-1 overflow-visible font-sans text-gray-800">

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
        /* Shelves Overview Grid matching screenshot */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start max-w-5xl">
          {/* Shelf Cards (First shelf uses blueshade.svg as requested) */}
          {folders.map((folder, idx) => {
            const shelfTitle = idx === 0 && folder.name === 'My Flipbooks' ? 'Pumps based shelfs' : folder.name;
            return (
              <React.Fragment key={folder.name || idx}>
                <div
                  onClick={() => {
                    setSelectedFolder(folder.name);
                    setActiveShelfStyle('customize4');
                    setSelectedWallTheme(null);
                    setCurrentView('shelf_detail');
                  }}
                  className="group cursor-pointer flex flex-col items-center"
                >
                  <div className="w-full aspect-[354/200] rounded-xl overflow-hidden shadow-sm border border-gray-200/90 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-blue-400/50 transition-all duration-200 ease-out bg-white flex items-center justify-center">
                    <img
                      src={blueshade}
                      alt={shelfTitle}
                      className="w-full h-full object-cover transition-all duration-200 group-hover:contrast-[1.03]"
                    />
                  </div>
                  <span className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    {shelfTitle}
                  </span>
                </div>

                {/* Green Shelf card added right next to Blue Shelf */}
                {idx === 0 && (
                  <>
                    <div
                      onClick={() => {
                        setSelectedFolder(folder.name);
                        setActiveShelfStyle('customize_green');
                        setSelectedWallTheme(null);
                        setCurrentView('shelf_detail');
                      }}
                      className="group cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-full aspect-[354/200] rounded-xl overflow-hidden shadow-sm border border-gray-200/90 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-green-400/50 transition-all duration-200 ease-out bg-white flex items-center justify-center">
                        <img
                          src={greenshade}
                          alt="Green Shelf"
                          className="w-full h-full object-cover transition-all duration-200 group-hover:contrast-[1.03]"
                        />
                      </div>
                      <span className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                        Green Shelf
                      </span>
                    </div>

                    {/* Light Shelf card right beside Green Shelf */}
                    <div
                      onClick={() => {
                        setSelectedFolder(folder.name);
                        setActiveShelfStyle('customize_light');
                        setSelectedWallTheme(null);
                        setCurrentView('shelf_detail');
                      }}
                      className="group cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-full aspect-[354/200] rounded-xl overflow-hidden shadow-sm border border-gray-200/90 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-amber-400/50 transition-all duration-200 ease-out bg-white flex items-center justify-center">
                        <img
                          src={lightShelfImg}
                          alt="Light Shelf"
                          className="w-full h-full object-cover transition-all duration-200 group-hover:contrast-[1.03]"
                        />
                      </div>
                      <span className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">
                        Light Shelf
                      </span>
                    </div>

                    {/* Plant-Light Shelf card right beside Light Shelf */}
                    <div
                      onClick={() => {
                        setSelectedFolder(folder.name);
                        setActiveShelfStyle('customize_plantlight');
                        setSelectedWallTheme(null);
                        setCurrentView('shelf_detail');
                      }}
                      className="group cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-full aspect-[354/200] rounded-xl overflow-hidden shadow-sm border border-gray-200/90 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-emerald-400/50 transition-all duration-200 ease-out bg-white flex items-center justify-center">
                        <img
                          src={plantLightShelfImg}
                          alt="Plant-Light Shelf"
                          className="w-full h-full object-cover transition-all duration-200 group-hover:contrast-[1.03]"
                        />
                      </div>
                      <span className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">
                        Plant-Light Shelf
                      </span>
                    </div>

                    {/* Green-Light Shelf card right beside Plant-Light Shelf */}
                    <div
                      onClick={() => {
                        setSelectedFolder(folder.name);
                        setActiveShelfStyle('customize_greenlight');
                        setSelectedWallTheme(null);
                        setCurrentView('shelf_detail');
                      }}
                      className="group cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-full aspect-[354/200] rounded-xl overflow-hidden shadow-sm border border-gray-200/90 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-teal-400/50 transition-all duration-200 ease-out bg-white flex items-center justify-center">
                        <img
                          src={greenLightShelfImg}
                          alt="Green-Light Shelf"
                          className="w-full h-full object-cover transition-all duration-200 group-hover:contrast-[1.03]"
                        />
                      </div>
                      <span className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-teal-600 transition-colors">
                        Green-Light Shelf
                      </span>
                    </div>
                  </>
                )}
              </React.Fragment>
            );
          })}

          {/* Create New Shelf Dashed Card */}
          <div className="w-full aspect-[354/200] rounded-2xl border-2 border-dashed border-[#FCA5A5] bg-[#FEF2F2]/20 flex flex-col items-center justify-center p-6 text-center hover:bg-[#FEF2F2]/40 transition-colors">
            {/* Shelf Illustration / Icon with glowing rays */}
            <div className="relative mb-3 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center relative">
                {/* Subtle rays */}
                <span className="absolute -top-1 w-1 h-1.5 bg-orange-300 rounded-full"></span>
                <span className="absolute -top-0.5 -right-0.5 w-1 h-1.5 bg-orange-300 rounded-full rotate-45"></span>
                <span className="absolute -top-0.5 -left-0.5 w-1 h-1.5 bg-orange-300 rounded-full -rotate-45"></span>
                {/* Floating shelf icon */}
                <div className="w-7 h-2.5 bg-[#EA580C]/80 rounded-sm relative flex items-center justify-center shadow-sm">
                  <div className="w-3.5 h-1 bg-white/70 rounded-full"></div>
                </div>
                {/* Plus badge */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5733] rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  +
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-900 mb-1">Create New Shelf</h3>
            <p className="text-[11px] text-gray-500 mb-4 max-w-[240px] leading-relaxed">
              Design a new shelf, add your flipbooks and share with your clients
            </p>

            <button
              onClick={() => setShowAddShelfModal(true)}
              className="px-5 py-2 bg-[#FF5733] hover:bg-[#E04D2D] active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Create New Shelf</span>
            </button>
          </div>
        </div>
      ) : (
        /* Detailed Bookshelf / List View */
        <>

      {/* Main Content */}
      <div className="flex items-start gap-6 relative">
        {view === 'shelf' ? (
          /* Left Shelf Column (Header + Shelf + Styles) */
          <div className="flex-1 flex flex-col min-w-0">
            {/* Shelf View Header scoped to Shelf width (ends at shelf right edge) */}
            <div className="flex flex-col mb-3 w-full -mt-1">
              {/* Back to My Shelf Link */}
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setCurrentView('overview')}
                  className="flex items-center gap-1 text-[#FF5733] hover:text-[#E04D2D] text-xs font-semibold transition-colors"
                >
                  <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                  <span>My Shelf</span>
                </button>
              </div>

              {/* Title Row aligned straight with Action Buttons at the shelf right edge */}
              <div className="w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                      {activeShelfStyle === 'customize_plantlight' ? 'Plant-Light Shelf' : activeShelfStyle === 'customize_light' ? 'Light Shelf' : activeShelfStyle === 'customize_greenlight' ? 'Green-Light Shelf' : activeShelfStyle === 'customize_green' ? 'Green Shelf' : (selectedFolder === 'My Flipbooks' ? 'Pumps based shelf' : selectedFolder)}
                    </h2>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-0.5" title="Rename shelf">
                      <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Shelf link copied to clipboard!');
                        }
                      }}
                      className="flex items-center gap-2 px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
                    >
                      <Icon icon="lucide:share-2" className="w-3.5 h-3.5 text-gray-600" />
                      <span>Share Shelf</span>
                    </button>

                    <button
                      onClick={applyShelfStyle}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FF5733] hover:bg-[#E04D2D] active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      <Icon icon="lucide:check" className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 mt-1">
                  {filteredBooks.length} Books &nbsp;•&nbsp; Last updated 14 Oct 2026
                </p>
              </div>
            </div>

            {/* The Shelf Stage (w-full fills wrapper completely, aspect-[16/8.4] mild height increase) */}
            <div
              className="w-full aspect-[16/8.4] rounded-2xl overflow-hidden relative shadow-sm"
              style={{
                backgroundImage: (!Array.isArray(activeAssets.bg) && activeAssets.bg) ? `url('${activeAssets.bg}')` : 'none',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 z-50 flex gap-2 items-center justify-center bg-white/50 backdrop-blur-sm">
                  <Icon icon="eos-icons:loading" className="w-8 h-8 text-blue-600" />
                  <span className="text-base font-semibold text-gray-700">Shelf Loading...</span>
                </div>
              )}
                {/* If bg is an array, map over it to render wall blocks */}
                {Array.isArray(activeAssets.bg) && (
                  <div className="absolute inset-0 flex flex-col rounded-xl overflow-hidden pointer-events-none">
                    {Array.from({ length: activeAssets.rowCount }, (_, i) => (
                      <div
                        key={i}
                        className="w-full flex-1 bg-center"
                        style={{
                          backgroundImage: `url('${activeAssets.bg[i % activeAssets.bg.length]}')`,
                          backgroundSize: activeAssets.bgStretch ? '100% 100%' : '100% auto',
                          backgroundRepeat: activeAssets.bgStretch ? 'no-repeat' : 'repeat',
                          backgroundPosition: 'center',
                        }}
                      />
                    ))}
                  </div>
                )}
                {openMenuId && (
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setOpenMenuId(null)}
                  />
                )}


                {activeAssets.type === 'rows' && activeAssets.rowAsset && (
                  <div className="absolute inset-0 w-full h-full">
                    {Array.from({ length: activeAssets.rowCount }, (_, i) => (
                      <div
                        key={i}
                        className={`absolute left-0 w-full ${activeAssets.rowPadding ? '' : (activeAssets.padding || 'px-12')}`}
                        style={{
                          top: `${newTopOffset + (i * newSpacing) - (activeShelfStyle === 'customize2' && i !== activeAssets.rowCount - 1 ? 3.5 : 0)}%`,
                          padding: activeAssets.rowPadding || undefined
                        }}
                      >
                        <div className="relative w-full">
                          {!(activeShelfStyle === 'customize2' && i === activeAssets.rowCount - 1) && (
                            <img src={activeAssets.rowAsset} alt="Shelf" className="w-full h-auto drop-shadow-lg" />
                          )}
                          {activeAssets.rowShadow && (
                            <img src={activeAssets.rowShadow} alt="Shelf Shadow" className="w-full h-auto -mt-[1%] opacity-90 drop-shadow-md" />
                          )}
                          {/* Books Container */}
                          {!activeAssets.hideBooks && (
                            <div
                              className={`absolute inset-x-0 flex items-end ${activeAssets.justify || 'justify-between'}`}
                              style={activeAssets.bookStyle || { bottom: '15%', padding: '0 5%' }}
                            >
                            {(() => {
                              const booksPerRow = activeShelfStyle === 'customize4' ? 4 : 6;
                              const rowBooks = filteredBooks.slice(i * booksPerRow, (i + 1) * booksPerRow) || [];
                              const paddedBooks = [...rowBooks, ...Array.from({ length: booksPerRow - rowBooks.length }).fill(null)];
                              
                              return paddedBooks.map((book, bIdx) => {
                                const bookIndex = i * booksPerRow + bIdx;
                                if (!book) {
                                  return (
                                    <div
                                      key={`empty-${i}-${bIdx}`}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop(e, bookIndex)}
                                      className={`relative flex justify-center items-end ${activeShelfStyle === 'customize2' ? (i === activeAssets.rowCount - 1 ? 'translate-y-4' : 'translate-y-0') : activeShelfStyle === 'customize4' ? 'translate-y-0' : 'translate-y-2'}`}
                                      style={{ width: activeAssets.bookWidth || '12%' }}
                                    >
                                      {activeShelfStyle === 'customize4' ? (
                                        <div
                                          onClick={() => {
                                            setSelectedBookIdsToAdd([]);
                                            setAddBookSearch('');
                                            setShowAddBookModal(true);
                                          }}
                                          className="w-full aspect-[2.5/3.25] rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/15 backdrop-blur-[1px]"
                                          title="Add Book"
                                        >
                                          <div className="relative flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                            <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-white/90" />
                                            <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-white leading-none">
                                              +
                                            </span>
                                          </div>
                                          <span className="text-[9px] font-medium text-white/90 group-hover:text-white tracking-wide">
                                            Add Book
                                          </span>
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                }

                                const emailFolder = book.rawBook?.userEmail ? book.rawBook.userEmail.replace(/[@.]/g, "_") : '';
                                const folderName = (book.rawBook?.folderName && book.rawBook.folderName.length > 0) ? book.rawBook.folderName[0] : (book.rawBook?.folder || '');
                                const bookName = book.rawBook?.flipbookName || book.rawBook?.title || '';
                                const basePath = '';

                                return (
                                  <div
                                    key={book.v_id || bIdx}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, bookIndex)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, bookIndex)}
                                    onDragEnd={handleDragEnd}
                                    className={`relative group cursor-pointer flex justify-center items-end ${activeShelfStyle === 'customize2' ? (i === activeAssets.rowCount - 1 ? 'translate-y-4' : 'translate-y-0') : activeShelfStyle === 'customize4' ? 'translate-y-0' : 'translate-y-2'} ${openMenuId === `${i}-${bIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bookIndex ? 'opacity-50' : ''}`}
                                    style={{ width: activeAssets.bookWidth || '12%' }}
                                  >
                                    <div className={`w-[100%] ${activeShelfStyle === 'customize4' ? 'aspect-[2.5/3.25]' : 'aspect-[2.5/3.5]'} relative rounded-[3px] drop-shadow-md transition-transform origin-bottom group-hover:scale-105 overflow-hidden`}>
                                      <LazyPreview
                                        v_id={book.v_id}
                                        emailId={book.rawBook?.userEmail || currentUserEmail}
                                        backendUrl={backendUrl}
                                        iframeBaseUrl={basePath}
                                        title={book.title}
                                        imageUrl={null}
                                      />
                                    </div>

                                {/* Hover Menu Pill */}
                                <div className="absolute top-[2%] right-[0vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === `${i}-${bIdx}` ? null : `${i}-${bIdx}`)}
                                    className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                                  >
                                    <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                                  </button>
                                  <div
                                    className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                    onMouseEnter={() => setHoveredInfoId(`${i}-${bIdx}`)}
                                    onMouseLeave={() => setHoveredInfoId(null)}
                                  >
                                    <Icon icon="si:info-fill" className="w-4 h-4" />

                                    {/* Info Tooltip Bridge & Container */}
                                    <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `${i}-${bIdx}` ? 'block' : 'hidden'} z-[60]`}>
                                      <div className="w-[170px] bg-white rounded-xl p-4 text-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col gap-3 cursor-default text-left border border-gray-100 relative">
                                        {/* Author Info */}
                                        <div className="flex items-center gap-2">
                                          {book.authorPicture && book.authorPicture !== 'color_only' ? (
                                            <img
                                              src={book.authorPicture}
                                              alt={book.authorName}
                                              className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0"
                                            />
                                          ) : (
                                            <div
                                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-inner"
                                              style={{ backgroundColor: book.authorBgColor }}
                                            >
                                              {(book.authorName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                          )}
                                          <div className="flex flex-col min-w-0 pr-1">
                                            <span className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 truncate">
                                              <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                                              <span className="truncate">{String(book.location).replace(/📍/g, '').trim()}</span>
                                            </span>
                                          </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-2 justify-start text-[11px] text-gray-700 font-medium whitespace-nowrap">
                                          <div className="flex items-center gap-1">
                                            <span className="text-black font-semibold">{book.pages || 0}</span>
                                            <span className="font-normal text-gray-500">Pages</span>
                                          </div>
                                          <span className="text-gray-300">|</span>
                                          <span className="flex items-center gap-1">
                                            <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-gray-400" />
                                            {book.views || '1.2k'}
                                          </span>
                                          <span className="text-gray-300">|</span>
                                          <span className="flex items-center gap-1">
                                            <Icon icon="material-symbols:star" className="w-3.5 h-3.5 text-yellow-400" />
                                            {book.rating || 4.5}
                                          </span>
                                        </div>

                                        {/* Title & Desc & Button */}
                                        <div className="relative">
                                          <h4 className="text-[14px] font-semibold text-black truncate tracking-tight mb-1">{book.title}</h4>
                                          <p className="text-[11px] text-gray-500 leading-relaxed pr-10 line-clamp-2">{book.description}</p>

                                          {/* Action Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const targetShareId = book.shareId || book.v_id;
                                              const rawAcc = String(book.access || 'public').toLowerCase();
                                              if (targetShareId) {
                                                window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                              }
                                            }}
                                            className="absolute bottom-0 right-0 bg-black text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                                          >
                                            <Icon icon="mdi:arrow-top-right" className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                                  
                                {openMenuId === `${i}-${bIdx}` && (
                                  <div className="absolute top-[2%] -right-[0.5vw] bg-white rounded-[0.5vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-[0.2vw] w-[7vw] z-50 overflow-hidden">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const targetShareId = book.shareId || book.v_id;
                                        const rawAcc = String(book.access || 'public').toLowerCase();
                                        if (targetShareId) {
                                          window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                        }
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                    >
                                      Open Book
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveBook(book.v_id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      Remove Book
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
                {/* Green Shelf Custom Layout matching Screenshot 3 */}
                {activeAssets.type === 'green_shelf' && (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* 2 Tiers of Shelves: Top tier and Bottom tier */}
                    {[
                      { tierIdx: 0, top: '38%', books: [0, 1, 2, 3] },
                      { tierIdx: 1, top: '69%', books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, top, books }) => (
                      <React.Fragment key={`green-tier-${tierIdx}`}>
                        {/* Two split shelves per tier: Left shelf and Right shelf */}
                        {[
                          { side: 'left', left: '17.2%', width: '28.8%', bookIndices: [books[0], books[1]] },
                          { side: 'right', left: '49.0%', width: '30.1%', bookIndices: [books[2], books[3]] }
                        ].map(({ side, left, width, bookIndices }) => (
                          <div
                            key={`green-shelf-${tierIdx}-${side}`}
                            className="absolute pointer-events-auto"
                            style={{
                              top,
                              left,
                              width
                            }}
                          >
                            <div className="relative w-full">
                              {/* 1. Wood Shelf Plank (Crisp warm off-white floating shelf matching Screenshot 3) */}
                              <div
                                className="w-full relative z-10 rounded-[2px]"
                                style={{
                                  height: '1.15vw',
                                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F4 55%, #ECE7DD 92%, #DDD7CB 100%)',
                                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 #FFFFFF'
                                }}
                              />

                              {/* 2. Delicate warm LED strip glow directly underneath the shelf matching Screenshot 3 */}
                              {decors.lights && (
                                <>
                                  {/* Crisp thin warm LED light line under plank */}
                                  <div
                                    className="absolute left-[0.5%] right-[0.5%] pointer-events-none z-0"
                                    style={{
                                      top: '98%',
                                      height: '0.22vw',
                                      background: '#FFDE82',
                                      borderRadius: '0 0 1px 1px',
                                      boxShadow: '0 0 6px 1px #FBBF24, 0 0 12px 2px rgba(245, 158, 11, 0.5)'
                                    }}
                                  />
                                  {/* Soft luminous warm glow spreading downwards onto the green wall */}
                                  <div
                                    className="absolute left-[2%] right-[2%] pointer-events-none z-0"
                                    style={{
                                      top: '100%',
                                      height: '1.4vw',
                                      background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(254, 240, 138, 0.5) 0%, rgba(251, 191, 36, 0.2) 40%, rgba(245, 158, 11, 0.04) 70%, transparent 100%)',
                                      mixBlendMode: 'screen',
                                      filter: 'blur(1px)'
                                    }}
                                  />
                                </>
                              )}

                              {/* Soft ambient drop shadow underneath */}
                              <div
                                className="absolute left-[0.5%] right-[0.5%] pointer-events-none -z-10"
                                style={{
                                  top: '100%',
                                  height: '0.8vw',
                                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.03) 60%, transparent 100%)',
                                  filter: 'blur(2px)'
                                }}
                              />

                              {/* 3. Books sitting on top of the shelf (2 books per shelf plank = 4 books per tier = 8 total) */}
                              <div
                                className="absolute inset-x-0 bottom-[100%] flex justify-around items-end z-20"
                                style={{ padding: '0 4%', marginBottom: '-1px' }}
                              >
                                {bookIndices.map((bGlobalIdx, slotIdx) => {
                                  const book = filteredBooks[bGlobalIdx];
                                  if (!book) {
                                    return (
                                      <div
                                        key={`green-empty-${tierIdx}-${side}-${slotIdx}`}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, bGlobalIdx)}
                                        className="relative flex justify-center items-end"
                                        style={{ width: '34%' }}
                                      >
                                        <div
                                          onClick={() => {
                                            setSelectedBookIdsToAdd([]);
                                            setAddBookSearch('');
                                            setShowAddBookModal(true);
                                          }}
                                          className="w-full aspect-[2.5/3.4] rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/20 backdrop-blur-[1px] shadow-sm"
                                          title="Add Book"
                                        >
                                          <div className="relative flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                            <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-white/90" />
                                            <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-white leading-none">
                                              +
                                            </span>
                                          </div>
                                          <span className="text-[9px] font-medium text-white/90 group-hover:text-white tracking-wide">
                                            Add Book
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }

                                  const emailFolder = book.rawBook?.userEmail ? book.rawBook.userEmail.replace(/[@.]/g, "_") : '';
                                  const folderName = (book.rawBook?.folderName && book.rawBook.folderName.length > 0) ? book.rawBook.folderName[0] : (book.rawBook?.folder || '');
                                  const bookName = book.rawBook?.flipbookName || book.rawBook?.title || '';
                                  const basePath = '';

                                  return (
                                    <div
                                      key={book.v_id || `green-book-${bGlobalIdx}`}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, bGlobalIdx)}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop(e, bGlobalIdx)}
                                      onDragEnd={handleDragEnd}
                                      className={`relative group cursor-pointer flex justify-center items-end ${openMenuId === `green-${bGlobalIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bGlobalIdx ? 'opacity-50' : ''}`}
                                      style={{ width: '34%' }}
                                    >
                                      {/* Book Cover with 3D drop shadow resting on wood shelf */}
                                      <div className="w-full aspect-[2.5/3.4] relative rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
                                        <LazyPreview
                                          v_id={book.v_id}
                                          emailId={book.rawBook?.userEmail || currentUserEmail}
                                          backendUrl={backendUrl}
                                          iframeBaseUrl={basePath}
                                          title={book.title}
                                          imageUrl={null}
                                        />
                                      </div>

                                      {/* Hover Menu Pill */}
                                      <div className="absolute top-[2%] -right-[0.4vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto">
                                        <button
                                          onClick={() => setOpenMenuId(openMenuId === `green-${bGlobalIdx}` ? null : `green-${bGlobalIdx}`)}
                                          className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                                        >
                                          <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                                        </button>
                                        <div
                                          className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                          onMouseEnter={() => setHoveredInfoId(`green-${bGlobalIdx}`)}
                                          onMouseLeave={() => setHoveredInfoId(null)}
                                        >
                                          <Icon icon="si:info-fill" className="w-4 h-4" />

                                          {/* Info Tooltip Bridge & Container */}
                                          <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `green-${bGlobalIdx}` ? 'block' : 'hidden'} z-[60]`}>
                                            <div className="w-[170px] bg-white rounded-xl p-4 text-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col gap-3 cursor-default text-left border border-gray-100 relative">
                                              {/* Author Info */}
                                              <div className="flex items-center gap-2">
                                                {book.authorPicture && book.authorPicture !== 'color_only' ? (
                                                  <img
                                                    src={book.authorPicture}
                                                    alt={book.authorName}
                                                    className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0"
                                                  />
                                                ) : (
                                                  <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-inner"
                                                    style={{ backgroundColor: book.authorBgColor }}
                                                  >
                                                    {(book.authorName || 'U').charAt(0).toUpperCase()}
                                                  </div>
                                                )}
                                                <div className="flex flex-col min-w-0 pr-1">
                                                  <span className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                                                  <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 truncate">
                                                    <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                                                    <span className="truncate">{String(book.location).replace(/📍/g, '').trim()}</span>
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Stats */}
                                              <div className="flex items-center gap-2 justify-start text-[11px] text-gray-700 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-black font-semibold">{book.pages || 0}</span>
                                                  <span className="font-normal text-gray-500">Pages</span>
                                                </div>
                                                <span className="text-gray-300">|</span>
                                                <span className="flex items-center gap-1">
                                                  <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-gray-400" />
                                                  {book.views || '1.2k'}
                                                </span>
                                                <span className="text-gray-300">|</span>
                                                <span className="flex items-center gap-1">
                                                  <Icon icon="material-symbols:star" className="w-3.5 h-3.5 text-yellow-400" />
                                                  {book.rating || 4.5}
                                                </span>
                                              </div>

                                              {/* Title & Desc & Button */}
                                              <div className="relative">
                                                <h4 className="text-[14px] font-semibold text-black truncate tracking-tight mb-1">{book.title}</h4>
                                                <p className="text-[11px] text-gray-500 leading-relaxed pr-10 line-clamp-2">{book.description}</p>

                                                {/* Action Button */}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const targetShareId = book.shareId || book.v_id;
                                                    const rawAcc = String(book.access || 'public').toLowerCase();
                                                    if (targetShareId) {
                                                      window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                                    }
                                                  }}
                                                  className="absolute bottom-0 right-0 bg-black text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                                                >
                                                  <Icon icon="mdi:arrow-top-right" className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Dropdown Menu */}
                                      {openMenuId === `green-${bGlobalIdx}` && (
                                        <div className="absolute top-[2%] -right-[0.5vw] bg-white rounded-[0.5vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-[0.2vw] w-[7vw] z-50 overflow-hidden">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const targetShareId = book.shareId || book.v_id;
                                              const rawAcc = String(book.access || 'public').toLowerCase();
                                              if (targetShareId) {
                                                window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                              }
                                              setOpenMenuId(null);
                                            }}
                                            className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                          >
                                            Open Book
                                          </button>

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveBook(book.v_id);
                                              setOpenMenuId(null);
                                            }}
                                            className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                          >
                                            Remove Book
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Green-Light Shelf Layout matching Screenshot 2 */}
                {activeAssets.type === 'green_light_shelf' && (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* 2 Tiers of Shelves and Spotlights */}
                    {[
                      { tierIdx: 0, shelfTop: '35.5%', lightTop: '5.5%', books: [0, 1, 2, 3] },
                      { tierIdx: 1, shelfTop: '70.0%', lightTop: '40.5%', books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, shelfTop, lightTop, books }) => (
                      <React.Fragment key={`greenlight-tier-${tierIdx}`}>
                        {/* Shelf row: 4 floating shelf segments stretched across the width */}
                        <div
                          className="absolute pointer-events-none z-10"
                          style={{
                            top: shelfTop,
                            left: '12.8%',
                            width: '78.5%'
                          }}
                        >
                          <img
                            src={greenLightShelfPlank}
                            alt="Green Shelf"
                            className="w-full h-auto block drop-shadow-md"
                          />
                        </div>

                        {/* Top Spotlights for this row - moved up so they are clearly visible above books */}
                        <div
                          className="absolute pointer-events-none z-10"
                          style={{
                            top: lightTop,
                            left: '19.17%',
                            width: '65.7%'
                          }}
                        >
                          <img
                            src={greenLightFixture}
                            alt="Ceiling Spotlights"
                            className="w-full h-auto block drop-shadow-sm relative z-20"
                          />
                        </div>

                        {/* Realistic Studio Spotlight Wall-Wash Beams: vertical downward spread from fixture down onto book */}
                        {decors.lights && (
                          <div
                            className="absolute pointer-events-none z-15"
                            style={{
                              top: lightTop,
                              left: '12.8%',
                              width: '78.5%',
                              height: '100%'
                            }}
                          >
                            {[
                              { center: '9.91%' },
                              { center: '36.62%' },
                              { center: '63.33%' },
                              { center: '90.04%' }
                            ].map(({ center }, beamIdx) => (
                              <React.Fragment key={`spotlight-beam-${tierIdx}-${beamIdx}`}>
                                {/* 1. Pure Vertical Downward Beam: Narrow at top fixture, smoothly diffusing vertically down over the book */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3.5%',
                                    width: '12.0%',
                                    height: '26%',
                                    background:
                                      selectedLightTheme === 'light1'
                                        ? 'linear-gradient(to bottom, rgba(255, 250, 220, 0.95) 0%, rgba(254, 240, 138, 0.52) 32%, rgba(251, 191, 36, 0.16) 75%, transparent 100%)'
                                        : selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.58) 32%, rgba(203, 213, 225, 0.16) 75%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(224, 242, 254, 0.98) 0%, rgba(56, 189, 248, 0.58) 32%, rgba(14, 165, 233, 0.16) 75%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 25% 25% 75% 75%',
                                    filter: 'blur(7px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 2. Narrow focused core shaft down center of book */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3%',
                                    width: '4.8%',
                                    height: '20%',
                                    background:
                                      selectedLightTheme === 'light1'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 240, 0.95) 0%, rgba(254, 240, 138, 0.60) 25%, rgba(251, 191, 36, 0.15) 70%, transparent 100%)'
                                        : selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(248, 250, 252, 0.65) 25%, rgba(203, 213, 225, 0.15) 70%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(224, 242, 254, 1.0) 0%, rgba(56, 189, 248, 0.65) 25%, rgba(14, 165, 233, 0.15) 70%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 20% 20% 80% 80%',
                                    filter: 'blur(4px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 3. Intense bulb hotspot on the fixture lip */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '2.5%',
                                    width: '2.6%',
                                    height: '1.0%',
                                    borderRadius: '50%',
                                    background: '#ffffff',
                                    filter: 'blur(1.2px)',
                                    boxShadow:
                                      selectedLightTheme === 'light1'
                                        ? '0 0 8px 2px rgba(251, 191, 36, 0.90)'
                                        : selectedLightTheme === 'light2'
                                        ? '0 0 8px 2px rgba(255, 255, 255, 0.95)'
                                        : '0 0 8px 2px rgba(56, 189, 248, 0.90)'
                                  }}
                                />
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* 4 Book Positions for this tier - sized proportionally so spotlight & shadow are clearly visible above */}
                        <div
                          className="absolute pointer-events-none z-20"
                          style={{
                            top: shelfTop,
                            left: '12.8%',
                            width: '78.5%',
                            transform: 'translateY(-100%)',
                            height: '1px'
                          }}
                        >
                          {[
                            { bookIndex: books[0], center: '9.91%' },
                            { bookIndex: books[1], center: '36.62%' },
                            { bookIndex: books[2], center: '63.33%' },
                            { bookIndex: books[3], center: '90.04%' }
                          ].map(({ bookIndex, center }, slotIdx) => {
                            const book = filteredBooks[bookIndex];
                            if (!book) {
                              return (
                                <div
                                  key={`greenlight-empty-${tierIdx}-${slotIdx}`}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, bookIndex)}
                                  className="pointer-events-auto absolute -translate-x-1/2 bottom-0 flex justify-center items-end"
                                  style={{
                                    left: center,
                                    width: '11.5%',
                                    aspectRatio: '2.5 / 3.35'
                                  }}
                                >
                                  <div
                                    onClick={() => {
                                      setSelectedBookIdsToAdd([]);
                                      setAddBookSearch('');
                                      setShowAddBookModal(true);
                                    }}
                                    className="w-full h-full rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/20 backdrop-blur-[1px] shadow-sm"
                                    title="Add Book"
                                  >
                                    <div className="relative flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                      <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-white/90" />
                                      <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-white leading-none">
                                        +
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-medium text-white/90 group-hover:text-white tracking-wide">
                                      Add Book
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            const emailFolder = book.rawBook?.userEmail ? book.rawBook.userEmail.replace(/[@.]/g, "_") : '';
                            const folderName = (book.rawBook?.folderName && book.rawBook.folderName.length > 0) ? book.rawBook.folderName[0] : (book.rawBook?.folder || '');
                            const bookName = book.rawBook?.flipbookName || book.rawBook?.title || '';
                            const basePath = '';

                            return (
                              <div
                                key={book.v_id || `greenlight-book-${bookIndex}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, bookIndex)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, bookIndex)}
                                onDragEnd={handleDragEnd}
                                className={`pointer-events-auto absolute -translate-x-1/2 bottom-0 group cursor-pointer flex justify-center items-end ${openMenuId === `greenlight-${bookIndex}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bookIndex ? 'opacity-50' : ''}`}
                                style={{
                                  left: center,
                                  width: '11.5%'
                                }}
                              >
                                <div className="w-full aspect-[2.5/3.35] relative rounded-[3px] shadow-sm transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
                                  <LazyPreview
                                    v_id={book.v_id}
                                    emailId={book.rawBook?.userEmail || currentUserEmail}
                                    backendUrl={backendUrl}
                                    iframeBaseUrl={basePath}
                                    title={book.title}
                                    imageUrl={null}
                                  />
                                </div>

                                {/* Hover Menu Pill */}
                                <div className="absolute top-[2%] -right-[0.2vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === `greenlight-${bookIndex}` ? null : `greenlight-${bookIndex}`)}
                                    className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                                  >
                                    <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                                  </button>
                                  <div
                                    className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                    onMouseEnter={() => setHoveredInfoId(`greenlight-${bookIndex}`)}
                                    onMouseLeave={() => setHoveredInfoId(null)}
                                  >
                                    <Icon icon="si:info-fill" className="w-4 h-4" />

                                    {/* Info Tooltip Bridge & Container */}
                                    <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `greenlight-${bookIndex}` ? 'block' : 'hidden'} z-[60]`}>
                                      <div className="w-[170px] bg-white rounded-xl p-4 text-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col gap-3 cursor-default text-left border border-gray-100 relative">
                                        <div className="flex items-center gap-2">
                                          {book.authorPicture && book.authorPicture !== 'color_only' ? (
                                            <img
                                              src={book.authorPicture}
                                              alt={book.authorName}
                                              className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0"
                                            />
                                          ) : (
                                            <div
                                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-inner"
                                              style={{ backgroundColor: book.authorBgColor }}
                                            >
                                              {(book.authorName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                          )}
                                          <div className="flex flex-col min-w-0 pr-1">
                                            <span className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 truncate">
                                              <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                                              <span className="truncate">{String(book.location).replace(/📍/g, '').trim()}</span>
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 justify-start text-[11px] text-gray-700 font-medium whitespace-nowrap">
                                          <div className="flex items-center gap-1">
                                            <span className="text-black font-semibold">{book.pages || 0}</span>
                                            <span className="font-normal text-gray-500">Pages</span>
                                          </div>
                                          <span className="text-gray-300">|</span>
                                          <span className="flex items-center gap-1">
                                            <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-gray-400" />
                                            {book.views || '1.2k'}
                                          </span>
                                          <span className="text-gray-300">|</span>
                                          <span className="flex items-center gap-1">
                                            <Icon icon="material-symbols:star" className="w-3.5 h-3.5 text-yellow-400" />
                                            {book.rating || 4.5}
                                          </span>
                                        </div>

                                        <div className="relative">
                                          <h4 className="text-[14px] font-semibold text-black truncate tracking-tight mb-1">{book.title}</h4>
                                          <p className="text-[11px] text-gray-500 leading-relaxed pr-10 line-clamp-2">{book.description}</p>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const targetShareId = book.shareId || book.v_id;
                                              const rawAcc = String(book.access || 'public').toLowerCase();
                                              if (targetShareId) {
                                                window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                              }
                                            }}
                                            className="absolute bottom-0 right-0 bg-black text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                                          >
                                            <Icon icon="mdi:arrow-top-right" className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {openMenuId === `greenlight-${bookIndex}` && (
                                  <div className="absolute top-[2%] -right-[0.5vw] bg-white rounded-[0.5vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-[0.2vw] w-[7vw] z-50 overflow-hidden">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const targetShareId = book.shareId || book.v_id;
                                        const rawAcc = String(book.access || 'public').toLowerCase();
                                        if (targetShareId) {
                                          window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                        }
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                    >
                                      Open Book
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveBook(book.v_id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      Remove Book
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Light Shelf Layout matching Screenshot 2 */}
                {activeAssets.type === 'light_shelf' && (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Ceiling Spotlights (light.png) directly above the 4 shelves */}
                    <div
                      className="absolute pointer-events-none z-20"
                      style={{
                        top: '9.5%',
                        left: '19.87%',
                        width: '64.48%'
                      }}
                    >
                      <img
                        src={lightShelfSpotlights}
                        alt="Ceiling Spotlights"
                        className="w-full h-auto block drop-shadow-sm"
                      />
                    </div>

                    {/* 2 Tiers of Shelves */}
                    {[
                      { tierIdx: 0, shelfTop: '38.5%', lightTop: '10.0%', plankImg: lightShelfTopTier, books: [0, 1, 2, 3] },
                      { tierIdx: 1, shelfTop: '69.0%', lightTop: '41.2%', plankImg: lightShelfBottomTier, books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, shelfTop, lightTop, plankImg, books }) => (
                      <React.Fragment key={`lightshelf-tier-${tierIdx}`}>
                        {/* Shelf row: 4 floating shelf segments */}
                        <div
                          className="absolute pointer-events-none z-10"
                          style={{
                            top: shelfTop,
                            left: '13.6%',
                            width: '77.0%'
                          }}
                        >
                          <img
                            src={plankImg}
                            alt="Light Shelf Plank"
                            className="w-full h-auto block drop-shadow-md relative z-20"
                          />
                        </div>

                        {/* Realistic Studio Spotlight Wall-Wash Beams: vertical downward spread from fixture down onto book */}
                        {decors.lights && (
                          <div
                            className="absolute pointer-events-none z-15"
                            style={{
                              top: lightTop,
                              left: '13.6%',
                              width: '77.0%',
                              height: '100%'
                            }}
                          >
                            {[
                              { center: '9.57%' },
                              { center: '36.50%' },
                              { center: '63.50%' },
                              { center: '90.43%' }
                            ].map(({ center }, beamIdx) => (
                              <React.Fragment key={`lightshelf-spotlight-beam-${tierIdx}-${beamIdx}`}>
                                {/* 1. Pure Vertical Downward Beam: Softer, lighter golden light shade */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3.5%',
                                    width: '11.0%',
                                    height: '24%',
                                    background:
                                      selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.50) 30%, rgba(203, 213, 225, 0.12) 75%, transparent 100%)'
                                        : selectedLightTheme === 'light3'
                                        ? 'linear-gradient(to bottom, rgba(224, 242, 254, 0.95) 0%, rgba(56, 189, 248, 0.50) 30%, rgba(14, 165, 233, 0.12) 75%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(255, 240, 180, 0.82) 0%, rgba(252, 211, 77, 0.38) 32%, rgba(245, 158, 11, 0.12) 72%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 25% 25% 75% 75%',
                                    filter: 'blur(7px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 2. Narrow focused core shaft down center of book: Subtle light golden core */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '3%',
                                    width: '5.0%',
                                    height: '20%',
                                    background:
                                      selectedLightTheme === 'light2'
                                        ? 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(248, 250, 252, 0.65) 25%, rgba(203, 213, 225, 0.15) 70%, transparent 100%)'
                                        : selectedLightTheme === 'light3'
                                        ? 'linear-gradient(to bottom, rgba(224, 242, 254, 1.0) 0%, rgba(56, 189, 248, 0.65) 25%, rgba(14, 165, 233, 0.15) 70%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(255, 250, 220, 0.90) 0%, rgba(253, 224, 71, 0.52) 25%, rgba(245, 158, 11, 0.16) 65%, transparent 100%)',
                                    borderRadius: '50% 50% 45% 45% / 20% 20% 80% 80%',
                                    filter: 'blur(4px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />

                                {/* 3. Intense bulb hotspot on the fixture lip: Softer golden glow */}
                                <div
                                  className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300"
                                  style={{
                                    left: center,
                                    top: '2.5%',
                                    width: '2.6%',
                                    height: '1.0%',
                                    borderRadius: '50%',
                                    background: selectedLightTheme === 'light2' ? '#ffffff' : selectedLightTheme === 'light3' ? '#f0f9ff' : '#fffbeb',
                                    filter: 'blur(1.2px)',
                                    boxShadow:
                                      selectedLightTheme === 'light2'
                                        ? '0 0 8px 2px rgba(255, 255, 255, 0.95)'
                                        : selectedLightTheme === 'light3'
                                        ? '0 0 8px 2px rgba(56, 189, 248, 0.90)'
                                        : '0 0 8px 2px rgba(245, 158, 11, 0.75), 0 0 14px 4px rgba(251, 191, 36, 0.30)'
                                  }}
                                />
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* 4 Book Positions for this tier */}
                        <div
                          className="absolute pointer-events-none z-20"
                          style={{
                            top: shelfTop,
                            left: '13.6%',
                            width: '77.0%',
                            transform: 'translateY(-100%)',
                            height: '1px'
                          }}
                        >
                          {[
                            { bookIndex: books[0], center: '9.57%' },
                            { bookIndex: books[1], center: '36.50%' },
                            { bookIndex: books[2], center: '63.50%' },
                            { bookIndex: books[3], center: '90.43%' }
                          ].map(({ bookIndex, center }, slotIdx) => {
                            const book = filteredBooks[bookIndex];
                            if (!book) {
                              return (
                                <div
                                  key={`lightshelf-empty-${tierIdx}-${slotIdx}`}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, bookIndex)}
                                  className="pointer-events-auto absolute -translate-x-1/2 bottom-0 flex justify-center items-end"
                                  style={{
                                    left: center,
                                    width: '11.5%',
                                    aspectRatio: '2.5 / 3.35'
                                  }}
                                >
                                  <div
                                    onClick={() => {
                                      setSelectedBookIdsToAdd([]);
                                      setAddBookSearch('');
                                      setShowAddBookModal(true);
                                    }}
                                    className="w-full h-full rounded-[6px] border border-dashed border-amber-900/30 hover:border-amber-900/60 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-[1px] shadow-sm"
                                    title="Add Book"
                                  >
                                    <div className="relative flex items-center justify-center text-amber-950 transition-transform group-hover:scale-110">
                                      <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-amber-900/90" />
                                      <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-amber-950 leading-none">
                                        +
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-medium text-amber-950/90 group-hover:text-amber-950 tracking-wide">
                                      Add Book
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            const emailFolder = book.rawBook?.userEmail ? book.rawBook.userEmail.replace(/[@.]/g, "_") : '';
                            const folderName = (book.rawBook?.folderName && book.rawBook.folderName.length > 0) ? book.rawBook.folderName[0] : (book.rawBook?.folder || '');
                            const bookName = book.rawBook?.flipbookName || book.rawBook?.title || '';
                            const basePath = '';

                            return (
                              <div
                                key={book.v_id || `lightshelf-book-${bookIndex}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, bookIndex)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, bookIndex)}
                                onDragEnd={handleDragEnd}
                                className={`pointer-events-auto absolute -translate-x-1/2 bottom-0 group cursor-pointer flex justify-center items-end ${openMenuId === `lightshelf-${bookIndex}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bookIndex ? 'opacity-50' : ''}`}
                                style={{
                                  left: center,
                                  width: '11.5%'
                                }}
                              >
                                <div className="w-full aspect-[2.5/3.35] relative rounded-[3px] shadow-sm transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
                                  <LazyPreview
                                    v_id={book.v_id}
                                    emailId={book.rawBook?.userEmail || currentUserEmail}
                                    backendUrl={backendUrl}
                                    iframeBaseUrl={basePath}
                                    title={book.title}
                                    imageUrl={null}
                                  />
                                </div>

                                {/* Hover Menu Pill */}
                                <div className="absolute top-[2%] -right-[0.2vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === `lightshelf-${bookIndex}` ? null : `lightshelf-${bookIndex}`)}
                                    className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                                  >
                                    <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                                  </button>
                                  <div
                                    className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                    onMouseEnter={() => setHoveredInfoId(`lightshelf-${bookIndex}`)}
                                    onMouseLeave={() => setHoveredInfoId(null)}
                                  >
                                    <Icon icon="si:info-fill" className="w-4 h-4" />

                                    {/* Info Tooltip Bridge & Container */}
                                    <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `lightshelf-${bookIndex}` ? 'block' : 'hidden'} z-[60]`}>
                                      <div className="w-[170px] bg-white rounded-xl p-4 text-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col gap-3 cursor-default text-left border border-gray-100 relative">
                                        <div className="flex items-center gap-2">
                                          {book.authorPicture && book.authorPicture !== 'color_only' ? (
                                            <img
                                              src={book.authorPicture}
                                              alt={book.authorName}
                                              className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0"
                                            />
                                          ) : (
                                            <div
                                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-inner"
                                              style={{ backgroundColor: book.authorBgColor }}
                                            >
                                              {(book.authorName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                          )}
                                          <div className="flex flex-col min-w-0 pr-1">
                                            <span className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 truncate">
                                              <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                                              <span className="truncate">{String(book.location).replace(/📍/g, '').trim()}</span>
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 justify-start text-[11px] text-gray-700 font-medium whitespace-nowrap">
                                          <div className="flex items-center gap-1">
                                            <span className="text-black font-semibold">{book.pages || 0}</span>
                                            <span className="font-normal text-gray-500">Pages</span>
                                          </div>
                                          <span className="text-gray-300">|</span>
                                          <span className="flex items-center gap-1">
                                            <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-gray-400" />
                                            {book.views || '1.2k'}
                                          </span>
                                          <span className="text-gray-300">|</span>
                                          <span className="flex items-center gap-1">
                                            <Icon icon="material-symbols:star" className="w-3.5 h-3.5 text-yellow-400" />
                                            {book.rating || 4.5}
                                          </span>
                                        </div>

                                        <div className="relative">
                                          <h4 className="text-[14px] font-semibold text-black truncate tracking-tight mb-1">{book.title}</h4>
                                          <p className="text-[11px] text-gray-500 leading-relaxed pr-10 line-clamp-2">{book.description}</p>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const targetShareId = book.shareId || book.v_id;
                                              const rawAcc = String(book.access || 'public').toLowerCase();
                                              if (targetShareId) {
                                                window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                              }
                                            }}
                                            className="absolute bottom-0 right-0 bg-black text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                                          >
                                            <Icon icon="mdi:arrow-top-right" className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {openMenuId === `lightshelf-${bookIndex}` && (
                                  <div className="absolute top-[2%] -right-[0.5vw] bg-white rounded-[0.5vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-[0.2vw] w-[7vw] z-50 overflow-hidden">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const targetShareId = book.shareId || book.v_id;
                                        const rawAcc = String(book.access || 'public').toLowerCase();
                                        if (targetShareId) {
                                          window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                        }
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                    >
                                      Open Book
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveBook(book.v_id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      Remove Book
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Plant-Light Shelf Layout matching Screenshot 2 */}
                {activeAssets.type === 'plant_light_shelf' && (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Shelf 1 (Top Tier Plank): spans from left 8.25% to right 100% */}
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        top: '35.5%',
                        left: '8.25%',
                        width: '91.75%'
                      }}
                    >
                      <img
                        src={plantLightShelf1}
                        alt="Plant Shelf Tier 1"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>

                    {/* Shelf 1 Plant Image (Over Shelf 1): Hanging leafy vine on left, dried floral vase on right */}
                    <div
                      className="absolute pointer-events-none z-25"
                      style={{
                        top: '35.5%',
                        left: '8.8%',
                        width: '85.0%',
                        transform: 'translateY(-58%)'
                      }}
                    >
                      <img
                        src={plantLightPlant}
                        alt="Shelf 1 Plants and Vase"
                        className="w-full h-auto block"
                      />
                    </div>

                    {/* Shelf 2 (Bottom Tier Plank): shorter plank width matching asset aspect and screenshot */}
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        top: '70.46%',
                        left: '8.37%',
                        width: '77.08%'
                      }}
                    >
                      <img
                        src={plantLightShelf2}
                        alt="Plant Shelf Tier 2"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>

                    {/* Shelf 2 Decor (Over Shelf 2 on Left Side): Incense, candle & book stack */}
                    {decors.plant && (
                      <div
                        className="absolute pointer-events-none z-25"
                        style={{
                          top: '70.46%',
                          left: '8.97%',
                          width: '13.0%',
                          transform: 'translateY(-85%)'
                        }}
                      >
                        <img
                          src={plantLightDecor}
                          alt="Shelf 2 Decor"
                          className="w-full h-auto block drop-shadow-sm"
                        />
                      </div>
                    )}

                    {/* 2 Tiers of Books: Tier 0 (Shelf 1) & Tier 1 (Shelf 2) */}
                    {[
                      { tierIdx: 0, shelfTop: '35.5%', books: [0, 1, 2, 3] },
                      { tierIdx: 1, shelfTop: '70.46%', books: [4, 5, 6, 7] }
                    ].map(({ tierIdx, shelfTop, books }) => (
                      <div
                        key={`plantlight-tier-${tierIdx}`}
                        className="absolute pointer-events-none z-20"
                        style={{
                          top: shelfTop,
                          left: 0,
                          width: '100%',
                          transform: 'translateY(-100%)',
                          height: '1px'
                        }}
                      >
                        {[
                          { bookIndex: books[0], center: '31.5%' },
                          { bookIndex: books[1], center: '44.7%' },
                          { bookIndex: books[2], center: '57.9%' },
                          { bookIndex: books[3], center: '71.1%' }
                        ].map(({ bookIndex, center }, slotIdx) => {
                          const book = filteredBooks[bookIndex];
                          if (!book) {
                            return (
                              <div
                                key={`plantlight-empty-${tierIdx}-${slotIdx}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, bookIndex)}
                                className="pointer-events-auto absolute -translate-x-1/2 bottom-0 flex justify-center items-end"
                                style={{
                                  left: center,
                                  width: '10.5%',
                                  aspectRatio: '2.5 / 3.35'
                                }}
                              >
                                <div
                                  onClick={() => {
                                    setSelectedBookIdsToAdd([]);
                                    setAddBookSearch('');
                                    setShowAddBookModal(true);
                                  }}
                                  className="w-full h-full rounded-[6px] border border-dashed border-amber-900/30 hover:border-amber-900/60 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-[1px] shadow-sm"
                                  title="Add Book"
                                >
                                  <div className="relative flex items-center justify-center text-amber-950 transition-transform group-hover:scale-110">
                                    <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-amber-900/90" />
                                    <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-amber-950 leading-none">
                                      +
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-medium text-amber-950/90 group-hover:text-amber-950 tracking-wide">
                                    Add Book
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          const emailFolder = book.rawBook?.userEmail ? book.rawBook.userEmail.replace(/[@.]/g, "_") : '';
                          const folderName = (book.rawBook?.folderName && book.rawBook.folderName.length > 0) ? book.rawBook.folderName[0] : (book.rawBook?.folder || '');
                          const bookName = book.rawBook?.flipbookName || book.rawBook?.title || '';
                          const basePath = '';

                          return (
                            <div
                              key={book.v_id || `plantlight-book-${bookIndex}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, bookIndex)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, bookIndex)}
                              onDragEnd={handleDragEnd}
                              className={`pointer-events-auto absolute -translate-x-1/2 bottom-0 group cursor-pointer flex justify-center items-end ${openMenuId === `plantlight-${bookIndex}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bookIndex ? 'opacity-50' : ''}`}
                              style={{
                                left: center,
                                width: '10.5%'
                              }}
                            >
                              <div className="w-full aspect-[2.5/3.35] relative rounded-[3px] shadow-sm transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
                                <LazyPreview
                                  v_id={book.v_id}
                                  emailId={book.rawBook?.userEmail || currentUserEmail}
                                  backendUrl={backendUrl}
                                  iframeBaseUrl={basePath}
                                  title={book.title}
                                  imageUrl={null}
                                />
                              </div>

                              {/* Hover Menu Pill */}
                              <div className="absolute top-[2%] -right-[0.2vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === `plantlight-${bookIndex}` ? null : `plantlight-${bookIndex}`)}
                                  className="text-black hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 transition-colors"
                                >
                                  <Icon icon="mdi:dots-vertical" className="text-[14px]" />
                                </button>
                                <div
                                  className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-0.5 transition-colors relative cursor-pointer"
                                  onMouseEnter={() => setHoveredInfoId(`plantlight-${bookIndex}`)}
                                  onMouseLeave={() => setHoveredInfoId(null)}
                                >
                                  <Icon icon="si:info-fill" className="w-4 h-4" />

                                  {/* Info Tooltip Bridge & Container */}
                                  <div className={`absolute top-1/2 right-full pr-3 -translate-y-1/2 ${hoveredInfoId === `plantlight-${bookIndex}` ? 'block' : 'hidden'} z-[60]`}>
                                    <div className="w-[170px] bg-white rounded-xl p-4 text-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col gap-3 cursor-default text-left border border-gray-100 relative">
                                      <div className="flex items-center gap-2">
                                        {book.authorPicture && book.authorPicture !== 'color_only' ? (
                                          <img
                                            src={book.authorPicture}
                                            alt={book.authorName}
                                            className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0"
                                          />
                                        ) : (
                                          <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-inner"
                                            style={{ backgroundColor: book.authorBgColor }}
                                          >
                                            {(book.authorName || 'U').charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <div className="flex flex-col min-w-0 pr-1">
                                          <span className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                                          <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 truncate">
                                            <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                                            <span className="truncate">{String(book.location).replace(/📍/g, '').trim()}</span>
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 justify-start text-[11px] text-gray-700 font-medium whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                          <span className="text-black font-semibold">{book.pages || 0}</span>
                                          <span className="font-normal text-gray-500">Pages</span>
                                        </div>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1">
                                          <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-gray-400" />
                                          {book.views || '1.2k'}
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1">
                                          <Icon icon="material-symbols:star" className="w-3.5 h-3.5 text-yellow-400" />
                                          {book.rating || 4.5}
                                        </span>
                                      </div>

                                      <div className="relative">
                                        <h4 className="text-[14px] font-semibold text-black truncate tracking-tight mb-1">{book.title}</h4>
                                        <p className="text-[11px] text-gray-500 leading-relaxed pr-10 line-clamp-2">{book.description}</p>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const targetShareId = book.shareId || book.v_id;
                                            const rawAcc = String(book.access || 'public').toLowerCase();
                                            if (targetShareId) {
                                              window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                            }
                                          }}
                                          className="absolute bottom-0 right-0 bg-black text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                                        >
                                          <Icon icon="mdi:arrow-top-right" className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {openMenuId === `plantlight-${bookIndex}` && (
                                <div className="absolute top-[2%] -right-[0.5vw] bg-white rounded-[0.5vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-[0.2vw] w-[7vw] z-50 overflow-hidden">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const targetShareId = book.shareId || book.v_id;
                                      const rawAcc = String(book.access || 'public').toLowerCase();
                                      if (targetShareId) {
                                        window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                                      }
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                  >
                                    Open Book
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveBook(book.v_id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    Remove Book
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}


                {/* Bottom Decors for Blue Shelf (customize4) */}
                {activeShelfStyle === 'customize4' && (
                  <div
                    className="absolute left-0 w-full pointer-events-none z-10"
                    style={{ bottom: '-22%' }}
                  >
                    {/* The Credenza base (bluedecor.webp) lowered to the bottom of the wall */}
                    <div className="relative w-full">
                      <img
                        src={bluedecor}
                        alt="Shelf Credenza"
                        className="w-full h-auto block object-cover drop-shadow-md"
                      />

                      {/* Decors on Credenza: 1st Lamp (left), followed by Decor right beside it */}
                      {/* 1. Lamp.png on the left with Theme Light Effect */}
                      {decors.lamp && (
                        <div
                          className="absolute pointer-events-none z-20 transition-all duration-300"
                          style={{
                            left: '5.2%',
                            bottom: '50%',
                            width: '9.2%'
                          }}
                        >
                          {/* Natural Vivid Lamp Light Effects */}
                          {decors.lights && (
                            <>
                              {/* 1. Ambient wall wash behind the lamp */}
                              <div
                                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-0"
                                style={{
                                  left: '50%',
                                  top: '28%',
                                  width: '340%',
                                  height: '340%',
                                  background: selectedLightTheme === 'light1'
                                    ? 'radial-gradient(circle, rgba(251, 191, 36, 0.42) 0%, rgba(245, 158, 11, 0.20) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                    : selectedLightTheme === 'light2'
                                    ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                    : 'radial-gradient(circle, rgba(56, 189, 248, 0.55) 0%, rgba(14, 165, 233, 0.28) 35%, rgba(2, 132, 199, 0.06) 60%, transparent 80%)',
                                  filter: 'blur(22px)',
                                  mixBlendMode: 'screen'
                                }}
                              />

                              {/* 2. Downward pool of light on the wooden credenza tabletop */}
                              <div
                                className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 z-0"
                                style={{
                                  left: '50%',
                                  top: '32%',
                                  width: '320%',
                                  height: '160%',
                                  background: selectedLightTheme === 'light1'
                                    ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.32) 40%, transparent 75%)'
                                    : selectedLightTheme === 'light2'
                                    ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.75) 0%, rgba(241, 245, 249, 0.35) 40%, transparent 75%)'
                                    : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(186, 230, 253, 0.75) 0%, rgba(56, 189, 248, 0.45) 40%, rgba(14, 165, 233, 0.15) 65%, transparent 80%)',
                                  filter: 'blur(12px)',
                                  mixBlendMode: 'screen'
                                }}
                              />

                              {/* 3. Lampshade color transformation layer (ensures Blue is visibly vibrant on the dome) */}
                              <div
                                className="absolute pointer-events-none transition-all duration-300 z-25"
                                style={{
                                  left: '7%',
                                  top: '4%',
                                  width: '86%',
                                  height: '35%',
                                  borderRadius: '50% 50% 16% 16% / 78% 78% 22% 22%',
                                  background: selectedLightTheme === 'light1'
                                    ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 251, 235, 0.95) 0%, rgba(251, 191, 36, 0.70) 50%, rgba(217, 119, 6, 0.30) 85%, transparent 100%)'
                                    : selectedLightTheme === 'light2'
                                    ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.80) 50%, rgba(203, 213, 225, 0.30) 85%, transparent 100%)'
                                    : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(224, 242, 254, 0.98) 0%, rgba(56, 189, 248, 0.85) 50%, rgba(14, 165, 233, 0.40) 85%, transparent 100%)',
                                  mixBlendMode: 'screen',
                                  filter: 'blur(3px)'
                                }}
                              />

                              {/* 4. Color tint on the shade surface for unmistakable theme differentiation */}
                              {selectedLightTheme === 'light3' && (
                                <div
                                  className="absolute pointer-events-none transition-all duration-300 z-26"
                                  style={{
                                    left: '8%',
                                    top: '5%',
                                    width: '84%',
                                    height: '33%',
                                    borderRadius: '50% 50% 16% 16% / 78% 78% 22% 22%',
                                    background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.70) 0%, rgba(14, 165, 233, 0.50) 100%)',
                                    mixBlendMode: 'color'
                                  }}
                                />
                              )}
                            </>
                          )}

                          <img
                            src={blueLamp}
                            alt="Desk Lamp"
                            className="w-full h-auto block drop-shadow-md relative z-20 transition-all duration-300"
                            style={{
                              filter: decors.lights
                                ? (selectedLightTheme === 'light1'
                                    ? 'brightness(1.06) contrast(1.02)'
                                    : selectedLightTheme === 'light2'
                                    ? 'brightness(1.15) contrast(1.02)'
                                    : 'brightness(1.04) contrast(1.02)')
                                : 'brightness(0.72) contrast(0.95)'
                            }}
                          />
                        </div>
                      )}

                      {/* 2. bookwithpot.png placed right beside the lamp */}
                      <div
                        className="absolute pointer-events-none z-15 transition-all duration-300"
                        style={{
                          left: '14.8%',
                          bottom: '50%',
                          width: '84%',
                        }}
                      >
                        <img
                          src={blueBookWithPot}
                          alt="Shelf Decor"
                          className="w-full h-auto block object-contain drop-shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Decors for Green Shelf (customize_green): lamp on bottom-left, decor on right */}
                {activeShelfStyle === 'customize_green' && (
                  <>
                    {/* Shelf Base Credenza: only displayed when a custom wall theme is selected */}
                    {selectedWallTheme && (
                      <div
                        className="absolute left-0 w-full pointer-events-none z-10"
                        style={{ bottom: 0 }}
                      >
                        <img
                          src={greenBase}
                          alt="Green Shelf Base"
                          className="w-full h-auto block object-cover"
                        />
                      </div>
                    )}

                    {/* Bottom Left: lamp.svg placed on credenza with internal lamp light effects */}
                    <div
                      className="absolute pointer-events-none z-20 transition-all duration-300"
                      style={{
                        left: '3.8%',
                        bottom: '12.8%',
                        width: '18.5%'
                      }}
                    >
                      {/* Natural Vivid Lamp Light Effects (placed relative to the lamp so light is inside the shade) */}
                      {decors.lamp && decors.lights && (
                        <>
                          {/* 1. Ambient wall wash behind the lamp */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-0"
                            style={{
                              left: '26%',
                              top: '42%',
                              width: '170%',
                              height: '170%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, rgba(248, 250, 252, 0.26) 35%, rgba(226, 232, 240, 0.06) 60%, transparent 80%)'
                                : 'radial-gradient(circle, rgba(56, 189, 248, 0.55) 0%, rgba(14, 165, 233, 0.28) 35%, rgba(2, 132, 199, 0.06) 60%, transparent 80%)',
                              filter: 'blur(16px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 2. Downward pool of light on the credenza surface */}
                          <div
                            className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 z-0"
                            style={{
                              left: '26%',
                              top: '46%',
                              width: '160%',
                              height: '90%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.70) 0%, rgba(251, 191, 36, 0.35) 40%, transparent 75%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.80) 0%, rgba(241, 245, 249, 0.38) 40%, transparent 75%)'
                                : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(186, 230, 253, 0.80) 0%, rgba(56, 189, 248, 0.48) 40%, rgba(14, 165, 233, 0.16) 65%, transparent 80%)',
                              filter: 'blur(10px)',
                              mixBlendMode: 'screen'
                            }}
                          />

                          {/* 3. Lampshade inner glow layer (light directly inside the dome) */}
                          <div
                            className="absolute pointer-events-none transition-all duration-300 z-25"
                            style={{
                              left: '4%',
                              top: '12%',
                              width: '44%',
                              height: '42%',
                              borderRadius: '50% 50% 18% 18% / 78% 78% 22% 22%',
                              background: selectedLightTheme === 'light1'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 251, 235, 0.98) 0%, rgba(251, 191, 36, 0.80) 50%, rgba(217, 119, 6, 0.35) 85%, transparent 100%)'
                                : selectedLightTheme === 'light2'
                                ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.85) 50%, rgba(203, 213, 225, 0.35) 85%, transparent 100%)'
                                : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(224, 242, 254, 0.98) 0%, rgba(56, 189, 248, 0.88) 50%, rgba(14, 165, 233, 0.45) 85%, transparent 100%)',
                              mixBlendMode: 'screen',
                              filter: 'blur(2px)'
                            }}
                          />

                          {/* 4. Color tint on the shade surface for unmistakable theme differentiation */}
                          {selectedLightTheme === 'light3' && (
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-26"
                              style={{
                                left: '5%',
                                top: '13%',
                                width: '42%',
                                height: '40%',
                                borderRadius: '50% 50% 18% 18% / 78% 78% 22% 22%',
                                background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.70) 0%, rgba(14, 165, 233, 0.50) 100%)',
                                mixBlendMode: 'color'
                              }}
                            />
                          )}
                        </>
                      )}

                      <img
                        src={greenLamp}
                        alt="Lamp"
                        className="w-full h-auto block drop-shadow-md relative z-20 transition-all duration-300"
                        style={{
                          filter: !decors.lamp
                            ? 'brightness(0.70) contrast(0.95)'
                            : decors.lights
                            ? (selectedLightTheme === 'light1'
                                ? 'brightness(1.06) contrast(1.02)'
                                : selectedLightTheme === 'light2'
                                ? 'brightness(1.15) contrast(1.02)'
                                : 'brightness(1.04) contrast(1.02)')
                            : 'brightness(0.72) contrast(0.95)'
                        }}
                      />
                    </div>

                    {/* Bottom Right: decor.svg placed on credenza (moved to right edge) */}
                    <div
                      className="absolute pointer-events-none z-20"
                      style={{
                        right: '2.5%',
                        bottom: '12.8%',
                        width: '13.5%'
                      }}
                    >
                      <img
                        src={greenDecor}
                        alt="Decor"
                        className="w-full h-auto block drop-shadow-md"
                      />
                    </div>
                  </>
                )}

                {/* Bottom Decors for Green-Light Shelf (customize_greenlight): lamp in left side, plant in right side matching Screenshot 2 */}
                {activeShelfStyle === 'customize_greenlight' && (
                  <>
                    {/* Shelf Base Credenza: only displayed when a custom wall theme is selected */}
                    {selectedWallTheme && (
                      <div
                        className="absolute left-0 w-full pointer-events-none z-10"
                        style={{ bottom: 0 }}
                      >
                        <img
                          src={greenLightBase}
                          alt="Green-Light Shelf Base"
                          className="w-full h-auto block object-cover"
                        />
                      </div>
                    )}

                    {/* Bottom Left: lamp.png with books placed on credenza */}
                    {decors.lamp && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
                        style={{
                          left: '1.2%',
                          bottom: '6.5%',
                          width: '15.2%',
                          filter: !decors.lights ? 'brightness(0.75) contrast(0.95)' : 'none'
                        }}
                      >
                        {/* Light inside the lamp dome (lamp kulla light) & surrounding ambiance */}
                        {decors.lights && (
                          <>
                            {/* 1. Large ambient wall glow behind the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                              style={{
                                left: '28%',
                                top: '24%',
                                width: '260%',
                                height: '260%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.50) 0%, rgba(56, 189, 248, 0.25) 35%, rgba(14, 165, 233, 0.06) 60%, transparent 80%)',
                                filter: 'blur(20px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 2. Downward pool of light on the wooden credenza tabletop under the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                              style={{
                                left: '28%',
                                top: '30%',
                                width: '250%',
                                height: '140%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.30) 40%, transparent 75%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.70) 0%, rgba(241, 245, 249, 0.32) 40%, transparent 75%)'
                                  : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(186, 230, 253, 0.70) 0%, rgba(56, 189, 248, 0.38) 40%, transparent 75%)',
                                filter: 'blur(10px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 3. Direct light inside the lamp dome (lamp kulla irukura light) */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-30"
                              style={{
                                left: '2.5%',
                                top: '1.5%',
                                width: '53.5%',
                                height: '48%',
                                borderRadius: '50% 50% 18% 18% / 78% 78% 22% 22%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 240, 0.98) 0%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.50) 75%, transparent 100%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.90) 45%, rgba(203, 213, 225, 0.40) 75%, transparent 100%)'
                                  : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(224, 242, 254, 1) 0%, rgba(56, 189, 248, 0.90) 45%, rgba(14, 165, 233, 0.45) 75%, transparent 100%)',
                                mixBlendMode: 'screen',
                                filter: 'blur(3px)'
                              }}
                            />

                            {/* 4. Soft halo rim glow around the lamp dome edge */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-20"
                              style={{
                                left: '0%',
                                top: '0%',
                                width: '58%',
                                height: '52%',
                                borderRadius: '50% 50% 20% 20% / 78% 78% 22% 22%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(254, 240, 138, 0.70) 0%, rgba(245, 158, 11, 0.35) 60%, transparent 90%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(255, 255, 255, 0.75) 0%, rgba(203, 213, 225, 0.35) 60%, transparent 90%)'
                                  : 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(186, 230, 253, 0.75) 0%, rgba(56, 189, 248, 0.35) 60%, transparent 90%)',
                                mixBlendMode: 'screen',
                                filter: 'blur(7px)'
                              }}
                            />
                          </>
                        )}

                        <img
                          src={greenLightLamp}
                          alt="Lamp and Books"
                          className="w-full h-auto block drop-shadow-md relative z-10 transition-all duration-300"
                          style={{
                            filter: decors.lights
                              ? (selectedLightTheme === 'light1'
                                  ? 'brightness(1.08) contrast(1.02)'
                                  : selectedLightTheme === 'light2'
                                  ? 'brightness(1.15) contrast(1.02)'
                                  : 'brightness(1.05) contrast(1.02)')
                              : 'brightness(0.75) contrast(0.95)'
                          }}
                        />
                      </div>
                    )}

                    {/* Bottom Right: plant.png in vase with spherical decor placed on credenza */}
                    {decors.plant && (
                      <div
                        className="absolute pointer-events-none z-20"
                        style={{
                          right: '2.5%',
                          bottom: '6.5%',
                          width: '9.6%'
                        }}
                      >
                        <img
                          src={greenLightPlant}
                          alt="Plant with Vase"
                          className="w-full h-auto block drop-shadow-md"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Bottom Decors for Light Shelf (customize_light): lamp bottom-left, plantpot bottom-right matching Screenshot 2 */}
                {activeShelfStyle === 'customize_light' && (
                  <>
                    {/* Shelf Base Credenza: only displayed when a custom wall theme is selected */}
                    {selectedWallTheme && (
                      <div
                        className="absolute left-0 w-full pointer-events-none z-10"
                        style={{ bottom: 0 }}
                      >
                        <img
                          src={lightShelfBase}
                          alt="Light Shelf Base"
                          className="w-full h-auto block object-cover"
                        />
                      </div>
                    )}

                    {/* Bottom Left: lamp.png on credenza */}
                    {decors.lamp && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
                        style={{
                          left: '3.2%',
                          bottom: '4.2%',
                          width: '12.8%',
                          filter: !decors.lights ? 'brightness(0.75) contrast(0.95)' : 'none'
                        }}
                      >
                        {/* Light inside the lamp dome & warm ambient glow */}
                        {decors.lights && (
                          <>
                            {/* Ambient glow behind lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                              style={{
                                left: '38%',
                                top: '30%',
                                width: '240%',
                                height: '240%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.50) 0%, rgba(56, 189, 248, 0.25) 35%, rgba(14, 165, 233, 0.06) 60%, transparent 80%)',
                                filter: 'blur(18px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* Downward pool of light on the credenza surface */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                              style={{
                                left: '38%',
                                top: '36%',
                                width: '220%',
                                height: '130%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.30) 40%, transparent 75%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.70) 0%, rgba(241, 245, 249, 0.32) 40%, transparent 75%)'
                                  : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(186, 230, 253, 0.70) 0%, rgba(56, 189, 248, 0.38) 40%, transparent 75%)',
                                filter: 'blur(9px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* Direct light inside the lamp dome */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-30"
                              style={{
                                left: '3%',
                                top: '6%',
                                width: '68%',
                                height: '44%',
                                borderRadius: '50% 50% 18% 18% / 78% 78% 22% 22%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 240, 0.98) 0%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.50) 75%, transparent 100%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.90) 45%, rgba(203, 213, 225, 0.40) 75%, transparent 100%)'
                                  : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(224, 242, 254, 1) 0%, rgba(56, 189, 248, 0.90) 45%, rgba(14, 165, 233, 0.45) 75%, transparent 100%)',
                                mixBlendMode: 'screen',
                                filter: 'blur(3px)'
                              }}
                            />
                          </>
                        )}

                        <img
                          src={lightShelfLamp}
                          alt="Lamp"
                          className="w-full h-auto block drop-shadow-md relative z-10 transition-all duration-300"
                          style={{
                            filter: decors.lights
                              ? (selectedLightTheme === 'light1'
                                  ? 'brightness(1.08) contrast(1.02)'
                                  : selectedLightTheme === 'light2'
                                  ? 'brightness(1.15) contrast(1.02)'
                                  : 'brightness(1.05) contrast(1.02)')
                              : 'brightness(0.75) contrast(0.95)'
                          }}
                        />
                      </div>
                    )}

                    {/* Bottom Right: plantpot.png on credenza */}
                    {decors.plant && (
                      <div
                        className="absolute pointer-events-none z-20"
                        style={{
                          right: '2.8%',
                          bottom: '4.2%',
                          width: '9.0%'
                        }}
                      >
                        <img
                          src={lightShelfPlant}
                          alt="Plant Pot"
                          className="w-full h-auto block drop-shadow-md"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Bottom Decors for Plant-Light Shelf (customize_plantlight): base at bottom, leaf on bottom-left, lamp on bottom-right matching Screenshot 2 */}
                {activeShelfStyle === 'customize_plantlight' && (
                  <>
                    {/* Shelf Base (Credenza): placed at bottom */}
                    <div
                      className="absolute left-0 w-full pointer-events-none z-10"
                      style={{ bottom: 0 }}
                    >
                      <img
                        src={plantLightBase}
                        alt="Plant-Light Shelf Base"
                        className="w-full h-auto block object-cover"
                      />
                    </div>

                    {/* Left Side Bottom Corner: leaf.png (Tropical Leaves in Foreground) */}
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        left: 0,
                        bottom: 0,
                        width: '16.35%'
                      }}
                    >
                      <img
                        src={plantLightLeaf}
                        alt="Bottom Left Leaf"
                        className="w-full h-auto block"
                      />
                    </div>

                    {/* Right Side Bottom Corner: lamp.png (Warm Mushroom Table Lamp on Credenza) */}
                    {decors.lamp && (
                      <div
                        className="absolute pointer-events-none z-20 transition-all duration-300"
                        style={{
                          right: '3.0%',
                          bottom: '6.5%',
                          width: '10.5%',
                          filter: !decors.lights ? 'brightness(0.75) contrast(0.95)' : 'none'
                        }}
                      >
                        {/* Light inside the lamp dome & warm ambient glow */}
                        {decors.lights && (
                          <>
                            {/* 1. Large ambient wall glow behind the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 -z-10"
                              style={{
                                left: '50%',
                                top: '35%',
                                width: '250%',
                                height: '250%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.22) 35%, rgba(217, 119, 6, 0.05) 60%, transparent 80%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.50) 0%, rgba(248, 250, 252, 0.24) 35%, rgba(226, 232, 240, 0.05) 60%, transparent 80%)'
                                  : 'radial-gradient(circle, rgba(186, 230, 253, 0.50) 0%, rgba(56, 189, 248, 0.25) 35%, rgba(14, 165, 233, 0.06) 60%, transparent 80%)',
                                filter: 'blur(20px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 2. Downward pool of light on credenza top under the lamp */}
                            <div
                              className="absolute pointer-events-none -translate-x-1/2 transition-all duration-300 -z-10"
                              style={{
                                left: '50%',
                                top: '42%',
                                width: '240%',
                                height: '130%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.30) 40%, transparent 75%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(255, 255, 255, 0.70) 0%, rgba(241, 245, 249, 0.32) 40%, transparent 75%)'
                                  : 'radial-gradient(ellipse 65% 45% at 50% 10%, rgba(186, 230, 253, 0.70) 0%, rgba(56, 189, 248, 0.38) 40%, transparent 75%)',
                                filter: 'blur(10px)',
                                mixBlendMode: 'screen'
                              }}
                            />

                            {/* 3. Direct light inside the mushroom lamp dome */}
                            <div
                              className="absolute pointer-events-none transition-all duration-300 z-30"
                              style={{
                                left: '5%',
                                top: '2%',
                                width: '90%',
                                height: '48%',
                                borderRadius: '50% 50% 20% 20% / 78% 78% 22% 22%',
                                background: selectedLightTheme === 'light1'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 240, 0.98) 0%, rgba(254, 240, 138, 0.85) 45%, rgba(251, 191, 36, 0.50) 75%, transparent 100%)'
                                  : selectedLightTheme === 'light2'
                                  ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.90) 45%, rgba(203, 213, 225, 0.40) 75%, transparent 100%)'
                                  : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(224, 242, 254, 1) 0%, rgba(56, 189, 248, 0.90) 45%, rgba(14, 165, 233, 0.45) 75%, transparent 100%)',
                                mixBlendMode: 'screen',
                                filter: 'blur(3px)'
                              }}
                            />
                          </>
                        )}

                        <img
                          src={plantLightLamp}
                          alt="Lamp"
                          className="w-full h-auto block drop-shadow-md relative z-10 transition-all duration-300"
                          style={{
                            filter: decors.lights
                              ? (selectedLightTheme === 'light1'
                                  ? 'brightness(1.08) contrast(1.02)'
                                  : selectedLightTheme === 'light2'
                                  ? 'brightness(1.15) contrast(1.02)'
                                  : 'brightness(1.05) contrast(1.02)')
                              : 'brightness(0.75) contrast(0.95)'
                          }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Shelf Logo predefined box with light shadow on left wall */}
                <div
                  className="absolute z-15 transition-all duration-300 group"
                  style={{
                    top: '7%',
                    left: '8%',
                    width: '13.5%',
                    aspectRatio: '16 / 9'
                  }}
                >
                  {shelfLogo?.url ? (
                    <div
                      className="w-full h-full rounded-lg bg-white/40 backdrop-blur-md p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] border border-white/50 flex items-center justify-center overflow-hidden transition-all duration-200"
                      style={{
                        opacity: (logoOpacity ?? 100) / 100
                      }}
                    >
                      <img
                        src={shelfLogo.url}
                        alt="Shelf Logo"
                        className="w-full h-full block"
                        style={{
                          objectFit: logoFixType === 'Fill' ? 'fill' : 'contain'
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowLogoModal(true)}
                      className="w-full h-full rounded-lg border border-dashed border-white/40 hover:border-white/80 bg-white/10 hover:bg-white/20 backdrop-blur-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 group-hover:scale-[1.02]"
                      title="Add Logo"
                    >
                      <Icon icon="lucide:image-plus" className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                      <span className="text-[10px] font-medium text-white/80 group-hover:text-white transition-colors">
                        Add Logo
                      </span>
                    </div>
                  )}
                </div>

            </div>

            {/* Shelf Styles Carousel / Pagination matching Screenshot 2 */}
            <div className="mt-2.5 mb-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 tracking-tight">Shelf Styles</h3>
                <div className="flex items-center gap-1 text-[11px] font-semibold">
                  {[1, 2, 3, 4].map((page) => (
                    <button
                      key={page}
                      onClick={() => setShelfStylesPage(page)}
                      className={`w-4 h-4 rounded flex items-center justify-center transition-all ${shelfStylesPage === page
                        ? 'bg-[#FF5733] text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setShelfStylesPage(prev => (prev > 1 ? prev - 1 : 4))}
                  className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Icon icon="lucide:chevron-left" className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-5 gap-2 flex-1">
                  {[
                    { id: 'customize4', img: blueshade, title: 'Pumps Shelf' },
                    { id: 'customize_green', img: greenshade, title: 'Green Shelf' },
                    { id: 'customize_light', img: lightShelfImg, title: 'Light Shelf' },
                    { id: 'customize_plantlight', img: plantLightShelfImg, title: 'Plant-Light Shelf' },
                    { id: 'customize_greenlight', img: greenLightShelfImg, title: 'Green-Light Shelf' },
                  ].map((styleItem) => {
                    const isSelected = activeShelfStyle === styleItem.id;
                    return (
                      <div
                        key={styleItem.id}
                        onClick={() => {
                          if (styleItem.id === 'customize4' || styleItem.id === 'customize_green' || styleItem.id === 'customize_greenlight' || styleItem.id === 'customize_light' || styleItem.id === 'customize_plantlight') {
                            setActiveShelfStyle(styleItem.id);
                            setSelectedWallTheme(null);
                          }
                        }}
                        className={`group cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-[16/9.5] max-h-[72px] bg-gray-100 relative shadow-xs ${isSelected ? 'border-[#FF5733] ring-1 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <img
                          src={styleItem.img}
                          alt={styleItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShelfStylesPage(prev => (prev < 4 ? prev + 1 : 1))}
                  className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* List View Column */
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-2 pb-4">
            {openDropdown && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenDropdown(null)}
              />
            )}
            <div className="flex gap-4 mb-4 relative z-20">
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Search Flipbook..." className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
              </div>

              {/* Flipbook Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'flipbooks' ? null : 'flipbooks')}
                  className="flex items-center justify-between w-40 px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
                >
                  <span className="text-[#5B738B]">{selectedFolder === 'add_shelf' ? 'Add Shelf' : selectedFolder}</span>
                  <Icon icon={openDropdown === 'flipbooks' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 text-[#8BA3BA]" />
                </button>

                {openDropdown === 'flipbooks' && (
                  <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.08)] py-1 overflow-hidden">
                    {folders.map(folder => (
                      <div
                        key={folder.name}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${selectedFolder === folder.name ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                        onClick={() => {
                          handleFlipbookSelect({ target: { value: folder.name } });
                          setOpenDropdown(null);
                        }}
                      >
                        {folder.name}
                      </div>
                    ))}
                    <div
                      className={`px-4 py-2 text-sm cursor-pointer border-t border-gray-100 hover:bg-gray-50 transition-colors ${selectedFolder === 'add_shelf' ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                      onClick={() => {
                        handleFlipbookSelect({ target: { value: 'add_shelf' } });
                        setOpenDropdown(null);
                      }}
                    >
                      + Add Shelf
                    </div>
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                  className="flex items-center justify-between w-48 px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
                >
                  <span className="text-[#5B738B] truncate mr-2 text-left w-full">{selectedStatus}</span>
                  <Icon icon={openDropdown === 'status' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 text-[#8BA3BA] shrink-0" />
                </button>

                {openDropdown === 'status' && (
                  <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.08)] py-1 overflow-hidden">
                    {['All Status', 'Published - Public', 'Published - Private', 'Unpublished - Public', 'Unpublished - Private'].map((status) => (
                      <div
                        key={status}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${selectedStatus === status ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                        onClick={() => {
                          setSelectedStatus(status);
                          setOpenDropdown(null);
                        }}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {openMenuId && (
              <div
                className="fixed inset-0 z-20"
                onClick={() => setOpenMenuId(null)}
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full py-20 flex justify-center items-center">
                  <div className="flex flex-col items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100">
                    <Icon icon="eos-icons:loading" className="w-8 h-8 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Loading Flipbooks...</span>
                  </div>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="col-span-full py-10 flex justify-center text-gray-500">No flipbooks found.</div>
              ) : (
                filteredBooks.map((book, idx) => (
                  <div key={book.v_id || idx} className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow border border-transparent hover:border-gray-100">
                    {/* Image Area Wrapper */}
                    <div className="relative w-full aspect-square bg-[#e2b58d] overflow-hidden">
                      <img src={book.cover || listFrame} alt={book.title || "Flipbook"} className="w-full h-full object-cover" />

                      <button
                        onClick={() => setOpenMenuId(openMenuId === book.v_id ? null : book.v_id)}
                        className="absolute top-3 right-3 text-white hover:text-gray-200 bg-black/20 rounded-md p-0.5 transition-colors z-30"
                      >
                        <Icon icon="mdi:dots-vertical" className="w-5 h-5" />
                      </button>

                      {openMenuId === book.v_id && (
                        <div className="absolute top-[2.5vw] right-[0.8vw] bg-white rounded-[0.5vw] shadow-xl border border-gray-100 py-[0.5vw] w-[9vw] z-40 overflow-hidden">
                          <button
                            onClick={() => {
                              const targetShareId = book.shareId || book.v_id;
                              const rawAcc = String(book.access || 'public').toLowerCase();
                              if (targetShareId) {
                                window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                              }
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-[1vw] py-[0.5vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 flex items-center gap-[0.5vw] transition-colors"
                          >
                            <Icon icon="mdi:book-open-outline" className="w-[1vw] h-[1vw] text-gray-400" />
                            Open Book
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBook(book.v_id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-[1vw] py-[0.5vw] text-[0.75vw] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-[0.5vw] transition-colors"
                          >
                            <Icon icon="mdi:trash-can-outline" className="w-[1vw] h-[1vw] text-red-400" />
                            Remove Book
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className="p-4 flex flex-col flex-1 bg-white">
                      {/* Author Info */}
                      <div className="flex items-center gap-3">
                        {book.authorPicture && book.authorPicture !== 'color_only' ? (
                          <img
                            src={book.authorPicture}
                            alt={book.authorName}
                            className="w-9 h-9 rounded-full border border-gray-200 object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-inner"
                            style={{ backgroundColor: book.authorBgColor }}
                          >
                            {(book.authorName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 pr-1">
                          <span className="text-sm font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                          <span className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5 truncate">
                            <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{String(book.location).replace(/📍/g, '').trim()}</span>
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-2 justify-start text-xs text-gray-700 font-medium mt-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-black font-semibold">{book.pages || 0}</span>
                          <span className="font-normal text-gray-500">Pages</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1">
                          <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-gray-400" />
                          {book.views || '1.2k'}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1">
                          <Icon icon="material-symbols:star" className="w-4 h-4 text-yellow-400" />
                          {book.rating || 4.5}
                        </span>
                      </div>

                      {/* Title & Desc & Button */}
                      <div className="relative flex-1 mt-3">
                        <h4 className="text-[15px] font-semibold text-black truncate tracking-tight mb-1">{book.title}</h4>
                        <p className="text-[12px] text-gray-500 leading-relaxed pr-10 line-clamp-2">{book.description}</p>

                        {/* Action Button */}
                        <button
                          onClick={() => {
                            const targetShareId = book.shareId || book.v_id;
                            const rawAcc = String(book.access || 'public').toLowerCase();
                            if (targetShareId) {
                              window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                            }
                          }}
                          className="absolute bottom-0 right-0 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                        >
                          <Icon icon="mdi:arrow-top-right" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )))}
            </div>
          </div>
        )}

        {/* Sidebar matching Screenshot */}
        {view === 'shelf' ? (
          <div className="w-[320px] shrink-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Header: Customize your shelf with icon */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <div className="w-5 h-5 flex items-center justify-center text-red-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF5733]">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                  <path d="M9 3v18" />
                </svg>
              </div>
              <h3 className="text-[14px] font-bold text-gray-900 tracking-tight">
                Customize your shelf
              </h3>
            </div>

            <div className="flex flex-col gap-5 p-5 overflow-y-auto max-h-[72vh]">
              {/* Add Logo Section */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-[13px] font-bold text-gray-900 tracking-tight">Add Logo</span>
                  <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />

                {!shelfLogo ? (
                  /* Initial Add Logo Box (as seen in BrandingPanel & FlipbookInfoModal) */
                  <div
                    onClick={() => setShowLogoModal(true)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        handleLogoFile(file);
                      }
                    }}
                    className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-gray-50/70 hover:border-[#FF5733]/60 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF5733] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon icon="lucide:plus" className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                      + Add Logo
                    </span>
                    <span className="text-[10px] text-gray-400">
                      PNG, JPG, SVG up to 10MB
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Logo fix type dropdown with custom polished UI */}
                    <div className="flex items-center justify-between gap-2 mb-3 relative z-30">
                      <span className="text-[12px] text-gray-700 font-medium">Logo fix type :</span>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowLogoFixDropdown(!showLogoFixDropdown)}
                          className="flex items-center justify-between gap-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-[12px] font-semibold rounded-lg px-3 py-1.5 min-w-[90px] shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-400"
                        >
                          <span>{logoFixType === 'Fill' ? 'Fill' : 'Fit'}</span>
                          <Icon
                            icon="lucide:chevron-down"
                            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showLogoFixDropdown ? 'rotate-180 text-orange-500' : ''}`}
                          />
                        </button>

                        {/* Custom Dropdown Menu */}
                        {showLogoFixDropdown && (
                          <div className="absolute right-0 top-full mt-1.5 w-28 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                            {[
                              { label: 'Fit', desc: 'Proportional inside box' },
                              { label: 'Fill', desc: 'Stretch to edges' }
                            ].map((opt) => (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => {
                                  setLogoFixType(opt.label);
                                  setShowLogoFixDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                                  logoFixType === opt.label
                                    ? 'bg-orange-50 text-[#FF5733] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 font-medium'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {logoFixType === opt.label && (
                                  <Icon icon="lucide:check" className="w-3.5 h-3.5 text-[#FF5733]" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logo Image Preview Card */}
                    <div className="flex items-center gap-3 mb-3.5">
                      <div className="relative w-28 h-16 rounded-lg border border-gray-200 bg-white flex items-center justify-center p-2 shadow-xs overflow-hidden">
                        <img
                          src={shelfLogo.url}
                          alt={shelfLogo.name}
                          className="w-full h-full transition-opacity duration-150"
                          style={{
                            objectFit: logoFixType === 'Fill' ? 'fill' : 'contain',
                            opacity: (logoOpacity ?? 100) / 100
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLogoModal(true)}
                          title="Replace image"
                          className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-xs p-0.5 rounded transition-colors cursor-pointer"
                        >
                          <Icon icon="lucide:sliders-horizontal" className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[12px] font-semibold text-gray-800 truncate" title={shelfLogo.name}>
                          {shelfLogo.name}
                        </span>
                        <span className="text-[10px] text-gray-400 mb-2">
                          {shelfLogo.dimensions} &nbsp;•&nbsp; {shelfLogo.size}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowLogoModal(true)}
                            className="px-2.5 py-1 text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                          >
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            title="Delete image"
                            className="p-1 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                          >
                            <Icon icon="lucide:trash-2" className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-gray-700 font-medium">Opacity :</span>
                      <div className="relative flex-1 flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={logoOpacity}
                          onChange={(e) => setLogoOpacity(Number(e.target.value))}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF5733]"
                          style={{
                            background: `linear-gradient(to right, #FF5733 0%, #FF5733 ${logoOpacity}%, #E5E7EB ${logoOpacity}%, #E5E7EB 100%)`
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-700 min-w-[32px] text-right">
                        {logoOpacity} %
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Wall Themes Section */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-[13px] font-bold text-gray-900 tracking-tight">Wall Themes</span>
                  <div className="flex-1 h-px bg-gray-100"></div>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {wallThemeList.map((wt) => {
                    const isSelected = selectedWallTheme === wt.img;
                    return (
                      <button
                        key={wt.id}
                        type="button"
                        onClick={() => setSelectedWallTheme(wt.img)}
                        className={`aspect-square rounded-xl overflow-hidden transition-all duration-150 p-0 flex items-center justify-center cursor-pointer border ${
                          isSelected
                            ? 'border-[#FF5733] ring-2 ring-orange-200/70 shadow-sm'
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <img
                          src={wt.img}
                          alt="Wall theme"
                          className="w-full h-full object-cover rounded-[10px]"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Light Theme Section */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-[13px] font-bold text-gray-900 tracking-tight">Light Theme</span>
                  <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                {/* Default Light Type Row with Custom Dropdown UI */}
                <div className="flex items-center justify-between mb-3 relative">
                  <span className="text-[12px] text-gray-700 font-medium">Default Light type</span>
                  <div className="flex-1 mx-2 border-b border-dotted border-gray-300"></div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === 'default_light' ? null : 'default_light')}
                      className="flex items-center justify-between gap-2 bg-white border border-gray-200 text-gray-700 text-[12px] font-medium rounded-lg px-2.5 py-1 focus:outline-none hover:border-gray-300 transition-colors shadow-2xs cursor-pointer min-w-[96px]"
                    >
                      <span>{defaultLightType}</span>
                      <Icon
                        icon="lucide:chevron-down"
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                          openDropdown === 'default_light' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Custom Dropdown Menu */}
                    {openDropdown === 'default_light' && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute right-0 top-full mt-1.5 w-28 bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-1 z-50 overflow-hidden text-[12px]">
                          {['Turn on', 'Turn off'].map((option) => {
                            const isSelected = defaultLightType === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setDefaultLightType(option);
                                  setDecors(prev => ({ ...prev, lights: option === 'Turn on' }));
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-orange-50/70 text-[#FF5733] font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <span>{option}</span>
                                {isSelected && (
                                  <Icon icon="lucide:check" className="w-3.5 h-3.5 text-[#FF5733]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* On / Off Light switch Row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] text-gray-700 font-medium">On / Off Light switch</span>
                  <div className="flex-1 mx-2 border-b border-dotted border-gray-300"></div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextLights = !decors.lights;
                      setDecors(prev => ({ ...prev, lights: nextLights }));
                      setDefaultLightType(nextLights ? 'Turn on' : 'Turn off');
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                      decors.lights ? 'bg-[#FF5733]' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                        decors.lights ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Light Theme Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  {lightThemeList.map((lt) => {
                    const isSelected = selectedLightTheme === lt.id;
                    return (
                      <button
                        key={lt.id}
                        type="button"
                        onClick={() => setSelectedLightTheme(lt.id)}
                        className={`aspect-[4/3] rounded-xl overflow-hidden transition-all duration-150 p-0 flex items-center justify-center cursor-pointer border ${
                          isSelected
                            ? 'border-[#FF5733] ring-2 ring-orange-200/70 shadow-sm'
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <img
                          src={lt.img}
                          alt="Light theme"
                          className="w-full h-full object-cover rounded-[10px]"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Decors (Optional) Section */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-[13px] font-bold text-gray-900 tracking-tight">
                    Decors <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                  </span>
                  <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                <div className="flex flex-col gap-3.5">
                  {/* Lamp Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-medium text-gray-700">
                      <Icon icon="lucide:lamp" className="w-4 h-4 text-gray-600 stroke-[1.75]" />
                      <span>Lamp</span>
                    </div>
                    <div className="flex-1 mx-3 border-b border-dotted border-gray-300"></div>
                    <button
                      type="button"
                      onClick={() => setDecors(prev => ({ ...prev, lamp: !prev.lamp }))}
                      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                        decors.lamp ? 'bg-[#FF5733]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          decors.lamp ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List View Sidebar (Shelf Usage + Tips) */
          <div className="w-64 flex flex-col justify-end gap-6 h-full pb-4">
            {/* Shelf Usage */}
            <div className="bg-white border border-gray-200 rounded-[14px] p-5">
              <h3 className="font-medium text-[#475569] mb-4 text-[15px]">Shelf Usage</h3>
              <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full mb-4">
                <div className="h-1.5 bg-[#4F46E5] rounded-full" style={{ width: `${Math.min(100, (booksData.length / 50) * 100)}%` }}></div>
              </div>
              <div className="flex justify-between text-[13.5px] text-[#475569]">
                <span>{booksData.length} of 50 Flipbooks Used</span>
                <span>{Math.round(Math.min(100, (booksData.length / 50) * 100))}%</span>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-[#fef9f4] border border-[#faedd9] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💡</span>
                <h3 className="font-semibold text-sm">Tips</h3>
              </div>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                Drag and Drop flipbooks to rearrange them on your shelf
              </p>
              <div className="flex justify-center items-end gap-3 relative px-2 mt-2">
                <Icon icon="duo-icons:book" className="w-10 h-10 text-gray-600" />
                <Icon icon="duo-icons:book" className="w-10 h-10 text-gray-600" />

                <div className="relative z-10 -translate-y-2">
                  <Icon icon="duo-icons:book" className="w-14 h-14 text-yellow-500 drop-shadow-md" />
                  <Icon icon="game-icons:click" className="absolute -bottom-3 -right-3 w-8 h-8 text-black" />
                </div>

                <Icon icon="duo-icons:book" className="w-10 h-10 text-gray-600" />
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* Change Shelf Modal */}
      {showShelfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowShelfModal(false)}>
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-[700px] max-w-[90vw] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Change Shelf</h2>
                <p className="text-sm text-gray-500 mt-1">Choose a shelf style for your My Shelf</p>
              </div>
              <button
                onClick={() => setShowShelfModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col md:flex-row justify-center items-center gap-6 bg-gray-50/50">
              {shelfOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setDraftShelfStyle(option.id)}
                  className={`w-full md:w-[220px] cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 group relative bg-white shadow-sm ${draftShelfStyle === option.id
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-transparent hover:border-gray-200 hover:shadow-md'
                    }`}
                >
                  <div className="bg-[#f0ece6] aspect-[4/3] flex items-center justify-center p-4 relative">
                    <img src={option.img} alt={option.name} className="w-full h-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
                    {draftShelfStyle === option.id && (
                      <div className="absolute inset-0 bg-blue-500/10"></div>
                    )}
                  </div>
                  <div className={`p-3 text-center border-t transition-colors ${draftShelfStyle === option.id ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100'}`}>
                    <p className={`text-sm font-semibold ${draftShelfStyle === option.id ? 'text-blue-700' : 'text-gray-700'}`}>
                      {option.name}
                    </p>
                  </div>
                  {draftShelfStyle === option.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-sm">
                      <Icon icon="mdi:check-bold" className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setShowShelfModal(false)}
                className="px-5 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyShelfStyle}
                className="px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow transition-all"
              >
                Apply Shelf
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shelf/Folder Modal */}
      {showAddShelfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddShelfModal(false)}>
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-[400px] max-w-[90vw] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Create New Shelf</h2>
              <button onClick={() => setShowAddShelfModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2">
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Shelf Name</label>
              <input
                type="text"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter shelf name"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setShowAddShelfModal(false)} className="px-5 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 transition-colors">Cancel</button>
              <button
                onClick={() => {
                  if (newShelfName.trim()) {
                    setFolders(prev => [{ name: newShelfName.trim(), books: [] }, ...prev]);
                    setSelectedFolder(newShelfName.trim());
                    setNewShelfName('');
                    setShowAddShelfModal(false);
                  }
                }}
                className="px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Folder Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setShowMoveModal(false)}>
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-[400px] max-w-[90vw] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Move to Folder</h2>
              <button onClick={() => setShowMoveModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2">
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Destination Folder</label>
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'move_folder' ? null : 'move_folder')}
                  className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
                >
                  <span className="text-[#5B738B]">{targetMoveFolder === '__add_shelf__' ? '+ Add Shelf' : targetMoveFolder}</span>
                  <Icon icon={openDropdown === 'move_folder' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 text-[#8BA3BA]" />
                </button>

                {openDropdown === 'move_folder' && (
                  <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.08)] py-1 overflow-hidden">
                    {folders.map(folder => (
                      <div
                        key={folder.name}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${targetMoveFolder === folder.name ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                        onClick={() => {
                          setTargetMoveFolder(folder.name);
                          setOpenDropdown(null);
                        }}
                      >
                        {folder.name}
                      </div>
                    ))}
                    <div
                      className={`px-4 py-2 text-sm cursor-pointer border-t border-gray-100 hover:bg-gray-50 transition-colors ${targetMoveFolder === '__add_shelf__' ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                      onClick={() => {
                        setTargetMoveFolder('__add_shelf__');
                        setOpenDropdown(null);
                      }}
                    >
                      + Add Shelf
                    </div>
                  </div>
                )}
              </div>

              {targetMoveFolder === '__add_shelf__' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Folder Name</label>
                  <input
                    type="text"
                    value={newShelfName}
                    onChange={(e) => setNewShelfName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter new folder name"
                    autoFocus
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setShowMoveModal(false)} className="px-5 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 transition-colors">Cancel</button>
              <button
                onClick={handleMoveSubmit}
                className="px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                {targetMoveFolder === '__add_shelf__' ? 'Create & Move' : 'Move'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Books to Shelf Modal */}
      {showAddBookModal && (() => {
        const currentFolderBooks = folders.find(f => f.name === selectedFolder)?.books || [];
        const currentFolderBookIds = new Set(currentFolderBooks.map(b => b.v_id));

        // Available created books (all created books that are not already on this shelf)
        const availableBooks = allCreatedBooks.filter(b => {
          if (currentFolderBookIds.has(b.v_id)) return false;
          if (!addBookSearch.trim()) return true;
          const query = addBookSearch.toLowerCase();
          const title = (b.flipbookName || b.title || '').toLowerCase();
          return title.includes(query);
        });

        const toggleSelectBook = (v_id) => {
          setSelectedBookIdsToAdd(prev =>
            prev.includes(v_id) ? prev.filter(id => id !== v_id) : [...prev, v_id]
          );
        };

        const handleSelectAll = () => {
          if (selectedBookIdsToAdd.length === availableBooks.length) {
            setSelectedBookIdsToAdd([]);
          } else {
            setSelectedBookIdsToAdd(availableBooks.map(b => b.v_id));
          }
        };

        return (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowAddBookModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[720px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5733] flex items-center justify-center">
                    <Icon icon="mdi:book-plus-outline" className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Add Books to Shelf</h2>
                    <p className="text-xs text-gray-500">
                      Select books to place on <span className="font-semibold text-gray-700">{selectedFolder}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddBookModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Icon icon="mdi:close" className="w-5 h-5" />
                </button>
              </div>

              {/* Search and Action Bar */}
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
                <div className="relative flex-1">
                  <Icon icon="lucide:search" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={addBookSearch}
                    onChange={(e) => setAddBookSearch(e.target.value)}
                    placeholder="Search your created books..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF5733] focus:ring-1 focus:ring-[#FF5733] transition-all"
                  />
                  {addBookSearch && (
                    <button
                      onClick={() => setAddBookSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon icon="mdi:close-circle" className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {availableBooks.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-xs font-semibold text-[#FF5733] hover:text-[#e04523] px-2.5 py-1.5 rounded-lg hover:bg-orange-50/60 transition-colors shrink-0"
                  >
                    {selectedBookIdsToAdd.length === availableBooks.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Body: Grid of Books */}
              <div className="p-6 overflow-y-auto flex-1 min-h-[260px] max-h-[50vh]">
                {availableBooks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-500">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                      <Icon icon="mdi:book-check-outline" className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {allCreatedBooks.length === 0
                        ? "You haven't created any flipbooks yet."
                        : addBookSearch
                        ? 'No books matching your search.'
                        : 'All of your created books are already on this shelf!'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {allCreatedBooks.length === 0
                        ? 'Create a flipbook first to add it to your shelf.'
                        : 'You can remove existing books or select another shelf.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {availableBooks.map((b, idx) => {
                      const isSelected = selectedBookIdsToAdd.includes(b.v_id);
                      const title = b.flipbookName || b.title || `Book ${idx + 1}`;
                      const cover = b.image || covers[idx % covers.length];
                      const pages = typeof b.pages === 'number' ? b.pages : (b.pages?.length || 0);

                      return (
                        <div
                          key={b.v_id || idx}
                          onClick={() => toggleSelectBook(b.v_id)}
                          className={`relative group rounded-xl border-2 cursor-pointer transition-all duration-150 overflow-hidden flex flex-col bg-white ${
                            isSelected
                              ? 'border-[#FF5733] ring-2 ring-orange-200/80 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          {/* Selection Checkbox Badge */}
                          <div
                            className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-[#FF5733] text-white shadow-sm' : 'bg-black/35 text-transparent group-hover:text-white/60'
                            }`}
                          >
                            <Icon icon="mdi:check" className="w-3.5 h-3.5" />
                          </div>

                          {/* Cover Image */}
                          <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden relative">
                            <img
                              src={cover}
                              alt={title}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>

                          {/* Info */}
                          <div className="p-2.5 flex flex-col justify-between flex-1 bg-white">
                            <p className="text-xs font-semibold text-gray-800 truncate" title={title}>
                              {title}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {pages} {pages === 1 ? 'Page' : 'Pages'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs text-gray-500">
                  {selectedBookIdsToAdd.length > 0 ? (
                    <span className="font-semibold text-gray-800">
                      {selectedBookIdsToAdd.length} {selectedBookIdsToAdd.length === 1 ? 'book' : 'books'} selected
                    </span>
                  ) : (
                    'Select books to add'
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddBookModal(false)}
                    className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={selectedBookIdsToAdd.length === 0 || isAddingBooks}
                    onClick={handleAddBooksToShelf}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#FF5733] text-white hover:bg-[#e04523] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {isAddingBooks ? (
                      <>
                        <Icon icon="eos-icons:loading" className="w-3.5 h-3.5" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:plus" className="w-3.5 h-3.5" />
                        <span>Add to Shelf</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

const LazyPreview = ({ v_id, emailId, backendUrl, iframeBaseUrl, title, imageUrl }) => {
  const containerRef = useRef(null);
  const [html, setHtml] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!v_id || loaded) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loaded && !fetching) {
          observer.disconnect();
          setFetching(true);
          axios
            .get(`${backendUrl}/api/flipbook/preview/${v_id}`, { params: { emailId } })
            .then((res) => {
              if (res.data?.html) {
                const fontsToLoad = new Set();
                const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
                const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
                let match;
                while ((match = cssRegex.exec(res.data.html)) !== null) {
                  let f = match[1] || match[2];
                  if (f) f = f.split(',')[0].replace(/['"]/g, '').trim();
                  if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                }
                while ((match = attrRegex.exec(res.data.html)) !== null) {
                  let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
                  if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) fontsToLoad.add(f);
                }

                let fontImports = '';
                if (fontsToLoad.size > 0) {
                  const fontList = Array.from(fontsToLoad).map(f => f.replace(/\s+/g, '+')).join('|');
                  fontImports = `<link href="https://fonts.googleapis.com/css?family=${fontList}:300,400,500,600,700,800,900&display=swap" rel="stylesheet">`;
                }

                setHtml({ content: res.data.html, fontImports });
              }
            })
            .catch(() => { })
            .finally(() => { setFetching(false); setLoaded(true); });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [v_id, loaded, fetching, backendUrl, emailId]);

  const isLoading = !loaded || fetching;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative bg-white overflow-hidden rounded-[3px]">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[0.4vw] bg-[#E8E6E1] overflow-hidden border border-[#d5d2c9]">
          <Icon icon="eos-icons:loading" className="w-[1.5vw] h-[1.5vw] text-gray-400" />
        </div>
      )}

      {html ? (
        <iframe
          title={`Preview of ${title}`}
          className="w-full h-full border-none pointer-events-none object-fill"
          srcDoc={`<!DOCTYPE html><html><head>${html.fontImports}<base href="${iframeBaseUrl}"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:white;}svg{width:100%;height:100%;max-width:100%;max-height:100%;}[data-name="Free Frame"]{stroke:transparent !important;fill:transparent !important;}</style></head><body>${html.content.replace(/<svg/, '<svg preserveAspectRatio="none"')}</body></html>`}
        />
      ) : loaded && imageUrl ? (
        <img src={resolveUploadsPath(imageUrl)} alt={title} className="w-full h-full object-fill bg-white" />
      ) : loaded && !html ? (
        <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full bg-white border border-[#d5d2c9]">
          <Icon icon="mdi:book-open-blank-variant" className="w-[2vw] h-[2vw] text-gray-400 mb-1" />
          <span className="text-[0.7vw] font-medium leading-tight text-gray-500">No Preview</span>
        </div>
      ) : null}
    </div>
  );
};

export default MyShelf;
