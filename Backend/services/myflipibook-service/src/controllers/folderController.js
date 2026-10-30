const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const UserFolder = require('../models/userFolder');
const Flipbook = require('../../../../shared/models/Flipbook');
const backupService = require('../../../../shared/backupService');
const { deleteFolderStorage, getStorageRoot } = require('../utils/storageHelper');
const { getAuthUser, resolveAuthUser, getUserQuery, getFlipbookUserQuery } = require('../utils/userHelper');

/**
 * GET /api/flipbook/folders
 * Retrieve user's folder list
 */
exports.getFolders = async (req, res) => {
  try {
    const { objectId, customUserId, emailId } = await resolveAuthUser(req);
    const userQuery = getUserQuery(req);
    if (!userQuery) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let userFolderDoc = await UserFolder.findOne(userQuery);

    // 1. Identify or initialize the default folder
    let defaultItem = null;
    const customItems = [];
    const seenNames = new Set();

    if (userFolderDoc && Array.isArray(userFolderDoc.folders)) {
      // Prioritize explicit isDefault flag
      defaultItem = userFolderDoc.folders.find((f) => f && f.isDefault === true);

      // Fallback to legacy default names if isDefault not yet explicitly set
      if (!defaultItem) {
        defaultItem = userFolderDoc.folders.find((f) => {
          if (!f || !f.name) return false;
          const low = String(f.name).trim().toLowerCase();
          return low === 'default' || low === 'my flipbooks';
        });
      }

      // Collect custom folders, avoiding duplicates
      userFolderDoc.folders.forEach((item) => {
        if (!item || !item.name) return;
        const itemFolId = item.fol_v_id || (item._id ? item._id.toString() : String(item.id));
        const defFolId = defaultItem ? (defaultItem.fol_v_id || (defaultItem._id ? defaultItem._id.toString() : '')) : '';
        if (defaultItem && (item === defaultItem || (defFolId && itemFolId === defFolId))) {
          return;
        }
        const trimmedName = String(item.name).trim();
        const low = trimmedName.toLowerCase();
        if (!seenNames.has(low)) {
          seenNames.add(low);
          const fol_v_id = item.fol_v_id || ('fol_' + (item._id ? item._id.toString() : crypto.randomBytes(6).toString('hex')));
          customItems.push({
            id: fol_v_id,
            fol_v_id,
            name: trimmedName,
            isDefault: false
          });
        }
      });
    }

    // Ensure default folder item exists with a generated unique fol_v_id
    const defaultFolId = (defaultItem && defaultItem.fol_v_id && defaultItem.fol_v_id !== 'fol_default')
      ? defaultItem.fol_v_id
      : ('fol_' + crypto.randomBytes(6).toString('hex'));
    if (!defaultItem) {
      defaultItem = {
        fol_v_id: defaultFolId,
        name: 'default',
        isDefault: true
      };
    } else {
      defaultItem.isDefault = true;
      defaultItem.fol_v_id = defaultFolId;
    }

    const defaultStoredName = String(defaultItem.name || 'default').trim();
    // In frontend, default folder displays as 'My Flipbooks' unless user renamed it to something custom
    const defaultDisplayName = defaultStoredName === 'default' ? 'My Flipbooks' : defaultStoredName;
    seenNames.add(defaultDisplayName.toLowerCase());
    if (defaultStoredName !== defaultDisplayName) {
      seenNames.add(defaultStoredName.toLowerCase());
    }

    // 2. Auto-discover any real custom folders on Flipbook documents
    const flipQuery = getFlipbookUserQuery(req);
    if (flipQuery) {
      const distinctFolders = await Flipbook.distinct('folderName', flipQuery);
      distinctFolders.forEach((f) => {
        const candidates = Array.isArray(f) ? f : [f];
        candidates.forEach((name) => {
          if (name && typeof name === 'string') {
            const trimmed = name.trim();
            const low = trimmed.toLowerCase();
            const isSystem = (
              low === 'recent book' || low === 'recent' ||
              low === 'trash' || low === 'favorites' ||
              low === 'all flipbook' || low === 'all flipbooks'
            );
            const isDef = (
              low === 'default' ||
              low === defaultStoredName.toLowerCase() ||
              low === defaultDisplayName.toLowerCase()
            );
            if (!isSystem && !isDef && !seenNames.has(low)) {
              seenNames.add(low);
              const fol_v_id = 'fol_' + crypto.randomBytes(6).toString('hex');
              customItems.push({
                id: fol_v_id,
                fol_v_id,
                name: trimmed,
                isDefault: false
              });
            }
          }
        });
      });
    }

    // 3. Assemble final unique list with default folder at the top
    const orderedFolders = [
      {
        id: defaultFolId,
        fol_v_id: defaultFolId,
        name: defaultDisplayName,
        rawName: defaultStoredName,
        isDefault: true
      },
      ...customItems
    ];

    // Auto-sync in MongoDB with fol_v_id
    const formattedSubdocs = [
      {
        fol_v_id: defaultFolId,
        name: defaultStoredName,
        isDefault: true
      },
      ...customItems.map((c) => ({
        fol_v_id: c.fol_v_id || c.id,
        name: c.name,
        isDefault: false
      }))
    ];

    if (userFolderDoc) {
      if (objectId) userFolderDoc.userObjectID = objectId;
      if (customUserId && !userFolderDoc.userID) userFolderDoc.userID = customUserId;
      userFolderDoc.folders = formattedSubdocs;
      await userFolderDoc.save().catch(() => {});
    } else {
      await UserFolder.create({
        ...(objectId ? { userObjectID: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
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
    const { objectId, customUserId, emailId } = await resolveAuthUser(req);
    const userQuery = getUserQuery(req);
    const { folderName } = req.body;

    if (!userQuery || !folderName) {
      return res.status(400).json({ success: false, message: 'Missing user credentials or folderName' });
    }

    const safeFolderName = folderName.replace(/[^a-zA-Z0-9 _-]/g, '').trim();
    if (!safeFolderName) {
      return res.status(400).json({ success: false, message: 'Invalid folder name' });
    }

    const lowerSafe = safeFolderName.toLowerCase();

    // Disallow system virtual folder names
    const systemNames = ['recent book', 'recent', 'trash', 'favorites', 'all flipbook', 'all flipbooks'];
    if (systemNames.includes(lowerSafe)) {
      return res.status(400).json({ success: false, message: 'This is a reserved folder name' });
    }

    const newFolId = 'fol_' + crypto.randomBytes(6).toString('hex');
    let userFolderDoc = await UserFolder.findOne(userQuery);

    if (userFolderDoc && Array.isArray(userFolderDoc.folders)) {
      // Enforce strict uniqueness among user's folders (checking both stored name and display name)
      const exists = userFolderDoc.folders.some((f) => {
        if (!f || !f.name) return false;
        const fLow = String(f.name).toLowerCase().trim();
        if (f.isDefault && fLow === 'default' && lowerSafe === 'my flipbooks') return true;
        return fLow === lowerSafe;
      });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Folder with this name already exists' });
      }

      if (objectId) userFolderDoc.userObjectID = objectId;
      if (customUserId && !userFolderDoc.userID) userFolderDoc.userID = customUserId;
      userFolderDoc.folders.push({ fol_v_id: newFolId, name: safeFolderName, isDefault: false });
      await userFolderDoc.save();
    } else {
      const defaultFolId = 'fol_' + crypto.randomBytes(6).toString('hex');
      await UserFolder.create({
        ...(objectId ? { userObjectID: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
        folders: [
          { fol_v_id: defaultFolId, name: 'default', isDefault: true },
          { fol_v_id: newFolId, name: safeFolderName, isDefault: false }
        ]
      });
    }

    // Create physical directory under storage/<userFolder>/books/<safeFolderName>
    try {
      const storageRoot = getStorageRoot();
      const userFolder = customUserId || (objectId ? String(objectId) : (emailId ? emailId.replace(/[@.]/g, '_') : 'default'));
      const targetDir = path.join(storageRoot, userFolder, 'books', safeFolderName);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`[Folder Controller] Created physical folder: ${targetDir}`);
      }
    } catch (fsErr) {
      console.error('[Folder Controller] Error creating physical folder on disk:', fsErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Folder created',
      folder: safeFolderName,
      id: newFolId,
      fol_v_id: newFolId,
      isDefault: false
    });
  } catch (err) {
    console.error('[Folder Controller] Error creating folder:', err);
    res.status(500).json({ success: false, message: 'Server error creating folder' });
  }
};

/**
 * POST /api/flipbook/folder/rename
 * Rename an existing folder (including the default folder)
 */
exports.renameFolder = async (req, res) => {
  try {
    const { objectId, customUserId, emailId } = await resolveAuthUser(req);
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

    const lowerNew = safeNewName.toLowerCase();
    const systemNames = ['recent book', 'recent', 'trash', 'favorites', 'all flipbook', 'all flipbooks'];
    if (systemNames.includes(lowerNew)) {
      return res.status(400).json({ success: false, message: 'This is a reserved folder name' });
    }

    let userFolderDoc = await UserFolder.findOne(userQuery);
    if (!userFolderDoc || !Array.isArray(userFolderDoc.folders)) {
      return res.status(404).json({ success: false, message: 'Folder records not found' });
    }

    // Find target folder
    let targetFolder = null;
    if (folderId) {
      targetFolder = userFolderDoc.folders.find((f) => (f.fol_v_id === String(folderId)) || (f._id ? f._id.toString() : String(f.id)) === String(folderId));
    }
    if (!targetFolder && oldName) {
      const lowerOld = oldName.toLowerCase().trim();
      targetFolder = userFolderDoc.folders.find((f) => {
        const fLow = (f.name || '').toLowerCase().trim();
        if (f.isDefault && (lowerOld === 'my flipbooks' || lowerOld === 'default')) return true;
        return fLow === lowerOld;
      });
    }

    if (!targetFolder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Enforce folder name uniqueness among user's folders
    const duplicate = userFolderDoc.folders.some((f) => {
      if (f === targetFolder || (f._id && targetFolder._id && f._id.toString() === targetFolder._id.toString())) {
        return false;
      }
      const fLow = (f.name || '').toLowerCase().trim();
      if (f.isDefault && fLow === 'default' && lowerNew === 'my flipbooks') return true;
      return fLow === lowerNew;
    });

    if (duplicate) {
      return res.status(409).json({ success: false, message: 'Folder with this name already exists' });
    }

    const isDefault = Boolean(targetFolder.isDefault);
    const oldDiskName = (isDefault && targetFolder.name === 'default') ? 'default' : targetFolder.name;

    // 1. Update in UserFolder
    targetFolder.name = safeNewName;
    if (isDefault) {
      targetFolder.isDefault = true;
    }
    await userFolderDoc.save();

    // 2. Cascade rename across user's flipbooks
    if (flipQuery) {
      const candidateOldNames = [oldName, targetFolder.name, oldDiskName];
      if (isDefault) {
        candidateOldNames.push('default', 'My Flipbooks', 'My_Flipbooks');
      }
      const uniqueOlds = Array.from(new Set(candidateOldNames.filter(Boolean)));

      await Flipbook.updateMany(
        { ...flipQuery, folderName: { $in: uniqueOlds } },
        { $set: { folderName: [safeNewName] } }
      );
    }

    // 3. Rename physical directory on disk under books/<oldDiskName> -> books/<safeNewName>
    try {
      const storageRoot = getStorageRoot();
      const userFolder = customUserId || (objectId ? String(objectId) : (emailId ? emailId.replace(/[@.]/g, '_') : 'default'));
      const oldDir = path.join(storageRoot, userFolder, 'books', oldDiskName);
      const newDir = path.join(storageRoot, userFolder, 'books', safeNewName);

      if (fs.existsSync(oldDir)) {
        if (!fs.existsSync(newDir)) {
          fs.renameSync(oldDir, newDir);
          console.log(`[Folder Controller] Renamed physical folder: ${oldDir} -> ${newDir}`);
        }
      } else {
        if (!fs.existsSync(newDir)) {
          fs.mkdirSync(newDir, { recursive: true });
        }
      }
    } catch (renErr) {
      console.error('[Folder Controller] Error renaming physical folder on disk:', renErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Folder renamed successfully',
      oldName,
      newName: safeNewName,
      id: targetFolder.fol_v_id || (targetFolder._id ? targetFolder._id.toString() : String(folderId)),
      fol_v_id: targetFolder.fol_v_id,
      isDefault
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
    const { objectId, customUserId, emailId } = await resolveAuthUser(req);
    const userQuery = getUserQuery(req);
    const { folders } = req.body;

    if (!userQuery || !Array.isArray(folders)) {
      return res.status(400).json({ success: false, message: 'Missing user credentials or folders array' });
    }

    const currentDoc = await UserFolder.findOne(userQuery);
    const existingFolders = currentDoc?.folders || [];

    const safeFolders = folders
      .filter((f) => {
        const name = typeof f === 'string' ? f : f?.name;
        const low = String(name || '').toLowerCase();
        return name && low !== 'recent book' && low !== 'recent' && low !== 'favorites' && low !== 'trash';
      })
      .map((f) => {
        const name = typeof f === 'string' ? f.trim() : String(f.name).trim();
        const rawId = typeof f === 'object' ? (f.fol_v_id || f._id || f.id) : null;
        const matched = existingFolders.find(
          (ex) => (rawId && (ex.fol_v_id === String(rawId) || ex._id?.toString() === String(rawId) || String(ex.id) === String(rawId))) || ex.name === name
        );
        const mongoId = (rawId && mongoose.Types.ObjectId.isValid(rawId) && /^[0-9a-fA-F]{24}$/.test(String(rawId)))
          ? new mongoose.Types.ObjectId(rawId)
          : (matched?._id || new mongoose.Types.ObjectId());
        const fol_v_id = matched?.fol_v_id || (rawId && String(rawId).startsWith('fol_') ? String(rawId) : ('fol_' + crypto.randomBytes(6).toString('hex')));
        return {
          _id: mongoId,
          fol_v_id,
          name: (matched?.isDefault && matched?.name === 'default') ? 'default' : name,
          isDefault: Boolean(matched?.isDefault || f.isDefault)
        };
      });

    if (currentDoc) {
      if (objectId) {
        if (!currentDoc.userId) currentDoc.userId = objectId;
        if (!currentDoc.userObjectID) currentDoc.userObjectID = objectId;
      }
      if (customUserId && !currentDoc.userID) currentDoc.userID = customUserId;
      if (emailId && !currentDoc.emailId) currentDoc.emailId = emailId;
      currentDoc.folders = safeFolders;
      await currentDoc.save();
    } else {
      currentDoc = await UserFolder.create({
        ...(objectId ? { userId: objectId, userObjectID: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
        emailId,
        folders: safeFolders
      });
    }

    const formattedFolders = (currentDoc.folders || []).map((f) => ({
      id: f.fol_v_id || (f._id ? f._id.toString() : String(f.id)),
      fol_v_id: f.fol_v_id || (f._id ? f._id.toString() : String(f.id)),
      name: (f.isDefault && f.name === 'default') ? 'My Flipbooks' : f.name,
      isDefault: Boolean(f.isDefault)
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

    const userFolderDoc = await UserFolder.findOne(userQuery);
    let targetFolder = null;
    if (userFolderDoc && Array.isArray(userFolderDoc.folders)) {
      if (folderId) {
        targetFolder = userFolderDoc.folders.find((f) => (f.fol_v_id === String(folderId)) || (f._id ? f._id.toString() : String(f.id)) === String(folderId));
      }
      if (!targetFolder && folderName) {
        const lowerName = folderName.toLowerCase().trim();
        targetFolder = userFolderDoc.folders.find((f) => {
          const fLow = (f.name || '').toLowerCase().trim();
          if (f.isDefault && (lowerName === 'my flipbooks' || lowerName === 'default')) return true;
          return fLow === lowerName;
        });
      }
    }

    if (targetFolder && targetFolder.isDefault) {
      return res.status(400).json({ success: false, message: 'Default folder cannot be deleted' });
    }

    const lowerName = (folderName || (targetFolder ? targetFolder.name : '')).toLowerCase().trim();
    if (lowerName === 'my flipbooks' || lowerName === 'default') {
      return res.status(400).json({ success: false, message: 'Default folder cannot be deleted' });
    }

    const resolvedName = targetFolder ? targetFolder.name : folderName;

    // 1. Remove from UserFolder document
    if (userFolderDoc) {
      userFolderDoc.folders = userFolderDoc.folders.filter((f) => {
        if (folderId && ((f.fol_v_id === String(folderId)) || (f._id ? f._id.toString() : String(f.id)) === String(folderId))) return false;
        if (resolvedName && f.name.toLowerCase() === resolvedName.toLowerCase()) return false;
        return true;
      });
      await userFolderDoc.save();
    }

    // Record folder deletion in backup DB
    backupService.recordFolderDeletion(
      {
        folderId: folderId || (targetFolder ? (targetFolder.fol_v_id || targetFolder._id) : null),
        folderName: resolvedName,
        targetFolder
      },
      {
        req,
        user: { customUserId, rawId, emailId },
        reason: 'USER_DELETE'
      }
    );

    // 2. Cascade delete all books in this custom folder
    if ((resolvedName || folderId) && flipQuery) {
      const folderBooks = await Flipbook.find({
        ...flipQuery,
        $or: [
          ...(folderId ? [{ folder_id: String(folderId) }] : []),
          ...(resolvedName ? [{ folderName: resolvedName }, { folderName: { $in: [resolvedName] } }] : [])
        ]
      }).lean();
      const folderVIds = folderBooks.map(b => b.v_id).filter(Boolean);

      // Record cascade deletion for each book in backup DB
      folderBooks.forEach((book) => {
        backupService.recordFlipbookDeletion(book, {
          req,
          user: { customUserId, rawId, emailId },
          reason: 'FOLDER_CASCADE_DELETE'
        });
      });

      // Execute database deletions in parallel
      const dbOps = [
        Flipbook.deleteMany({
          ...flipQuery,
          $or: [
            ...(folderId ? [{ folder_id: String(folderId) }] : []),
            ...(resolvedName ? [{ folderName: resolvedName }, { folderName: { $in: [resolvedName] } }] : [])
          ]
        })
      ];

      if (folderVIds.length > 0 && mongoose.connection && mongoose.connection.db) {
        dbOps.push(
          mongoose.connection.db
            .collection('customizedsettings')
            .deleteMany({ v_id: { $in: folderVIds } })
            .catch(() => {}),
          mongoose.connection.db
            .collection('leads')
            .deleteMany({ v_id: { $in: folderVIds } })
            .catch(() => {})
        );
      }

      await Promise.allSettled(dbOps);

      if (resolvedName) {
        deleteFolderStorage(customUserId || rawId, emailId, resolvedName);
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
    const { objectId, customUserId, emailId } = await resolveAuthUser(req);
    const userQuery = getUserQuery(req);
    const flipQuery = getFlipbookUserQuery(req);
    const { folderName } = req.body;

    if (!userQuery || !folderName) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const newFolderName = `${folderName.trim()} Copy`;
    const newId = new mongoose.Types.ObjectId();

    let userFolderDoc = await UserFolder.findOne(userQuery);
    const newFolVId = 'fol_' + crypto.randomBytes(6).toString('hex');
    if (userFolderDoc) {
      userFolderDoc.folders.push({ fol_v_id: newFolVId, name: newFolderName, isDefault: false });
      await userFolderDoc.save();
    } else {
      const defaultFolId = 'fol_' + crypto.randomBytes(6).toString('hex');
      userFolderDoc = await UserFolder.create({
        ...(objectId ? { userObjectID: objectId } : {}),
        ...(customUserId ? { userID: customUserId } : {}),
        folders: [
          { fol_v_id: defaultFolId, name: 'default', isDefault: true },
          { fol_v_id: newFolVId, name: newFolderName, isDefault: false }
        ]
      });
    }

    // Duplicate all books in this folder
    if (flipQuery) {
      const books = await Flipbook.find({
        ...flipQuery,
        $or: [{ folder_id: folderName }, { folderName }, { folderName: { $in: [folderName] } }]
      });

      for (const b of books) {
        const clone = b.toObject();
        delete clone._id;
        delete clone.createdAt;
        delete clone.updatedAt;
        const newVId = crypto.randomBytes(8).toString('hex');
        clone.v_id = newVId;
        clone.book_v_id = newVId;
        if (objectId) {
          clone.userObjectID = objectId;
        }
        if (customUserId) {
          clone.userID = customUserId;
        }
        delete clone.userId;
        delete clone.userEmail;
        delete clone.folderName;
        delete clone.lastUpdated;
        clone.folder_id = newFolVId;
        clone.flipbookName = `${clone.flipbookName} Copy`;
        await Flipbook.create(clone);
      }

      // Copy physical storage assets from source folder to new duplicated folder
      try {
        const storageRoot = getStorageRoot();
        const userFolder = customUserId || (objectId ? String(objectId) : (emailId ? emailId.replace(/[@.]/g, '_') : 'default'));
        const srcFolderDir = path.join(storageRoot, userFolder, 'books', folderName);
        const destFolderDir = path.join(storageRoot, userFolder, 'books', newFolderName);
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
      id: newFolVId,
      fol_v_id: newFolVId
    });
  } catch (err) {
    console.error('[Folder Controller] Error duplicating folder:', err);
    res.status(500).json({ success: false, message: 'Server error duplicating folder' });
  }
};
