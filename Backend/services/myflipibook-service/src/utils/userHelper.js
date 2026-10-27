const mongoose = require('mongoose');

/**
 * Safely extracts authentication identifiers from request
 * Returns:
 * - objectId: Mongoose ObjectId (if candidate is a valid 24-character hex string)
 * - rawId: String representation of the ObjectId
 * - customUserId: Human-readable ID like 'FLIPI0001'
 * - emailId: Lowercase email address
 */
const getAuthUser = (req) => {
  const user = req.user || {};

  let objectId = null;
  let rawId = null;

  // Search candidate keys that might hold a 24-char hex ObjectId
  const candidates = [user.id, user._id, user.userId];
  for (const cand of candidates) {
    if (cand && typeof cand === 'string' && /^[0-9a-fA-F]{24}$/.test(cand)) {
      objectId = new mongoose.Types.ObjectId(cand);
      rawId = cand;
      break;
    } else if (cand && typeof cand === 'object' && mongoose.Types.ObjectId.isValid(cand)) {
      objectId = cand;
      rawId = cand.toString();
      break;
    }
  }

  // Custom user string identifier (e.g. 'FLIPI0001')
  const customUserId = (
    user.userID ||
    (user.userId && (!objectId || String(user.userId) !== rawId) ? user.userId : '')
  ).toString().trim();

  // Email address
  const emailId = (
    user.emailId ||
    user.email ||
    req.query?.emailId ||
    req.body?.emailId ||
    req.query?.userEmail ||
    req.body?.userEmail ||
    ''
  ).toString().trim().toLowerCase();

  return {
    objectId,
    rawId,
    customUserId: customUserId || null,
    emailId: emailId || null
  };
};

/**
 * Builds user query for UserFolder and pageEditorSettings collections
 */
const getUserQuery = (req) => {
  const { objectId, customUserId, emailId } = getAuthUser(req);
  const conds = [];

  if (objectId) {
    conds.push({ userObjectID: objectId });
  }
  if (customUserId) {
    conds.push({ userID: customUserId });
  }
  if (emailId) {
    conds.push({ emailId });
  }

  if (conds.length === 1) return conds[0];
  if (conds.length > 1) return { $or: conds };
  return null;
};

/**
 * Builds user query for Flipbook collection
 */
const getFlipbookUserQuery = (req) => {
  const { objectId, customUserId, emailId } = getAuthUser(req);
  const conds = [];

  if (objectId) {
    conds.push({ userObjectID: objectId });
    conds.push({ userId: objectId });
  }
  if (customUserId) {
    conds.push({ userID: customUserId });
  }
  if (emailId) {
    conds.push({ userEmail: emailId });
  }

  if (conds.length === 1) return conds[0];
  if (conds.length > 1) return { $or: conds };
  return null;
};

/**
 * Asynchronously extracts and resolves authentication identifiers,
 * querying the User collection in MongoDB if objectId is not in the request token.
 * Automatically backfills req.user with _id and id for downstream consistency.
 */
const resolveAuthUser = async (req) => {
  let auth = getAuthUser(req);

  if (!auth.objectId && (auth.emailId || auth.customUserId)) {
    try {
      const User = require('../models/user');
      const conds = [];
      if (auth.customUserId) conds.push({ userID: auth.customUserId });
      if (auth.emailId) conds.push({ emailId: auth.emailId });

      if (conds.length > 0) {
        let u = await User.findOne({ $or: conds }).select('_id userID emailId').lean();
        if (!u && auth.emailId) {
          u = await User.create({
            emailId: auth.emailId,
            userID: auth.customUserId || `FLIPI${Date.now()}`
          }).catch(() => null);
        }
        if (u) {
          auth.objectId = u._id;
          auth.rawId = u._id.toString();
          if (!auth.customUserId && u.userID) auth.customUserId = u.userID;
          if (!auth.emailId && u.emailId) auth.emailId = u.emailId;

          // Attach to req.user for downstream consistency
          if (req) {
            if (!req.user) req.user = {};
            req.user._id = u._id;
            req.user.id = u._id.toString();
            if (!req.user.userId) req.user.userId = u._id.toString();
            if (!req.user.userID && u.userID) req.user.userID = u.userID;
            if (!req.user.emailId && u.emailId) req.user.emailId = u.emailId;
          }
        }
      }
    } catch (err) {
      console.error('[UserHelper] Error resolving auth user from DB:', err.message);
    }
  }

  return auth;
};

module.exports = {
  getAuthUser,
  resolveAuthUser,
  getUserQuery,
  getFlipbookUserQuery
};
