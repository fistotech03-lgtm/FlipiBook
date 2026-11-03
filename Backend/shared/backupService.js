// Backend/shared/backupService.js
const mongoose = require('mongoose');

let backupConn = null;
let isConnecting = false;
let hasLoggedConnectionAttempt = false;

/**
 * Get backup MongoDB connection string
 */
const getBackupUri = () => {
  return process.env.BACKUP_MONGO_URI || null;
};

/**
 * Extract client IP address safely from request
 */
const getClientIp = (req) => {
  if (!req) return 'unknown';
  try {
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded && typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || req.ip || 'unknown';
  } catch (_) {
    return 'unknown';
  }
};

/**
 * Extract User-Agent header from request
 */
const getUserAgent = (req) => {
  if (!req || !req.headers) return 'unknown';
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Obtain or initialize the isolated secondary Mongoose connection pool for backup
 */
const getBackupConnection = async () => {
  const uri = getBackupUri();
  if (!uri) return null;

  if (backupConn && backupConn.readyState === 1) {
    return backupConn;
  }

  if (isConnecting) {
    let attempts = 0;
    while (isConnecting && attempts < 10) {
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }
    if (backupConn && backupConn.readyState === 1) return backupConn;
  }

  try {
    isConnecting = true;
    if (!hasLoggedConnectionAttempt) {
      console.log('[Backup DB] Initializing connection to backup database...');
      hasLoggedConnectionAttempt = true;
    }

    backupConn = mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
      autoIndex: false
    });

    backupConn.on('error', (err) => {
      // Graceful error logging - suppressed from breaking any live application requests
      console.warn('[Backup DB Note]:', err.message);
    });

    backupConn.on('connected', () => {
      console.log(`[Backup DB] Connected to VPS backup database: "${backupConn.name}"`);
    });

    backupConn.on('disconnected', () => {
      console.warn('[Backup DB] Disconnected from VPS backup database');
    });

    await backupConn.asPromise();
    return backupConn;
  } catch (err) {
    console.warn('[Backup DB] Initial connection skipped or unavailable:', err.message);
    return null;
  } finally {
    isConnecting = false;
  }
};

/**
 * Executes a backup operation completely asynchronously without blocking the caller
 */
const safeAsync = (fn) => {
  setImmediate(async () => {
    try {
      await fn();
    } catch (err) {
      console.warn('[Backup Service Error]:', err.message);
    }
  });
};

/**
 * Helper to ensure a document is converted to a plain object without virtuals (like "id" or "userId" aliases)
 */
const toPlainObject = (doc) => {
  if (!doc) return null;
  let plain = null;
  if (typeof doc.toObject === 'function') {
    plain = doc.toObject({ virtuals: false, aliases: false });
  } else if (doc._doc && typeof doc._doc === 'object') {
    plain = { ...doc._doc };
  } else {
    plain = { ...doc };
  }
  if (plain) {
    delete plain.id;
    if ('userID' in plain && 'userId' in plain) {
      delete plain.userId;
    }
  }
  return plain;
};

/**
 * Helper to build standard deletion audit payload
 */
const buildAuditPayload = (req, user, reason) => {
  const u = user || req?.user || req?.admin || {};
  return {
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: {
      userObjectID: u.rawId || u.id || u._id || u.userObjectID || null,
      userID: u.customUserId || u.userID || u.userId || u.adminId || null,
      emailId: u.emailId || u.email || null
    },
    deletedFromIp: getClientIp(req),
    deletedUserAgent: getUserAgent(req),
    deletionReason: reason || 'USER_DELETE'
  };
};

// ============================================================================
// Core Backup Service API - Live Mirror (Inserts & Updates)
// ============================================================================

/**
 * Synchronize an active or updated flipbook into the backup database
 */
