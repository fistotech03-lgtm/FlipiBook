// Backend/services/user-service/src/utils/ticketStorageHelper.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

/**
 * Returns absolute path to root storage directory (e.g. /Backend/storage)
 */
const getStorageRoot = () => {
  return process.env.STORAGE_PATH
    ? path.resolve(process.env.STORAGE_PATH)
    : path.resolve(__dirname, '../../../../storage');
};

/**
 * Sanitize email for folder name fallback
 */
const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return 'anonymous_user';
  return email.trim().toLowerCase().replace(/[@.]/g, '_');
};

/**
 * Resolves user folder name (e.g. 'FLIPI0001' or 'user_gmail_com')
 * @param {string} emailId 
 * @param {string} [explicitUserId] 
 * @returns {Promise<string>}
 */
const resolveUserFolder = async (emailId, explicitUserId = null) => {
  // If explicitUserId is provided (e.g. FLIPI0001)
  if (explicitUserId && /^FLIPI\d+/i.test(explicitUserId.trim())) {
    const userFolder = explicitUserId.trim();
    ensureTicketsDir(userFolder);
    return userFolder;
  }

  let resolvedId = null;

  if (emailId) {
    try {
      const User = require('../../../../shared/models/User');
      const user = await User.findOne({
        emailId: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      }).select('userID');
      if (user && user.userID) {
        resolvedId = user.userID;
      }
    } catch (e) {
      // ignore
    }
  }

  const storageRoot = getStorageRoot();
  if (!resolvedId) {
    try {
      if (fs.existsSync(storageRoot)) {
        const topDirs = fs.readdirSync(storageRoot);
        const flipiDir = topDirs.find(d => /^FLIPI\d+/i.test(d));
        if (flipiDir) {
          resolvedId = flipiDir;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const userFolder = resolvedId || sanitizeEmail(emailId);
  ensureTicketsDir(userFolder);
  return userFolder;
};

/**
 * Ensure Backend/storage/<USER_ID>/tickets directory exists
 */
const ensureTicketsDir = (userFolder) => {
  try {
    const storageRoot = getStorageRoot();
    const ticketsDir = path.join(storageRoot, userFolder, 'tickets');
    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true });
    }
    return ticketsDir;
  } catch (err) {
    console.warn('[ticketStorageHelper] Failed to create tickets dir:', err.message);
    return null;
  }
};

/**
 * Save an individual attachment (decoding Base64 if needed) into Backend/storage/<USER_ID>/tickets/
 * @param {string} userFolder 
 * @param {Object} att 
 * @param {string} [ticketCode] 
 * @returns {Object}
 */
const saveTicketAttachment = (userFolder, att, ticketCode = '') => {
  if (!att) return null;

  const url = att.url || (typeof att === 'string' ? att : '');
  const name = att.name || 'attachment';
  const size = att.size || 0;
  const type = att.type || 'image/jpeg';

  // If not a data URI, it's already an existing file URL
  if (!url || typeof url !== 'string' || !url.startsWith('data:')) {
    return {
      name,
      url,
      size,
      type
    };
  }

  try {
    const match = url.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return { name, url, size, type };
    }

    const contentType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine extension
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('gif')) ext = 'gif';
    else if (contentType.includes('svg')) ext = 'svg';
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
    else if (name && path.extname(name)) {
      ext = path.extname(name).replace('.', '').toLowerCase();
    }

    // Create a safe, clean file name
    const safeBase = (path.parse(name).name || 'ticket_img')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const rand = Math.random().toString(36).substring(2, 7);
    const codePrefix = ticketCode ? `${ticketCode.replace(/[^a-zA-Z0-9_-]/g, '_')}_` : '';
    const fileName = `${codePrefix}${Date.now()}_${rand}_${safeBase}.${ext}`;

    const storageRoot = getStorageRoot();
    const ticketsDir = path.join(storageRoot, userFolder, 'tickets');
    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true });
    }

    const fullPath = path.join(ticketsDir, fileName);
    fs.writeFileSync(fullPath, buffer);

    const relativeUrl = `/storage/${userFolder}/tickets/${fileName}`;

    return {
      name,
      url: relativeUrl,
      size: buffer.length,
      type: contentType || `image/${ext}`
    };
  } catch (err) {
    console.error('[ticketStorageHelper] Error saving attachment:', err);
    return { name, url, size, type };
  }
};

/**
 * Process a list of attachments and save any Base64 images to Backend/storage/<USER_ID>/tickets/
 * @param {string} userFolder 
 * @param {Array} attachments 
 * @param {string} [ticketCode] 
 * @returns {Array}
 */
const processTicketAttachments = (userFolder, attachments, ticketCode = '') => {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .map(att => saveTicketAttachment(userFolder, att, ticketCode))
    .filter(Boolean);
};

/**
 * Delete all attachment files belonging to a ticket from Backend/storage/<USER_ID>/tickets/
 * @param {string} userFolder 
 * @param {Object} ticket 
 * @returns {Array<string>} list of deleted file paths
 */
const deleteTicketAttachments = (userFolder, ticket) => {
  if (!ticket) return [];
  const storageRoot = getStorageRoot();
  const deletedFiles = new Set();

  const removeFileByUrl = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('/tickets/')) return;
    try {
      const match = url.match(/\/storage\/(.+)$/i);
      const relPath = match ? match[1] : url.replace(/^\/?storage\//, '');
      const fullPath = path.join(storageRoot, relPath);

      if (fs.existsSync(fullPath) && !deletedFiles.has(fullPath)) {
        fs.unlinkSync(fullPath);
        deletedFiles.add(fullPath);
        console.log(`[ticketStorageHelper] Deleted attachment file: ${fullPath}`);
      }
    } catch (err) {
      console.warn(`[ticketStorageHelper] Could not remove file for url ${url}:`, err.message);
    }
  };

  // 1. Remove files referenced in ticket.attachments
  if (Array.isArray(ticket.attachments)) {
    ticket.attachments.forEach(att => removeFileByUrl(att?.url));
  }

  // 2. Remove files referenced in ticket.messages[].attachments
  if (Array.isArray(ticket.messages)) {
    ticket.messages.forEach(msg => {
      if (Array.isArray(msg?.attachments)) {
        msg.attachments.forEach(att => removeFileByUrl(att?.url));
      }
    });
  }

  // 3. Sweep by ticket.id prefix in Backend/storage/<userFolder>/tickets/
  if (userFolder && ticket.id) {
    try {
      const ticketsDir = path.join(storageRoot, userFolder, 'tickets');
      if (fs.existsSync(ticketsDir)) {
        const files = fs.readdirSync(ticketsDir);
        const prefix = `${ticket.id.replace(/[^a-zA-Z0-9_-]/g, '_')}_`;
        for (const file of files) {
          if (file.startsWith(prefix)) {
            const fPath = path.join(ticketsDir, file);
            if (fs.existsSync(fPath) && !deletedFiles.has(fPath)) {
              fs.unlinkSync(fPath);
              deletedFiles.add(fPath);
              console.log(`[ticketStorageHelper] Deleted swept ticket file: ${fPath}`);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[ticketStorageHelper] Error during ticket files sweep:', err.message);
    }
  }

  return Array.from(deletedFiles);
};

module.exports = {
  getStorageRoot,
  resolveUserFolder,
  ensureTicketsDir,
  saveTicketAttachment,
  processTicketAttachments,
  deleteTicketAttachments
};

