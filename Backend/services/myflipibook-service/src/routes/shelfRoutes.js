const express = require('express');
const ShelfCustomizations = require('../../../../shared/models/ShelfCustomizations');
const Profile = require('../../../../shared/models/Profile');
const Flipbook = require('../../../../shared/models/Flipbook');
const { optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(optionalAuth);

const normalizeFolderName = (name) => {
  if (!name || typeof name !== 'string') return 'My Bookshelf';
  const trimmed = name.trim();
  return trimmed || 'My Bookshelf';
};

const getOrCreateShelf = async (emailId) => {
  const normalizedEmail = (emailId || '').trim().toLowerCase();
  if (!normalizedEmail) return null;

  let shelf = await ShelfCustomizations.findOne({ emailId: normalizedEmail });
  if (!shelf) {
    // Migration fallback: check if legacy data exists in Profile.myShelf
    try {
      const legacyProfile = await Profile.findOne({ emailId: normalizedEmail }).lean();
      if (legacyProfile?.myShelf?.folders?.length > 0) {
        shelf = new ShelfCustomizations({
          userID: legacyProfile.userID || '',
          emailId: normalizedEmail,
          shelfCount: legacyProfile.myShelf.shelfCount || 1,
          folders: legacyProfile.myShelf.folders
        });
        await shelf.save();
      }
    } catch (_) {}
  }

  if (!shelf) {
    shelf = new ShelfCustomizations({
      emailId: normalizedEmail,
      shelfCount: 1,
      folders: []
    });
  }

  if (!Array.isArray(shelf.folders)) {
    shelf.folders = [];
  } else {
    let modified = false;
    const crypto = require('crypto');
    shelf.folders.forEach((f) => {
      if (!f.shelfId) {
        f.shelfId = 'sh_' + crypto.randomBytes(6).toString('hex');
        modified = true;
      }
    });
    if (modified) {
      shelf.markModified('folders');
      shelf.save().catch(e => console.error("Error backfilling shelfId:", e));
    }
  }
  return shelf;
};

// GET /api/profile/my-shelf-books or /api/shelf/my-shelf-books
router.get('/my-shelf-books', async (req, res) => {
  try {
    const emailId = (
      req.query?.emailId ||
      req.query?.email ||
      req.user?.emailId ||
      req.user?.email ||
      ''
    ).trim().toLowerCase();
    if (!emailId) return res.status(400).json({ success: false, message: 'Authentication required' });

    const normalizedEmail = emailId;
    const shelf = await getOrCreateShelf(normalizedEmail);
    if (!shelf) {
      return res.json({ success: true, books: [], myShelf: { folders: [] }, shelfCustomizations: { folders: [] } });
    }

    let bookIds = [];
    if (shelf.folders && Array.isArray(shelf.folders)) {
      shelf.folders.forEach((f) => {
        if (f.books) {
          f.books.forEach((b) => {
            const id = typeof b === 'string' ? b : b.v_id;
            if (id) bookIds.push(id);
          });
        }
      });
    }

    const allBooks = await Flipbook.find({ v_id: { $in: bookIds }, trash: { $ne: true } }).lean();
    const books = allBooks.filter(
      (b) => b.isPublished === true || (b.userEmail && b.userEmail.toLowerCase() === normalizedEmail)
    );

    const userEmails = [...new Set(books.map((b) => b.userEmail?.toLowerCase()).filter(Boolean))];
    const profiles = await Profile.find({ emailId: { $in: userEmails } }).lean();
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.emailId.toLowerCase()] = p;
    });

    const booksWithFlag = books.map((book) => {
      const p = profileMap[book.userEmail?.toLowerCase()] || {};
      const authorName = p.name || (book.userEmail ? book.userEmail.split('@')[0] : 'Creator');
      const city = p.city || p.state || (p.country && p.country !== 'INDIA' ? p.country : '') || 'Coimbatore';
      const authorPicture = p.picture || null;
      const authorBgColor = p.avatarBgColor || '#E8D4C8';

      return {
        ...book,
        isAddedToShelf: true,
        authorName,
        city,
        authorPicture,
        authorBgColor
      };
    });

    const shelfPayload = {
      shelfCount: shelf.shelfCount || 1,
      folders: shelf.folders || []
    };

    return res.json({
      success: true,
      books: booksWithFlag,
      myShelf: shelfPayload,
      shelfCustomizations: shelf
    });
  } catch (error) {
    console.error('Error fetching my-shelf-books:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/profile/add-to-shelf
router.post('/add-to-shelf', async (req, res) => {
  try {
    const emailId = (
      req.body?.emailId ||
      req.user?.emailId ||
      req.body?.email ||
      req.user?.email ||
      ''
    ).trim().toLowerCase();
    const { bookId, folderName } = req.body;
    if (!emailId || !bookId) {
      return res.status(400).json({ success: false, message: 'Missing emailId or bookId' });
    }

    const normalizedEmail = emailId;
    const shelf = await getOrCreateShelf(normalizedEmail);

    let targetFolder = normalizeFolderName(folderName);
    let folder = shelf.folders.find((f) => f.folderName === targetFolder);

    if (!folder) {
      shelf.folders.push({ folderName: targetFolder, shelf_design: 'customize4', books: [] });
      folder = shelf.folders.find((f) => f.folderName === targetFolder);
    }

    if (!folder.books) folder.books = [];

    const bookExists = folder.books.some((b) => {
      const id = typeof b === 'string' ? b : b.v_id;
      return id === bookId;
    });

    if (bookExists) {
      return res.json({ success: false, message: 'Book is already on your shelf' });
    }

    const currentCount = folder.books.length;
    folder.books.push({
      v_id: bookId,
      row: Math.floor(currentCount / 6),
      order: currentCount % 6
    });

    shelf.updatedAt = new Date();
    shelf.markModified('folders');
    await shelf.save();

    return res.json({ success: true, message: 'Book added to shelf' });
  } catch (error) {
    console.error('Error in add-to-shelf:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/profile/delete-shelf
router.post('/delete-shelf', async (req, res) => {
  try {
    const emailId = (
      req.body?.emailId ||
      req.user?.emailId ||
      req.body?.email ||
      req.user?.email ||
      ''
    ).trim().toLowerCase();
    const { folderName } = req.body;

    if (!emailId || !folderName) {
      return res.status(400).json({ success: false, message: 'Missing emailId or folderName' });
    }

    const shelf = await getOrCreateShelf(emailId);
    if (!shelf || !shelf.folders) {
      return res.status(404).json({ success: false, message: 'Shelf not found' });
    }

    const initialCount = shelf.folders.length;
    shelf.folders = shelf.folders.filter((f) => f.folderName !== folderName);

    if (shelf.folders.length < initialCount) {
      shelf.shelfCount = shelf.folders.length;
      shelf.updatedAt = new Date();
      shelf.markModified('folders');
      await shelf.save();

      // Also clean up from legacy Profile.myShelf if it exists
      try {
        const profile = await Profile.findOne({ emailId });
        if (profile?.myShelf?.folders) {
          profile.myShelf.folders = profile.myShelf.folders.filter((f) => f.folderName !== folderName);
          profile.markModified('myShelf.folders');
          await profile.save();
        }
      } catch (_) {}
    }

    return res.json({ success: true, message: 'Shelf deleted successfully' });
  } catch (error) {
    console.error('Error deleting shelf:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/profile/remove-from-shelf
router.post('/remove-from-shelf', async (req, res) => {
  try {
    const emailId = (
      req.body?.emailId ||
      req.user?.emailId ||
      req.body?.email ||
      req.user?.email ||
      ''
    ).trim().toLowerCase();
    const { bookId, folderName } = req.body;
    if (!emailId || !bookId) {
      return res.status(400).json({ success: false, message: 'Missing emailId or bookId' });
    }

    const normalizedEmail = emailId;
    const shelf = await getOrCreateShelf(normalizedEmail);
    if (!shelf || !shelf.folders) {
      return res.status(404).json({ success: false, message: 'Shelf not found' });
    }

    let removed = false;
    shelf.folders.forEach((folder) => {
      if (folderName && folder.folderName !== folderName) return;
      if (folder.books) {
        const initLength = folder.books.length;
        folder.books = folder.books.filter((b) => {
          const id = typeof b === 'string' ? b : b.v_id;
          return id !== bookId;
        });
        if (folder.books.length < initLength) {
          removed = true;
          folder.books = folder.books.map((b, index) => {
            if (typeof b === 'string') {
              return { v_id: b, row: Math.floor(index / 6), order: index % 6 };
            }
            b.row = Math.floor(index / 6);
            b.order = index % 6;
            return b;
          });
        }
      }
    });

    if (removed) {
      shelf.updatedAt = new Date();
      shelf.markModified('folders');
      await shelf.save();
    }

    return res.json({ success: true, message: 'Book removed from shelf' });
  } catch (error) {
    console.error('Error removing from shelf:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/profile/update-shelf-order
router.post('/update-shelf-order', async (req, res) => {
  try {
    const emailId = (
      req.body?.emailId ||
      req.body?.email ||
      req.user?.emailId ||
      req.user?.email ||
      ''
    ).trim().toLowerCase();
    const { folderName, bookIds, oldFolderName, shelfId } = req.body;
    if (!emailId || (!folderName && !shelfId)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const shelf = await getOrCreateShelf(emailId);
    const targetShelfId = (shelfId || '').trim();

    // Handle renaming shelf folder if oldFolderName is passed
    if (oldFolderName && folderName && oldFolderName !== folderName) {
      const existingFolder = shelf.folders.find((f) => 
        (targetShelfId && f.shelfId === targetShelfId) ||
        f.folderName === oldFolderName ||
        (f.folderName && f.folderName.trim().toLowerCase() === oldFolderName.trim().toLowerCase())
      );
      if (existingFolder) {
        existingFolder.folderName = folderName;
      }
    }

    let folder = shelf.folders.find((f) => 
      (targetShelfId && f.shelfId === targetShelfId) ||
      f.folderName === folderName ||
      (f.folderName && f.folderName.trim().toLowerCase() === (folderName || '').trim().toLowerCase()) ||
      (folderName === 'My Flipbooks' && (f.folderName === 'My_Flipbooks' || f.folderName === 'My Flipbooks')) ||
      (folderName === 'My_Flipbooks' && (f.folderName === 'My_Flipbooks' || f.folderName === 'My Flipbooks'))
    );

    if (!folder) {
      const crypto = require('crypto');
      const newShelfId = targetShelfId || ('sh_' + crypto.randomBytes(6).toString('hex'));
      shelf.folders.push({
        shelfId: newShelfId,
        folderName: folderName || 'My Bookshelf',
        shelf_design: 'customize4',
        books: []
      });
      folder = shelf.folders.find((f) => f.shelfId === newShelfId || f.folderName === folderName);
    } else if (targetShelfId && !folder.shelfId) {
      folder.shelfId = targetShelfId;
    }

    if (Array.isArray(bookIds)) {
      folder.books = bookIds.map((id, index) => ({
        v_id: id,
        row: Math.floor(index / 6),
        order: index % 6
      }));
    }

    shelf.updatedAt = new Date();
    shelf.markModified('folders');
    await shelf.save();

    return res.json({ success: true, message: 'Shelf order updated successfully', shelfId: folder?.shelfId });
  } catch (error) {
    console.error('Error in update-shelf-order:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/profile/update-shelf-design
router.post('/update-shelf-design', async (req, res) => {
  try {
    const emailId = (
      req.body?.emailId ||
      req.body?.email ||
      req.user?.emailId ||
      req.user?.email ||
      ''
    ).trim().toLowerCase();
    const {
      folderName,
      shelfId,
      shelf_design,
      defaultLightType,
      lights,
      selectedWallTheme,
      selectedLightTheme,
      showLightSwitch,
      lightOpacity,
      decors,
      logo,
      logoFixType,
      logoOpacity
    } = req.body;

    if (!emailId || (!folderName && !shelfId)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const shelf = await getOrCreateShelf(emailId);
    const targetShelfId = (shelfId || '').trim();

    let folder = shelf.folders.find((f) => 
      (targetShelfId && f.shelfId === targetShelfId) ||
      f.folderName === folderName ||
      (f.folderName && f.folderName.trim().toLowerCase() === (folderName || '').trim().toLowerCase()) ||
      (folderName === 'My Flipbooks' && (f.folderName === 'My_Flipbooks' || f.folderName === 'My Flipbooks')) ||
      (folderName === 'My_Flipbooks' && (f.folderName === 'My_Flipbooks' || f.folderName === 'My Flipbooks'))
    );

    if (!folder) {
      const crypto = require('crypto');
      const newShelfId = targetShelfId || ('sh_' + crypto.randomBytes(6).toString('hex'));
      shelf.folders.push({
        shelfId: newShelfId,
        folderName: folderName || 'My Bookshelf',
        shelf_design: shelf_design || 'customize4',
        defaultLightType: defaultLightType || 'Turn on',
        lights: lights !== undefined ? lights : true,
        selectedWallTheme: selectedWallTheme || null,
        selectedLightTheme: selectedLightTheme || null,
        showLightSwitch: showLightSwitch !== undefined ? showLightSwitch : true,
        lightOpacity: lightOpacity !== undefined ? lightOpacity : 100,
        decors: decors || {},
        logo: logo || null,
        logoFixType: logoFixType || 'Fit',
        logoOpacity: logoOpacity !== undefined ? logoOpacity : 80,
        books: []
      });
      folder = shelf.folders.find((f) => f.shelfId === newShelfId || f.folderName === folderName);
    } else {
      if (targetShelfId && !folder.shelfId) folder.shelfId = targetShelfId;
      if (folderName && folder.folderName !== folderName) folder.folderName = folderName;
      if (shelf_design !== undefined) folder.shelf_design = shelf_design;
      if (defaultLightType !== undefined) folder.defaultLightType = defaultLightType;
      if (lights !== undefined) folder.lights = lights;
      if (selectedWallTheme !== undefined) folder.selectedWallTheme = selectedWallTheme;
      if (selectedLightTheme !== undefined) folder.selectedLightTheme = selectedLightTheme;
      if (showLightSwitch !== undefined) folder.showLightSwitch = showLightSwitch;
      if (lightOpacity !== undefined) folder.lightOpacity = lightOpacity;
      if (decors !== undefined) folder.decors = decors;
      if (logo !== undefined) folder.logo = logo;
      if (logoFixType !== undefined) folder.logoFixType = logoFixType;
      if (logoOpacity !== undefined) folder.logoOpacity = logoOpacity;
    }

    shelf.updatedAt = new Date();
    shelf.markModified('folders');
    await shelf.save();

    return res.json({ success: true, message: 'Shelf design updated successfully', shelfId: folder?.shelfId });
  } catch (error) {
    console.error('Error in update-shelf-design:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /api/shelf/public/:shelfId or /api/profile/public-shelf/:shelfId
router.get(['/public/:shelfId', '/public-shelf/:shelfId'], async (req, res) => {
  try {
    const { shelfId } = req.params;
    if (!shelfId) {
      return res.status(400).json({ success: false, message: 'Shelf ID is required' });
    }

    // Set aggressive anti-cache headers so reloading always fetches fresh updates
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Find the shelf document that contains this shelfId
    const shelfDoc = await ShelfCustomizations.findOne({
      'folders.shelfId': shelfId
    }).lean();

    if (!shelfDoc || !Array.isArray(shelfDoc.folders)) {
      return res.status(404).json({ success: false, message: 'Shelf not found' });
    }

    const folder = shelfDoc.folders.find((f) => f.shelfId === shelfId);
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Shelf not found' });
    }

    // Extract book IDs from the folder
    const bookIds = (folder.books || [])
      .map((b) => (typeof b === 'string' ? b : b.v_id))
      .filter(Boolean);

    // Fetch flipbooks
    const allBooks = await Flipbook.find({
      v_id: { $in: bookIds },
      trash: { $ne: true }
    }).lean();

    // Fetch creator profile
    const creatorEmail = (shelfDoc.emailId || '').toLowerCase();
    const creatorProfile = await Profile.findOne({ emailId: creatorEmail }).lean();

    const authorName = creatorProfile?.name || (creatorEmail ? creatorEmail.split('@')[0] : 'Creator');
    const city = creatorProfile?.city || creatorProfile?.state || (creatorProfile?.country && creatorProfile?.country !== 'INDIA' ? creatorProfile?.country : '') || 'Coimbatore';
    const authorPicture = creatorProfile?.picture || null;
    const authorBgColor = creatorProfile?.avatarBgColor || '#E8D4C8';

    // Format books
    const booksMap = new Map();
    allBooks.forEach((book) => {
      const pageCount = Array.isArray(book.pages) ? book.pages.length : (typeof book.pages === 'number' ? book.pages : 0);
      booksMap.set(book.v_id, {
        ...book,
        isAddedToShelf: true,
        authorName,
        city,
        authorPicture,
        authorBgColor,
        pages: pageCount
      });
    });

    // Maintain the custom shelf ordering
    const orderedBooks = bookIds.map((id) => booksMap.get(id)).filter(Boolean);

    return res.json({
      success: true,
      shelf: {
        shelfId: folder.shelfId,
        folderName: folder.folderName,
        shelf_design: folder.shelf_design,
        defaultLightType: folder.defaultLightType,
        lights: folder.lights,
        selectedWallTheme: folder.selectedWallTheme,
        selectedLightTheme: folder.selectedLightTheme,
        showLightSwitch: folder.showLightSwitch,
        lightOpacity: folder.lightOpacity,
        decors: folder.decors,
        logo: folder.logo,
        logoFixType: folder.logoFixType || 'Fit',
        logoOpacity: folder.logoOpacity !== undefined ? folder.logoOpacity : 80,
        books: orderedBooks
      },
      creator: {
        name: authorName,
        email: creatorEmail,
        city,
        picture: authorPicture,
        avatarBgColor: authorBgColor
      }
    });
  } catch (error) {
    console.error('Error fetching public shelf:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