const syncFlipbook = (bookDoc) => {
  safeAsync(async () => {
    const raw = toPlainObject(bookDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const flipbooksCol = conn.collection('flipbooks');
    const query = raw._id ? { _id: raw._id } : { v_id: raw.v_id };

    await flipbooksCol.updateOne(
      query,
      {
        $set: {
          ...raw,
          isDeleted: false
        }
      },
      { upsert: true }
    );
  });
};

/**
 * Synchronize customized viewer settings (Layouts, branding, appearance) into backup DB
 */
const syncCustomizedSettings = (settingsDoc) => {
  safeAsync(async () => {
    const raw = toPlainObject(settingsDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const col = conn.collection('customizedsettings');
    const query = raw._id ? { _id: raw._id } : { v_id: raw.v_id, userID: raw.userID };

    await col.updateOne(query, { $set: { ...raw, isDeleted: false } }, { upsert: true });
  });
};

/**
 * Synchronize page editor layout settings into backup DB
 */
const syncPageEditorSettings = (settingsDoc) => {
  safeAsync(async () => {
    const raw = toPlainObject(settingsDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const col = conn.collection('pageEditorSettings');
    const query = raw._id ? { _id: raw._id } : { v_id: raw.v_id };

    await col.updateOne(query, { $set: { ...raw, isDeleted: false } }, { upsert: true });
  });
};

/**
 * Synchronize a user account document into the backup DB
 */
const syncUser = (userDoc) => {
  safeAsync(async () => {
    const raw = toPlainObject(userDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const col = conn.collection('users');
    const query = raw._id ? { _id: raw._id } : (raw.userID ? { userID: raw.userID } : { emailId: raw.emailId });

    await col.updateOne(query, { $set: { ...raw, isDeleted: false } }, { upsert: true });
  });
};

/**
 * Synchronize user profile into backup DB
 */
const syncProfile = (profileDoc) => {
  safeAsync(async () => {
    const raw = toPlainObject(profileDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const col = conn.collection('Profiles');
    const query = raw._id ? { _id: raw._id } : { user_id: raw.user_id };

    await col.updateOne(query, { $set: { ...raw, isDeleted: false } }, { upsert: true });
  });
};

/**
 * Append or sync a login audit log into backup DB
 */
const syncLoginLog = (logDoc) => {
  safeAsync(async () => {
    const raw = toPlainObject(logDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const col = conn.collection('loginlogs');
    const query = raw._id ? { _id: raw._id } : { sessionId: raw.sessionId };

    await col.updateOne(query, { $set: raw }, { upsert: true });
  });
};

/**
 * Synchronize user persistent media gallery into backup DB
 */
const syncUserGallery = (galleryDoc) => {
  safeAsync(async () => {
    const raw = toPlainObject(galleryDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    // Ensure emailId is unset
    delete raw.emailId;

    const col = conn.collection('userGallery');
    const query = raw._id
      ? { _id: raw._id }
      : (raw.userObjectID ? { userObjectID: raw.userObjectID } : { userID: raw.userID });

    await col.updateOne(
      query,
      {
        $set: raw,
        $unset: { emailId: "" }
      },
      { upsert: true }
    );
  });
};

/**
 * Synchronize a captured lead into backup DB
 */
const syncLead = (leadDoc) => {
  safeAsync(async () => {
    const raw = toPlainObject(leadDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const col = conn.collection('leads');
    const query = raw._id ? { _id: raw._id } : { flipbookId: raw.flipbookId, email: raw.email };

    await col.updateOne(query, { $set: { ...raw, isDeleted: false } }, { upsert: true });
  });
};

/**
 * Synchronize a folder document into backup DB
 */
const syncFolder = (folderDoc) => {
  safeAsync(async () => {
    const raw = toPlainObject(folderDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const col = conn.collection('UserFolders');
    const query = raw._id ? { _id: raw._id } : { userObjectID: raw.userObjectID };

    await col.updateOne(query, { $set: { ...raw, isDeleted: false } }, { upsert: true });
  });
};

// ============================================================================
// Core Backup Service API - Deletions with Audit Preservation
// ============================================================================

/**
 * Record a permanently deleted flipbook (or empty trash) into the backup database.
 * Sets isDeleted: true, deletedAt, deletedBy, deletedFromIp, deletedUserAgent, deletionReason.
 * Also preserves associated customizedsettings, pageEditorSettings, and leads in backup DB.
 */
const recordFlipbookDeletion = (bookDoc, options = {}) => {
  safeAsync(async () => {
    const raw = toPlainObject(bookDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const { req, user, reason } = options;
    const audit = buildAuditPayload(req, user, reason || 'PERMANENT_DELETE');

    const payload = {
      ...raw,
      ...audit
    };

    const flipbooksCol = conn.collection('flipbooks');
    const query = raw._id ? { _id: raw._id } : { v_id: raw.v_id };

    await flipbooksCol.updateOne(query, { $set: payload }, { upsert: true });

    // Also soft-delete associated customizedsettings in backup DB so layout/settings can be restored
    if (raw.v_id) {
      try {
        await conn.collection('customizedsettings').updateMany(
          { v_id: raw.v_id },
          { $set: audit }
        );
        await conn.collection('pageEditorSettings').updateMany(
          { v_id: raw.v_id },
          { $set: audit }
        );
        await conn.collection('leads').updateMany(
          { v_id: raw.v_id },
          { $set: audit }
        );
      } catch (childErr) {
        console.warn('[Backup DB] Child settings soft-delete note:', childErr.message);
      }
    }

    console.log(`[Backup DB] Successfully recorded deletion for flipbook: "${raw.flipbookName || raw.v_id}" (Reason: ${audit.deletionReason})`);
  });
};

/**
 * Record a deleted lead in the backup database
 */
const recordLeadDeletion = (leadDoc, options = {}) => {
  safeAsync(async () => {
    const raw = toPlainObject(leadDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const { req, user, reason } = options;
    const audit = buildAuditPayload(req, user, reason || 'LEAD_DELETE');

    const col = conn.collection('leads');
    const query = raw._id ? { _id: raw._id } : { leadId: raw.leadId };

    await col.updateOne(
      query,
      {
        $set: {
          ...raw,
          ...audit
        }
      },
      { upsert: true }
    );
    console.log(`[Backup DB] Successfully recorded deletion for lead: "${raw.leadId || raw._id}"`);
  });
};

/**
 * Record a deleted user folder in the backup database (stored in UserFolders collection)
 */
const recordFolderDeletion = (folderData, options = {}) => {
  safeAsync(async () => {
    const conn = await getBackupConnection();
    if (!conn) return;

    const { req, user, reason } = options;
    const audit = buildAuditPayload(req, user, reason || 'FOLDER_DELETE');

    const col = conn.collection('UserFolders');
    const query = folderData._id
      ? { _id: folderData._id }
      : (folderData.folderId
        ? { 'folders.fol_v_id': String(folderData.folderId) }
        : (audit.deletedBy.userObjectID ? { userObjectID: audit.deletedBy.userObjectID } : null));

    if (query) {
      await col.updateOne(
        query,
        {
          $push: {
            deletedFolders: {
              ...folderData,
              ...audit
            }
          },
          $set: {
            lastDeletedFolder: folderData,
            ...audit
          }
        },
        { upsert: false }
      ).catch(() => {});
    }
    console.log(`[Backup DB] Successfully recorded deletion for folder in UserFolders: "${folderData.folderName || folderData.folderId}"`);
  });
};

/**
 * Record deleted gallery assets in backup DB (stored in userGallery collection):
 * 1. Pushes deleted items into the "deletedAssets" array inside userGallery document with full audit info.
 * 2. Mirrors the $pull operation on the active media arrays in userGallery.
 */
const recordGalleryAssetDeletion = (deletionInfo, options = {}) => {
  safeAsync(async () => {
    const conn = await getBackupConnection();
    if (!conn) return;

    const { req, user, reason } = options;
    const audit = buildAuditPayload(req, user, reason || 'USER_GALLERY_DELETE');

    const {
      userFolder,
      userObjectID,
      userID,
      category = 'pageEditorgallery',
      targetName,
      file_v_id,
      url,
      asset,
      assets = [],
      matchCriteria,
      ugConds
    } = deletionInfo;

    const itemsToArchive = [];
    if (asset) itemsToArchive.push(asset);
    if (Array.isArray(assets) && assets.length > 0) itemsToArchive.push(...assets);
    if (itemsToArchive.length === 0 && (targetName || file_v_id || url)) {
      itemsToArchive.push({
        convertedName: targetName || file_v_id,
        file_v_id: file_v_id || targetName,
        url: url || ''
      });
    }

    const userGalleryCol = conn.collection('userGallery');
    const targetQuery = ugConds && ugConds.length > 0
      ? { $or: ugConds }
      : (userObjectID
        ? { userObjectID }
        : (userID ? { userID } : null));

    if (targetQuery) {
      // 1. Archive deleted asset items inside userGallery.deletedAssets
      await userGalleryCol.updateMany(
        targetQuery,
        {
          $push: {
            deletedAssets: {
              $each: itemsToArchive.map(item => ({
                ...item,
                category,
                ...audit
              }))
            }
          }
        }
      ).catch(() => {});

      // 2. Mirror removal from active media arrays in userGallery
      if (matchCriteria && matchCriteria.length > 0) {
        await userGalleryCol.updateMany(
          targetQuery,
          {
            $pull: {
              'pageEditorgallery.images': { $or: matchCriteria },
              'pageEditorgallery.video': { $or: matchCriteria },
              'pageEditorgallery.gif': { $or: matchCriteria },
              'CustomizationGallery.images': { $or: matchCriteria },
              'CustomizationGallery.videos': { $or: matchCriteria },
              'userdetails.images': { $or: matchCriteria }
            }
          }
        ).catch(() => {});
      }
    }

    console.log(`[Backup DB] Successfully recorded ${itemsToArchive.length} deleted asset(s) in userGallery`);
  });
};

/**
 * Record user account deletion in backup DB (marks user & profile as deleted with audit)
 */
const recordUserDeletion = (userDoc, options = {}) => {
  safeAsync(async () => {
    const raw = toPlainObject(userDoc);
    if (!raw) return;

    const conn = await getBackupConnection();
    if (!conn) return;

    const { req, user, reason } = options;
    const audit = buildAuditPayload(req, user, reason || 'USER_ACCOUNT_DELETE');

    const usersCol = conn.collection('users');
    const profilesCol = conn.collection('Profiles');
    const query = raw._id ? { _id: raw._id } : { userID: raw.userID };

    await usersCol.updateOne(query, { $set: { status: 'DELETED', ...audit } });
    await profilesCol.updateOne({ user_id: raw._id }, { $set: { ...audit } });

    console.log(`[Backup DB] Successfully recorded account deletion for user: "${raw.userID || raw.emailId}"`);
  });
};

module.exports = {
  getBackupConnection,
  getClientIp,
  getUserAgent,
  // Live Sync
  syncFlipbook,
  syncCustomizedSettings,
  syncPageEditorSettings,
  syncUser,
  syncProfile,
  syncLoginLog,
  syncUserGallery,
  syncLead,
  syncFolder,
  // Deletion Audit
  recordFlipbookDeletion,
  recordLeadDeletion,
  recordFolderDeletion,
  recordGalleryAssetDeletion,
  recordUserDeletion
};
