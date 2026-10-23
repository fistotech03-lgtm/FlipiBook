const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Flipbook = require("../models/Flipbook");
const FlipbookAsset = require("../models/FlipbookAsset");
const UserGallery = require("../models/UserGallery");
const InteractionThreedModel = require("../models/InteractionThreedModel");
const {
  deleteBookStorage,
  getStorageRoot,
  initFlipbookStorage,
} = require("../utils/storageHelper");
const { getAuthUser, getFlipbookUserQuery } = require("../utils/userHelper");
const {
  processAndSaveBase64Assets,
  normalizeToRelativeAssetPaths,
} = require("../utils/base64Helper");

// In-memory cache for chunked uploads with 30-minute TTL eviction to prevent memory leaks
const CHUNK_TTL_MS = 30 * 60 * 1000;
const chunkUploads = new Map();

setInterval(
  () => {
    const now = Date.now();
    for (const [id, session] of chunkUploads.entries()) {
      if (session.timestamp && now - session.timestamp > CHUNK_TTL_MS) {
        chunkUploads.delete(id);
      }
    }
  },
  10 * 60 * 1000,
).unref();

const VIRTUAL_FOLDERS = new Set([
  "recent book",
  "recent",
  "all books",
  "all flipbooks",
  "favorites",
  "trash",
]);

const resolveFolder = (folderName) => {
  if (Array.isArray(folderName)) {
    const flat = folderName.flat(Infinity);
    const realFolders = flat.filter(
      (f) => f && typeof f === "string" && !VIRTUAL_FOLDERS.has(String(f).trim().toLowerCase()),
    );
    if (realFolders.length > 0) {
      const first = String(realFolders[0]).trim();
      const lower = first.toLowerCase();
      if (lower === "my flipbooks" || lower === "default") {
        return "default";
      }
      return first;
    }
    return "default";
  }
  if (typeof folderName === "string" && folderName.trim()) {
    const clean = folderName.trim();
    const lower = clean.toLowerCase();
    if (VIRTUAL_FOLDERS.has(lower)) return "default";
    if (lower === "my flipbooks" || lower === "default") {
      return "default";
    }
    return clean;
  }
  return "default";
};

/**
 * Helper to enforce maximum 10 recent books per user (FIFO)
 */
const enforceRecentLimit = async (userQuery) => {
  try {
    if (!userQuery) return;
    const recentBooks = await Flipbook.find({
      ...userQuery,
      trash: { $ne: true },
      folderName: { $in: ["Recent Book", "Recent", "Recent book"] },
    }).sort({ lastUpdated: -1, updatedAt: -1, createdAt: -1 });

    if (recentBooks.length > 10) {
      const toRemove = recentBooks.slice(10);
      await Flipbook.updateMany(
        { _id: { $in: toRemove.map((b) => b._id) } },
        {
          $pull: {
            folderName: { $in: ["Recent Book", "Recent", "Recent book"] },
          },
        },
      );
    }
  } catch (err) {
    console.warn("[Book Controller] Error enforcing Recent Book limit:", err);
  }
};

/**
 * Format book document to match frontend contract expected by MyFlipbooks.jsx
 */
const formatBook = (doc, settingsDoc = null) => {
  const primaryFolder = resolveFolder(doc.folderName);
  const displayFolder = primaryFolder === "default" ? "My Flipbooks" : primaryFolder;
  const mtime = doc.lastUpdated || doc.updatedAt || doc.createdAt;
  const s = settingsDoc || doc.Customized_Settings || {};

  return {
    id: doc._id.toString(),
    _id: doc._id.toString(),
    userId: doc.userId ? doc.userId.toString() : null,
    userID: doc.userID || (doc.userId ? doc.userId.toString() : null),
    v_id: doc.v_id,
    title: doc.flipbookName,
    realName: doc.flipbookName,
    flipbookName: doc.flipbookName,
    folder: displayFolder,
    folderName: displayFolder,
    actualFolder: displayFolder,
    originalFolder: displayFolder,
    pages: Array.isArray(doc.pages)
      ? doc.pages.length
      : typeof doc.pages === "number"
        ? doc.pages
        : 0,
    pagesCount: Array.isArray(doc.pages)
      ? doc.pages.length
      : typeof doc.pages === "number"
        ? doc.pages
        : 0,
    pagesList: Array.isArray(doc.pages) ? doc.pages : [],
    fileSize: doc.fileSize || 0,
    trash: Boolean(doc.trash),
    trashedAt: doc.trashedAt,
    isFavorite: Boolean(doc.isFavorite),
    isPublished: Boolean(doc.isPublished),
    createdAt: doc.createdAt,
    lastUpdated: mtime,
    updatedAt: doc.updatedAt || mtime,
    mtime: mtime,
    allFolders: Array.isArray(doc.folderName) ? doc.folderName : [doc.folderName],
    width: s?.FlipbookInfo?.width || s?.width || null,
    height: s?.FlipbookInfo?.height || s?.height || null,
    orientation: s?.FlipbookInfo?.orientation || s?.orientation || null,
    templateId: s?.FlipbookInfo?.templateId || s?.templateId || null,
    Customized_Settings: s || {},
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
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    // Sort by createdAt ascending to determine original vs subsequent duplicate books (using .lean() for performance)
    const rawBooks = await Flipbook.find(userQuery)
      .sort({ createdAt: 1 })
      .lean();

    // Auto-heal duplicate flipbook names for this user
    const seenNames = new Map();
    for (const b of rawBooks) {
      const currentName = (b.flipbookName || "Flipbook").trim();
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

        console.log(
          `[Book Controller] Auto-healing duplicate flipbook name: "${b.flipbookName}" -> "${newName}" for v_id ${b.v_id}`,
        );
        b.flipbookName = newName;
        await Flipbook.updateOne(
          { _id: b._id },
          { $set: { flipbookName: newName } },
        );
      }
    }

    // Sort newest updated/created first for display
    rawBooks.sort(
      (a, b) =>
        new Date(b.updatedAt || b.lastUpdated || b.createdAt) -
        new Date(a.updatedAt || a.lastUpdated || a.createdAt),
    );
    // Fetch customizedsettings for all books in one batch
    const vIds = rawBooks.map((b) => b.v_id).filter(Boolean);
    const settingsMap = new Map();
    try {
      if (mongoose.connection && mongoose.connection.db && vIds.length > 0) {
        const settingsDocs = await mongoose.connection.db
          .collection("customizedsettings")
          .find({ v_id: { $in: vIds } })
          .toArray();
        for (const s of settingsDocs) {
          settingsMap.set(s.v_id, s);
        }
      }
    } catch (e) {
      console.warn("[Book Controller] Failed to fetch customizedsettings in getBooks:", e.message);
    }

    const physicalBooks = rawBooks.map((b) => formatBook(b, settingsMap.get(b.v_id) || {}));

    const hasRecentTag = (doc) => {
      if (doc.trash) return false;
      if (Array.isArray(doc.folderName)) {
        return doc.folderName.some((f) => {
          const s = String(f).trim().toLowerCase();
          return s === "recent book" || s === "recent";
        });
      }
      if (typeof doc.folderName === "string") {
        const s = doc.folderName.trim().toLowerCase();
        return s === "recent book" || s === "recent";
      }
      return false;
    };

    const recentDocs = rawBooks.filter(hasRecentTag);

    recentDocs.sort(
      (a, b) =>
        new Date(b.lastUpdated || b.updatedAt || b.createdAt) -
        new Date(a.lastUpdated || a.updatedAt || a.createdAt),
    );

    const recentBooks = recentDocs.map((doc) => {
      const base = formatBook(doc, settingsMap.get(doc.v_id) || {});
      return {
        ...base,
        id: `Recent_${doc.v_id || doc._id.toString()}`,
        folder: "Recent Book",
        folderName: "Recent Book",
        actualFolder: base.folder,
        originalFolder: base.folder,
        isRecent: true,
        mtime: doc.lastUpdated || doc.updatedAt || doc.createdAt,
      };
    });

    const allBooks = [...physicalBooks, ...recentBooks];

    res.status(200).json({
      success: true,
      books: allBooks,
    });
  } catch (err) {
    console.error("[Book Controller] Error fetching books:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching books" });
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
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const query = { ...userQuery };
    if (v_id) {
      query.v_id = v_id;
    } else if (bookName) {
      query.flipbookName = bookName;
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing book identifier (v_id or bookName)",
        });
    }

    const updated = await Flipbook.findOneAndUpdate(
      query,
      { $set: { isFavorite: Boolean(isFavorite) } },
      { returnDocument: "after" },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    res.status(200).json({
      success: true,
      message: "Favorite status updated",
      isFavorite: updated.isFavorite,
      book: formatBook(updated),
    });
  } catch (err) {
    console.error("[Book Controller] Error toggling favorite:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error toggling favorite" });
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
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const cleanVId = v_id ? String(v_id).replace(/^Recent_/, "") : null;
    const query = { ...userQuery };
    if (cleanVId) {
      query.v_id = cleanVId;
    } else {
      query.flipbookName = bookName;
      if (
        folderName &&
        folderName !== "Trash" &&
        folderName !== "Recent Book" &&
        folderName !== "Recent"
      ) {
        query.folderName = folderName;
      }
    }

    const updated = await Flipbook.findOneAndUpdate(
      query,
      {
        $set: {
          trash: true,
          trashedAt: new Date(),
          isPublished: false,
        },
        $pull: {
          folderName: { $in: ["Recent Book", "Recent", "Recent book"] },
        },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    res.status(200).json({
      success: true,
      message: "Moved to trash successfully",
      book: formatBook(updated),
    });
  } catch (err) {
    console.error("[Book Controller] Error moving book to trash:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error moving book to trash" });
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
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const cleanVId = v_id ? String(v_id).replace(/^Recent_/, "") : null;
    const query = { ...userQuery };
    if (cleanVId) {
      query.v_id = cleanVId;
    } else {
      query.flipbookName = bookName;
    }

    const updated = await Flipbook.findOneAndUpdate(
      query,
      {
        $set: { trash: false, trashedAt: null, lastUpdated: new Date() },
        $addToSet: { folderName: "Recent Book" },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    if (userQuery) enforceRecentLimit(userQuery).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Flipbook restored successfully",
      book: formatBook(updated),
    });
  } catch (err) {
    console.error("[Book Controller] Error restoring book:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error restoring book" });
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
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const trashedBooks = await Flipbook.find({ ...userQuery, trash: true });

    // Clean up local disk files for trashed books
    for (const b of trashedBooks) {
      const folder = resolveFolder(b.folderName);
      deleteBookStorage(
        rawId || customUserId,
        emailId,
        folder || "default",
        b.flipbookName,
        b,
      );
    }

    const trashedVIds = trashedBooks.map((b) => b.v_id).filter(Boolean);
    if (trashedVIds.length > 0) {
      try {
        await FlipbookAsset.deleteMany({ flipbook_v_id: { $in: trashedVIds } });
      } catch (e) {}
      try {
        if (mongoose.connection && mongoose.connection.db) {
          await mongoose.connection.db
            .collection("customizedsettings")
            .deleteMany({ v_id: { $in: trashedVIds } });
          await mongoose.connection.db
            .collection("leads")
            .deleteMany({ v_id: { $in: trashedVIds } });
        }
      } catch (e) {
        console.warn(
          "[Book Controller] Failed to remove customizedsettings on empty trash:",
          e.message
        );
      }
    }

    const deleteResult = await Flipbook.deleteMany({
      ...userQuery,
      trash: true,
    });

    res.status(200).json({
      success: true,
      message: "Trash emptied successfully",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (err) {
    console.error("[Book Controller] Error emptying trash:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error emptying trash" });
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
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const trimmedNew = newBookName.trim();
    const query = { ...userQuery };
    if (v_id) query.v_id = v_id;
    else query.flipbookName = bookName;

    const existing = await Flipbook.findOne(query);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    const oldName = existing.flipbookName;
    existing.flipbookName = trimmedNew;
    existing.lastUpdated = new Date();
    await existing.save();

    // Rename directory on disk if it exists
    if (oldName !== trimmedNew) {
      try {
        const storageRoot = getStorageRoot();
        const userFolders = [
          existing.userID,
          existing.userId ? String(existing.userId) : null,
          existing.userEmail ? existing.userEmail.replace(/[@.]/g, "_") : null,
        ].filter(Boolean);
        const folder = resolveFolder(existing.folderName);

        for (const uf of userFolders) {
          const candidateOldDirs = [
            path.join(storageRoot, uf, "books", folder, oldName),
            path.join(storageRoot, uf, "books", oldName),
            path.join(storageRoot, uf, folder, oldName),
            path.join(storageRoot, uf, oldName),
          ];
          for (const oldDir of candidateOldDirs) {
            if (fs.existsSync(oldDir)) {
              const newDir = path.join(path.dirname(oldDir), trimmedNew);
              if (!fs.existsSync(newDir)) {
                fs.renameSync(oldDir, newDir);
                console.log(
                  `[Book Controller] Renamed physical book directory: ${oldDir} -> ${newDir}`,
                );
              }
              break;
            }
          }
        }
      } catch (renameErr) {
        console.warn(
          "[Book Controller] Warning renaming physical folder on disk:",
          renameErr.message,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Renamed successfully",
      book: formatBook(existing),
    });
  } catch (err) {
    console.error("[Book Controller] Error renaming book:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error renaming book" });
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
      return res
        .status(400)
        .json({ success: false, message: "Missing book identifier" });
    }

    const query = { ...userQuery };
    if (v_id) query.v_id = v_id;
    else query.flipbookName = bookName;

    const existing = await Flipbook.findOne(query);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Original flipbook not found" });
    }

    const cloneData = existing.toObject();
    delete cloneData._id;
    cloneData.v_id = crypto.randomBytes(8).toString("hex");
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

    const cloneFolders = (Array.isArray(existing.folderName) ? existing.folderName.flat(Infinity) : [existing.folderName])
      .filter((f) => f && typeof f === "string" && f.trim() && f.trim() !== "Trash")
      .map((f) => f.trim());
    if (!cloneFolders.includes("Recent Book")) cloneFolders.push("Recent Book");
    cloneData.folderName = [...new Set(cloneFolders.length > 0 ? cloneFolders : ["default"])];
    cloneData.lastUpdated = new Date();

    const duplicated = await Flipbook.create(cloneData);
    if (userQuery) enforceRecentLimit(userQuery).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Book duplicated successfully",
      book: formatBook(duplicated),
    });
  } catch (err) {
    console.error("[Book Controller] Error duplicating book:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error duplicating book" });
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
      return res
        .status(400)
        .json({ success: false, message: "Missing book identifier" });
    }

    const query = { ...userQuery };
    if (v_id) query.v_id = v_id;
    else query.flipbookName = bookName;

    let book = await Flipbook.findOne(query);
    if (!book && v_id) {
      book = await Flipbook.findOne({ v_id });
      if (
        book &&
        emailId &&
        book.userEmail &&
        book.userEmail.toLowerCase() !== emailId.toLowerCase()
      ) {
        book = null;
      }
    }
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    const folder = resolveFolder(book.folderName);
    deleteBookStorage(
      rawId || customUserId,
      emailId,
      folder || "default",
      book.flipbookName,
      book,
    );

    await Flipbook.deleteOne({ _id: book._id });
    try {
      await FlipbookAsset.deleteMany({ flipbook_v_id: book.v_id });
      await InteractionThreedModel.deleteMany({
        $or: [
          { flipbook_v_id: book.v_id },
          { flipbookName: book.flipbookName, userEmail: book.userEmail }
        ]
      }).catch(() => {});
    } catch (e) {}

    // Check flipbook v_id in customizedsettings and remove that db data
    try {
      if (mongoose.connection && mongoose.connection.db) {
        await mongoose.connection.db
          .collection("customizedsettings")
          .deleteMany({ v_id: book.v_id });
        await mongoose.connection.db
          .collection("leads")
          .deleteMany({ v_id: book.v_id });
      }
    } catch (e) {
      console.warn(
        `[Book Controller] Failed to remove customizedsettings for v_id ${book.v_id}:`,
        e.message
      );
    }

    res.status(200).json({
      success: true,
      message: "Flipbook permanently deleted",
    });
  } catch (err) {
    console.error("[Book Controller] Error deleting book permanently:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error deleting book" });
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
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const cleanVId = v_id ? String(v_id).replace(/^Recent_/, "").trim() : null;
    const cleanBookName =
      bookName && typeof bookName === "string" ? bookName.trim() : null;

    const bookConds = [];
    if (cleanVId) bookConds.push({ v_id: cleanVId });
    if (cleanBookName) bookConds.push({ flipbookName: cleanBookName });

    if (bookConds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Missing book identifier" });
    }

    // Build compound query: user owns the book, and book matches v_id or name
    const query = {
      $and: [
        userQuery,
        bookConds.length === 1 ? bookConds[0] : { $or: bookConds },
      ],
    };

    const updateResult = await Flipbook.updateMany(query, {
      $pull: { folderName: { $in: ["Recent Book", "Recent", "Recent book"] } },
    });

    console.log(
      `[Book Controller] removeRecent: matched ${updateResult.matchedCount}, modified ${updateResult.modifiedCount} for v_id: ${cleanVId || "N/A"}, name: ${cleanBookName || "N/A"}`
    );

    res.status(200).json({
      success: true,
      message: "Removed from Recent",
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (err) {
    console.error("[Book Controller] Error removing recent:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error removing recent" });
  }
};

