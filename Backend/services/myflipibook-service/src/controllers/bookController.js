const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Flipbook = require('../models/Flipbook');
const { deleteBookStorage, getStorageRoot } = require('../utils/storageHelper');
const { getAuthUser, getFlipbookUserQuery } = require('../utils/userHelper');

// In-memory cache for chunked uploads
const chunkUploads = new Map();

/**
 * Format book document to match frontend contract expected by MyFlipbooks.jsx
 */
const formatBook = (doc) => {
  const realFolders = Array.isArray(doc.folderName)
    ? doc.folderName.filter((f) => f !== 'Recent Book' && f !== 'Recent' && f !== 'Recent book')
    : [doc.folderName];
  const primaryFolder = realFolders[0] || 'My_Flipbooks';

  return {
    id: doc._id.toString(),
    _id: doc._id.toString(),
    userId: doc.userId ? doc.userId.toString() : null,
    v_id: doc.v_id,
    title: doc.flipbookName,
    realName: doc.flipbookName,
    flipbookName: doc.flipbookName,
    folder: primaryFolder,
    folderName: primaryFolder,
    pages: Array.isArray(doc.pages) ? doc.pages.length : (typeof doc.pages === 'number' ? doc.pages : 0),
    pagesCount: Array.isArray(doc.pages) ? doc.pages.length : (typeof doc.pages === 'number' ? doc.pages : 0),
    pagesList: Array.isArray(doc.pages) ? doc.pages : [],
    fileSize: doc.fileSize || 0,
    trash: Boolean(doc.trash),
    trashedAt: doc.trashedAt,
    isFavorite: Boolean(doc.isFavorite),
    isPublished: Boolean(doc.isPublished),
    createdAt: doc.createdAt,
    lastUpdated: doc.lastUpdated || doc.updatedAt,
    width: doc.Customized_Settings?.width || null,
    height: doc.Customized_Settings?.height || null,
    orientation: doc.Customized_Settings?.orientation || null,
    templateId: doc.Customized_Settings?.templateId || null,
    Customized_Settings: doc.Customized_Settings || {}
  };
};

/**
 * GET /api/flipbook/list
 * Fetch all user books
 */
exports.getBooks = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const rawBooks = await Flipbook.find(userQuery).sort({ updatedAt: -1 });
    const formattedBooks = rawBooks.map(formatBook);

    res.status(200).json({
      success: true,
      books: formattedBooks
    });
  } catch (err) {
    console.error('[Book Controller] Error fetching books:', err);
    res.status(500).json({ success: false, message: 'Server error fetching books' });
  }
};

/**
 * POST /api/flipbook/favorite
 * Toggle favorite status
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, bookName, isFavorite } = req.body;
    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const query = { ...userQuery };
    if (v_id) {
      query.v_id = v_id;
    } else if (bookName) {
      query.flipbookName = bookName;
    } else {
      return res.status(400).json({ success: false, message: 'Missing book identifier (v_id or bookName)' });
    }

    const updated = await Flipbook.findOneAndUpdate(
      query,
      { $set: { isFavorite: Boolean(isFavorite) } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Favorite status updated',
      isFavorite: updated.isFavorite,
      book: formatBook(updated)
    });
  } catch (err) {
    console.error('[Book Controller] Error toggling favorite:', err);
    res.status(500).json({ success: false, message: 'Server error toggling favorite' });
  }
};

/**
 * POST /api/flipbook/trash
 * Move flipbook to trash
 */
exports.trashBook = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, bookName, folderName } = req.body;
    if (!userQuery || (!v_id && !bookName)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const query = { ...userQuery };
    if (v_id) {
      query.v_id = v_id;
    } else {
      query.flipbookName = bookName;
      if (folderName && folderName !== 'Trash') {
        query.folderName = folderName;
      }
    }

    const updated = await Flipbook.findOneAndUpdate(
      query,
      {
        $set: {
          trash: true,
          trashedAt: new Date(),
          isPublished: false
        },
        $pull: { folderName: { $in: ['Recent Book', 'Recent', 'Recent book'] } }
      },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Moved to trash successfully',
      book: formatBook(updated)
    });
  } catch (err) {
    console.error('[Book Controller] Error moving book to trash:', err);
    res.status(500).json({ success: false, message: 'Server error moving book to trash' });
  }
};

