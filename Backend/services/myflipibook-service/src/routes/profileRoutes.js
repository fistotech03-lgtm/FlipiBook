const express = require('express');
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

const normalizeAndMergeFolders = (profile) => {
  if (!profile.myShelf) {
    profile.myShelf = { shelfCount: 1, folders: [] };
  }
  if (!Array.isArray(profile.myShelf.folders)) {
    profile.myShelf.folders = [];
  }
  return false;
};

// GET /api/profile/my-shelf-books
router.get('/my-shelf-books', async (req, res) => {
  try {
    const emailId = (req.query?.emailId || req.user?.emailId || '').trim().toLowerCase();
    if (!emailId) return res.status(400).json({ success: false, message: 'Authentication required' });

    const normalizedEmail = emailId;
    const profile = await Profile.findOne({ emailId: normalizedEmail });
    if (!profile) {
      return res.json({ success: true, books: [], myShelf: { folders: [] } });
    }

    let bookIds = [];
    if (profile.myShelf && profile.myShelf.folders) {
      profile.myShelf.folders.forEach((f) => {
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

    return res.json({
      success: true,
      books: booksWithFlag,
      myShelf: profile.myShelf || { folders: [] }
    });
  } catch (error) {
    console.error('Error fetching my-shelf-books:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/profile/add-to-shelf
router.post('/add-to-shelf', async (req, res) => {
  try {
    const emailId = (req.body?.emailId || req.user?.emailId || '').trim().toLowerCase();
    const { bookId, folderName } = req.body;
    if (!emailId || !bookId) {
      return res.status(400).json({ success: false, message: 'Missing emailId or bookId' });
    }

    const normalizedEmail = emailId;
    let profile = await Profile.findOne({ emailId: normalizedEmail });
    if (!profile) {
      profile = new Profile({ emailId: normalizedEmail });
    }

    normalizeAndMergeFolders(profile);

    let targetFolder = normalizeFolderName(folderName);
    let folder = profile.myShelf.folders.find((f) => f.folderName === targetFolder);

    if (!folder) {
      profile.myShelf.folders.push({ folderName: targetFolder, shelf_design: 1, books: [] });
      folder = profile.myShelf.folders.find((f) => f.folderName === targetFolder);
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

    profile.updatedAt = new Date();
    profile.markModified('myShelf.folders');
    profile.markModified('myShelf');
    await profile.save();

    return res.json({ success: true, message: 'Book added to shelf' });
  } catch (error) {
    console.error('Error in add-to-shelf:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/profile/remove-from-shelf
router.post('/remove-from-shelf', async (req, res) => {
  try {
    const emailId = (req.body?.emailId || req.user?.emailId || '').trim().toLowerCase();
    const { bookId } = req.body;
    if (!emailId || !bookId) {
      return res.status(400).json({ success: false, message: 'Missing emailId or bookId' });
    }

    const normalizedEmail = emailId;
    let profile = await Profile.findOne({ emailId: normalizedEmail });
    if (!profile || !profile.myShelf || !profile.myShelf.folders) {
      return res.status(404).json({ success: false, message: 'Profile or shelf not found' });
    }

    normalizeAndMergeFolders(profile);

    let removed = false;
    profile.myShelf.folders.forEach((folder) => {
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
      profile.updatedAt = new Date();
      profile.markModified('myShelf.folders');
      profile.markModified('myShelf');
      await profile.save();
    }

    return res.json({ success: true, message: 'Book removed from shelf' });
  } catch (error) {
    console.error('Error removing from shelf:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
