import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { Search, Folder, ChevronDown, ArrowDownUp, Check } from 'lucide-react';
const resolveUploadsPath = (path) => path || '';
const getSupabaseBaseUrl = () => '';

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

import { useAuth } from '../../context/AuthContext';

const covers = [cover1, cover2, cover3, cover4, cover5];

const shelfOptions = [
  { id: 'customize1', name: 'Modern White', img: customize1 },
  { id: 'customize2', name: 'Classic Wood', img: customize2 },
  { id: 'customize3', name: 'Dark Oak', img: customize3 },
];

const MyShelf = () => {
  const { user } = useAuth();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Recently Created');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [draggedBookIndex, setDraggedBookIndex] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [bookToMoveIndex, setBookToMoveIndex] = useState(null);
  const [targetMoveFolder, setTargetMoveFolder] = useState('');

  // State for the currently applied shelf and the draft shelf in the modal
  const [activeShelfStyle, setActiveShelfStyle] = useState(shelfOptions[0].id);
  const [draftShelfStyle, setDraftShelfStyle] = useState(shelfOptions[0].id);

  const [booksData, setBooksData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const currentUserEmail = (user?.emailId || user?.email || '').toLowerCase();

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
          axios.get(`${backendUrl}/api/explore/creator`, { params: { emailId: currentUserEmail, t: timestamp } }).catch(() => ({ data: {} })),
          axios.get(`${backendUrl}/api/flipbook/list`, { params: { emailId: currentUserEmail, t: timestamp } }).catch(() => ({ data: {} })),
          axios.get(`${backendUrl}/api/profile/my-shelf-books`, { params: { emailId: currentUserEmail, t: timestamp } }).catch(() => ({ data: {} }))
        ]);

        if (creatorRes.data?.profile) {
          setProfileData(creatorRes.data.profile);
        }

        const rawBooks = listRes.data?.books || [];
        const shelfBooks = shelfRes.data?.books || [];

        // Filter out 'Recent Book' virtual tags so we only show actual folder contents, or filter by specific folder
        const actualCreatedBooks = rawBooks.filter(b => b.folder !== 'Recent Book');

        // Combine created books and shelf books, avoiding duplicates if a user somehow added their own book to the shelf
        const combinedBooksMap = new Map();
        actualCreatedBooks.forEach(b => {
          combinedBooksMap.set(b.v_id, b);
        });
        shelfBooks.forEach(b => {
          if (!combinedBooksMap.has(b.v_id)) {
            combinedBooksMap.set(b.v_id, b);
          } else {
            // Update folder if the shelf explicitly categorized it differently
            const existing = combinedBooksMap.get(b.v_id);
            existing.folder = b.folder;
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
            description: b.Customized_Settings?.FlipbookInfo?.quotes || b.quotes || 'â€œBring your content to life with a real, interactive experienceâ€',
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
        const actualMyShelf = shelfRes.data?.myShelf || (fetchedProfile && fetchedProfile.myShelf);
        const folderDesignMap = {};
        const bookToFolderMap = new Map();
        
        if (actualMyShelf && actualMyShelf.folders) {
          actualMyShelf.folders.forEach(f => {
            const fName = f.folderName === 'My_Flipbooks' ? 'My Flipbooks' : (f.folderName || 'My Flipbooks');
            if (!folderMap[fName]) folderMap[fName] = [];
            folderDesignMap[fName] = f.shelf_design || 1;
            
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
          shelf_design: folderDesignMap[folderName] || 1
        }));

        // Ensure 'My Flipbooks' always exists
        if (!newFolders.some(f => f.name === 'My Flipbooks')) {
          newFolders.unshift({ name: 'My Flipbooks', books: [], shelf_design: folderDesignMap['My Flipbooks'] || 1 });
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
    try {
      await axios.post(`${backendUrl}/api/profile/remove-from-shelf`, {
        emailId: currentUserEmail,
        bookId: v_id
      });

      // Remove from local state
      setBooksData(prev => prev.filter(b => b.v_id !== v_id));
      setFolders(prev => prev.map(f => ({
        ...f,
        books: f.books.filter(b => b.v_id !== v_id)
      })));
    } catch (err) {
      console.error("Failed to remove book:", err);
    }
  };

  // Sync active shelf style with the selected folder
  useEffect(() => {
    const currentFolder = folders.find(f => f.name === selectedFolder);
    if (currentFolder) {
      setActiveShelfStyle(`customize${currentFolder.shelf_design || 1}`);
    }
  }, [folders, selectedFolder]);

  const handleFlipbookSelect = (e) => {
    if (e.target.value === 'add_shelf') {
      setShowAddShelfModal(true);
    } else if (e.target.value === 'All Folders') {
      setSelectedFolder('All Folders');
    } else {
      setSelectedFolder(e.target.value);
      const targetFolder = folders.find(f => f.name === e.target.value);
      if (targetFolder) {
        setActiveShelfStyle(`customize${targetFolder.shelf_design || 1}`);
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

  const sortCategories = [
    {
      id: 'date',
      title: 'Date',
      options: ['Recently Created', 'Oldest Created', 'Recently Modified']
    },
    {
      id: 'title',
      title: 'Title',
      options: ['Title (A-Z)', 'Title (Z-A)']
    }
  ];

  const filteredBooks = useMemo(() => {
    let baseList = [];
    if (selectedFolder === 'All Folders' || selectedFolder === 'All') {
      const seen = new Set();
      folders.forEach(f => {
        (f.books || []).forEach(b => {
          if (!seen.has(b.v_id)) {
            seen.add(b.v_id);
            baseList.push(b);
          }
        });
      });
    } else {
      const activeFolderGlobal = folders.find(f => f.name === selectedFolder);
      baseList = activeFolderGlobal ? [...activeFolderGlobal.books] : [];
    }

    let list = baseList.filter(b => {
      if (selectedStatus !== 'All Status') {
        const isPublic = String(b.access).toLowerCase() === 'public';
        const isPrivate = String(b.access).toLowerCase() === 'private';
        const isPublished = b.rawBook?.isPublished === true || b.rawBook?.isPublished === 'true';

        if (selectedStatus === 'Published - Public' && (!isPublished || !isPublic)) return false;
        if (selectedStatus === 'Published - Private' && (!isPublished || !isPrivate)) return false;
        if (selectedStatus === 'Unpublished - Public' && (isPublished || !isPublic)) return false;
        if (selectedStatus === 'Unpublished - Private' && (isPublished || !isPrivate)) return false;
        if (selectedStatus === 'Private' && !isPrivate) return false;
        if (selectedStatus === 'Public' && !isPublic) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = (b.title || '').toLowerCase().includes(q);
        const matchesDesc = (b.description || '').toLowerCase().includes(q);
        const matchesCat = (b.category || '').toLowerCase().includes(q);
        const matchesAuthor = (b.authorName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesAuthor) return false;
      }

      return true;
    });

    if (sortOption === 'Recently Created') {
      list.sort((a, b) => {
        const dateA = new Date(a.rawBook?.createdAt || 0).getTime();
        const dateB = new Date(b.rawBook?.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } else if (sortOption === 'Oldest Created') {
      list.sort((a, b) => {
        const dateA = new Date(a.rawBook?.createdAt || 0).getTime();
        const dateB = new Date(b.rawBook?.createdAt || 0).getTime();
        return dateA - dateB;
      });
    } else if (sortOption === 'Recently Modified') {
      list.sort((a, b) => {
        const dateA = new Date(a.rawBook?.updatedAt || a.rawBook?.createdAt || 0).getTime();
        const dateB = new Date(b.rawBook?.updatedAt || b.rawBook?.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } else if (sortOption === 'Title (A-Z)') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortOption === 'Title (Z-A)') {
      list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }

    return list;
  }, [folders, selectedFolder, selectedStatus, searchQuery, sortOption]);

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
          padding: 'px-[1.5vw]',
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
          bg: mwWall1,
          rowAsset: bookShelf1,
          rowCount: calculatedRowCount,
          bgStretch: false,
          noZone: true,
          padding: 'px-[1.5vw]',
          topOffset: 6,
          spacing: 32,
          bookWidth: '11.5%',
          bookStyle: { bottom: '21%', padding: '0 14%' }
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
    <div className="flex flex-col w-full h-full px-[0.5vw] pb-0 pt-[0.2vw] overflow-visible font-sans text-gray-800">

      {/* Title */}
      <h2 className="text-[1.15vw] font-bold text-[#1f2937] mb-[0.6vw]">
        My Shelf
      </h2>

      {/* Toolbar: Search, Folders, Status, Sort & View Switcher */}
      <div className="flex items-center justify-between w-full mb-[0.8vw] relative z-20 flex-shrink-0" ref={dropdownRef}>
        {/* Left: Search & Filter Dropdowns */}
        <div className="flex items-center gap-[0.75vw]">
          {/* Search Input */}
          <div className="relative w-[15vw]">
            <Search className="absolute left-[0.9vw] top-1/2 -translate-y-1/2 text-[#ec5137]" size="0.95vw" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[2.4vw] pr-[1vw] py-[0.5vw] rounded-[0.6vw] border border-gray-200 text-[0.84vw] focus:outline-none focus:ring-1 focus:ring-[#ec5137] bg-white text-gray-700 placeholder-gray-400 shadow-xs"
            />
          </div>

          {/* All Folders Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'flipbooks' ? null : 'flipbooks')}
              className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-xs font-medium cursor-pointer"
            >
              <Folder size="0.9vw" className="text-[#ec5137]" />
              <span>{selectedFolder === 'All Folders' || selectedFolder === 'All' ? 'All Folders' : (selectedFolder === 'add_shelf' ? '+ Add Shelf' : selectedFolder)}</span>
              <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
            </button>
            {openDropdown === 'flipbooks' && (
              <div className="absolute top-full left-0 mt-[0.25vw] min-w-[11vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 max-h-[14vw] overflow-y-auto overflow-x-hidden custom-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    handleFlipbookSelect({ target: { value: 'All Folders' } });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] ${
                    selectedFolder === 'All Folders' || selectedFolder === 'All'
                      ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                      : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                  }`}
                >
                  All Folders
                </button>
                {folders.map(folder => (
                  <button
                    type="button"
                    key={folder.name}
                    onClick={() => {
                      handleFlipbookSelect({ target: { value: folder.name } });
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors truncate cursor-pointer ${
                      selectedFolder === folder.name
                        ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                        : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                    }`}
                  >
                    {folder.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    handleFlipbookSelect({ target: { value: 'add_shelf' } });
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] font-medium border-t border-gray-100 text-[#ec5137] hover:bg-[#fff5f3] cursor-pointer last:rounded-b-[0.55vw]"
                >
                  + Add Shelf
                </button>
              </div>
            )}
          </div>

          {/* All Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-xs font-medium cursor-pointer"
            >
              <Icon icon="lucide:disc" className="w-[0.9vw] h-[0.9vw] text-[#ec5137]" />
              <span>{selectedStatus}</span>
              <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
            </button>
            {openDropdown === 'status' && (
              <div className="absolute top-full left-0 mt-[0.25vw] min-w-[10vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 overflow-hidden">
                {['All Status', 'Public', 'Private', 'Published - Public', 'Published - Private'].map((status) => (
                  <button
                    type="button"
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] ${
                      selectedStatus === status
                        ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                        : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort by Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-xs font-medium cursor-pointer"
            >
              <ArrowDownUp size="0.9vw" className="text-[#ec5137]" />
              <span>Sort by - <span className="text-gray-500 font-normal">{sortOption}</span></span>
              <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
            </button>
            {openDropdown === 'sort' && (
              <div className="absolute top-full left-0 mt-[0.25vw] min-w-[14vw] max-h-[22vw] overflow-y-auto overflow-x-hidden custom-scrollbar bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50">
                {sortCategories.map((cat, idx) => (
                  <div key={cat.id || idx} className={idx > 0 ? "border-t border-gray-100 pt-[0.2vw] mt-[0.2vw]" : ""}>
                    <div className="px-[0.9vw] py-[0.25vw] text-[0.65vw] font-bold uppercase tracking-wider text-gray-400">
                      {cat.title}
                    </div>
                    {cat.options.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => { setSortOption(opt); setOpenDropdown(null); }}
                        className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors flex items-center justify-between cursor-pointer ${
                          sortOption === opt
                            ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                            : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                        }`}
                      >
                        <span>{opt}</span>
                        {sortOption === opt && <Check size="0.85vw" className="text-[#ec5137]" />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Shelf View / List View Buttons */}
        <div className="flex items-center gap-[0.5vw]">
          <button
            type="button"
            onClick={() => setView('shelf')}
            className={`flex items-center gap-[0.35vw] px-[0.8vw] py-[0.45vw] rounded-[0.55vw] text-[0.78vw] font-semibold transition-all border cursor-pointer ${
              view === 'shelf'
                ? 'bg-[#fff5f3] text-[#ec5137] border-[#fecdd3]'
                : 'bg-white text-gray-500 hover:text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[0.9vw] h-[0.9vw]">
              <path fillRule="evenodd" clipRule="evenodd" d="M 2 3 h 20 v 5 H 2 Z M 13.5 4 h 1.2 v 4 h -1.2 Z M 15.1 4 h 1.2 v 4 h -1.2 Z M 16.7 4 h 1.2 v 4 h -1.2 Z M 18.3 4 h 1.2 v 4 h -1.2 Z M 2 9.5 h 20 v 5 H 2 Z M 3.5 10.5 h 1.2 v 4 h -1.2 Z M 5.1 10.5 h 1.2 v 4 h -1.2 Z M 6.7 10.5 h 1.2 v 4 h -1.2 Z M 8.5 14.5 L 9.7 10.5 h 1.2 L 9.7 14.5 Z M 2 16 h 20 v 5 H 2 Z M 3.5 17 h 1.2 v 4 h -1.2 Z M 5.1 17 h 1.2 v 4 h -1.2 Z M 13.5 18.4 h 4 v 1.2 h -4 Z M 14.5 19.8 h 4 v 1.2 h -4 Z" />
            </svg>
            <span>Shelf View</span>
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`flex items-center gap-[0.35vw] px-[0.8vw] py-[0.45vw] rounded-[0.55vw] text-[0.78vw] font-semibold transition-all border cursor-pointer ${
              view === 'list'
                ? 'bg-[#fff5f3] text-[#ec5137] border-[#fecdd3]'
                : 'bg-white text-gray-500 hover:text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Icon icon="circum:box-list" className="w-[0.9vw] h-[0.9vw]" />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-[1vw] flex-1 min-h-0 relative">
        {view === 'shelf' ? (
          /* Outer Scrollable Container */
          <div className={`relative flex-1 h-full overflow-x-hidden ${globalRowCount <= 3 ? 'overflow-y-hidden' : 'overflow-y-auto pr-[0.4vw]'}`}>
            {isLoading && (
              <div className="absolute inset-0 z-50 flex gap-[0.5vw] items-center justify-center bg-white/50 backdrop-blur-sm rounded-[0.8vw]">
                 <Icon icon="eos-icons:loading" className="w-[2vw] h-[2vw] text-blue-600" />
                  <span className="text-[1vw] font-semibold text-gray-700">Shelf Loading...</span>
                </div>
            )}
            {/* The White Rounded Box (Grows in height) */}
            <div
              className="w-full rounded-[0.8vw] bg-white shadow-inner overflow-hidden flex flex-col"
              style={{
                minHeight: '100%',
                height: `${heightRatio * 100}%`
              }}
            >
              <div
                className={`relative flex-1 w-full bg-top rounded-[0.8vw]`}
                style={{
                  backgroundImage: (!Array.isArray(activeAssets.bg) && activeAssets.bg) ? `url('${activeAssets.bg}')` : 'none',
                  backgroundSize: activeAssets.bgStretch ? '100% 100%' : '100% auto',
                  backgroundRepeat: activeAssets.bgStretch ? 'no-repeat' : 'repeat',
                }}
              >
                {/* If bg is an array, map over it to render wall blocks */}
                {Array.isArray(activeAssets.bg) && (
                  <div className="absolute inset-0 flex flex-col rounded-[0.8vw] overflow-hidden pointer-events-none">
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
                <div className="absolute right-[1vw] top-[1vw] z-20">
                  <div
                    className="bg-white/80 backdrop-blur p-[0.5vw] rounded-full cursor-pointer hover:bg-white shadow-xs transition-all"
                    onClick={openShelfModal}
                    title="Change Shelf"
                  >
                    <svg className="w-[1.2vw] h-[1.2vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  </div>
                </div>

                {activeAssets.type === 'rows' && activeAssets.rowAsset && (
                  <div className="absolute inset-0 w-full h-full">
                    {Array.from({ length: activeAssets.rowCount }, (_, i) => (
                      <div
                        key={i}
                        className={`absolute left-0 w-full ${activeAssets.rowPadding ? '' : (activeAssets.padding || 'px-[2.5vw]')}`}
                        style={{
                          top: `${newTopOffset + (i * newSpacing) - (activeShelfStyle === 'customize2' && i !== activeAssets.rowCount - 1 ? 3.5 : 0)}%`,
                          padding: activeAssets.rowPadding || undefined
                        }}
                      >
                        {!(activeShelfStyle === 'customize2' && i === activeAssets.rowCount - 1) && (
                          <img src={activeAssets.rowAsset} alt="Shelf" className="w-full h-auto drop-shadow-lg" />
                        )}
                        {/* Books Container */}
                        {!activeAssets.hideBooks && (
                          <div
                            className="absolute inset-0 flex justify-between items-end"
                            style={activeAssets.bookStyle || { bottom: '15%', padding: '0 5%' }}
                          >
                            {(() => {
                              const rowBooks = filteredBooks.slice(i * 6, (i + 1) * 6) || [];
                              const paddedBooks = [...rowBooks, ...Array.from({ length: 6 - rowBooks.length }).fill(null)];
                              
                              return paddedBooks.map((book, bIdx) => {
                                if (!book) {
                                  return (
                                    <div
                                      key={`empty-${i}-${bIdx}`}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop(e, i * 6 + bIdx)}
                                      className={`relative flex justify-center items-end ${activeShelfStyle === 'customize2' ? (i === activeAssets.rowCount - 1 ? 'translate-y-[1vw]' : 'translate-y-0') : 'translate-y-[0.5vw]'} ${bIdx === 0 ? 'translate-x-[0.75vw]' : bIdx === 1 ? 'translate-x-[0.75vw]' : bIdx === 2 ? 'translate-x-[1vw]' : ''}`}
                                      style={{ width: activeAssets.bookWidth || '12%' }}
                                    />
                                  );
                                }

                                const emailFolder = book.rawBook?.userEmail ? book.rawBook.userEmail.replace(/[@.]/g, "_") : '';
                                const folderName = (book.rawBook?.folderName && book.rawBook.folderName.length > 0) ? book.rawBook.folderName[0] : (book.rawBook?.folder || '');
                                const bookName = book.rawBook?.flipbookName || book.rawBook?.title || '';
                                const basePath = getSupabaseBaseUrl(emailFolder, folderName, bookName);

                                return (
                                  <div
                                    key={book.v_id || bIdx}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, i * 6 + bIdx)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, i * 6 + bIdx)}
                                    onDragEnd={handleDragEnd}
                                    className={`relative group cursor-pointer flex justify-center items-end ${activeShelfStyle === 'customize2' ? (i === activeAssets.rowCount - 1 ? 'translate-y-[1vw]' : 'translate-y-0') : 'translate-y-[0.5vw]'} ${openMenuId === `${i}-${bIdx}` ? 'z-40' : 'hover:z-30'} ${bIdx === 0 ? 'translate-x-[0.75vw]' : bIdx === 1 ? 'translate-x-[0.75vw]' : bIdx === 2 ? 'translate-x-[1vw]' : ''} ${draggedBookIndex === (i * 6 + bIdx) ? 'opacity-50' : ''}`}
                                    style={{ width: activeAssets.bookWidth || '12%' }}
                                  >
                                    <div className="w-[100%] aspect-[2.5/3.5] relative rounded-[0.2vw] drop-shadow-md transition-transform origin-bottom group-hover:scale-105 overflow-hidden">
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
                                <div className="absolute top-[2%] right-[0vw] w-[1vw] h-[3vw] bg-[#E8E6E1] rounded-full flex flex-col items-center justify-between py-[0.1vw] opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30 pointer-events-none group-hover:pointer-events-auto">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === `${i}-${bIdx}` ? null : `${i}-${bIdx}`)}
                                    className="text-black hover:bg-gray-300 rounded-full w-[0.9vw] h-[0.9vw] flex items-center justify-center mt-[0.1vw] transition-colors"
                                  >
                                    <Icon icon="mdi:dots-vertical" className="text-[0.75vw]" />
                                  </button>
                                  <div
                                    className="text-[#4A4A4A] hover:text-black flex items-center justify-center mb-[0.1vw] transition-colors relative cursor-pointer"
                                    onMouseEnter={() => setHoveredInfoId(`${i}-${bIdx}`)}
                                    onMouseLeave={() => setHoveredInfoId(null)}
                                  >
                                    <Icon icon="si:info-fill" className="w-[0.85vw] h-[0.85vw]" />

                                    {/* Info Tooltip Bridge & Container */}
                                    <div className={`absolute top-1/2 right-full pr-[0.6vw] -translate-y-1/2 ${hoveredInfoId === `${i}-${bIdx}` ? 'block' : 'hidden'} z-[60]`}>
                                      <div className="w-[11vw] bg-white rounded-[0.7vw] p-[0.9vw] text-gray-800 shadow-xl flex flex-col gap-[0.6vw] cursor-default text-left border border-gray-100 relative">
                                        {/* Author Info */}
                                        <div className="flex items-center gap-[0.4vw]">
                                          {book.authorPicture && book.authorPicture !== 'color_only' ? (
                                            <img
                                              src={book.authorPicture}
                                              alt={book.authorName}
                                              className="w-[2vw] h-[2vw] rounded-full border border-gray-200 object-cover shrink-0"
                                            />
                                          ) : (
                                            <div
                                              className="w-[2vw] h-[2vw] rounded-full flex items-center justify-center text-white text-[0.7vw] font-bold shrink-0 shadow-inner"
                                              style={{ backgroundColor: book.authorBgColor }}
                                            >
                                              {(book.authorName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                          )}
                                          <div className="flex flex-col min-w-0 pr-[0.2vw]">
                                            <span className="text-[0.75vw] font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                                            <span className="flex items-center gap-[0.2vw] text-[0.6vw] text-gray-400 mt-[0.1vw] truncate">
                                              <Icon icon="lucide:map-pin" className="w-[0.7vw] h-[0.7vw] text-gray-400 shrink-0" />
                                              <span className="truncate">{String(book.location || '').replace(/[^\x20-\x7E]/g, '').trim()}</span>
                                            </span>
                                          </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-[0.4vw] justify-start text-[0.65vw] text-gray-700 font-medium whitespace-nowrap">
                                          <div className="flex items-center gap-[0.2vw]">
                                            <span className="text-black font-semibold">{book.pages || 0}</span>
                                            <span className="font-normal text-gray-500">Pages</span>
                                          </div>
                                          <span className="text-gray-300">|</span>
                                          <span className="flex items-center gap-[0.2vw]">
                                            <Icon icon="lucide:eye" className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                                            {book.views || '1.2k'}
                                          </span>
                                          <span className="text-gray-300">|</span>
                                          <span className="flex items-center gap-[0.2vw]">
                                            <Icon icon="material-symbols:star" className="w-[0.8vw] h-[0.8vw] text-yellow-400" />
                                            {book.rating || 4.5}
                                          </span>
                                        </div>

                                        {/* Title & Desc & Button */}
                                        <div className="relative">
                                          <h4 className="text-[0.8vw] font-semibold text-black truncate tracking-tight mb-[0.2vw]">{book.title}</h4>
                                          <p className="text-[0.65vw] text-gray-500 leading-relaxed pr-[2.2vw] line-clamp-2">{book.description}</p>

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
                                            className="absolute bottom-0 right-0 bg-black text-white w-[1.6vw] h-[1.6vw] rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                                          >
                                            <Icon icon="mdi:arrow-top-right" className="w-[0.9vw] h-[0.9vw]" />
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
                                        setBookToMoveIndex(activeFolderGlobal.books.findIndex(b => b.v_id === book.v_id));
                                        setTargetMoveFolder(selectedFolder);
                                        setShowMoveModal(true);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-[1vw] py-[0.3vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                    >
                                      Move Folder
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
                ))}
              </div>
            )}
              </div>
            </div>
          </div>
        ) : (
          /* List View Grid */
          <div className="flex-1 overflow-y-auto pr-[0.5vw] pb-[1vw]">
            {openMenuId && (
              <div
                className="fixed inset-0 z-20"
                onClick={() => setOpenMenuId(null)}
              />
            )}
            <div className="grid grid-cols-4 gap-[1.2vw]">
              {isLoading ? (
                <div className="col-span-full py-[5vw] flex justify-center items-center">
                  <div className="flex flex-col items-center gap-[0.8vw] bg-white px-[1.5vw] py-[1vw] rounded-[1vw] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100">
                    <Icon icon="eos-icons:loading" className="w-[2vw] h-[2vw] text-blue-600" />
                    <span className="text-[0.85vw] font-semibold text-gray-700">Loading Flipbooks...</span>
                  </div>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="col-span-full py-[2.5vw] flex justify-center text-[0.85vw] text-gray-500 font-semibold">No flipbooks found.</div>
              ) : (
                filteredBooks.map((book, idx) => (
                  <div key={book.v_id || idx} className="bg-white rounded-[1vw] overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow border border-transparent hover:border-gray-100">
                    {/* Image Area Wrapper */}
                    <div className="relative w-full aspect-square bg-[#e2b58d] overflow-hidden">
                      <img src={book.cover || listFrame} alt={book.title || "Flipbook"} className="w-full h-full object-cover" />

                      <button
                        onClick={() => setOpenMenuId(openMenuId === book.v_id ? null : book.v_id)}
                        className="absolute top-[0.6vw] right-[0.6vw] text-white hover:text-gray-200 bg-black/20 rounded-[0.3vw] p-[0.15vw] transition-colors z-30"
                      >
                        <Icon icon="mdi:dots-vertical" className="w-[1.1vw] h-[1.1vw]" />
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
                              setBookToMoveIndex(activeFolderGlobal.books.findIndex(b => b.v_id === book.v_id));
                              setTargetMoveFolder(selectedFolder);
                              setShowMoveModal(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-[1vw] py-[0.5vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 flex items-center gap-[0.5vw] transition-colors"
                          >
                            <Icon icon="mdi:folder-move-outline" className="w-[1vw] h-[1vw] text-gray-400" />
                            Move Folder
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
                    <div className="p-[1vw] flex flex-col flex-1 bg-white">
                      {/* Author Info */}
                      <div className="flex items-center gap-[0.6vw]">
                        {book.authorPicture && book.authorPicture !== 'color_only' ? (
                          <img
                            src={book.authorPicture}
                            alt={book.authorName}
                            className="w-[2vw] h-[2vw] rounded-full border border-gray-200 object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="w-[2vw] h-[2vw] rounded-full flex items-center justify-center text-white text-[0.75vw] font-bold shrink-0 shadow-inner"
                            style={{ backgroundColor: book.authorBgColor }}
                          >
                            {(book.authorName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 pr-[0.2vw]">
                          <span className="text-[0.8vw] font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                          <span className="flex items-center gap-[0.2vw] text-[0.65vw] text-gray-400 mt-[0.1vw] truncate">
                            <Icon icon="lucide:map-pin" className="w-[0.7vw] h-[0.7vw] text-gray-400 shrink-0" />
                            <span className="truncate">{String(book.location || '').replace(/[^\x20-\x7E]/g, '').trim()}</span>
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-[0.4vw] justify-start text-[0.65vw] text-gray-700 font-medium mt-[0.8vw] whitespace-nowrap">
                        <div className="flex items-center gap-[0.2vw]">
                          <span className="text-black font-semibold">{book.pages || 0}</span>
                          <span className="font-normal text-gray-500">Pages</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-[0.2vw]">
                          <Icon icon="lucide:eye" className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                          {book.views || '1.2k'}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-[0.2vw]">
                          <Icon icon="material-symbols:star" className="w-[0.85vw] h-[0.85vw] text-yellow-400" />
                          {book.rating || 4.5}
                        </span>
                      </div>

                      {/* Title & Desc & Button */}
                      <div className="relative flex-1 mt-[0.6vw]">
                        <h4 className="text-[0.85vw] font-semibold text-black truncate tracking-tight mb-[0.2vw]">{book.title}</h4>
                        <p className="text-[0.68vw] text-gray-500 leading-relaxed pr-[2.2vw] line-clamp-2">{book.description}</p>

                        {/* Action Button */}
                        <button
                          onClick={() => {
                            const targetShareId = book.shareId || book.v_id;
                            const rawAcc = String(book.access || 'public').toLowerCase();
                            if (targetShareId) {
                              window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                            }
                          }}
                          className="absolute bottom-0 right-0 bg-black text-white w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                        >
                          <Icon icon="mdi:arrow-top-right" className="w-[1vw] h-[1vw]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )))}
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="w-[15.5vw] flex flex-col justify-end gap-[1vw] h-full flex-shrink-0 select-none">

          {/* Shelf Usage */}
          <div className="bg-white border border-gray-200/90 rounded-[0.8vw] p-[1.1vw] shadow-xs">
            <h3 className="font-semibold text-[#1e293b] text-[0.88vw] mb-[0.9vw]">Shelf Usage</h3>
            <div className="h-[0.35vw] w-full bg-[#f1f5f9] rounded-full mb-[0.9vw] overflow-hidden">
              <div
                className="h-full bg-[#4F46E5] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (booksData.length / 50) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[0.74vw] text-[#64748b] font-medium">
              <span>{booksData.length} of 50 Flipbooks Used</span>
              <span>{Math.round(Math.min(100, (booksData.length / 50) * 100))}%</span>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[#fffbf2] border border-[#fdecd2] rounded-[0.8vw] p-[1.1vw] shadow-xs">
            <div className="flex items-center gap-[0.4vw] mb-[0.4vw]">
              <Icon icon="solar:lightbulb-bold" className="w-[1.05vw] h-[1.05vw] text-[#f59e0b]" />
              <h3 className="font-bold text-[#1e293b] text-[0.88vw]">Tips</h3>
            </div>
            <p className="text-[0.72vw] text-[#475569] mb-[1.2vw] leading-relaxed">
              Drag and Drop flipbooks to rearrange them on your shelf
            </p>
            <div className="flex justify-center items-end gap-[0.65vw] relative px-[0.5vw] mt-[0.5vw]">
              {/* Notebook 1 */}
              <div className="w-[1.8vw] h-[2.25vw] bg-[#cbd5e1] rounded-[0.3vw] relative flex items-center justify-center flex-shrink-0">
                <div className="w-[0.9vw] h-[0.3vw] bg-[#475569] rounded-full mb-[0.6vw]"></div>
                <div className="absolute left-[-0.15vw] top-[0.4vw] flex flex-col gap-[0.3vw]">
                  <span className="w-[0.3vw] h-[0.15vw] bg-white rounded-full"></span>
                  <span className="w-[0.3vw] h-[0.15vw] bg-white rounded-full"></span>
                  <span className="w-[0.3vw] h-[0.15vw] bg-white rounded-full"></span>
                </div>
              </div>

              {/* Notebook 2 */}
              <div className="w-[1.8vw] h-[2.25vw] bg-[#cbd5e1] rounded-[0.3vw] relative flex items-center justify-center flex-shrink-0">
                <div className="w-[0.9vw] h-[0.3vw] bg-[#475569] rounded-full mb-[0.6vw]"></div>
                <div className="absolute left-[-0.15vw] top-[0.4vw] flex flex-col gap-[0.3vw]">
                  <span className="w-[0.3vw] h-[0.15vw] bg-white rounded-full"></span>
                  <span className="w-[0.3vw] h-[0.15vw] bg-white rounded-full"></span>
                  <span className="w-[0.3vw] h-[0.15vw] bg-white rounded-full"></span>
                </div>
              </div>

              {/* Notebook 3 (Active / Dragged) */}
              <div className="relative -translate-y-[0.35vw] flex-shrink-0">
                <div className="w-[2.4vw] h-[2.9vw] bg-[#fde68a] rounded-[0.4vw] relative flex items-center justify-center shadow-xs">
                  <div className="w-[1.2vw] h-[0.4vw] bg-[#eab308] rounded-full mb-[0.8vw]"></div>
                  <div className="absolute left-[-0.15vw] top-[0.5vw] flex flex-col gap-[0.35vw]">
                    <span className="w-[0.35vw] h-[0.18vw] bg-white rounded-full"></span>
                    <span className="w-[0.35vw] h-[0.18vw] bg-white rounded-full"></span>
                    <span className="w-[0.35vw] h-[0.18vw] bg-white rounded-full"></span>
                  </div>
                </div>
                <Icon icon="fluent:cursor-click-24-filled" className="absolute -bottom-[0.4vw] -right-[0.5vw] w-[1.4vw] h-[1.4vw] text-black drop-shadow-sm rotate-[-10deg]" />
              </div>

              {/* Notebook 4 */}
              <div className="w-[1.8vw] h-[2.25vw] bg-[#cbd5e1] rounded-[0.3vw] relative flex items-center justify-center flex-shrink-0">
                <div className="w-[0.9vw] h-[0.3vw] bg-[#475569] rounded-full mb-[0.6vw]"></div>
                <div className="absolute left-[-0.15vw] top-[0.4vw] flex flex-col gap-[0.3vw]">
                  <span className="w-[0.3vw] h-[0.15vw] bg-white rounded-full"></span>
                  <span className="w-[0.3vw] h-[0.15vw] bg-white rounded-full"></span>
                  <span className="w-[0.3vw] h-[0.15vw] bg-white rounded-full"></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Change Shelf Modal */}
      {showShelfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowShelfModal(false)}>
          <div className="bg-white rounded-[0.8vw] shadow-xl border border-gray-100 w-[45vw] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-[1.5vw] py-[1vw] border-b border-gray-100">
              <div>
                <h2 className="text-[1.1vw] font-bold text-gray-800">Change Shelf</h2>
                <p className="text-[0.75vw] text-gray-500 mt-[0.2vw]">Choose a shelf style for your My Shelf</p>
              </div>
              <button
                onClick={() => setShowShelfModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-[0.4vw]"
              >
                <Icon icon="mdi:close" className="w-[1.1vw] h-[1.1vw]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-[1.5vw] flex justify-center items-center gap-[1.2vw] bg-gray-50/50">
              {shelfOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setDraftShelfStyle(option.id)}
                  className={`w-[13vw] cursor-pointer rounded-[0.8vw] border-2 overflow-hidden transition-all duration-200 group relative bg-white shadow-sm ${draftShelfStyle === option.id
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-transparent hover:border-gray-200 hover:shadow-md'
                    }`}
                >
                  <div className="bg-[#f0ece6] aspect-[4/3] flex items-center justify-center p-[0.8vw] relative">
                    <img src={option.img} alt={option.name} className="w-full h-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
                    {draftShelfStyle === option.id && (
                      <div className="absolute inset-0 bg-blue-500/10"></div>
                    )}
                  </div>
                  <div className={`p-[0.7vw] text-center border-t transition-colors ${draftShelfStyle === option.id ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100'}`}>
                    <p className={`text-[0.78vw] font-semibold ${draftShelfStyle === option.id ? 'text-blue-700' : 'text-gray-700'}`}>
                      {option.name}
                    </p>
                  </div>
                  {draftShelfStyle === option.id && (
                    <div className="absolute top-[0.5vw] right-[0.5vw] bg-blue-500 text-white rounded-full p-[0.25vw] shadow-sm">
                      <Icon icon="mdi:check-bold" className="w-[0.8vw] h-[0.8vw]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-[1.5vw] py-[1vw] border-t border-gray-100 flex justify-end gap-[0.7vw] bg-white">
              <button
                onClick={() => setShowShelfModal(false)}
                className="px-[1.2vw] py-[0.5vw] border border-gray-200 rounded-[0.4vw] text-[0.75vw] font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyShelfStyle}
                className="px-[1.2vw] py-[0.5vw] rounded-[0.4vw] text-[0.75vw] font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow transition-all"
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
          <div className="bg-white rounded-[0.8vw] shadow-xl border border-gray-100 w-[26vw] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-[1.5vw] py-[1vw] border-b border-gray-100">
              <h2 className="text-[1vw] font-bold text-gray-800">Create New Shelf</h2>
              <button onClick={() => setShowAddShelfModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-[0.4vw]">
                <Icon icon="mdi:close" className="w-[1.1vw] h-[1.1vw]" />
              </button>
            </div>
            <div className="p-[1.5vw]">
              <label className="block text-[0.75vw] font-medium text-gray-700 mb-[0.5vw]">Shelf Name</label>
              <input
                type="text"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                className="w-full px-[0.9vw] py-[0.5vw] border border-gray-300 rounded-[0.5vw] text-[0.78vw] focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter shelf name"
                autoFocus
              />
            </div>
            <div className="px-[1.5vw] py-[1vw] border-t border-gray-100 flex justify-end gap-[0.7vw] bg-white">
              <button onClick={() => setShowAddShelfModal(false)} className="px-[1.2vw] py-[0.5vw] border border-gray-200 rounded-[0.4vw] text-[0.75vw] font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 transition-colors">Cancel</button>
              <button
                onClick={() => {
                  if (newShelfName.trim()) {
                    setFolders(prev => [{ name: newShelfName.trim(), books: [] }, ...prev]);
                    setSelectedFolder(newShelfName.trim());
                    setNewShelfName('');
                    setShowAddShelfModal(false);
                  }
                }}
                className="px-[1.2vw] py-[0.5vw] rounded-[0.4vw] text-[0.75vw] font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
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
          <div className="bg-white rounded-[0.8vw] shadow-xl border border-gray-100 w-[26vw] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-[1.5vw] py-[1vw] border-b border-gray-100">
              <h2 className="text-[1vw] font-bold text-gray-800">Move to Folder</h2>
              <button onClick={() => setShowMoveModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-[0.4vw]">
                <Icon icon="mdi:close" className="w-[1.1vw] h-[1.1vw]" />
              </button>
            </div>
            <div className="p-[1.5vw]">
              <label className="block text-[0.75vw] font-medium text-gray-700 mb-[0.5vw]">Select Destination Folder</label>
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'move_folder' ? null : 'move_folder')}
                  className="flex items-center justify-between w-full px-[0.9vw] py-[0.5vw] bg-white border border-gray-300 rounded-[0.5vw] text-[0.78vw] focus:outline-none"
                >
                  <span className="text-[#5B738B]">{targetMoveFolder === '__add_shelf__' ? '+ Add Shelf' : targetMoveFolder}</span>
                  <Icon icon={openDropdown === 'move_folder' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-[0.9vw] h-[0.9vw] text-[#8BA3BA]" />
                </button>

                {openDropdown === 'move_folder' && (
                  <div className="absolute z-50 w-full mt-[0.3vw] bg-white border border-gray-100 rounded-[0.5vw] shadow-[0_4px_20px_rgb(0,0,0,0.08)] py-[0.3vw] overflow-hidden">
                    {folders.map(folder => (
                      <div
                        key={folder.name}
                        className={`px-[0.9vw] py-[0.4vw] text-[0.75vw] cursor-pointer hover:bg-gray-50 transition-colors ${targetMoveFolder === folder.name ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                        onClick={() => {
                          setTargetMoveFolder(folder.name);
                          setOpenDropdown(null);
                        }}
                      >
                        {folder.name}
                      </div>
                    ))}
                    <div
                      className={`px-[0.9vw] py-[0.4vw] text-[0.75vw] cursor-pointer border-t border-gray-100 hover:bg-gray-50 transition-colors ${targetMoveFolder === '__add_shelf__' ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
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
                <div className="mt-[1vw]">
                  <label className="block text-[0.75vw] font-medium text-gray-700 mb-[0.5vw]">New Folder Name</label>
                  <input
                    type="text"
                    value={newShelfName}
                    onChange={(e) => setNewShelfName(e.target.value)}
                    className="w-full px-[0.9vw] py-[0.5vw] border border-gray-300 rounded-[0.5vw] text-[0.78vw] focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new folder name"
                    autoFocus
                  />
                </div>
              )}
            </div>
            <div className="px-[1.5vw] py-[1vw] border-t border-gray-100 flex justify-end gap-[0.7vw] bg-white">
              <button onClick={() => setShowMoveModal(false)} className="px-[1.2vw] py-[0.5vw] border border-gray-200 rounded-[0.4vw] text-[0.75vw] font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 transition-colors">Cancel</button>
              <button
                onClick={handleMoveSubmit}
                className="px-[1.2vw] py-[0.5vw] rounded-[0.4vw] text-[0.75vw] font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                {targetMoveFolder === '__add_shelf__' ? 'Create & Move' : 'Move'}
              </button>
            </div>
          </div>
        </div>
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
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative bg-white overflow-hidden rounded-[0.2vw]">
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
          <Icon icon="mdi:book-open-blank-variant" className="w-[2vw] h-[2vw] text-gray-400 mb-[0.2vw]" />
          <span className="text-[0.7vw] font-medium leading-tight text-gray-500">No Preview</span>
        </div>
      ) : null}
    </div>
  );
};

export default MyShelf;