/**
 * POST /api/flipbook/restore
 * Restore flipbook from trash
 */
exports.restoreBook = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, bookName } = req.body;
    if (!userQuery || (!v_id && !bookName)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const query = { ...userQuery };
    if (v_id) {
      query.v_id = v_id;
    } else {
      query.flipbookName = bookName;
    }

    const updated = await Flipbook.findOneAndUpdate(
      query,
      { $set: { trash: false, trashedAt: null } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Flipbook restored successfully',
      book: formatBook(updated)
    });
  } catch (err) {
    console.error('[Book Controller] Error restoring book:', err);
    res.status(500).json({ success: false, message: 'Server error restoring book' });
  }
};

/**
 * POST /api/flipbook/empty-trash
 * Permanently delete all trashed flipbooks
 */
exports.emptyTrash = async (req, res) => {
  try {
    const { rawId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getFlipbookUserQuery(req);

    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const trashedBooks = await Flipbook.find({ ...userQuery, trash: true });

    // Clean up local disk files for trashed books
    for (const b of trashedBooks) {
      const folder = Array.isArray(b.folderName) ? b.folderName[0] : b.folderName;
      deleteBookStorage(rawId || customUserId, emailId, folder || 'My_Flipbooks', b.flipbookName);
    }

    const deleteResult = await Flipbook.deleteMany({ ...userQuery, trash: true });

    res.status(200).json({
      success: true,
      message: 'Trash emptied successfully',
      deletedCount: deleteResult.deletedCount
    });
  } catch (err) {
    console.error('[Book Controller] Error emptying trash:', err);
    res.status(500).json({ success: false, message: 'Server error emptying trash' });
  }
};

/**
 * POST /api/flipbook/rename
 * Rename flipbook title
 */
exports.renameBook = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, bookName, newBookName } = req.body;
    if (!userQuery || (!v_id && !bookName) || !newBookName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const trimmedNew = newBookName.trim();
    const query = { ...userQuery };
    if (v_id) query.v_id = v_id;
    else query.flipbookName = bookName;

    const updated = await Flipbook.findOneAndUpdate(
      query,
      { $set: { flipbookName: trimmedNew, lastUpdated: new Date() } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Renamed successfully',
      book: formatBook(updated)
    });
  } catch (err) {
    console.error('[Book Controller] Error renaming book:', err);
    res.status(500).json({ success: false, message: 'Server error renaming book' });
  }
};

/**
 * POST /api/flipbook/duplicate
 * Duplicate a flipbook document
 */
exports.duplicateBook = async (req, res) => {
  try {
    const { objectId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, bookName } = req.body;

    if (!userQuery || (!v_id && !bookName)) {
      return res.status(400).json({ success: false, message: 'Missing book identifier' });
    }

    const query = { ...userQuery };
    if (v_id) query.v_id = v_id;
    else query.flipbookName = bookName;

    const existing = await Flipbook.findOne(query);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Original flipbook not found' });
    }

    const cloneData = existing.toObject();
    delete cloneData._id;
    cloneData.v_id = crypto.randomBytes(8).toString('hex');
    if (objectId) {
      cloneData.userId = objectId;
    }
    if (customUserId) {
      cloneData.userID = customUserId;
    }
    if (emailId) {
      cloneData.userEmail = emailId;
    }
    cloneData.flipbookName = `${cloneData.flipbookName} Copy`;
    cloneData.trash = false;
    cloneData.trashedAt = null;
    cloneData.isPublished = false;

    const duplicated = await Flipbook.create(cloneData);

    res.status(201).json({
      success: true,
      message: 'Book duplicated successfully',
      book: formatBook(duplicated)
    });
  } catch (err) {
    console.error('[Book Controller] Error duplicating book:', err);
    res.status(500).json({ success: false, message: 'Server error duplicating book' });
  }
};

/**
 * DELETE /api/flipbook/delete or /api/flipbook/delete/:v_id
 * Permanently delete single flipbook
 */