/**
 * POST /api/flipbook/publish
 * Publish flipbook with metadata (category, language, tags, quotes, about)
 */
exports.publishBook = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const { v_id, bookName, category, language, tags, quotes, about, meta } = req.body;
    if (!v_id && !bookName) {
      return res.status(400).json({ success: false, message: "Missing book identifier" });
    }

    const query = userQuery ? { ...userQuery } : {};
    if (v_id) query.v_id = v_id;
    else if (bookName) query.flipbookName = bookName;

    let book = await Flipbook.findOne(query);
    if (!book && v_id) {
      book = await Flipbook.findOne({ v_id });
    }

    if (!book) {
      return res.status(404).json({ success: false, message: "Flipbook not found" });
    }

    const cleanCategory = typeof category === 'string' ? category.trim() : (meta?.category || '');
    const cleanLanguage = typeof language === 'string' ? language.trim() : (meta?.language || 'English');
    const cleanQuotes = typeof quotes === 'string' ? quotes.trim() : (meta?.quotes || '');
    const cleanAbout = typeof about === 'string' ? about.trim() : (meta?.about || '');
    const cleanTags = Array.isArray(tags) ? tags : (Array.isArray(meta?.tags) ? meta.tags : []);

    let existingCustomized = {};
    try {
      if (mongoose.connection && mongoose.connection.db) {
        existingCustomized = (await mongoose.connection.db.collection('customizedsettings').findOne({ v_id: book.v_id })) || {};
      }
    } catch (e) {}

    const existingFlipbookInfo = existingCustomized.FlipbookInfo || {};

    const updatedFlipbookInfo = {
      ...existingFlipbookInfo,
      ...(meta || {}),
      category: cleanCategory || existingFlipbookInfo.category || 'General',
      language: cleanLanguage || existingFlipbookInfo.language || 'English',
      tags: cleanTags.length > 0 ? cleanTags : (existingFlipbookInfo.tags || []),
      quotes: cleanQuotes || existingFlipbookInfo.quotes || '',
      about: cleanAbout || existingFlipbookInfo.about || '',
      publishedAt: new Date()
    };

    book.isPublished = true;
    book.publishedAt = new Date();
    book.lastUpdated = new Date();
    await book.save();

    try {
      if (mongoose.connection && mongoose.connection.db) {
        await mongoose.connection.db.collection('customizedsettings').updateOne(
          { v_id: book.v_id },
          {
            $set: {
              'FlipbookInfo': updatedFlipbookInfo,
              'FlipbookInfo.publishedAt': new Date()
            }
          }
        );
      }
    } catch (e) {
      console.warn('[Book Controller] Sync published info to customizedsettings failed:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: "Flipbook published successfully",
      book: formatBook(book, { ...existingCustomized, FlipbookInfo: updatedFlipbookInfo })
    });
  } catch (err) {
    console.error("[Book Controller] Error publishing book:", err);
    return res.status(500).json({ success: false, message: "Server error publishing book", error: err.message });
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
      return res
        .status(400)
        .json({ success: false, message: "Missing book identifier" });
    }

    const query = { ...userQuery };
    if (v_id) query.v_id = v_id;
    else query.flipbookName = bookName;

    const updated = await Flipbook.findOneAndUpdate(
      query,
      { $set: { isPublished: false } },
      { returnDocument: "after" },
    );

    res.status(200).json({
      success: true,
      message: "Flipbook unpublished",
      book: updated ? formatBook(updated) : null,
    });
  } catch (err) {
    console.error("[Book Controller] Error unpublishing book:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error unpublishing book" });
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
      return res
        .status(400)
        .json({ success: false, message: "Missing chunk parameters" });
    }
    if (!chunkUploads.has(uploadId)) {
      chunkUploads.set(uploadId, {
        chunks: new Array(totalChunks),
        totalChunks,
        timestamp: Date.now(),
      });
    }
    const session = chunkUploads.get(uploadId);
    session.chunks[chunkIndex] = chunkData;

    const isComplete =
      session.chunks.filter(Boolean).length === session.totalChunks;
    if (isComplete) {
      session.fullContent = session.chunks.join("");
    }
    res.status(200).json({ success: true, isComplete });
  } catch (err) {
    console.error("[Book Controller] Error in saveChunk:", err);
    res.status(500).json({ success: false, message: "Chunk upload error" });
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
    const {
      flipbookName,
      pages,
      folderName,
      fileSize,
      overwrite,
      v_id: providedVId,
      meta,
      keepBase64: reqKeepBase64,
    } = req.body;

    if (!userQuery || !flipbookName) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required flipbookName" });
    }

    const safeName = flipbookName.trim();
    const resolvedPhysical = resolveFolder(folderName) || "default";
    const targetFolder = resolvedPhysical;

    let book = null;
    if (providedVId) {
      book = await Flipbook.findOne({ ...userQuery, v_id: providedVId });
    }

    let finalFlipbookName = safeName;
    if (!book) {
      // New book creation: strictly guarantee unique flipbookName to avoid collisions
      const existingBooks = await Flipbook.find(userQuery)
        .select("flipbookName")
        .lean();
      const existingNames = new Set(
        existingBooks.map((eb) => (eb.flipbookName || "").trim().toLowerCase()),
      );
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

    const resolvedVId =
      book?.v_id || providedVId || crypto.randomBytes(8).toString("hex");

    // Index existing pages by v_id, fileName, and name to preserve pages across reordering
    const existingByVId = new Map();
    const existingByFileName = new Map();
    const existingByName = new Map();
    if (book && Array.isArray(book.pages)) {
      book.pages.forEach((p) => {
        if (p.v_id) existingByVId.set(p.v_id, p);
        if (p.fileName) existingByFileName.set(p.fileName.toLowerCase(), p);
        if (p.name) existingByName.set(p.name.toLowerCase(), p);
      });
    }

    const safePages = Array.isArray(pages)
      ? pages.map((p, idx) => {
          const pageNum = idx + 1;
          const existingPage =
            (p.v_id && existingByVId.get(p.v_id)) ||
            (p.fileName && existingByFileName.get(p.fileName.toLowerCase())) ||
            (p.name && existingByName.get(p.name.toLowerCase()));

          // Resolve chunked upload if applicable
          let chunkedContent = null;
          if (p.contentChunkId && chunkUploads.has(p.contentChunkId)) {
            chunkedContent =
              chunkUploads.get(p.contentChunkId).fullContent || "";
            chunkUploads.delete(p.contentChunkId);
          }

          let pageContent =
            chunkedContent !== null
              ? chunkedContent
              : p.content !== undefined && p.content !== null
                ? p.content
                : p.html !== undefined && p.html !== null
                  ? p.html
                  : "";

          const pageVId =
            p.v_id && p.v_id !== resolvedVId
              ? p.v_id
              : existingPage?.v_id && existingPage.v_id !== resolvedVId
                ? existingPage.v_id
                : crypto.randomBytes(6).toString("hex");

          const pageName =
            p.name || p.pageName || existingPage?.name || `Page ${pageNum}`;
          const cleanPageName = String(pageName || "")
            .replace(/[\\/:*?"<>|]/g, "")
            .trim();
          const pageFileName =
            p.fileName ||
            existingPage?.fileName ||
            (cleanPageName
              ? cleanPageName.endsWith(".svg")
                ? cleanPageName
                : `${cleanPageName}.svg`
              : `${pageNum}.svg`);

          return {
            pageNumber: pageNum,
            name: pageName,
            fileName: pageFileName,
            v_id: pageVId,
            size:
              p.size ||
              (pageContent
                ? Buffer.byteLength(pageContent, "utf8")
                : existingPage?.size || 0),
            hide: p.hide !== undefined ? p.hide : existingPage?.hide || 0,
            content: pageContent,
            html: pageContent,
            existingFileName: existingPage?.fileName,
          };
        })
      : [];

    const mongoPages = safePages.map((p) => ({
      pageNumber: p.pageNumber,
      name: p.name,
      fileName: p.fileName,
      v_id: p.v_id,
      size: p.size,
      hide: p.hide,
    }));

    const physicalFolder = targetFolder || "default";
    if (book) {
      book.flipbookName = safeName;
      const existingFolders = (Array.isArray(book.folderName) ? book.folderName.flat(Infinity) : [book.folderName])
        .filter((f) => typeof f === "string" && f.trim() && f.trim() !== "Trash")
        .map((f) => f.trim());
      if (!existingFolders.includes(physicalFolder)) existingFolders.unshift(physicalFolder);
      if (!existingFolders.includes("Recent Book")) existingFolders.push("Recent Book");
      book.folderName = [...new Set(existingFolders)];

      if (mongoPages.length > 0) book.pages = mongoPages;
      if (fileSize !== undefined) book.fileSize = fileSize;
      book.lastUpdated = new Date();
      await book.save();
    } else {
      book = await Flipbook.create({
        ...(objectId ? { userId: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
        userEmail: emailId,
        v_id: resolvedVId,
        flipbookName: finalFlipbookName,
        folderName: physicalFolder === "Recent Book" ? ["Recent Book"] : [physicalFolder, "Recent Book"],
        pages: mongoPages,
        fileSize: fileSize || 0,
        lastUpdated: new Date(),
      });
    }

    if (meta && Object.keys(meta).length > 0) {
      try {
        if (mongoose.connection && mongoose.connection.db) {
          await mongoose.connection.db.collection('customizedsettings').updateOne(
            { v_id: resolvedVId },
            {
              $set: {
                v_id: resolvedVId,
                userID: customUserId || book.userID,
                userEmail: emailId || book.userEmail,
                flipbookName: finalFlipbookName,
                folderName: physicalFolder,
                ...meta
              }
            },
            { upsert: true }
          );
        }
      } catch (e) {
        console.warn('[Book Controller] Sync meta to customizedsettings failed:', e.message);
      }
    }

    if (userQuery) {
      enforceRecentLimit(userQuery).catch(() => {});
    }

    // Persist full pages and complete workspace structure to local disk storage
    try {
      const storageRoot = getStorageRoot();
      const userFolder =
        book.userID ||
        (objectId
          ? String(objectId)
          : emailId
            ? emailId.replace(/[@.]/g, "_")
            : "default");
      const targetSubfolder =
        resolvedPhysical || resolveFolder(book.folderName);

      const wsBookDir = path.join(
        storageRoot,
        userFolder,
        "books",
        targetSubfolder,
        finalFlipbookName,
      );
      initFlipbookStorage(wsBookDir);
      const pagesDir = path.join(wsBookDir, "pages");

      const savedBase64Map = new Map();
      const newFlipbookAssets = [];
      const keepBase64 =
        reqKeepBase64 !== undefined ? Boolean(reqKeepBase64) : false;

      for (const sp of safePages) {
        let svgContent = sp.content || sp.html || "";
        const targetFileName = sp.fileName || `${sp.pageNumber}.svg`;

        if (!svgContent || svgContent.trim() === "") {
          const candidateNames = [
            targetFileName,
            sp.existingFileName,
            sp.fileName,
            sp.name ? `${sp.name}.svg` : null,
            `${sp.pageNumber}.svg`,
            `Page ${sp.pageNumber}.svg`,
          ].filter(Boolean);

          for (const cand of candidateNames) {
            const candPath = path.join(pagesDir, cand);
            if (fs.existsSync(candPath)) {
              try {
                const diskStr = await fs.promises.readFile(candPath, "utf8");
                if (diskStr && diskStr.trim()) {
                  svgContent = diskStr;
                  break;
                }
              } catch (e) {}
            }
          }
        }

        if (!svgContent || svgContent.trim() === "") {
          const pageWidth = meta?.width || 595;
          const pageHeight = meta?.height || 842;
          const gId = `g_page_${sp.pageNumber}_${crypto.randomBytes(4).toString("hex")}`;
          const rectId = `rect_${sp.pageNumber}_${crypto.randomBytes(4).toString("hex")}`;
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${pageWidth} ${pageHeight}" width="100%" height="100%" style="overflow: visible"><defs></defs><g id="${gId}" data-name="${sp.name || `Page ${sp.pageNumber}`}" data-type="frame"><rect id="${rectId}" x="0" y="0" width="${pageWidth}" height="${pageHeight}" fill="#ffffff" data-name="Overlay" data-type="background" data-locked="true" shape-rendering="crispEdges"/></g></svg>`;
        } else if (
          svgContent.includes("<svg") &&
          !svgContent.includes('data-name="Page ') &&
          !svgContent.includes(`data-name="${sp.name}"`)
        ) {
          // Ensure root Page frame folder exists for layers panel
          const gId = `g_page_${sp.pageNumber}_${crypto.randomBytes(4).toString("hex")}`;
          svgContent = svgContent
            .replace(
              /(<svg\b[^>]*>)/i,
              `$1\n<g id="${gId}" data-name="${sp.name || `Page ${sp.pageNumber}`}" data-type="frame">`,
            )
            .replace(/<\/svg>/i, "</g>\n</svg>");
        }

        // Extract base64 assets, write to assets/ folder on disk, and link with ./assets/... in SVG
        svgContent = processAndSaveBase64Assets({
          htmlContent: svgContent,
          pageVId: sp.v_id,
          wsBookDir,
          flipbook_v_id: resolvedVId,
          flipbookName: finalFlipbookName,
          folderName: targetSubfolder,
          userEmail: emailId,
          userFolder,
          newFlipbookAssets,
          savedBase64Map,
          skipBase64Extraction: keepBase64,
        });

        await fs.promises.writeFile(
          path.join(pagesDir, targetFileName),
          svgContent,
          "utf8",
        );
        sp.size = Buffer.byteLength(svgContent, "utf8");

        // If this page was renamed, remove its old physical file
        if (
          sp.existingFileName &&
          sp.existingFileName.toLowerCase() !== targetFileName.toLowerCase()
        ) {
          try {
            const oldFilePath = path.join(pagesDir, sp.existingFileName);
            if (fs.existsSync(oldFilePath)) {
              await fs.promises.unlink(oldFilePath);
              console.log(
                `[Book Controller] Cleaned up renamed old page file: ${sp.existingFileName}`,
              );
            }
          } catch (e) {}
        }
      }

      // Upsert extracted base64 assets in MongoDB
      if (newFlipbookAssets.length > 0) {
        for (const assetObj of newFlipbookAssets) {
          try {
            await FlipbookAsset.updateOne(
              {
                flipbook_v_id: assetObj.flipbook_v_id,
                fileName: assetObj.fileName,
              },
              { $set: assetObj },
              { upsert: true },
            );
          } catch (assetUpsertErr) {
            console.error(
              "[Book Controller] Error upserting asset to DB:",
              assetUpsertErr.message,
            );
          }
        }
        console.log(
          `[Book Controller] Upserted ${newFlipbookAssets.length} extracted base64 assets in DB`,
        );
      }

      // Clean up unused FlipbookAsset & InteractionThreedModel records & files if removed from canvas
      try {
        if (fs.existsSync(pagesDir)) {
          let allPageSvgs = "";
          const pageFiles = fs.readdirSync(pagesDir);
          pageFiles.forEach((pf) => {
            if (pf.endsWith(".svg") || pf.endsWith(".html")) {
              try {
                allPageSvgs +=
                  " " +
                  fs
                    .readFileSync(path.join(pagesDir, pf), "utf8")
                    .toLowerCase();
              } catch (e) {}
            }
          });
          if (Array.isArray(safePages)) {
            safePages.forEach((sp) => {
              if (sp.content) allPageSvgs += " " + String(sp.content).toLowerCase();
              if (sp.html) allPageSvgs += " " + String(sp.html).toLowerCase();
            });
          }

          // 1. Clean up unused FlipbookAsset records
          const allFlipbookAssets = await FlipbookAsset.find({
            flipbook_v_id: resolvedVId,
          });
          for (const asset of allFlipbookAssets) {
            if (asset.isGallery) continue;
            const fNameLower = (asset.fileName || "").toLowerCase();
            const isReferenced = fNameLower && allPageSvgs.includes(fNameLower);
            if (!isReferenced) {
              const diskAssetPath = path.join(
                wsBookDir,
                "assets",
                asset.assetType || "Image",
                asset.fileName,
              );
              if (fs.existsSync(diskAssetPath)) {
                try {
                  fs.unlinkSync(diskAssetPath);
                } catch (e) {}
              }
              await FlipbookAsset.deleteOne({ _id: asset._id });
              console.log(
                `[Book Controller] Cleaned up unused asset from disk & DB: ${asset.fileName}`,
              );

              // Also delete corresponding InteractionThreedModel if it was 3D
              if (asset.assetType === "3D_Model" || fNameLower.endsWith(".glb")) {
                await InteractionThreedModel.deleteMany({
                  $or: [
                    { fileName: asset.fileName },
                    { v_id: asset.file_v_id },
                    { url: asset.url }
                  ]
                }).catch(() => {});
              }
            }
          }

          // 2. Clean up unreferenced InteractionThreedModel records for this flipbook
          const userMail = emailId || book?.userEmail;
          const emailRegex = userMail ? new RegExp(`^${userMail}$`, "i") : null;
          const query3DOr = [{ flipbook_v_id: resolvedVId }];
          if (finalFlipbookName) {
            if (emailRegex) {
              query3DOr.push({ flipbookName: finalFlipbookName, userEmail: emailRegex });
            } else {
              query3DOr.push({ flipbookName: finalFlipbookName });
            }
          }

          const all3DModels = await InteractionThreedModel.find({ $or: query3DOr });
          for (const model of all3DModels) {
            const fNameLower = (model.fileName || "").toLowerCase();
            const vIdLower = (model.v_id || "").toLowerCase();
            const isReferenced =
              (fNameLower && allPageSvgs.includes(fNameLower)) ||
              (vIdLower && allPageSvgs.includes(vIdLower));

            if (!isReferenced) {
              const disk3DPath = path.join(
                wsBookDir,
                "assets",
                "3D_Model",
                model.fileName,
              );
              if (fs.existsSync(disk3DPath)) {
                try {
                  fs.unlinkSync(disk3DPath);
                } catch (e) {}
              }
              await InteractionThreedModel.deleteOne({ _id: model._id });
              await FlipbookAsset.deleteMany({
                flipbook_v_id: resolvedVId,
                $or: [{ fileName: model.fileName }, { file_v_id: model.v_id }]
              }).catch(() => {});
              console.log(
                `[Book Controller] Cleaned up unreferenced InteractionThreedModel from DB & disk: ${model.fileName} (${model.v_id})`,
              );
            }
          }
        }
      } catch (assetCleanErr) {
        console.warn(
          "[Book Controller] Warning cleaning up unused assets:",
          assetCleanErr.message,
        );
      }

      // Clean up physical files for any pages that were deleted
      try {
        if (fs.existsSync(pagesDir) && safePages.length > 0) {
          const activeFileNames = new Set();
          safePages.forEach((sp) => {
            if (sp.fileName) activeFileNames.add(sp.fileName.toLowerCase());
            if (sp.name) {
              const clean = String(sp.name)
                .replace(/[\\/:*?"<>|]/g, "")
                .trim()
                .toLowerCase();
              if (clean) activeFileNames.add(`${clean}.svg`);
            }
          });
          const diskFiles = fs.readdirSync(pagesDir);
          diskFiles.forEach((df) => {
            const dfLower = df.toLowerCase();
            if (
              (dfLower.endsWith(".svg") || dfLower.endsWith(".html")) &&
              !activeFileNames.has(dfLower)
            ) {
              try {
                fs.unlinkSync(path.join(pagesDir, df));
                console.log(
                  `[Book Controller] Cleaned up deleted page file from disk: ${df}`,
                );
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
            if (
              /^Page\s*\d+\.html$/i.test(rf) ||
              (rf.endsWith(".html") && !rf.includes("index"))
            ) {
              try {
                fs.unlinkSync(path.join(wsBookDir, rf));
              } catch (e) {}
            }
          });
        }
      } catch (cleanErr) {}
    } catch (fsErr) {
      console.warn(
        "[Book Controller] Warning writing pages to disk:",
        fsErr.message,
      );
    }

    res.status(200).json({
      success: true,
      message: "Flipbook saved successfully",
      v_id: resolvedVId,
      book: formatBook(book),
      pages: safePages,
    });
  } catch (err) {
    console.error("[Book Controller] Error saving book:", err);
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Server error saving book",
      });
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
      return res
        .status(400)
        .json({ success: false, message: "Missing v_id or pages" });
    }

    const book = await Flipbook.findOne({ ...userQuery, v_id });
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    const newPagesMap = new Map();
    (book.pages || []).forEach((p) => newPagesMap.set(p.pageNumber, p));

    const fullBatchPages = [];
    pages.forEach((p, idx) => {
      const pageNum =
        p.pageNumber !== undefined ? p.pageNumber : newPagesMap.size + idx + 1;
      const existingPage = newPagesMap.get(pageNum);

      const pageContent =
        p.content !== undefined && p.content !== null
          ? p.content
          : p.html !== undefined && p.html !== null
            ? p.html
            : existingPage?.content || existingPage?.html || "";

      const pageVId =
        p.v_id && p.v_id !== v_id
          ? p.v_id
          : existingPage?.v_id && existingPage.v_id !== v_id
            ? existingPage.v_id
            : crypto.randomBytes(6).toString("hex");

      const pageName =
        p.name || p.pageName || existingPage?.name || `Page ${pageNum}`;
      const cleanPageName = String(pageName || "")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim();
      const pageFileName =
        p.fileName ||
        (cleanPageName
          ? cleanPageName.endsWith(".svg")
            ? cleanPageName
            : `${cleanPageName}.svg`
          : `${pageNum}.svg`);

      const fullPage = {
        pageNumber: pageNum,
        name: pageName,
        fileName: pageFileName,
        v_id: pageVId,
        size:
          p.size ||
          (pageContent
            ? Buffer.byteLength(pageContent, "utf8")
            : existingPage?.size || 0),
        hide: p.hide !== undefined ? p.hide : existingPage?.hide || 0,
        content: pageContent,
        html: pageContent,
      };
      fullBatchPages.push(fullPage);
      newPagesMap.set(pageNum, fullPage);
    });

    const allSortedPages = Array.from(newPagesMap.values()).sort(
      (a, b) => a.pageNumber - b.pageNumber,
    );

    book.pages = allSortedPages.map((p) => ({
      pageNumber: p.pageNumber,
      name: p.name,
      fileName: p.fileName,
      v_id: p.v_id,
      size: p.size,
      hide: p.hide,
    }));

    if (fileSize !== undefined) book.fileSize = fileSize;
    book.lastUpdated = new Date();
    await book.save();

    // Persist pages and workspace structure to disk
    try {
      const storageRoot = getStorageRoot();
      const folder = resolveFolder(book.folderName);
      const userFolder =
        book.userID ||
        (objectId
          ? String(objectId)
          : emailId
            ? emailId.replace(/[@.]/g, "_")
            : "default");

      const wsBookDir = path.join(
        storageRoot,
        userFolder,
        "books",
        folder,
        book.flipbookName,
      );
      initFlipbookStorage(wsBookDir);
      const pagesDir = path.join(wsBookDir, "pages");

      const savedBase64Map = new Map();
      const newFlipbookAssets = [];
      const keepBase64 =
        req.body?.keepBase64 !== undefined
          ? Boolean(req.body.keepBase64)
          : false;

      fullBatchPages.forEach((sp) => {
        let svgContent = sp.content || sp.html || "";
        const targetFileName = sp.fileName || `${sp.pageNumber}.svg`;

        if (svgContent) {
          if (
            svgContent.includes("<svg") &&
            !svgContent.includes('data-name="Page ') &&
            !svgContent.includes(`data-name="${sp.name}"`)
          ) {
            const gId = `g_page_${sp.pageNumber}_${crypto.randomBytes(4).toString("hex")}`;
            svgContent = svgContent
              .replace(
                /(<svg\b[^>]*>)/i,
                `$1\n<g id="${gId}" data-name="${sp.name || `Page ${sp.pageNumber}`}" data-type="frame">`,
              )
              .replace(/<\/svg>/i, "</g>\n</svg>");
          }

          svgContent = processAndSaveBase64Assets({
            htmlContent: svgContent,
            pageVId: sp.v_id,
            wsBookDir,
            flipbook_v_id: book.v_id,
            flipbookName: book.flipbookName,
            folderName: folder,
            userEmail: emailId,
            userFolder,
            newFlipbookAssets,
            savedBase64Map,
            skipBase64Extraction: keepBase64,
          });

          svgContent = normalizeToRelativeAssetPaths(svgContent);
          fs.writeFileSync(
            path.join(pagesDir, targetFileName),
            svgContent,
            "utf8",
          );
          sp.size = Buffer.byteLength(svgContent, "utf8");
        }
      });

      if (newFlipbookAssets.length > 0) {
        for (const assetObj of newFlipbookAssets) {
          try {
            await FlipbookAsset.updateOne(
              {
                flipbook_v_id: assetObj.flipbook_v_id,
                fileName: assetObj.fileName,
              },
              { $set: assetObj },
              { upsert: true },
            );
          } catch (assetUpsertErr) {
            console.error(
              "[Book Controller] Error upserting asset in savePagesBatch:",
              assetUpsertErr.message,
            );
          }
        }
      }

      // Clean up unused FlipbookAsset & InteractionThreedModel records if removed from canvas
      try {
        if (fs.existsSync(pagesDir)) {
          let allPageSvgs = "";
          const pageFiles = fs.readdirSync(pagesDir);
          pageFiles.forEach((pf) => {
            if (pf.endsWith(".svg") || pf.endsWith(".html")) {
              try {
                allPageSvgs +=
                  " " +
                  fs
                    .readFileSync(path.join(pagesDir, pf), "utf8")
                    .toLowerCase();
              } catch (e) {}
            }
          });

          const currentFlipbookVId = book.v_id || v_id;
          const allFlipbookAssets = await FlipbookAsset.find({
            flipbook_v_id: currentFlipbookVId,
          });
          for (const asset of allFlipbookAssets) {
            if (asset.isGallery) continue;
            const fNameLower = (asset.fileName || "").toLowerCase();
            const isReferenced = fNameLower && allPageSvgs.includes(fNameLower);
            if (!isReferenced) {
              const diskAssetPath = path.join(
                wsBookDir,
                "assets",
                asset.assetType || "Image",
                asset.fileName,
              );
              if (fs.existsSync(diskAssetPath)) {
                try {
                  fs.unlinkSync(diskAssetPath);
                } catch (e) {}
              }
              await FlipbookAsset.deleteOne({ _id: asset._id });
              if (asset.assetType === "3D_Model" || fNameLower.endsWith(".glb")) {
                await InteractionThreedModel.deleteMany({
                  $or: [
                    { fileName: asset.fileName },
                    { v_id: asset.file_v_id },
                    { url: asset.url }
                  ]
                }).catch(() => {});
              }
            }
          }

          // Clean up unreferenced InteractionThreedModel
          const query3DOr = [{ flipbook_v_id: currentFlipbookVId }];
          if (book.flipbookName) {
            query3DOr.push({
              flipbookName: book.flipbookName,
              userEmail: new RegExp(`^${emailId || book.userEmail}$`, "i")
            });
          }
          const all3DModels = await InteractionThreedModel.find({ $or: query3DOr });
          for (const model of all3DModels) {
            const fNameLower = (model.fileName || "").toLowerCase();
            const vIdLower = (model.v_id || "").toLowerCase();
            const isReferenced =
              (fNameLower && allPageSvgs.includes(fNameLower)) ||
              (vIdLower && allPageSvgs.includes(vIdLower));

            if (!isReferenced) {
              const disk3DPath = path.join(
                wsBookDir,
                "assets",
                "3D_Model",
                model.fileName,
              );
              if (fs.existsSync(disk3DPath)) {
                try {
                  fs.unlinkSync(disk3DPath);
                } catch (e) {}
              }
              await InteractionThreedModel.deleteOne({ _id: model._id });
              await FlipbookAsset.deleteMany({
                flipbook_v_id: currentFlipbookVId,
                $or: [{ fileName: model.fileName }, { file_v_id: model.v_id }]
              }).catch(() => {});
            }
          }
        }
      } catch (cleanAssetErr) {
        console.warn("[Book Controller] Warning cleaning unreferenced assets in savePagesBatch:", cleanAssetErr.message);
      }

      // Clean up physical files for any pages that were deleted
      try {
        if (fs.existsSync(pagesDir) && allSortedPages.length > 0) {
          const activeFileNames = new Set();
          allSortedPages.forEach((p) => {
            if (p.fileName) activeFileNames.add(p.fileName.toLowerCase());
            if (p.pageNumber) {
              activeFileNames.add(`${p.pageNumber}.svg`.toLowerCase());
              activeFileNames.add(`page ${p.pageNumber}.svg`.toLowerCase());
            }
            if (p.name) {
              const clean = String(p.name)
                .replace(/[\\/:*?"<>|]/g, "")
                .trim()
                .toLowerCase();
              if (clean) activeFileNames.add(`${clean}.svg`);
            }
          });
          const diskFiles = fs.readdirSync(pagesDir);
          diskFiles.forEach((df) => {
            const dfLower = df.toLowerCase();
            if (
              (dfLower.endsWith(".svg") || dfLower.endsWith(".html")) &&
              !activeFileNames.has(dfLower)
            ) {
              try {
                fs.unlinkSync(path.join(pagesDir, df));
                console.log(
                  `[Book Controller] Cleaned up deleted page file from disk: ${df}`,
                );
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
            if (
              /^Page\s*\d+\.html$/i.test(rf) ||
              (rf.endsWith(".html") && !rf.includes("index"))
            ) {
              try {
                fs.unlinkSync(path.join(wsBookDir, rf));
              } catch (e) {}
            }
          });
        }
      } catch (cleanErr) {}
    } catch (fsErr) {
      console.warn(
        "[Book Controller] Warning writing batch pages to disk:",
        fsErr.message,
      );
    }

    res.status(200).json({
      success: true,
      message: "Pages batch saved",
      v_id: book.v_id,
      pages: allSortedPages,
    });
  } catch (err) {
    console.error("[Book Controller] Error saving pages batch:", err);
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Server error saving pages batch",
      });
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
    } else if (bookName && bookName !== "undefined") {
      filter = { flipbookName: bookName };
      if (userQuery) filter = { ...filter, ...userQuery };
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing book identifier (v_id or bookName)",
        });
    }

    let book = await Flipbook.findOne(filter);
    if (!book && v_id) {
      // Public / shared fallback by v_id only
      book = await Flipbook.findOne({ v_id });
    }

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    // Mark as recent book and update lastUpdated when opened (if not trashed)
    if (!book.trash) {
      Flipbook.updateOne(
        { _id: book._id },
        {
          $addToSet: { folderName: "Recent Book" },
          $set: { lastUpdated: new Date() },
        },
      )
        .then(() => {
          if (userQuery) enforceRecentLimit(userQuery).catch(() => {});
        })
        .catch(() => {});
    }

    // Disk storage root
    const storageRoot = getStorageRoot();
    const userFolders = [
      book.userID,
      book.userId ? String(book.userId) : null,
      book.userEmail ? book.userEmail.replace(/[@.]/g, "_") : null,
    ].filter(Boolean);
    const folders = Array.from(
      new Set(
        [
          resolveFolder(book.folderName),
          ...(Array.isArray(book.folderName) ? book.folderName.flat(Infinity) : [book.folderName]),
          "default",
        ].filter((f) => f && typeof f === "string" && f.trim() && !VIRTUAL_FOLDERS.has(f.toLowerCase()))
      )
    );

    // Build all possible candidate directories on disk
    const candidateDirs = [];
    for (const uf of userFolders) {
      for (const f of folders) {
        candidateDirs.push(
          path.join(storageRoot, uf, "books", f, book.flipbookName),
          path.join(storageRoot, uf, "books", f, book.v_id),
          path.join(storageRoot, uf, "books", f, `${book.flipbookName}_${book.v_id}`),
          path.join(storageRoot, uf, "books", book.flipbookName),
          path.join(storageRoot, uf, "books", book.v_id),
          path.join(storageRoot, uf, f, book.flipbookName),
          path.join(storageRoot, uf, f, book.v_id),
          path.join(storageRoot, "flipbooks", uf, f, book.flipbookName),
          path.join(storageRoot, "flipbooks", uf, f, book.v_id),
        );
      }
    }

    const populatedPages = (book.pages || []).map((p) => {
      const pageObj = p.toObject ? p.toObject() : { ...p };
      let pageContent = "";

      // 1. MUST load page data directly from local storage file on disk first
      for (const candDir of candidateDirs) {
        const candidateFiles = [
          pageObj.fileName
            ? path.join(candDir, "pages", pageObj.fileName)
            : null,
          pageObj.name
            ? path.join(candDir, "pages", `${pageObj.name}.svg`)
            : null,
          path.join(candDir, "pages", `${pageObj.pageNumber}.svg`),
          path.join(candDir, "pages", `Page ${pageObj.pageNumber}.svg`),
          path.join(candDir, `Page ${pageObj.pageNumber}.html`),
        ].filter(Boolean);

        for (const fPath of candidateFiles) {
          if (fs.existsSync(fPath)) {
            try {
              const str = fs.readFileSync(fPath, "utf8");
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
        pageContent = pageObj.content || pageObj.html || "";
      }

      const cleanName = String(pageObj.name || "")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim();
      const resolvedFileName =
        pageObj.fileName ||
        (cleanName
          ? cleanName.endsWith(".svg")
            ? cleanName
            : `${cleanName}.svg`
          : `${pageObj.pageNumber}.svg`);

      return {
        ...pageObj,
        fileName: resolvedFileName,
        content: pageContent,
        html: pageContent,
      };
    });

    let customizedDoc = null;
    try {
      if (mongoose.connection && mongoose.connection.db) {
        customizedDoc = await mongoose.connection.db
          .collection("customizedsettings")
          .findOne({ v_id: book.v_id });
      }
    } catch (e) {}

    const formattedMeta = formatBook(book, customizedDoc || {});

    let resolvedShareId =
      customizedDoc?.Visibility?.shareId ||
      formattedMeta.Customized_Settings?.Visibility?.shareId ||
      formattedMeta.Visibility?.shareId ||
      (formattedMeta.Customized_Settings?.share?.shareId && formattedMeta.Customized_Settings?.share?.shareId !== book.v_id
        ? formattedMeta.Customized_Settings?.share?.shareId
        : null);

    if (!resolvedShareId || resolvedShareId === book.v_id) {
      resolvedShareId = crypto.randomBytes(8).toString('hex');
      try {
        if (mongoose.connection && mongoose.connection.db) {
          await mongoose.connection.db
            .collection("customizedsettings")
            .updateOne(
              { v_id: book.v_id },
              { $set: { "Visibility.shareId": resolvedShareId } },
              { upsert: false }
            );
        }
      } catch (e) {}
    }

    if (customizedDoc) {
      formattedMeta.Customized_Settings = {
        ...customizedDoc,
        Visibility: {
          ...(customizedDoc.Visibility || {}),
          shareId: resolvedShareId,
        },
      };
    } else {
      if (!formattedMeta.Customized_Settings) formattedMeta.Customized_Settings = {};
      if (!formattedMeta.Customized_Settings.Visibility) formattedMeta.Customized_Settings.Visibility = {};
      formattedMeta.Customized_Settings.Visibility.shareId = resolvedShareId;
    }

    res.status(200).json({
      success: true,
      meta: formattedMeta,
      settings: formattedMeta.Customized_Settings || {},
      Customized_Settings: formattedMeta.Customized_Settings || {},
      pages: populatedPages,
      share: {
        shareId: resolvedShareId,
        access: formattedMeta.Customized_Settings?.Visibility?.access || formattedMeta.Customized_Settings?.share?.access || "public",
      },
    });
  } catch (err) {
    console.error("[Book Controller] Error fetching single book:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching flipbook" });
  }
};

/**
 * POST /api/flipbook/update-settings
 * Update flipbook settings, share, and metadata
 */
exports.updateSettings = async (req, res) => {
  try {
    const userQuery = getFlipbookUserQuery(req);
    const {
      v_id,
      bookName,
      share,
      Customized_Settings,
      settings,
      width,
      height,
      orientation,
    } = req.body;

    const query = {};
    if (v_id) query.v_id = v_id;
    else if (bookName) query.flipbookName = bookName;
    else {
      return res
        .status(400)
        .json({ success: false, message: "Missing v_id or bookName" });
    }

    if (userQuery) {
      Object.assign(query, userQuery);
    }

    const book = await Flipbook.findOne(query);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    let currentSettings = {};
    try {
      if (mongoose.connection && mongoose.connection.db) {
        currentSettings =
          (await mongoose.connection.db
            .collection("customizedsettings")
            .findOne({ v_id: book.v_id })) || {};
      }
    } catch (e) {}

    const rawCustomized = Customized_Settings || {};
    const rawSettings = settings || {};
    const newSettings = {
      ...currentSettings,
      ...(Customized_Settings || {}),
      ...(settings || {}),
    };
    if (rawSettings.background && !newSettings.Background) newSettings.Background = rawSettings.background;
    if (rawSettings.appearance && !newSettings.BookAppearance) newSettings.BookAppearance = rawSettings.appearance;
    if (rawSettings.menuBar && !newSettings.MenuBar) newSettings.MenuBar = rawSettings.menuBar;
    if (rawSettings.visibility && !newSettings.Visibility) newSettings.Visibility = rawSettings.visibility;
    if (rawSettings.leadForm && !newSettings.leadForm) newSettings.leadForm = rawSettings.leadForm;

    if (width) {
      newSettings.FlipbookInfo = { ...(newSettings.FlipbookInfo || {}), width };
    }
    if (height) {
      newSettings.FlipbookInfo = { ...(newSettings.FlipbookInfo || {}), height };
    }
    if (orientation) {
      newSettings.FlipbookInfo = { ...(newSettings.FlipbookInfo || {}), orientation };
    }

    // Purge duplicate legacy keys
    delete newSettings.appearance;
    delete newSettings.background;
    delete newSettings.menuBar;
    delete newSettings.visibility;
    delete newSettings.layout;
    delete newSettings.layoutColors;
    delete newSettings.share;
    delete newSettings.settings;
    delete newSettings.leadform;

    try {
      if (mongoose.connection && mongoose.connection.db) {
        await mongoose.connection.db.collection("customizedsettings").updateOne(
          { v_id: book.v_id },
          {
            $set: {
              v_id: book.v_id,
              userID: book.userID,
              userEmail: book.userEmail,
              flipbookName: book.flipbookName,
              ...newSettings,
            },
          },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn("[Book Controller] Failed to update customizedsettings:", e.message);
    }

    book.lastUpdated = new Date();
    await book.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: newSettings,
    });
  } catch (err) {
    console.error("[Book Controller] Error updating settings:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error updating settings" });
  }
};

/**
 * GET /api/flipbook/preview/:v_id
 * Preview flipbook
 */
exports.previewBook = async (req, res) => {
  try {
    const v_id = req.params?.v_id;
    const reqEmail = req.query?.emailId;
    const book = await Flipbook.findOne({ v_id });
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }
    const firstPage =
      book.pages && book.pages.length > 0 ? book.pages[0] : null;
    let firstPageHtml = firstPage?.html || firstPage?.content || "";

    if (!firstPageHtml) {
      const storageRoot = getStorageRoot();
      const userFolders = Array.from(
        new Set(
          [
            book.userID,
            book.userId ? String(book.userId) : null,
            book.userEmail ? book.userEmail.replace(/[@.]/g, "_") : null,
            reqEmail ? String(reqEmail).replace(/[@.]/g, "_") : null,
          ].filter(Boolean),
        ),
      );

      const primaryFolder = resolveFolder(book.folderName);
      const rawFolders = Array.isArray(book.folderName)
        ? book.folderName.flat(Infinity)
        : [book.folderName];
      const folders = Array.from(
        new Set(
          [primaryFolder, ...rawFolders, "default"]
            .filter((f) => f && typeof f === "string" && f.trim() && !VIRTUAL_FOLDERS.has(f.toLowerCase()))
            .map((f) => String(f).trim()),
        ),
      );

      const bookNames = Array.from(
        new Set(
          [
            book.flipbookName,
            book.v_id,
            `${book.flipbookName}_${book.v_id}`,
          ]
            .flat(Infinity)
            .filter((bn) => bn && typeof bn === "string" && bn.trim())
            .map((bn) => String(bn).trim()),
        ),
      );

      // 1. Build all candidate directories
      const candidateDirs = [];
      for (const uf of userFolders) {
        if (!uf || typeof uf !== "string") continue;
        for (const f of folders) {
          if (!f || typeof f !== "string") continue;
          for (const bn of bookNames) {
            if (!bn || typeof bn !== "string") continue;
            candidateDirs.push(
              path.join(storageRoot, uf, "books", f, bn),
              path.join(storageRoot, uf, "books", bn),
              path.join(storageRoot, uf, f, bn),
              path.join(storageRoot, uf, bn),
              path.join(storageRoot, "flipbooks", uf, f, bn),
              path.join(storageRoot, "flipbooks", uf, bn),
            );
          }
        }
      }

      // 2. Fallback scan for matching book directory
      for (const uf of userFolders) {
        const searchBases = [
          path.join(storageRoot, uf, "books"),
          path.join(storageRoot, uf, "books", "default"),
          path.join(storageRoot, uf),
        ];
        for (const sb of searchBases) {
          if (fs.existsSync(sb)) {
            try {
              const subdirs = fs.readdirSync(sb);
              for (const sd of subdirs) {
                const fullSd = path.join(sb, sd);
                try {
                  if (fs.statSync(fullSd).isDirectory()) {
                    const sdLower = sd.toLowerCase();
                    if (
                      (book.flipbookName &&
                        (sdLower === book.flipbookName.toLowerCase() ||
                          sdLower.includes(book.flipbookName.toLowerCase()))) ||
                      (book.v_id &&
                        (sdLower === book.v_id.toLowerCase() ||
                          sdLower.includes(book.v_id.toLowerCase())))
                    ) {
                      candidateDirs.push(fullSd);
                    }
                  }
                } catch (e) {}
              }
            } catch (e) {}
          }
        }
      }

      const uniqueCandidateDirs = Array.from(new Set(candidateDirs));

      // 3. Build candidate file names for the first page
      const pageNum = firstPage?.pageNumber || 1;
      const cleanName = firstPage?.name
        ? String(firstPage.name)
            .replace(/[\\/:*?"<>|]/g, "")
            .trim()
        : "";
      const cleanFileName = firstPage?.fileName
        ? String(firstPage.fileName)
            .replace(/[\\/:*?"<>|]/g, "")
            .trim()
        : "";

      const candidateFileNames = Array.from(
        new Set(
          [
            cleanFileName,
            cleanName
              ? cleanName.toLowerCase().endsWith(".svg")
                ? cleanName
                : `${cleanName}.svg`
              : null,
            `Page ${pageNum}.svg`,
            `page ${pageNum}.svg`,
            `Page_${pageNum}.svg`,
            `${pageNum}.svg`,
            "Page 1.svg",
            "page 1.svg",
            "1.svg",
            `Page ${pageNum}.html`,
            `page ${pageNum}.html`,
            "Page 1.html",
            "page 1.html",
            "1.html",
          ].filter(Boolean),
        ),
      );

      // 4. Search candidate directories for the first page file
      for (const candDir of uniqueCandidateDirs) {
        if (!fs.existsSync(candDir)) continue;

        for (const fName of candidateFileNames) {
          const candidatePaths = [
            path.join(candDir, "pages", fName),
            path.join(candDir, fName),
          ];
          for (const candPath of candidatePaths) {
            if (fs.existsSync(candPath)) {
              try {
                const content = fs.readFileSync(candPath, "utf8");
                if (content && content.trim()) {
                  firstPageHtml = content;
                  break;
                }
              } catch (e) {}
            }
          }
          if (firstPageHtml) break;
        }

        // Check if pages directory exists and has any .svg/.html files
        if (!firstPageHtml) {
          const pagesDir = path.join(candDir, "pages");
          if (fs.existsSync(pagesDir)) {
            try {
              const files = fs
                .readdirSync(pagesDir)
                .filter((f) => f.endsWith(".svg") || f.endsWith(".html"));
              if (files.length > 0) {
                const firstSvg =
                  files.find((f) => /page\s*1\b|^1\./i.test(f)) || files[0];
                const content = fs.readFileSync(
                  path.join(pagesDir, firstSvg),
                  "utf8",
                );
                if (content && content.trim()) {
                  firstPageHtml = content;
                }
              }
            } catch (e) {}
          }
        }

        if (firstPageHtml) break;
      }
    }

    res.status(200).json({
      success: true,
      book: formatBook(book),
      pages: book.pages || [],
      html: firstPageHtml,
    });
  } catch (err) {
    console.error("[Book Controller] Error fetching preview:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching preview" });
  }
};

/**
 * GET /api/flipbook/get-gallery-assets
 * Retrieve gallery assets
 */
exports.getGalleryAssets = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, type, currentUrl, currentFileName } = req.query;
    const emailId = authEmail || reqEmail;

    if (!emailId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing emailId" });
    }

    const sanitizedEmail = emailId.replace(/[@.]/g, "_");
    let resolvedUserId = null;

    try {
      const anyBook = await Flipbook.findOne({
        userEmail: new RegExp(
          `^${emailId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      }).select("userID userId");
      if (anyBook) {
        resolvedUserId =
          anyBook.userID || (anyBook.userId ? String(anyBook.userId) : null);
      }
    } catch (e) {}

    if (!resolvedUserId) {
      try {
        if (mongoose.connection && mongoose.connection.db) {
          const userRec = await mongoose.connection.db
            .collection("users")
            .findOne({
              emailId: new RegExp(
                `^${emailId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                "i",
              ),
            });
          if (userRec && userRec.userID) {
            resolvedUserId = userRec.userID;
          }
        }
      } catch (e) {}
    }

    const storageRoot = getStorageRoot();
    if (!resolvedUserId) {
      try {
        if (fs.existsSync(storageRoot)) {
          const topDirs = fs.readdirSync(storageRoot);
          const flipiDir = topDirs.find((d) => /^FLIPI\d+/i.test(d));
          if (flipiDir) {
            resolvedUserId = flipiDir;
          }
        }
      } catch (e) {}
    }

    const userFolder = resolvedUserId || sanitizedEmail;
    const candidateDirs = Array.from(
      new Set([resolvedUserId, userFolder, sanitizedEmail].filter(Boolean)),
    );
    const requestedType = type ? type.toLowerCase() : null;
    const assetsMap = new Map();
    const validMediaExtensions =
      /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|mkv|mp3|wav|ogg|glb|gltf)$/i;

    // 1. Fetch from consolidated UserGallery model
    try {
      const userGallery = await UserGallery.findOne({
        $or: [
          { emailId: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, 'i') },
          { userID: userFolder }
        ]
      });

      if (userGallery && userGallery.pageEditorgallery) {
        const { images = [], video = [], gif = [] } = userGallery.pageEditorgallery;

        const processList = (list, itemType) => {
          for (const item of list) {
            if (!item || !item.convertedName || !item.url) continue;
            if (currentFileName && (item.convertedName === currentFileName || item._id?.toString() === currentFileName)) continue;
            if (currentUrl && item.url.toLowerCase().includes(currentUrl.toLowerCase())) continue;

            if (!requestedType || itemType === requestedType) {
              assetsMap.set(item.convertedName, {
                id: item.convertedName,
                file_v_id: item.convertedName,
                name: item.originalName || item.convertedName,
                url: item.url,
                type: itemType,
                size: item.size || 0,
                uploadedAt: item.timestamp || new Date()
              });
            }
          }
        };

        processList(images, 'image');
        processList(video, 'video');
        processList(gif, 'gif');
      }
    } catch (e) {}

    // 2. Query FlipbookAsset collection for legacy gallery assets
    const dbAssets = await FlipbookAsset.find({
      userEmail: new RegExp(
        `^${emailId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i",
      ),
      $or: [
        { isGallery: true },
        { folderName: "Gallery" },
        { flipbook_v_id: "gallery" },
      ],
    }).sort({ createdAt: -1 });

    for (const asset of dbAssets) {
      if (
        asset.url &&
        asset.fileName &&
        validMediaExtensions.test(asset.fileName)
      ) {
        if (
          currentFileName &&
          (asset.fileName === currentFileName ||
            asset.file_v_id === currentFileName)
        )
          continue;
        if (
          currentUrl &&
          asset.url.toLowerCase().includes(currentUrl.toLowerCase())
        )
          continue;

        let detectedType = (asset.assetType || "").toLowerCase();
        if (detectedType === "images" || detectedType === "image")
          detectedType = "image";
        else if (detectedType === "videos" || detectedType === "video")
          detectedType = "video";
        else if (detectedType === "gifs" || detectedType === "gif")
          detectedType = "gif";
        else if (detectedType === "audio") detectedType = "audio";
        else if (
          detectedType === "3d" ||
          detectedType === "3d_model" ||
          detectedType === "model"
        )
          detectedType = "3d";
        else detectedType = "image";

        if (!requestedType || detectedType === requestedType) {
          assetsMap.set(asset.fileName, {
            id: asset.fileName,
            file_v_id: asset.file_v_id,
            name: asset.originalName || asset.fileName,
            url: asset.url,
            type: detectedType,
            size: asset.size || 0,
            uploadedAt: asset.createdAt || new Date(),
          });
        }
      }
    }

    // 2. Scan physical gallery folders on disk
    const gallerySubfolders = [
      "Images",
      "Videos",
      "gifs",
      "audio",
      "3D_Models",
    ];

    for (const uDir of candidateDirs) {
      for (const sub of gallerySubfolders) {
        const checkPaths = [
          {
            dir: path.join(storageRoot, uDir, sub),
            urlPrefix: `/storage/${uDir}/${sub}`,
          },
          {
            dir: path.join(storageRoot, uDir, "Gallery", sub),
            urlPrefix: `/storage/${uDir}/Gallery/${sub}`,
          },
        ];

        for (const { dir: diskDir, urlPrefix } of checkPaths) {
          if (fs.existsSync(diskDir)) {
            try {
              const files = fs.readdirSync(diskDir);
              for (const f of files) {
                if (validMediaExtensions.test(f) && !assetsMap.has(f)) {
                  const stats = fs.statSync(path.join(diskDir, f));
                  let t = "image";
                  if (sub === "Videos") t = "video";
                  else if (sub === "gifs") t = "gif";
                  else if (sub === "audio") t = "audio";
                  else if (sub === "3D_Models") t = "3d";

                  if (!requestedType || t === requestedType) {
                    const publicUrl = `${urlPrefix}/${f}`;
                    assetsMap.set(f, {
                      id: f,
                      file_v_id: f.split(".")[0] || f,
                      name: f,
                      url: publicUrl,
                      type: t,
                      size: stats.size,
                      uploadedAt: stats.mtime,
                    });
                  }
                }
              }
            } catch (scanErr) {
              console.warn(
                "[Book Controller] Error scanning gallery folder:",
                diskDir,
                scanErr.message,
              );
            }
          }
        }
      }
    }

    let assets = Array.from(assetsMap.values());
    assets.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return res.status(200).json({ success: true, assets });
  } catch (err) {
    console.error("[Book Controller] Error fetching gallery assets:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching gallery assets",
      error: err.message,
    });
  }
};

/**
 * Copy a gallery asset into a flipbook's own assets folder and create a new FlipbookAsset DB record
 * @route POST /api/flipbook/use-gallery-asset
 */
exports.useGalleryAsset = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const {
      emailId: reqEmail,
      v_id,
      folderName,
      flipbookName,
      galleryUrl,
      fileName: reqFileName,
      page_v_id,
      assetType: reqAssetType,
    } = req.body;

    const emailId = authEmail || reqEmail;
    if (!emailId || !galleryUrl) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing required fields: emailId and galleryUrl",
        });
    }

    let dbDoc = null;
    let safeFolderName = resolveFolder(folderName);
    let safeFlipbookName =
      (flipbookName || "Untitled_Document")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim() || "Untitled_Document";

    if (v_id) {
      dbDoc = await Flipbook.findOne({ v_id });
      if (dbDoc) {
        if (dbDoc.flipbookName)
          safeFlipbookName =
            dbDoc.flipbookName.replace(/[\\/:*?"<>|]/g, "").trim() ||
            safeFlipbookName;
        safeFolderName = resolveFolder(dbDoc.folderName);
      }
    }

    const sanitizedEmail = emailId.replace(/[@.]/g, "_");
    let resolvedUserId =
      dbDoc?.userID || (dbDoc?.userId ? String(dbDoc.userId) : null);

    if (!resolvedUserId && emailId) {
      try {
        const anyBook = await Flipbook.findOne({
          userEmail: new RegExp(
            `^${emailId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i",
          ),
        }).select("userID userId");
        if (anyBook) {
          resolvedUserId =
            anyBook.userID || (anyBook.userId ? String(anyBook.userId) : null);
        }
      } catch (e) {}
    }

    if (!resolvedUserId) {
      try {
        if (mongoose.connection && mongoose.connection.db) {
          const userRec = await mongoose.connection.db
            .collection("users")
            .findOne({
              emailId: new RegExp(
                `^${emailId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                "i",
              ),
            });
          if (userRec && userRec.userID) {
            resolvedUserId = userRec.userID;
          }
        }
      } catch (e) {}
    }

    const storageRoot = getStorageRoot();
    if (!resolvedUserId) {
      try {
        if (fs.existsSync(storageRoot)) {
          const topDirs = fs.readdirSync(storageRoot);
          const flipiDir = topDirs.find((d) => /^FLIPI\d+/i.test(d));
          if (flipiDir) {
            resolvedUserId = flipiDir;
          }
        }
      } catch (e) {}
    }

    const userFolder = resolvedUserId || sanitizedEmail;
    const candidateDirs = Array.from(
      new Set([resolvedUserId, userFolder, sanitizedEmail].filter(Boolean)),
    );

    // Parse source filename from URL
    const cleanUrl = galleryUrl.split("?")[0].split("#")[0];
    const sourceFileName = reqFileName || path.basename(cleanUrl);

    // Determine target subfolder
    let subFolder = "Image";
    const cleanLower = cleanUrl.toLowerCase();
    const typeLower = (reqAssetType || "").toLowerCase();
    if (
      typeLower.includes("video") ||
      cleanLower.includes("/videos/") ||
      cleanLower.endsWith(".mp4") ||
      cleanLower.endsWith(".mkv") ||
      cleanLower.endsWith(".webm")
    ) {
      subFolder = "video";
    } else if (
      typeLower.includes("gif") ||
      cleanLower.includes("/gifs/") ||
      cleanLower.endsWith(".gif")
    ) {
      subFolder = "gif";
    } else if (
      typeLower.includes("audio") ||
      cleanLower.includes("/audio/") ||
      cleanLower.endsWith(".mp3") ||
      cleanLower.endsWith(".wav") ||
      cleanLower.endsWith(".ogg")
    ) {
      subFolder = "audio";
    } else if (
      typeLower.includes("3d") ||
      cleanLower.includes("/3d_models/") ||
      cleanLower.endsWith(".glb") ||
      cleanLower.endsWith(".gltf")
    ) {
      subFolder = "3D_Model";
    } else if (
      typeLower.includes("download") ||
      cleanLower.includes("/download/")
    ) {
      subFolder = "download";
    }

    // Locate source file on disk in gallery
    let srcFilePath = null;
    const gallerySubs = [
      "Images",
      "Videos",
      "gifs",
      "audio",
      "3D_Models",
      "download",
    ];
    for (const uDir of candidateDirs) {
      for (const gsub of gallerySubs) {
        const p1 = path.join(storageRoot, uDir, gsub, sourceFileName);
        const p2 = path.join(
          storageRoot,
          uDir,
          "Gallery",
          gsub,
          sourceFileName,
        );
        if (fs.existsSync(p1)) {
          srcFilePath = p1;
          break;
        }
        if (fs.existsSync(p2)) {
          srcFilePath = p2;
          break;
        }
      }
      if (srcFilePath) break;
    }

    // Target flipbook assets folder
    const targetDir = path.join(
      storageRoot,
      userFolder,
      "books",
      safeFolderName,
      safeFlipbookName,
      "assets",
      subFolder,
    );
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileExt = path.extname(sourceFileName);
    const newFileVId = crypto.randomBytes(8).toString("hex");
    const newFileName = `${newFileVId}${fileExt}`;
    const destinationPath = path.join(targetDir, newFileName);

    let fileSize = 0;
    if (srcFilePath && fs.existsSync(srcFilePath)) {
      fs.copyFileSync(srcFilePath, destinationPath);
      fileSize = fs.statSync(destinationPath).size;
    } else {
      try {
        const fetchUrl = galleryUrl.startsWith("http")
          ? galleryUrl
          : `http://localhost:8000${galleryUrl.startsWith("/") ? "" : "/"}${galleryUrl}`;
        const response = await fetch(fetchUrl);
        const arrayBuf = await response.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        fs.writeFileSync(destinationPath, buf);
        fileSize = buf.length;
      } catch (fErr) {
        console.warn(
          "[Book Controller] Failed to fetch remote gallery asset:",
          fErr.message,
        );
      }
    }

    const relativeUrl = `/storage/${userFolder}/books/${safeFolderName}/${safeFlipbookName}/assets/${subFolder}/${newFileName}`;
    const svgRelativePath = `../assets/${subFolder}/${newFileName}`;

    // Create a NEW FlipbookAsset document for this flipbook (isGallery: false)
    const newAsset = new FlipbookAsset({
      flipbook_v_id: v_id || "flipbook_asset",
      file_v_id: newFileVId,
      page_v_id: page_v_id || "global",
      assetType: subFolder,
      fileName: newFileName,
      originalName: sourceFileName,
      userEmail: emailId,
      isGallery: false,
      flipbookName: safeFlipbookName,
      folderName: safeFolderName,
      url: svgRelativePath,
      size: fileSize,
    });

    await newAsset.save();

    return res.status(200).json({
      success: true,
      message: "Gallery asset copied to flipbook assets folder",
      url: svgRelativePath,
      relativeUrl: svgRelativePath,
      file_v_id: newFileVId,
      fileName: newFileName,
      name: sourceFileName,
      size: fileSize,
    });
  } catch (err) {
    console.error("[Book Controller] Error using gallery asset:", err);
    return res.status(500).json({
      success: false,
      message: "Server error copying gallery asset to flipbook",
      error: err.message,
    });
  }
};

/**
 * Rename a page and rename its corresponding physical file on disk
 * @route POST /api/flipbook/rename-page
 */
exports.renamePage = async (req, res) => {
  try {
    const { emailId: authEmail, objectId, customUserId } = getAuthUser(req);
    const {
      v_id,
      pageId,
      pageNumber,
      oldPageName,
      newPageName,
      emailId: reqEmail,
    } = req.body;
    const emailId = authEmail || reqEmail;

    if (!v_id || !newPageName || !newPageName.trim()) {
      return res.status(400).json({
        success: false,
        message: "v_id and newPageName are required",
      });
    }

    const trimmedNewName = newPageName.trim();
    const book = await Flipbook.findOne({ v_id });
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    if (
      emailId &&
      book.userEmail &&
      book.userEmail.toLowerCase() !== emailId.toLowerCase()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to modify this flipbook",
        });
    }

    book.pages = book.pages || [];
    let pageIndex = -1;
    if (pageId) {
      pageIndex = book.pages.findIndex(
        (p) => p.v_id === pageId || p.id === pageId,
      );
    }
    if (pageIndex === -1 && pageNumber !== undefined) {
      pageIndex = book.pages.findIndex(
        (p) => p.pageNumber === Number(pageNumber),
      );
    }
    if (pageIndex === -1 && oldPageName) {
      pageIndex = book.pages.findIndex((p) => p.name === oldPageName);
    }

    if (pageIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found in flipbook" });
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
      emailId ? emailId.replace(/[@.]/g, "_") : null,
      book.userEmail ? book.userEmail.replace(/[@.]/g, "_") : null,
    ].filter(Boolean);

    const folder = resolveFolder(book.folderName);

    // Find real existing bookDir on disk
    let wsBookDir = path.join(
      storageRoot,
      userFolders[0] || "default",
      "books",
      folder,
      book.flipbookName,
    );
    for (const uf of userFolders) {
      const candidates = [
        path.join(storageRoot, uf, "books", folder, book.flipbookName),
        path.join(storageRoot, uf, "books", "default", book.flipbookName),
        path.join(storageRoot, uf, "books", book.flipbookName),
        path.join(storageRoot, uf, folder, book.flipbookName),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          wsBookDir = cand;
          break;
        }
      }
    }

    initFlipbookStorage(wsBookDir);
    const pagesDir = path.join(wsBookDir, "pages");

    const cleanNewName = trimmedNewName.replace(/[\\/:*?"<>|]/g, "").trim();
    const newFileName = cleanNewName.endsWith(".svg")
      ? cleanNewName
      : `${cleanNewName}.svg`;
    const newFilePath = path.join(pagesDir, newFileName);

    const oldCandidateNames = [
      prevFileName,
      `${prevName}.svg`,
      oldPageName ? `${oldPageName}.svg` : null,
      `${page.pageNumber}.svg`,
      `Page ${page.pageNumber}.svg`,
    ].filter(Boolean);

    let foundOldFilePath = null;
    for (const oldName of oldCandidateNames) {
      const p = path.join(pagesDir, oldName);
      if (fs.existsSync(p)) {
        foundOldFilePath = p;
        break;
      }
    }

    let pageSvgContent = page.html || page.content || "";

    if (foundOldFilePath) {
      try {
        const diskContent = fs.readFileSync(foundOldFilePath, "utf8");
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
            console.error(
              "[Book Controller] Fallback copy/unlink error:",
              copyErr.message,
            );
          }
        }
      }
    } else {
      if (!pageSvgContent || !pageSvgContent.trim()) {
        const pageWidth = 595;
        const pageHeight = 842;
        const gId = `g_page_${page.pageNumber}_${crypto.randomBytes(4).toString("hex")}`;
        const rectId = `rect_${page.pageNumber}_${crypto.randomBytes(4).toString("hex")}`;
        pageSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${pageWidth} ${pageHeight}" width="100%" height="100%" style="overflow: visible"><defs></defs><g id="${gId}" data-name="${trimmedNewName}" data-type="frame"><rect id="${rectId}" x="0" y="0" width="${pageWidth}" height="${pageHeight}" fill="#ffffff" data-name="Overlay" data-type="background" data-locked="true" shape-rendering="crispEdges"/></g></svg>`;
      }
      fs.writeFileSync(newFilePath, pageSvgContent, "utf8");
    }

    if (fs.existsSync(newFilePath)) {
      try {
        let svgStr = fs.readFileSync(newFilePath, "utf8");
        if (svgStr.includes('data-name="')) {
          svgStr = svgStr.replace(
            /(<g\b[^>]*\bdata-type="frame"[^>]*\bdata-name=")[^"]*(")/i,
            `$1${trimmedNewName}$2`,
          );
          svgStr = svgStr.replace(
            /(<g\b[^>]*\bdata-name=")[^"]*("[^>]*\bdata-type="frame")/i,
            `$1${trimmedNewName}$2`,
          );
          fs.writeFileSync(newFilePath, svgStr, "utf8");
          pageSvgContent = svgStr;
        }
      } catch (xmlErr) {}
    }

    book.pages[pageIndex].name = trimmedNewName;
    book.pages[pageIndex].fileName = newFileName;
    book.lastUpdated = new Date();
    book.markModified("pages");
    await book.save();

    return res.status(200).json({
      success: true,
      message: "Page renamed successfully and physical file updated",
      pageNumber: page.pageNumber,
      name: trimmedNewName,
      fileName: newFileName,
    });
  } catch (error) {
    console.error("[Book Controller] Error renaming page:", error);
    return res.status(500).json({
      success: false,
      message: "Server error renaming page",
      error: error.message,
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
    const {
      v_id,
      pageId,
      pageNumber,
      fileName,
      oldPageName,
      emailId: reqEmail,
    } = req.body;
    const emailId = authEmail || reqEmail;

    if (!v_id) {
      return res.status(400).json({
        success: false,
        message: "v_id is required",
      });
    }

    const book = await Flipbook.findOne({ v_id });
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Flipbook not found" });
    }

    if (
      emailId &&
      book.userEmail &&
      book.userEmail.toLowerCase() !== emailId.toLowerCase()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to modify this flipbook",
        });
    }

    book.pages = book.pages || [];
    if (book.pages.length <= 1) {
      return res.status(400).json({
        success: false,
        message:
          "A flipbook must have at least one page. Cannot delete the only remaining page.",
      });
    }

    let pageIndex = -1;
    if (pageId) {
      pageIndex = book.pages.findIndex(
        (p) => p.v_id === pageId || p.id === pageId,
      );
    }
    if (pageIndex === -1 && pageNumber !== undefined) {
      pageIndex = book.pages.findIndex(
        (p) => p.pageNumber === Number(pageNumber),
      );
    }
    if (pageIndex === -1 && fileName) {
      pageIndex = book.pages.findIndex((p) => p.fileName === fileName);
    }
    if (pageIndex === -1 && oldPageName) {
      pageIndex = book.pages.findIndex((p) => p.name === oldPageName);
    }

    if (pageIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found in flipbook" });
    }

    const pageToDelete = book.pages[pageIndex];

    const storageRoot = getStorageRoot();
    const userFolders = [
      book.userID,
      book.userId ? String(book.userId) : null,
      customUserId,
      objectId ? String(objectId) : null,
      emailId ? emailId.replace(/[@.]/g, "_") : null,
      book.userEmail ? book.userEmail.replace(/[@.]/g, "_") : null,
    ].filter(Boolean);

    const folder = resolveFolder(book.folderName);

    // Find real existing bookDir on disk
    const dirVariants = [
      book.flipbookName,
      book.v_id ? `${book.flipbookName}_${book.v_id}` : null,
      book.v_id,
    ].filter(Boolean);

    let wsBookDir = path.join(
      storageRoot,
      userFolders[0] || "default",
      "books",
      folder,
      book.flipbookName,
    );
    let foundDir = false;

    for (const uf of userFolders) {
      if (foundDir) break;
      for (const variant of dirVariants) {
        const candidates = [
          path.join(storageRoot, uf, "books", folder, variant),
          path.join(storageRoot, uf, "books", "default", variant),
          path.join(storageRoot, uf, "books", variant),
          path.join(storageRoot, uf, folder, variant),
          path.join(storageRoot, uf, variant),
        ];
        for (const cand of candidates) {
          if (fs.existsSync(cand)) {
            wsBookDir = cand;
            foundDir = true;
            break;
          }
        }
        if (foundDir) break;

        const booksDir = path.join(storageRoot, uf, "books");
        if (fs.existsSync(booksDir)) {
          try {
            const subdirs = fs.readdirSync(booksDir);
            for (const sd of subdirs) {
              const nestedCand = path.join(booksDir, sd, variant);
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

    const pagesDir = path.join(wsBookDir, "pages");

    const otherPages = book.pages.filter((_, idx) => idx !== pageIndex);
    const otherFileNames = new Set();
    otherPages.forEach((p) => {
      if (p.fileName) otherFileNames.add(p.fileName.toLowerCase());
      if (p.name) otherFileNames.add(`${p.name.toLowerCase()}.svg`);
    });

    const candidateFilesToRemove = [
      pageToDelete.fileName,
      fileName,
      pageToDelete.name ? `${pageToDelete.name}.svg` : null,
      oldPageName ? `${oldPageName}.svg` : null,
      pageToDelete.name ? `${pageToDelete.name}.html` : null,
    ].filter(Boolean);

    // Only delete candidate files that do NOT belong to any remaining active page!
    const filesToRemove = candidateFilesToRemove.filter(
      (f) => !otherFileNames.has(f.toLowerCase()),
    );

    if (fs.existsSync(pagesDir)) {
      filesToRemove.forEach((f) => {
        try {
          const filePath = path.join(pagesDir, f);
          if (fs.existsSync(filePath)) {
            console.log(
              `[Book Controller] Deleting page file from disk: ${filePath}`,
            );
            fs.unlinkSync(filePath);
          }
        } catch (unlinkErr) {
          console.warn(
            "[Book Controller] Could not delete page file:",
            f,
            unlinkErr.message,
          );
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
    book.markModified("pages");
    await book.save();

    return res.status(200).json({
      success: true,
      message: "Page deleted and physical file removed from disk",
      totalPages: book.pages.length,
      pages: book.pages,
    });
  } catch (error) {
    console.error("[Book Controller] Error deleting page:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting page",
      error: error.message,
    });
  }
};

