const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Flipbook = require('../models/Flipbook');
const { deleteBookStorage, getStorageRoot, initFlipbookStorage } = require('../utils/storageHelper');
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

    // Sort by createdAt ascending to determine original vs subsequent duplicate books
    const rawBooks = await Flipbook.find(userQuery).sort({ createdAt: 1 });

    // Auto-heal duplicate flipbook names for this user
    const seenNames = new Map();
    for (const b of rawBooks) {
      const currentName = (b.flipbookName || 'Flipbook').trim();
      const lower = currentName.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.set(lower, 1);
      } else {
        let counter = seenNames.get(lower);
        let newName = `${currentName} (${counter})`;
        while (seenNames.has(newName.toLowerCase())) {
          counter++;
          newName = `${currentName} (${counter})`;
        }
        seenNames.set(lower, counter + 1);
        seenNames.set(newName.toLowerCase(), 1);

        console.log(`[Book Controller] Auto-healing duplicate flipbook name: "${b.flipbookName}" -> "${newName}" for v_id ${b.v_id}`);
        b.flipbookName = newName;
        await Flipbook.updateOne({ _id: b._id }, { $set: { flipbookName: newName } });
      }
    }

    // Sort newest updated/created first for display
    rawBooks.sort((a, b) => new Date(b.updatedAt || b.lastUpdated || b.createdAt) - new Date(a.updatedAt || a.lastUpdated || a.createdAt));
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
      deleteBookStorage(rawId || customUserId, emailId, folder || 'My_Flipbooks', b.flipbookName, b);
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

    let book = await Flipbook.findOne(query);
    if (!book && v_id) {
      book = await Flipbook.findOne({ v_id });
      if (book && emailId && book.userEmail && book.userEmail.toLowerCase() !== emailId.toLowerCase()) {
        book = null;
      }
    }
    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    const folder = Array.isArray(book.folderName) ? book.folderName[0] : book.folderName;
    deleteBookStorage(rawId || customUserId, emailId, folder || 'My_Flipbooks', book.flipbookName, book);

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
    }

    let finalFlipbookName = safeName;
    if (!book) {
      // New book creation: strictly guarantee unique flipbookName to avoid collisions
      const existingBooks = await Flipbook.find(userQuery).select('flipbookName').lean();
      const existingNames = new Set(existingBooks.map(eb => (eb.flipbookName || '').trim().toLowerCase()));
      if (existingNames.has(finalFlipbookName.toLowerCase())) {
        let counter = 1;
        let testName = `${finalFlipbookName} (${counter})`;
        while (existingNames.has(testName.toLowerCase())) {
          counter++;
          testName = `${finalFlipbookName} (${counter})`;
        }
        finalFlipbookName = testName;
      }
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

      const pageName = p.name || p.pageName || existingPage?.name || `Page ${pageNum}`;
      const cleanPageName = String(pageName || '').replace(/[\\/:*?"<>|]/g, '').trim();
      const pageFileName = p.fileName || (cleanPageName ? (cleanPageName.endsWith('.svg') ? cleanPageName : `${cleanPageName}.svg`) : `${pageNum}.svg`);

      return {
        pageNumber: pageNum,
        name: pageName,
        fileName: pageFileName,
        v_id: pageVId,
        size: p.size || (pageContent ? Buffer.byteLength(pageContent, 'utf8') : existingPage?.size || 0),
        hide: p.hide !== undefined ? p.hide : (existingPage?.hide || 0),
        content: pageContent,
        html: pageContent
      };
    }) : [];

    const mongoPages = safePages.map((p) => ({
      pageNumber: p.pageNumber,
      name: p.name,
      fileName: p.fileName,
      v_id: p.v_id,
      size: p.size,
      hide: p.hide
    }));

    if (book) {
      book.flipbookName = safeName;
      book.folderName = targetFolder;
      if (mongoPages.length > 0) book.pages = mongoPages;
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
        flipbookName: finalFlipbookName,
        folderName: targetFolder,
        pages: mongoPages,
        fileSize: fileSize || 0,
        Customized_Settings: meta || {},
        lastUpdated: new Date()
      });
    }

    // Persist full pages and complete workspace structure to local disk storage
    try {
      const storageRoot = getStorageRoot();
      const userFolder = book.userID || (objectId ? String(objectId) : (emailId ? emailId.replace(/[@.]/g, '_') : 'default'));
      const targetSubfolder = targetFolder[0] || 'My_Flipbooks';

      const wsBookDir = path.join(storageRoot, userFolder, 'My_Flipbooks', targetSubfolder, finalFlipbookName);
      initFlipbookStorage(wsBookDir);
      const pagesDir = path.join(wsBookDir, 'pages');
      safePages.forEach((sp) => {
        let svgContent = sp.content || sp.html || '';
        const targetFileName = sp.fileName || `${sp.pageNumber}.svg`;

        if (!svgContent || svgContent.trim() === '') {
          const targetFilePath = path.join(pagesDir, targetFileName);
          if (fs.existsSync(targetFilePath)) {
            try {
              const diskStr = fs.readFileSync(targetFilePath, 'utf8');
              if (diskStr && diskStr.trim()) {
                svgContent = diskStr;
              }
            } catch (e) {}
          }
        }

        if (!svgContent || svgContent.trim() === '') {
          const pageWidth = meta?.width || book.Customized_Settings?.width || 595;
          const pageHeight = meta?.height || book.Customized_Settings?.height || 842;
          const gId = `g_page_${sp.pageNumber}_${crypto.randomBytes(4).toString('hex')}`;
          const rectId = `rect_${sp.pageNumber}_${crypto.randomBytes(4).toString('hex')}`;
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${pageWidth} ${pageHeight}" width="100%" height="100%" style="overflow: visible"><defs></defs><g id="${gId}" data-name="${sp.name || `Page ${sp.pageNumber}`}" data-type="frame"><rect id="${rectId}" x="0" y="0" width="${pageWidth}" height="${pageHeight}" fill="#ffffff" data-name="Overlay" data-type="background" data-locked="true" shape-rendering="crispEdges"/></g></svg>`;
        } else if (svgContent.includes('<svg') && !svgContent.includes('data-name="Page ') && !svgContent.includes(`data-name="${sp.name}"`)) {
          // Ensure root Page frame folder exists for layers panel
          const gId = `g_page_${sp.pageNumber}_${crypto.randomBytes(4).toString('hex')}`;
          svgContent = svgContent.replace(/(<svg\b[^>]*>)/i, `$1\n<g id="${gId}" data-name="${sp.name || `Page ${sp.pageNumber}`}" data-type="frame">`).replace(/<\/svg>/i, '</g>\n</svg>');
        }
        fs.writeFileSync(path.join(pagesDir, targetFileName), svgContent, 'utf8');

        // Clean up older mismatched filenames for this page
        const candidateOldNames = [`${sp.pageNumber}.svg`, `Page ${sp.pageNumber}.svg`];
        candidateOldNames.forEach(oldName => {
          if (oldName !== targetFileName) {
            try {
              const oldFp = path.join(pagesDir, oldName);
              if (fs.existsSync(oldFp)) fs.unlinkSync(oldFp);
            } catch (e) {}
          }
        });
      });

      // Clean up physical files for any pages that were deleted
      try {
        if (fs.existsSync(pagesDir)) {
          const activeFileNames = new Set(safePages.map(sp => sp.fileName).filter(Boolean));
          safePages.forEach(sp => {
            if (sp.pageNumber) activeFileNames.add(`${sp.pageNumber}.svg`);
            if (sp.name) {
              const clean = String(sp.name).replace(/[\\/:*?"<>|]/g, '').trim();
              if (clean) activeFileNames.add(`${clean}.svg`);
            }
          });
          const diskFiles = fs.readdirSync(pagesDir);
          diskFiles.forEach(df => {
            if ((df.endsWith('.svg') || df.endsWith('.html')) && !activeFileNames.has(df)) {
              try {
                fs.unlinkSync(path.join(pagesDir, df));
                console.log(`[Book Controller] Cleaned up deleted page file from disk: ${df}`);
              } catch (e) {}
            }
          });
        }
      } catch (cleanErr) {}

      // Clean up any stray Page *.html files from root book folder
      try {
        if (fs.existsSync(wsBookDir)) {
          const rootFiles = fs.readdirSync(wsBookDir);
          rootFiles.forEach((rf) => {
            if (/^Page\s*\d+\.html$/i.test(rf) || (rf.endsWith('.html') && !rf.includes('index'))) {
              try { fs.unlinkSync(path.join(wsBookDir, rf)); } catch (e) {}
            }
          });
        }
      } catch (cleanErr) {}
    } catch (fsErr) {
      console.warn('[Book Controller] Warning writing pages to disk:', fsErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Flipbook saved successfully',
      v_id: resolvedVId,
      book: formatBook(book),
      pages: safePages
    });
  } catch (err) {
    console.error('[Book Controller] Error saving book:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error saving book' });
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

    const fullBatchPages = [];
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

      const pageName = p.name || p.pageName || existingPage?.name || `Page ${pageNum}`;
      const cleanPageName = String(pageName || '').replace(/[\\/:*?"<>|]/g, '').trim();
      const pageFileName = p.fileName || (cleanPageName ? (cleanPageName.endsWith('.svg') ? cleanPageName : `${cleanPageName}.svg`) : `${pageNum}.svg`);

      const fullPage = {
        pageNumber: pageNum,
        name: pageName,
        fileName: pageFileName,
        v_id: pageVId,
        size: p.size || (pageContent ? Buffer.byteLength(pageContent, 'utf8') : existingPage?.size || 0),
        hide: p.hide !== undefined ? p.hide : (existingPage?.hide || 0),
        content: pageContent,
        html: pageContent
      };
      fullBatchPages.push(fullPage);
      newPagesMap.set(pageNum, fullPage);
    });

    const allSortedPages = Array.from(newPagesMap.values()).sort((a, b) => a.pageNumber - b.pageNumber);

    book.pages = allSortedPages.map(p => ({
      pageNumber: p.pageNumber,
      name: p.name,
      fileName: p.fileName,
      v_id: p.v_id,
      size: p.size,
      hide: p.hide
    }));

    if (fileSize !== undefined) book.fileSize = fileSize;
    book.lastUpdated = new Date();
    await book.save();

    // Persist pages and workspace structure to disk
    try {
      const storageRoot = getStorageRoot();
      const folder = Array.isArray(book.folderName) ? book.folderName[0] : (book.folderName || 'My_Flipbooks');
      const userFolder = book.userID || (objectId ? String(objectId) : (emailId ? emailId.replace(/[@.]/g, '_') : 'default'));

      const wsBookDir = path.join(storageRoot, userFolder, 'My_Flipbooks', folder, book.flipbookName);
      initFlipbookStorage(wsBookDir);
      const pagesDir = path.join(wsBookDir, 'pages');
      fullBatchPages.forEach((sp) => {
        let svgContent = sp.content || sp.html || '';
        const targetFileName = sp.fileName || `${sp.pageNumber}.svg`;

        if (svgContent) {
          if (svgContent.includes('<svg') && !svgContent.includes('data-name="Page ') && !svgContent.includes(`data-name="${sp.name}"`)) {
            const gId = `g_page_${sp.pageNumber}_${crypto.randomBytes(4).toString('hex')}`;
            svgContent = svgContent.replace(/(<svg\b[^>]*>)/i, `$1\n<g id="${gId}" data-name="${sp.name || `Page ${sp.pageNumber}`}" data-type="frame">`).replace(/<\/svg>/i, '</g>\n</svg>');
          }
          fs.writeFileSync(path.join(pagesDir, targetFileName), svgContent, 'utf8');

          // Clean up older mismatched filenames for this page
          const candidateOldNames = [`${sp.pageNumber}.svg`, `Page ${sp.pageNumber}.svg`];
          candidateOldNames.forEach(oldName => {
            if (oldName !== targetFileName) {
              try {
                const oldFp = path.join(pagesDir, oldName);
                if (fs.existsSync(oldFp)) fs.unlinkSync(oldFp);
              } catch (e) {}
            }
          });
        }
      });

      // Clean up physical files for any pages that were deleted
      try {
        if (fs.existsSync(pagesDir)) {
          const activeFileNames = new Set(allSortedPages.map(p => p.fileName).filter(Boolean));
          allSortedPages.forEach(p => {
            if (p.pageNumber) activeFileNames.add(`${p.pageNumber}.svg`);
            if (p.name) {
              const clean = String(p.name).replace(/[\\/:*?"<>|]/g, '').trim();
              if (clean) activeFileNames.add(`${clean}.svg`);
            }
          });
          const diskFiles = fs.readdirSync(pagesDir);
          diskFiles.forEach(df => {
            if ((df.endsWith('.svg') || df.endsWith('.html')) && !activeFileNames.has(df)) {
              try {
                fs.unlinkSync(path.join(pagesDir, df));
                console.log(`[Book Controller] Cleaned up deleted page file from disk: ${df}`);
              } catch (e) {}
            }
          });
        }
      } catch (cleanErr) {}
      // Clean up any stray Page *.html files
      try {
        if (fs.existsSync(wsBookDir)) {
          const rootFiles = fs.readdirSync(wsBookDir);
          rootFiles.forEach((rf) => {
            if (/^Page\s*\d+\.html$/i.test(rf) || (rf.endsWith('.html') && !rf.includes('index'))) {
              try { fs.unlinkSync(path.join(wsBookDir, rf)); } catch (e) {}
            }
          });
        }
      } catch (cleanErr) {}
    } catch (fsErr) {
      console.warn('[Book Controller] Warning writing batch pages to disk:', fsErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Pages batch saved',
      v_id: book.v_id,
      pages: allSortedPages
    });
  } catch (err) {
    console.error('[Book Controller] Error saving pages batch:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error saving pages batch' });
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

    let filter;
    if (v_id) {
      filter = { v_id };
      if (userQuery) filter = { ...filter, ...userQuery };
    } else if (bookName && bookName !== 'undefined') {
      filter = { flipbookName: bookName };
      if (userQuery) filter = { ...filter, ...userQuery };
    } else {
      return res.status(400).json({ success: false, message: 'Missing book identifier (v_id or bookName)' });
    }

    let book = await Flipbook.findOne(filter);
    if (!book && v_id) {
      // Public / shared fallback by v_id only
      book = await Flipbook.findOne({ v_id });
    }

    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    // Disk storage root
    const storageRoot = getStorageRoot();
    const userFolders = [
      book.userID,
      book.userId ? String(book.userId) : null,
      book.userEmail ? book.userEmail.replace(/[@.]/g, '_') : null
    ].filter(Boolean);
    const folders = [
      Array.isArray(book.folderName) ? book.folderName[0] : book.folderName,
      'My_Flipbooks'
    ].filter(Boolean);

    // Build all possible candidate directories on disk
    const candidateDirs = [];
    for (const uf of userFolders) {
      for (const f of folders) {
        candidateDirs.push(
          path.join(storageRoot, uf, 'My_Flipbooks', f, book.flipbookName),
          path.join(storageRoot, uf, 'My_Flipbooks', f, book.v_id),
          path.join(storageRoot, uf, 'My_Flipbooks', f, `${book.flipbookName}_${book.v_id}`),
          path.join(storageRoot, uf, f, book.flipbookName),
          path.join(storageRoot, uf, f, book.v_id),
          path.join(storageRoot, 'flipbooks', uf, f, book.flipbookName),
          path.join(storageRoot, 'flipbooks', uf, f, book.v_id)
        );
      }
    }

    const populatedPages = (book.pages || []).map((p) => {
      const pageObj = p.toObject ? p.toObject() : { ...p };
      let pageContent = '';

      // 1. MUST load page data directly from local storage file on disk first
      for (const candDir of candidateDirs) {
        const candidateFiles = [
          pageObj.fileName ? path.join(candDir, 'pages', pageObj.fileName) : null,
          pageObj.name ? path.join(candDir, 'pages', `${pageObj.name}.svg`) : null,
          path.join(candDir, 'pages', `${pageObj.pageNumber}.svg`),
          path.join(candDir, 'pages', `Page ${pageObj.pageNumber}.svg`),
          path.join(candDir, `Page ${pageObj.pageNumber}.html`)
        ].filter(Boolean);

        for (const fPath of candidateFiles) {
          if (fs.existsSync(fPath)) {
            try {
              const str = fs.readFileSync(fPath, 'utf8');
              if (str && str.trim()) {
                pageContent = str;
                break;
              }
            } catch (e) {}
          }
        }
        if (pageContent) break;
      }

      // 2. Fallback to MongoDB only if local storage file does not exist
      if (!pageContent) {
        pageContent = pageObj.content || pageObj.html || '';
      }

      const cleanName = String(pageObj.name || '').replace(/[\\/:*?"<>|]/g, '').trim();
      const resolvedFileName = pageObj.fileName || (cleanName ? (cleanName.endsWith('.svg') ? cleanName : `${cleanName}.svg`) : `${pageObj.pageNumber}.svg`);

      return {
        ...pageObj,
        fileName: resolvedFileName,
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
      const userFolder = book.userID || (book.userId ? String(book.userId) : (book.userEmail ? book.userEmail.replace(/[@.]/g, '_') : ''));
      const folder = Array.isArray(book.folderName) ? book.folderName[0] : (book.folderName || 'My_Flipbooks');
      if (userFolder && folder) {
        const candidateFiles = [
          path.join(storageRoot, userFolder, 'My_Flipbooks', folder, book.v_id, `Page ${firstPage.pageNumber}.html`),
          path.join(storageRoot, userFolder, 'My_Flipbooks', folder, book.v_id, 'pages', `${firstPage.pageNumber}.svg`),
          path.join(storageRoot, userFolder, 'My_Flipbooks', folder, `${book.flipbookName}_${book.v_id}`, `Page ${firstPage.pageNumber}.html`),
          path.join(storageRoot, userFolder, 'My_Flipbooks', folder, book.flipbookName, `Page ${firstPage.pageNumber}.html`),
          path.join(storageRoot, userFolder, 'My_Flipbooks', folder, book.flipbookName, 'pages', `${firstPage.pageNumber}.svg`),
          path.join(storageRoot, 'flipbooks', userFolder, folder, book.flipbookName, 'pages', `${firstPage.pageNumber}.svg`)
        ];
        for (const filePath of candidateFiles) {
          if (fs.existsSync(filePath)) {
            try {
              firstPageHtml = fs.readFileSync(filePath, 'utf8');
              break;
            } catch (e) {}
          }
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

/**
 * Rename a page and rename its corresponding physical file on disk
 * @route POST /api/flipbook/rename-page
 */
exports.renamePage = async (req, res) => {
  try {
    const { emailId: authEmail, objectId, customUserId } = getAuthUser(req);
    const { v_id, pageId, pageNumber, oldPageName, newPageName, emailId: reqEmail } = req.body;
    const emailId = authEmail || reqEmail;

    if (!v_id || !newPageName || !newPageName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'v_id and newPageName are required'
      });
    }

    const trimmedNewName = newPageName.trim();
    const book = await Flipbook.findOne({ v_id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    if (emailId && book.userEmail && book.userEmail.toLowerCase() !== emailId.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this flipbook' });
    }

    book.pages = book.pages || [];
    let pageIndex = -1;
    if (pageId) {
      pageIndex = book.pages.findIndex((p) => p.v_id === pageId || p.id === pageId);
    }
    if (pageIndex === -1 && pageNumber !== undefined) {
      pageIndex = book.pages.findIndex((p) => p.pageNumber === Number(pageNumber));
    }
    if (pageIndex === -1 && oldPageName) {
      pageIndex = book.pages.findIndex((p) => p.name === oldPageName);
    }

    if (pageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Page not found in flipbook' });
    }

    const page = book.pages[pageIndex];
    const prevName = page.name;
    const prevFileName = page.fileName;

    const storageRoot = getStorageRoot();
    const userFolders = [
      book.userID,
      book.userId ? String(book.userId) : null,
      customUserId,
      objectId ? String(objectId) : null,
      emailId ? emailId.replace(/[@.]/g, '_') : null,
      book.userEmail ? book.userEmail.replace(/[@.]/g, '_') : null
    ].filter(Boolean);

    const folder = Array.isArray(book.folderName) ? book.folderName[0] : (book.folderName || 'My_Flipbooks');

    // Find real existing bookDir on disk
    let wsBookDir = path.join(storageRoot, userFolders[0] || 'default', 'My_Flipbooks', folder, book.flipbookName);
    for (const uf of userFolders) {
      const candidates = [
        path.join(storageRoot, uf, 'My_Flipbooks', folder, book.flipbookName),
        path.join(storageRoot, uf, 'My_Flipbooks', 'My_Flipbooks', book.flipbookName),
        path.join(storageRoot, uf, folder, book.flipbookName)
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          wsBookDir = cand;
          break;
        }
      }
    }

    initFlipbookStorage(wsBookDir);
    const pagesDir = path.join(wsBookDir, 'pages');

    const cleanNewName = trimmedNewName.replace(/[\\/:*?"<>|]/g, '').trim();
    const newFileName = cleanNewName.endsWith('.svg') ? cleanNewName : `${cleanNewName}.svg`;
    const newFilePath = path.join(pagesDir, newFileName);

    const oldCandidateNames = [
      prevFileName,
      `${prevName}.svg`,
      oldPageName ? `${oldPageName}.svg` : null,
      `${page.pageNumber}.svg`,
      `Page ${page.pageNumber}.svg`
    ].filter(Boolean);

    let foundOldFilePath = null;
    for (const oldName of oldCandidateNames) {
      const p = path.join(pagesDir, oldName);
      if (fs.existsSync(p)) {
        foundOldFilePath = p;
        break;
      }
    }

    let pageSvgContent = page.html || page.content || '';

    if (foundOldFilePath) {
      try {
        const diskContent = fs.readFileSync(foundOldFilePath, 'utf8');
        if (diskContent && diskContent.trim()) {
          pageSvgContent = diskContent;
        }
      } catch (readErr) {}

      if (path.resolve(foundOldFilePath) !== path.resolve(newFilePath)) {
        try {
          fs.renameSync(foundOldFilePath, newFilePath);
        } catch (renameErr) {
          try {
            fs.copyFileSync(foundOldFilePath, newFilePath);
            fs.unlinkSync(foundOldFilePath);
          } catch (copyErr) {
            console.error('[Book Controller] Fallback copy/unlink error:', copyErr.message);
          }
        }
      }
    } else {
      if (!pageSvgContent || !pageSvgContent.trim()) {
        const pageWidth = book.Customized_Settings?.width || 595;
        const pageHeight = book.Customized_Settings?.height || 842;
        const gId = `g_page_${page.pageNumber}_${crypto.randomBytes(4).toString('hex')}`;
        const rectId = `rect_${page.pageNumber}_${crypto.randomBytes(4).toString('hex')}`;
        pageSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${pageWidth} ${pageHeight}" width="100%" height="100%" style="overflow: visible"><defs></defs><g id="${gId}" data-name="${trimmedNewName}" data-type="frame"><rect id="${rectId}" x="0" y="0" width="${pageWidth}" height="${pageHeight}" fill="#ffffff" data-name="Overlay" data-type="background" data-locked="true" shape-rendering="crispEdges"/></g></svg>`;
      }
      fs.writeFileSync(newFilePath, pageSvgContent, 'utf8');
    }

    if (fs.existsSync(newFilePath)) {
      try {
        let svgStr = fs.readFileSync(newFilePath, 'utf8');
        if (svgStr.includes('data-name="')) {
          svgStr = svgStr.replace(/(<g\b[^>]*\bdata-type="frame"[^>]*\bdata-name=")[^"]*(")/i, `$1${trimmedNewName}$2`);
          svgStr = svgStr.replace(/(<g\b[^>]*\bdata-name=")[^"]*("[^>]*\bdata-type="frame")/i, `$1${trimmedNewName}$2`);
          fs.writeFileSync(newFilePath, svgStr, 'utf8');
          pageSvgContent = svgStr;
        }
      } catch (xmlErr) {}
    }

    book.pages[pageIndex].name = trimmedNewName;
    book.pages[pageIndex].fileName = newFileName;
    book.lastUpdated = new Date();
    book.markModified('pages');
    await book.save();

    return res.status(200).json({
      success: true,
      message: 'Page renamed successfully and physical file updated',
      pageNumber: page.pageNumber,
      name: trimmedNewName,
      fileName: newFileName
    });
  } catch (error) {
    console.error('[Book Controller] Error renaming page:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error renaming page',
      error: error.message
    });
  }
};

/**
 * Delete a specific page from flipbook and remove its physical file from disk
 * @route POST /api/flipbook/delete-page
 */
exports.deletePage = async (req, res) => {
  try {
    const { emailId: authEmail, objectId, customUserId } = getAuthUser(req);
    const { v_id, pageId, pageNumber, fileName, oldPageName, emailId: reqEmail } = req.body;
    const emailId = authEmail || reqEmail;

    if (!v_id) {
      return res.status(400).json({
        success: false,
        message: 'v_id is required'
      });
    }

    const book = await Flipbook.findOne({ v_id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    if (emailId && book.userEmail && book.userEmail.toLowerCase() !== emailId.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this flipbook' });
    }

    book.pages = book.pages || [];
    if (book.pages.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'A flipbook must have at least one page. Cannot delete the only remaining page.'
      });
    }

    let pageIndex = -1;
    if (pageId) {
      pageIndex = book.pages.findIndex((p) => p.v_id === pageId || p.id === pageId);
    }
    if (pageIndex === -1 && pageNumber !== undefined) {
      pageIndex = book.pages.findIndex((p) => p.pageNumber === Number(pageNumber));
    }
    if (pageIndex === -1 && fileName) {
      pageIndex = book.pages.findIndex((p) => p.fileName === fileName);
    }
    if (pageIndex === -1 && oldPageName) {
      pageIndex = book.pages.findIndex((p) => p.name === oldPageName);
    }

    if (pageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Page not found in flipbook' });
    }

    const pageToDelete = book.pages[pageIndex];

    const storageRoot = getStorageRoot();
    const userFolders = [
      book.userID,
      book.userId ? String(book.userId) : null,
      customUserId,
      objectId ? String(objectId) : null,
      emailId ? emailId.replace(/[@.]/g, '_') : null,
      book.userEmail ? book.userEmail.replace(/[@.]/g, '_') : null
    ].filter(Boolean);

    const folder = Array.isArray(book.folderName) ? book.folderName[0] : (book.folderName || 'My_Flipbooks');

    // Find real existing bookDir on disk
    const dirVariants = [
      book.flipbookName,
      book.v_id ? `${book.flipbookName}_${book.v_id}` : null,
      book.v_id
    ].filter(Boolean);

    let wsBookDir = path.join(storageRoot, userFolders[0] || 'default', 'My_Flipbooks', folder, book.flipbookName);
    let foundDir = false;

    for (const uf of userFolders) {
      if (foundDir) break;
      for (const variant of dirVariants) {
        const candidates = [
          path.join(storageRoot, uf, 'My_Flipbooks', folder, variant),
          path.join(storageRoot, uf, 'My_Flipbooks', 'My_Flipbooks', variant),
          path.join(storageRoot, uf, folder, variant),
          path.join(storageRoot, uf, variant)
        ];
        for (const cand of candidates) {
          if (fs.existsSync(cand)) {
            wsBookDir = cand;
            foundDir = true;
            break;
          }
        }
        if (foundDir) break;

        const myFlipbooksDir = path.join(storageRoot, uf, 'My_Flipbooks');
        if (fs.existsSync(myFlipbooksDir)) {
          try {
            const subdirs = fs.readdirSync(myFlipbooksDir);
            for (const sd of subdirs) {
              const nestedCand = path.join(myFlipbooksDir, sd, variant);
              if (fs.existsSync(nestedCand)) {
                wsBookDir = nestedCand;
                foundDir = true;
                break;
              }
            }
          } catch (e) {}
        }
        if (foundDir) break;
      }
    }

    const pagesDir = path.join(wsBookDir, 'pages');

    const filesToRemove = [
      pageToDelete.fileName,
      fileName,
      `${pageToDelete.name}.svg`,
      oldPageName ? `${oldPageName}.svg` : null,
      `${pageToDelete.pageNumber}.svg`,
      `Page ${pageToDelete.pageNumber}.svg`,
      `${pageToDelete.name}.html`,
      `Page ${pageToDelete.pageNumber}.html`
    ].filter(Boolean);

    if (fs.existsSync(pagesDir)) {
      filesToRemove.forEach(f => {
        try {
          const filePath = path.join(pagesDir, f);
          if (fs.existsSync(filePath)) {
            console.log(`[Book Controller] Deleting page file from disk: ${filePath}`);
            fs.unlinkSync(filePath);
          }
        } catch (unlinkErr) {
          console.warn('[Book Controller] Could not delete page file:', f, unlinkErr.message);
        }
      });
    }

    // Remove page from MongoDB pages array
    book.pages.splice(pageIndex, 1);

    // Renumber remaining pages
    book.pages.forEach((p, idx) => {
      p.pageNumber = idx + 1;
    });

    book.fileSize = book.pages.reduce((sum, p) => sum + (p.size || 0), 0);
    book.lastUpdated = new Date();
    book.markModified('pages');
    await book.save();

    return res.status(200).json({
      success: true,
      message: 'Page deleted and physical file removed from disk',
      totalPages: book.pages.length,
      pages: book.pages
    });
  } catch (error) {
    console.error('[Book Controller] Error deleting page:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting page',
      error: error.message
    });
  }
};