exports.deleteBookPermanently = async (req, res) => {
  try {
    const { rawId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getFlipbookUserQuery(req);
    const v_id = req.params?.v_id || req.body?.v_id;
    const bookName = req.body?.bookName;

    if (!userQuery || (!v_id && !bookName)) {
      return res.status(400).json({ success: false, message: 'Missing book identifier' });
    }

    const query = { ...userQuery };
    if (v_id) query.v_id = v_id;
    else query.flipbookName = bookName;

    const book = await Flipbook.findOne(query);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    const folder = Array.isArray(book.folderName) ? book.folderName[0] : book.folderName;
    deleteBookStorage(rawId || customUserId, emailId, folder || 'My_Flipbooks', book.flipbookName);

    await Flipbook.deleteOne({ _id: book._id });

    res.status(200).json({
      success: true,
      message: 'Flipbook permanently deleted'
    });
  } catch (err) {
    console.error('[Book Controller] Error deleting book permanently:', err);
    res.status(500).json({ success: false, message: 'Server error deleting book' });
  }
};

/**
 * POST /api/flipbook/remove-recent
 * Remove book from Recent view
 */
exports.removeRecent = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const { bookName, v_id } = req.body;
    if (!userQuery || (!bookName && !v_id)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const query = { ...userQuery };
    if (v_id) query.v_id = v_id;
    else query.flipbookName = bookName;

    await Flipbook.updateOne(
      query,
      { $pull: { folderName: { $in: ['Recent Book', 'Recent', 'Recent book'] } } }
    );

    res.status(200).json({ success: true, message: 'Removed from Recent' });
  } catch (err) {
    console.error('[Book Controller] Error removing recent:', err);
    res.status(500).json({ success: false, message: 'Server error removing recent' });
  }
};

/**
 * POST /api/flipbook/unpublish
 * Unpublish flipbook
 */
exports.unpublishBook = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, bookName } = req.body;
    if (!userQuery || (!v_id && !bookName)) {
      return res.status(400).json({ success: false, message: 'Missing book identifier' });
    }

    const query = { ...userQuery };
    if (v_id) query.v_id = v_id;
    else query.flipbookName = bookName;

    const updated = await Flipbook.findOneAndUpdate(
      query,
      { $set: { isPublished: false } },
      { returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      message: 'Flipbook unpublished',
      book: updated ? formatBook(updated) : null
    });
  } catch (err) {
    console.error('[Book Controller] Error unpublishing book:', err);
    res.status(500).json({ success: false, message: 'Server error unpublishing book' });
  }
};

/**
 * POST /api/flipbook/save/chunk
 * Receive chunked page upload for large assets/pages
 */
exports.saveChunk = async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, chunkData } = req.body;
    if (!uploadId || chunkIndex === undefined || !chunkData) {
      return res.status(400).json({ success: false, message: 'Missing chunk parameters' });
    }
    if (!chunkUploads.has(uploadId)) {
      chunkUploads.set(uploadId, { chunks: new Array(totalChunks), totalChunks, timestamp: Date.now() });
    }
    const session = chunkUploads.get(uploadId);
    session.chunks[chunkIndex] = chunkData;

    const isComplete = session.chunks.filter(Boolean).length === session.totalChunks;
    if (isComplete) {
      session.fullContent = session.chunks.join('');
    }
    res.status(200).json({ success: true, isComplete });
  } catch (err) {
    console.error('[Book Controller] Error in saveChunk:', err);
    res.status(500).json({ success: false, message: 'Chunk upload error' });
  }
};

/**
 * POST /api/flipbook/save
 * Save or create a new flipbook with full page content & storage persistence
 */
