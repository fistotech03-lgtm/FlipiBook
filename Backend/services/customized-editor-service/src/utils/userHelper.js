const mongoose = require('mongoose');

/**
 * Safely extracts authentication identifiers from request.
 * Prioritizes userId (ObjectId / rawId) as the primary data accessor.
 */
const getAuthUser = (req) => {
  const user = req.user || {};

  let objectId = null;
  let rawId = null;

  // Search candidate keys that hold a 24-character hex ObjectId
  const candidates = [user.userId, user._id, user.id];
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
    rawId: rawId || (objectId ? objectId.toString() : null),
    customUserId: customUserId || null,
    emailId: emailId || null
  };
};

/**
 * Builds user query strictly prioritizing userId as main data to access.
 */
const getUserQuery = (req) => {
  const { objectId, customUserId, emailId } = getAuthUser(req);
  const conds = [];

  if (objectId) {
    conds.push({ userId: objectId });
  }
  if (customUserId) {
    conds.push({ userID: customUserId });
  }
  if (conds.length === 0 && emailId) {
    conds.push({ userEmail: emailId });
  }

  if (conds.length === 1) return conds[0];
  if (conds.length > 1) return { $or: conds };
  return null;
};

/**
 * Resolves safe storage folder identifier for the user.
 * Prioritizes customUserId (e.g. FLIPI0001) or rawId (userId), then sanitized email.
 */
const getUserStorageFolder = (req) => {
  const { objectId, rawId, customUserId, emailId } = getAuthUser(req);
  if (customUserId) return customUserId;
  if (rawId) return rawId;
  if (objectId) return objectId.toString();
  if (emailId) return emailId.replace(/[@.]/g, '_');
  return 'default_user';
};

module.exports = {
  getAuthUser,
  getUserQuery,
  getUserStorageFolder
};
