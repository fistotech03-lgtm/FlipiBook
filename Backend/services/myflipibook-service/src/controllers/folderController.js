const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const UserFolder = require('../models/UserFolder');
const Flipbook = require('../models/Flipbook');
const { deleteFolderStorage, getStorageRoot } = require('../utils/storageHelper');
const { getAuthUser, getUserQuery, getFlipbookUserQuery } = require('../utils/userHelper');

/**
 * GET /api/flipbook/folders
 * Retrieve user's folder list
 */
exports.getFolders = async (req, res) => {
  try {
    const { objectId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getUserQuery(req);
    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let userFolderDoc = await UserFolder.findOne(userQuery);

    // 1. Gather all folder names from UserFolder document
    const folderMap = new Map();
    const dbOrder = [];

    if (userFolderDoc && Array.isArray(userFolderDoc.folders)) {
      userFolderDoc.folders.forEach((item) => {
        if (item && item.name) {
          const idStr = item._id ? item._id.toString() : String(item.id);
          folderMap.set(item.name, idStr);
          dbOrder.push({ id: idStr, name: item.name });
        }
      });
    }

    // 2. Auto-discover any folders on Flipbook documents
    const flipQuery = getFlipbookUserQuery(req);
    if (flipQuery) {
      const distinctFolders = await Flipbook.distinct('folderName', flipQuery);
      distinctFolders.forEach((f) => {
        const candidates = Array.isArray(f) ? f : [f];
        candidates.forEach((name) => {
          if (
            name &&
            typeof name === 'string' &&
            name !== 'Recent Book' &&
            name !== 'Recent book' &&
            name !== 'Recent' &&
            name !== 'Trash' &&
            name !== 'Favorites' &&
            name !== 'All Flipbook' &&
            name !== 'All Flipbooks'
          ) {
            const trimmed = name.trim();
            if (!folderMap.has(trimmed)) {
              const generatedId = new mongoose.Types.ObjectId().toString();
              folderMap.set(trimmed, generatedId);
            }
          }
        });
      });
    }

    // 3. Guarantee 'My_Flipbooks' default folder
    if (!folderMap.has('My_Flipbooks')) {
      const defaultId = new mongoose.Types.ObjectId().toString();
      folderMap.set('My_Flipbooks', defaultId);
      dbOrder.unshift({ id: defaultId, name: 'My_Flipbooks' });
    }

    // 4. Construct final list maintaining order
    const orderedFolders = [];
    const addedNames = new Set();

    dbOrder.forEach((item) => {
      if (folderMap.has(item.name)) {
        orderedFolders.push(item);
        addedNames.add(item.name);
      }
    });

    Array.from(folderMap.entries()).forEach(([name, id]) => {
      if (!addedNames.has(name)) {
        orderedFolders.push({ id, name });
        addedNames.add(name);
      }
    });

    // Auto-sync in MongoDB with safe ObjectId references
    const formattedSubdocs = orderedFolders.map((f) => ({
      _id: (f.id && mongoose.Types.ObjectId.isValid(f.id) && /^[0-9a-fA-F]{24}$/.test(String(f.id)))
        ? new mongoose.Types.ObjectId(f.id)
        : new mongoose.Types.ObjectId(),
      name: f.name
    }));

    if (userFolderDoc) {
      if (objectId && !userFolderDoc.userId) {
        userFolderDoc.userId = objectId;
      }
      if (customUserId && !userFolderDoc.userID) {
        userFolderDoc.userID = customUserId;
      }
      userFolderDoc.folders = formattedSubdocs;
      await userFolderDoc.save().catch(() => {});
    } else {
      await UserFolder.create({
        ...(objectId ? { userId: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
        emailId,
        folders: formattedSubdocs
      }).catch(() => {});
    }

    res.status(200).json({ success: true, folders: orderedFolders });
  } catch (error) {
    console.error('[Folder Controller] Error fetching folders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching folders' });
  }
};

/**
 * POST /api/flipbook/folder/create
 * Create a new folder referenced by ObjectId userId
 */
exports.createFolder = async (req, res) => {
  try {
    const { objectId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const { folderName } = req.body;

    if (!userQuery || !folderName) {
      return res.status(400).json({ success: false, message: 'Missing user credentials or folderName' });
    }

    const safeFolderName = folderName.replace(/[^a-zA-Z0-9 _-]/g, '').trim();
    if (!safeFolderName) {
      return res.status(400).json({ success: false, message: 'Invalid folder name' });
    }

    const newId = new mongoose.Types.ObjectId();
    let userFolderDoc = await UserFolder.findOne(userQuery);

    if (userFolderDoc) {
      const exists = userFolderDoc.folders.some(
        (f) => f.name.toLowerCase() === safeFolderName.toLowerCase()
      );
      if (exists) {
        return res.status(400).json({ success: false, message: 'Folder with this name already exists' });
      }
      if (objectId && !userFolderDoc.userId) {
        userFolderDoc.userId = objectId;
      }
      if (customUserId && !userFolderDoc.userID) {
        userFolderDoc.userID = customUserId;
      }
      if (emailId && !userFolderDoc.emailId) {
        userFolderDoc.emailId = emailId;
      }
      userFolderDoc.folders.push({ _id: newId, name: safeFolderName });
      await userFolderDoc.save();
    } else {
      await UserFolder.create({
        ...(objectId ? { userId: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
        emailId,
        folders: [{ _id: newId, name: safeFolderName }]
      });
    }

    res.status(201).json({
      success: true,
      message: 'Folder created',
      folder: safeFolderName,
      id: newId.toString()
    });
  } catch (err) {
    console.error('[Folder Controller] Error creating folder:', err);
    res.status(500).json({ success: false, message: 'Server error creating folder' });
  }
};

/**
 * POST /api/flipbook/folder/rename
 * Rename an existing folder
 */
exports.renameFolder = async (req, res) => {
  try {
    const userQuery = getUserQuery(req);
    const flipQuery = getFlipbookUserQuery(req);
    const { oldName, newName, folderId } = req.body;

    if (!userQuery || !oldName || !newName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const safeNewName = newName.replace(/[^a-zA-Z0-9 _-]/g, '').trim();
    if (!safeNewName) {
      return res.status(400).json({ success: false, message: 'Invalid new folder name' });
    }

    // 1. Update in UserFolder
    let resolvedId = folderId || null;
    const userFolderDoc = await UserFolder.findOne(userQuery);
    if (userFolderDoc && Array.isArray(userFolderDoc.folders)) {
      userFolderDoc.folders = userFolderDoc.folders.map((f) => {
        const fIdStr = f._id ? f._id.toString() : String(f.id);
        const isMatch = (folderId && fIdStr === String(folderId)) || f.name === oldName;
        if (isMatch) {
          resolvedId = fIdStr;
          return {
            _id: (mongoose.Types.ObjectId.isValid(fIdStr) && /^[0-9a-fA-F]{24}$/.test(fIdStr))
              ? new mongoose.Types.ObjectId(fIdStr)
              : new mongoose.Types.ObjectId(),
            name: safeNewName
          };
        }
        return f;
      });
      await userFolderDoc.save();
    }

    // 2. Cascade rename across user's flipbooks
    if (flipQuery) {
      await Flipbook.updateMany(
        { ...flipQuery, folderName: oldName },
        { $set: { folderName: [safeNewName] } }
      );
      await Flipbook.updateMany(
        { ...flipQuery, folderName: { $in: [oldName] } },
        { $set: { 'folderName.$': safeNewName } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Folder renamed successfully',
      oldName,
      newName: safeNewName,
      id: resolvedId
    });
  } catch (err) {
    console.error('[Folder Controller] Error renaming folder:', err);
    res.status(500).json({ success: false, message: 'Server error renaming folder' });
  }
};

/**
 * POST /api/flipbook/folder/reorder
 * Persist rearranged folder sequence
 */
exports.reorderFolders = async (req, res) => {
  try {
    const { objectId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const { folders } = req.body;

    if (!userQuery || !Array.isArray(folders)) {
      return res.status(400).json({ success: false, message: 'Missing user credentials or folders array' });
    }

    const safeFolders = folders
      .filter((f) => {
        const name = typeof f === 'string' ? f : f?.name;
        return name && name !== 'Recent Book' && name !== 'Recent' && name !== 'Favorites' && name !== 'Trash';
      })
      .map((f) => {
        const name = typeof f === 'string' ? f.trim() : String(f.name).trim();
        const rawId = typeof f === 'object' ? (f._id || f.id) : null;
        const mongoId = (rawId && mongoose.Types.ObjectId.isValid(rawId) && /^[0-9a-fA-F]{24}$/.test(String(rawId)))
          ? new mongoose.Types.ObjectId(rawId)
          : new mongoose.Types.ObjectId();
        return { _id: mongoId, name };
      });

    const updateFields = { folders: safeFolders };
    if (objectId) {
      updateFields.userId = objectId;
    }
    if (customUserId) {
      updateFields.userID = customUserId;
    }
    if (emailId) {
      updateFields.emailId = emailId;
    }

    const updatedDoc = await UserFolder.findOneAndUpdate(
      userQuery,
      { $set: updateFields },
      { upsert: true, returnDocument: 'after' }
    );

    const formattedFolders = (updatedDoc.folders || []).map((f) => ({
      id: f._id ? f._id.toString() : String(f.id),
      name: f.name
    }));

    res.status(200).json({
      success: true,
      message: 'Folder order updated',
      folders: formattedFolders
    });
  } catch (err) {
    console.error('[Folder Controller] Error reordering folders:', err);
    res.status(500).json({ success: false, message: 'Server error updating folder order' });
  }
};

/**
 * DELETE /api/flipbook/folder
 * Delete a folder and its flipbooks
 */
exports.deleteFolder = async (req, res) => {
  try {
    const { rawId, customUserId, emailId } = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const flipQuery = getFlipbookUserQuery(req);
    const folderName = req.body?.folderName || req.query?.folderName;
    const folderId = req.body?.folderId || req.query?.folderId;

    if (!userQuery || (!folderName && !folderId)) {
      return res.status(400).json({ success: false, message: 'Missing folder identifier' });
    }

    // 1. Remove from UserFolder document
    const pullCondition = [];
    if (folderName) pullCondition.push({ name: folderName });
    if (folderId && mongoose.Types.ObjectId.isValid(folderId) && /^[0-9a-fA-F]{24}$/.test(String(folderId))) {
      pullCondition.push({ _id: new mongoose.Types.ObjectId(folderId) });
    }

    if (pullCondition.length > 0) {
      await UserFolder.findOneAndUpdate(
        userQuery,
        { $pull: { folders: { $or: pullCondition } } }
      );
    }

    // 2. Cascade delete all books in this folder
    if (folderName && flipQuery) {
      const folderBooks = await Flipbook.find({
        ...flipQuery,
        $or: [{ folderName }, { folderName: { $in: [folderName] } }]
      }).select('v_id').lean();
      const folderVIds = folderBooks.map(b => b.v_id).filter(Boolean);

      await Flipbook.deleteMany({
        ...flipQuery,
        $or: [{ folderName }, { folderName: { $in: [folderName] } }]
      });
      deleteFolderStorage(rawId || customUserId, emailId, folderName);

      if (folderVIds.length > 0) {
        try {
          if (mongoose.connection && mongoose.connection.db) {
            await mongoose.connection.db
              .collection('customizedsettings')
              .deleteMany({ v_id: { $in: folderVIds } });
            await mongoose.connection.db
              .collection('leads')
              .deleteMany({ v_id: { $in: folderVIds } });
          }
        } catch (e) {
          console.warn('[Folder Controller] Failed to remove customizedsettings on folder delete:', e.message);
        }
      }
    }

    res.status(200).json({ success: true, message: 'Folder deleted successfully' });
  } catch (err) {
    console.error('[Folder Controller] Error deleting folder:', err);
    res.status(500).json({ success: false, message: 'Server error deleting folder' });
  }
};

/**
 * POST /api/flipbook/folder/duplicate
 * Duplicate folder and clone all books inside it
 */
exports.duplicateFolder = async (req, res) => {
  try {
    const { objectId, customUserId } = getAuthUser(req);
    const userQuery = getUserQuery(req);
    const flipQuery = getFlipbookUserQuery(req);
    const { folderName } = req.body;

    if (!userQuery || !folderName) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const newFolderName = `${folderName.trim()} Copy`;
    const newId = new mongoose.Types.ObjectId();

    await UserFolder.findOneAndUpdate(
      userQuery,
      { $push: { folders: { _id: newId, name: newFolderName } } },
      { upsert: true }
    );

    // Duplicate all books in this folder
    if (flipQuery) {
      const books = await Flipbook.find({
        ...flipQuery,
        $or: [{ folderName }, { folderName: { $in: [folderName] } }]
      });

      const crypto = require('crypto');
      for (const b of books) {
        const clone = b.toObject();
        delete clone._id;
        clone.v_id = crypto.randomBytes(8).toString('hex');
        if (objectId) {
          clone.userId = objectId;
        }
        if (customUserId) {
          clone.userID = customUserId;
        }
        clone.folderName = [newFolderName];
        clone.flipbookName = `${clone.flipbookName} Copy`;
        await Flipbook.create(clone);
      }

      // Copy physical storage assets from source folder to new duplicated folder
      try {
        const storageRoot = getStorageRoot();
        const userFolder = customUserId || (objectId ? String(objectId) : (emailId ? emailId.replace(/[@.]/g, '_') : 'default'));
        const srcFolderDir = path.join(storageRoot, userFolder, 'My_Flipbooks', folderName);
        const destFolderDir = path.join(storageRoot, userFolder, 'My_Flipbooks', newFolderName);
        if (fs.existsSync(srcFolderDir)) {
          fs.cpSync(srcFolderDir, destFolderDir, { recursive: true });
          console.log(`[Folder Controller] Copied physical storage from "${srcFolderDir}" to "${destFolderDir}"`);
        }
      } catch (cpErr) {
        console.error('[Folder Controller] Error copying physical folder assets:', cpErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Folder duplicated',
      folder: newFolderName,
      id: newId.toString()
    });
  } catch (err) {
    console.error('[Folder Controller] Error duplicating folder:', err);
    res.status(500).json({ success: false, message: 'Server error duplicating folder' });
  }
};