exports.saveBook = async (req, res) => {
  try {
    const { objectId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getFlipbookUserQuery(req);
    const { flipbookName, pages, folderName, fileSize, overwrite, v_id: providedVId, meta } = req.body;

    if (!userQuery || !flipbookName) {
      return res.status(400).json({ success: false, message: 'Missing required flipbookName' });
    }

    const safeName = flipbookName.trim();
    const targetFolder = (folderName && typeof folderName === 'string')
      ? [folderName.trim()]
      : (Array.isArray(folderName) && folderName.length > 0 ? folderName : ['My_Flipbooks']);

    let book = null;
    if (providedVId) {
      book = await Flipbook.findOne({ ...userQuery, v_id: providedVId });
    } else if (overwrite) {
      book = await Flipbook.findOne({ ...userQuery, flipbookName: safeName });
    }

    const resolvedVId = book?.v_id || providedVId || crypto.randomBytes(8).toString('hex');

    // Index existing pages by v_id and pageNumber to prevent overwriting unchanged pages
    const existingPagesMap = new Map();
    if (book && Array.isArray(book.pages)) {
      book.pages.forEach((p) => {
        if (p.v_id) existingPagesMap.set(p.v_id, p);
        if (p.pageNumber !== undefined) existingPagesMap.set(String(p.pageNumber), p);
      });
    }

    const safePages = Array.isArray(pages) ? pages.map((p, idx) => {
      const pageNum = p.pageNumber !== undefined ? p.pageNumber : (idx + 1);
      const existingPage = existingPagesMap.get(p.v_id) || existingPagesMap.get(String(pageNum));

      // Resolve chunked upload if applicable
      let chunkedContent = null;
      if (p.contentChunkId && chunkUploads.has(p.contentChunkId)) {
        chunkedContent = chunkUploads.get(p.contentChunkId).fullContent || '';
        chunkUploads.delete(p.contentChunkId);
      }

      const pageContent = (chunkedContent !== null)
        ? chunkedContent
        : (p.content !== undefined && p.content !== null)
          ? p.content
          : (p.html !== undefined && p.html !== null)
            ? p.html
            : (existingPage?.content || existingPage?.html || '');

      const pageVId = (p.v_id && p.v_id !== resolvedVId)
        ? p.v_id
        : (existingPage?.v_id && existingPage.v_id !== resolvedVId)
          ? existingPage.v_id
          : crypto.randomBytes(6).toString('hex');

      return {
        pageNumber: pageNum,
        name: p.name || p.pageName || existingPage?.name || `Page ${pageNum}`,
        fileName: p.fileName || existingPage?.fileName || `${pageNum}.svg`,
        v_id: pageVId,
        size: p.size || (pageContent ? Buffer.byteLength(pageContent, 'utf8') : existingPage?.size || 0),
        hide: p.hide !== undefined ? p.hide : (existingPage?.hide || 0),
        content: pageContent,
        html: pageContent
      };
    }) : [];

    if (book) {
      book.flipbookName = safeName;
      book.folderName = targetFolder;
      if (safePages.length > 0) book.pages = safePages;
      if (fileSize !== undefined) book.fileSize = fileSize;
      if (meta) book.Customized_Settings = { ...(book.Customized_Settings || {}), ...meta };
      book.lastUpdated = new Date();
      await book.save();
    } else {
      book = await Flipbook.create({
        ...(objectId ? { userId: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
        userEmail: emailId,
        v_id: resolvedVId,
        flipbookName: safeName,
        folderName: targetFolder,
        pages: safePages,
        fileSize: fileSize || 0,
        Customized_Settings: meta || {},
        lastUpdated: new Date()
      });
    }

    // Persist pages to local disk storage
    try {
      const storageRoot = getStorageRoot();
      const userFolder = objectId ? String(objectId) : (emailId ? emailId.replace(/[@.]/g, '_') : 'default');
      const bookDir = path.join(storageRoot, 'flipbooks', userFolder, targetFolder[0] || 'My_Flipbooks', safeName);
      const pagesDir = path.join(bookDir, 'pages');
      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
      }
      safePages.forEach((sp) => {
        if (sp.content) {
          fs.writeFileSync(path.join(pagesDir, `${sp.pageNumber}.svg`), sp.content, 'utf8');
        }
      });
    } catch (fsErr) {
      console.warn('[Book Controller] Warning writing pages to disk:', fsErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Flipbook saved successfully',
      v_id: resolvedVId,
      book: formatBook(book),
      pages: book.pages || []
    });
  } catch (err) {
    console.error('[Book Controller] Error saving book:', err);
    res.status(500).json({ success: false, message: 'Server error saving book' });
  }
};

/**
 * POST /api/flipbook/save-pages-batch
 * Batch append or update pages for a flipbook
 */
exports.savePagesBatch = async (req, res) => {
  try {
    const { objectId, emailId } = getAuthUser(req);
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, pages, fileSize } = req.body;

    if (!userQuery || !v_id || !Array.isArray(pages)) {
      return res.status(400).json({ success: false, message: 'Missing v_id or pages' });
    }

    const book = await Flipbook.findOne({ ...userQuery, v_id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    const newPagesMap = new Map();
    (book.pages || []).forEach(p => newPagesMap.set(p.pageNumber, p));

    pages.forEach((p, idx) => {
      const pageNum = p.pageNumber !== undefined ? p.pageNumber : (newPagesMap.size + idx + 1);
      const existingPage = newPagesMap.get(pageNum);

      const pageContent = (p.content !== undefined && p.content !== null)
        ? p.content
        : (p.html !== undefined && p.html !== null)
          ? p.html
          : (existingPage?.content || existingPage?.html || '');

      const pageVId = (p.v_id && p.v_id !== v_id)
        ? p.v_id
        : (existingPage?.v_id && existingPage.v_id !== v_id)
          ? existingPage.v_id
          : crypto.randomBytes(6).toString('hex');

      newPagesMap.set(pageNum, {
        pageNumber: pageNum,
        name: p.name || p.pageName || existingPage?.name || `Page ${pageNum}`,
        fileName: p.fileName || existingPage?.fileName || `${pageNum}.svg`,
        v_id: pageVId,
        size: p.size || (pageContent ? Buffer.byteLength(pageContent, 'utf8') : existingPage?.size || 0),
        hide: p.hide !== undefined ? p.hide : (existingPage?.hide || 0),
        content: pageContent,
        html: pageContent
      });
    });

    book.pages = Array.from(newPagesMap.values()).sort((a, b) => a.pageNumber - b.pageNumber);
    if (fileSize !== undefined) book.fileSize = fileSize;
    book.lastUpdated = new Date();
    await book.save();

    // Persist pages to disk
    try {
      const storageRoot = getStorageRoot();
      const userFolder = objectId ? String(objectId) : (emailId ? emailId.replace(/[@.]/g, '_') : 'default');
      const folder = Array.isArray(book.folderName) ? book.folderName[0] : (book.folderName || 'My_Flipbooks');
      const pagesDir = path.join(storageRoot, 'flipbooks', userFolder, folder, book.flipbookName, 'pages');
      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
      }
      book.pages.forEach((sp) => {
        if (sp.content) {
          fs.writeFileSync(path.join(pagesDir, `${sp.pageNumber}.svg`), sp.content, 'utf8');
        }
      });
    } catch (fsErr) {
      console.warn('[Book Controller] Warning writing batch pages to disk:', fsErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Pages batch saved',
      v_id: book.v_id,
      pages: book.pages
    });
  } catch (err) {
    console.error('[Book Controller] Error saving pages batch:', err);
    res.status(500).json({ success: false, message: 'Server error saving pages batch' });
  }
};

/**
 * GET /api/flipbook/get
 * Fetch single flipbook by v_id or bookName
 */
exports.getBook = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, bookName, folderName } = req.query;

    const queryConditions = [];
    if (v_id) {
      queryConditions.push({ v_id });
    }
    if (bookName && bookName !== 'undefined') {
      queryConditions.push({ flipbookName: bookName });
    }

    if (queryConditions.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing book identifier (v_id or bookName)' });
    }

    let filter = queryConditions.length === 1 ? queryConditions[0] : { $or: queryConditions };
    if (userQuery) {
      filter = { ...filter, ...userQuery };
    }

    let book = await Flipbook.findOne(filter);
    if (!book && v_id) {
      // Public / shared fallback by v_id only
      book = await Flipbook.findOne({ v_id });
    }

    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    // Disk fallback if MongoDB pages lack content
    const storageRoot = getStorageRoot();
    const userFolder = book.userId ? String(book.userId) : (book.userEmail ? book.userEmail.replace(/[@.]/g, '_') : '');
    const folder = Array.isArray(book.folderName) ? book.folderName[0] : (book.folderName || 'My_Flipbooks');
    const pagesDir = (userFolder && folder && book.flipbookName)
      ? path.join(storageRoot, 'flipbooks', userFolder, folder, book.flipbookName, 'pages')
      : null;

    const populatedPages = (book.pages || []).map((p) => {
      const pageObj = p.toObject ? p.toObject() : { ...p };
      let pageContent = pageObj.content || pageObj.html || '';

      if (!pageContent && pagesDir) {
        const svgPath = path.join(pagesDir, `${pageObj.pageNumber}.svg`);
        if (fs.existsSync(svgPath)) {
          try {
            pageContent = fs.readFileSync(svgPath, 'utf8');
          } catch (e) {}
        }
      }

      return {
        ...pageObj,
        content: pageContent,
        html: pageContent
      };
    });

    const formattedMeta = formatBook(book);

    res.status(200).json({
      success: true,
      meta: formattedMeta,
      settings: formattedMeta.Customized_Settings || {},
      pages: populatedPages,
      share: formattedMeta.Customized_Settings?.share || { shareId: book.v_id, access: 'public' }
    });
  } catch (err) {
    console.error('[Book Controller] Error fetching single book:', err);
    res.status(500).json({ success: false, message: 'Server error fetching flipbook' });
  }
};

/**
 * POST /api/flipbook/update-settings
 * Update flipbook settings, share, and metadata
 */
exports.updateSettings = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, bookName, share, Customized_Settings, settings, width, height, orientation } = req.body;

    const query = {};
    if (v_id) query.v_id = v_id;
    else if (bookName) query.flipbookName = bookName;
    else {
      return res.status(400).json({ success: false, message: 'Missing v_id or bookName' });
    }

    if (userQuery) {
      Object.assign(query, userQuery);
    }

    const book = await Flipbook.findOne(query);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    const currentSettings = book.Customized_Settings || {};
    const newSettings = {
      ...currentSettings,
      ...(Customized_Settings || {}),
      ...(settings || {})
    };
    if (share) newSettings.share = share;
    if (width) newSettings.width = width;
    if (height) newSettings.height = height;
    if (orientation) newSettings.orientation = orientation;

    book.Customized_Settings = newSettings;
    book.lastUpdated = new Date();
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: book.Customized_Settings
    });
  } catch (err) {
    console.error('[Book Controller] Error updating settings:', err);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};

/**
 * GET /api/flipbook/preview/:v_id
 * Preview flipbook
 */
exports.previewBook = async (req, res) => {
  try {
    const v_id = req.params?.v_id;
    const book = await Flipbook.findOne({ v_id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }
    const firstPage = book.pages && book.pages.length > 0 ? book.pages[0] : null;
    let firstPageHtml = firstPage?.html || firstPage?.content || '';

    if (!firstPageHtml && firstPage) {
      const storageRoot = getStorageRoot();
      const userFolder = book.userId ? String(book.userId) : (book.userEmail ? book.userEmail.replace(/[@.]/g, '_') : '');
      const folder = Array.isArray(book.folderName) ? book.folderName[0] : (book.folderName || 'My_Flipbooks');
      if (userFolder && folder && book.flipbookName) {
        const svgPath = path.join(storageRoot, 'flipbooks', userFolder, folder, book.flipbookName, 'pages', `${firstPage.pageNumber}.svg`);
        if (fs.existsSync(svgPath)) {
          try {
            firstPageHtml = fs.readFileSync(svgPath, 'utf8');
          } catch (e) {}
        }
      }
    }

    res.status(200).json({
      success: true,
      book: formatBook(book),
      pages: book.pages || [],
      html: firstPageHtml
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching preview' });
  }
};

/**
 * GET /api/flipbook/get-gallery-assets
 * Retrieve gallery assets
 */
exports.getGalleryAssets = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      assets: []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching gallery assets' });
  }
};
