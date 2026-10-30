// Backend/services/user-service/src/controllers/profileController.js
const mongoose = require('mongoose');
const Profile = require('../models/profile');
const User = require('../models/user');
const {
  resolveUserFolder,
  saveProfileAsset,
  deleteOldAsset
} = require('../utils/profileStorageHelper');

/**
 * Helper to resolve target email from query, body, headers, or decoded JWT token
 */
const resolveReqEmail = async (req) => {
  let emailId = (
    req.body?.emailId ||
    req.body?.email ||
    req.query?.emailId ||
    req.query?.email ||
    req.headers['x-user-email'] ||
    req.user?.emailId ||
    req.user?.email ||
    ''
  ).trim().toLowerCase();

  if (!emailId && (req.user?.id || req.user?._id || req.user?.userId)) {
    const uId = req.user.id || req.user._id;
    const conds = [];
    if (uId && mongoose.Types.ObjectId.isValid(uId)) conds.push({ _id: new mongoose.Types.ObjectId(uId) });
    if (req.user.userId) conds.push({ userID: req.user.userId });
    if (conds.length > 0) {
      const u = await User.findOne({ $or: conds }).select('emailId').lean();
      if (u?.emailId) {
        emailId = u.emailId.trim().toLowerCase();
      }
    }
  }

  return emailId;
};

/**
 * GET /api/profile
 * Get user profile by emailId or email
 */
const getProfile = async (req, res) => {
  try {
    const emailId = await resolveReqEmail(req);

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'emailId is required' });
    }

    // Look up User record for latest name, picture, and password
    const userDoc = await User.findOne({
      emailId: new RegExp(`^${emailId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    }).select('+password').lean();

    let profile = await Profile.findOne({ emailId });

    if (!profile) {
      const defaultName = userDoc?.name || emailId.split('@')[0];
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

      profile = new Profile({
        emailId,
        name: userDoc?.name || formattedName,
        displayName: userDoc?.name || formattedName,
        picture: userDoc?.picture || null,
        avatarBgColor: userDoc?.avatarBgColor || '#E8D4C8'
      });
      await profile.save();
    } else {
      // Auto-heal profile if user signed up with Google but Profile had null picture or fallback name
      let shouldUpdate = false;
      if (userDoc?.picture && (!profile.picture || profile.picture === 'null')) {
        profile.picture = userDoc.picture;
        shouldUpdate = true;
      }
      if (userDoc?.name && (!profile.name || profile.name.toLowerCase() === emailId.split('@')[0].toLowerCase())) {
        profile.name = userDoc.name;
        if (!profile.displayName || profile.displayName.toLowerCase() === emailId.split('@')[0].toLowerCase()) {
          profile.displayName = userDoc.name;
        }
        shouldUpdate = true;
      }
      if (shouldUpdate) {
        await profile.save();
      }
    }

    const hasPassword = Boolean(userDoc?.password && typeof userDoc.password === 'string' && userDoc.password.trim() !== '');

    const profileObj = profile.toObject ? profile.toObject() : profile;

    // Ensure picture and name from userDoc take priority if profile is missing them
    if (userDoc?.picture && !profileObj.picture) {
      profileObj.picture = userDoc.picture;
    }
    if (userDoc?.name && (!profileObj.name || profileObj.name.toLowerCase() === emailId.split('@')[0].toLowerCase())) {
      profileObj.name = userDoc.name;
      profileObj.displayName = userDoc.name;
    }

    return res.status(200).json({
      success: true,
      hasPassword,
      profile: {
        ...profileObj,
        hasPassword
      },
      ...profileObj
    });
  } catch (error) {
    console.error('[profileController] getProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * POST /api/profile/save and POST /api/profile
 * Create or update full user profile
 */
const saveProfile = async (req, res) => {
  try {
    const emailId = await resolveReqEmail(req);

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'emailId is required' });
    }

    const userFolder = await resolveUserFolder(emailId);
    let existingProfile = await Profile.findOne({ emailId });

    const updateFields = { ...req.body };
    delete updateFields._id;
    updateFields.emailId = emailId;

    // 1. Convert and save banner to user storage folder if base64
    if (req.body.bannerBg !== undefined) {
      let bBg = req.body.bannerBg;
      if (typeof bBg === 'string') {
        try { bBg = JSON.parse(bBg); } catch (e) {}
      }

      if (bBg && typeof bBg === 'object' && bBg.value && typeof bBg.value === 'string' && bBg.value.includes('data:')) {
        if (existingProfile?.bannerBg?.value && existingProfile.bannerBg.value !== bBg.value) {
          await deleteOldAsset(existingProfile.bannerBg.value);
        }
        const rawBase64 = bBg.value.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        const savedUrl = await saveProfileAsset(userFolder, rawBase64, 'banner', 'userdetails/profile');
        bBg.value = `url(${savedUrl})`;
      } else if (existingProfile?.bannerBg?.value && bBg?.value && existingProfile.bannerBg.value !== bBg.value) {
        await deleteOldAsset(existingProfile.bannerBg.value);
      }
      updateFields.bannerBg = bBg;
    }

    // 2. Convert and save company logo if base64
    if (req.body.company_logo_url !== undefined || req.body.companyLogo !== undefined) {
      const rawLogo = req.body.company_logo_url !== undefined ? req.body.company_logo_url : req.body.companyLogo;
      const oldLogo = existingProfile?.company_logo_url || existingProfile?.companyLogo;

      if (typeof rawLogo === 'string' && rawLogo.startsWith('data:')) {
        if (oldLogo && oldLogo !== rawLogo) {
          await deleteOldAsset(oldLogo);
        }
        const savedLogo = await saveProfileAsset(userFolder, rawLogo, 'logo', 'userdetails/company_logo');
        updateFields.company_logo_url = savedLogo;
        updateFields.companyLogo = savedLogo;
      } else {
        if (oldLogo && oldLogo !== rawLogo) {
          await deleteOldAsset(oldLogo);
        }
        updateFields.company_logo_url = rawLogo || '';
        updateFields.companyLogo = rawLogo || '';
      }
    }

    // 3. Convert and save avatar picture if base64
    if (req.body.picture !== undefined) {
      const rawPicture = req.body.picture;
      const oldPicture = existingProfile?.picture;
      if (typeof rawPicture === 'string' && rawPicture.startsWith('data:')) {
        if (oldPicture && oldPicture !== rawPicture) {
          await deleteOldAsset(oldPicture);
        }
        const savedAvatar = await saveProfileAsset(userFolder, rawPicture, 'avatar', 'userdetails/profile');
        updateFields.picture = savedAvatar;
      } else if (rawPicture === null || rawPicture === '') {
        if (oldPicture) {
          await deleteOldAsset(oldPicture);
        }
        updateFields.picture = null;
      }
    }

    updateFields.updatedAt = new Date();

    const updatedProfile = await Profile.findOneAndUpdate(
      { emailId },
      { $set: updateFields },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    // Sync primary fields to User model if user exists
    try {
      const userSyncFields = {};
      if (updateFields.name) userSyncFields.name = updateFields.name;
      if (updateFields.picture !== undefined) userSyncFields.picture = updateFields.picture;
      if (updateFields.avatarBgColor) userSyncFields.avatarBgColor = updateFields.avatarBgColor;
      if (updateFields.mobile) userSyncFields.phone = updateFields.mobile;
      if (updateFields.about) userSyncFields.bio = updateFields.about;
      if (updateFields.companyName) userSyncFields.company = updateFields.companyName;
      if (updateFields.industryType) userSyncFields.designation = updateFields.industryType;
      if (updateFields.city) userSyncFields.city = updateFields.city;
      if (updateFields.state) userSyncFields.state = updateFields.state;
      if (updateFields.country) userSyncFields.country = updateFields.country;

      if (Object.keys(userSyncFields).length > 0) {
        await User.updateOne({ emailId }, { $set: userSyncFields });
      }
    } catch (userSyncErr) {
      console.warn('[profileController] User sync warning:', userSyncErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('[profileController] saveProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * POST /api/profile/avatar
 * Upload or update user profile avatar
 */
const updateAvatar = async (req, res) => {
  try {
    const emailId = await resolveReqEmail(req);

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'emailId is required' });
    }

    const userFolder = await resolveUserFolder(emailId);
    let existingProfile = await Profile.findOne({ emailId });
    if (!existingProfile) {
      existingProfile = new Profile({ emailId });
    }

    let finalPictureUrl = existingProfile.picture;
    let targetColor = req.body.avatarBgColor !== undefined ? req.body.avatarBgColor : existingProfile.avatarBgColor;

    // Case 1: Multer file uploaded
    if (req.file) {
      if (existingProfile.picture) {
        await deleteOldAsset(existingProfile.picture);
      }
      finalPictureUrl = await saveProfileAsset(userFolder, req.file, 'avatar', 'userdetails/profile');
    }
    // Case 2: Base64 string in req.body.picture
    else if (req.body.picture && typeof req.body.picture === 'string' && req.body.picture.startsWith('data:')) {
      if (existingProfile.picture && existingProfile.picture !== req.body.picture) {
        await deleteOldAsset(existingProfile.picture);
      }
      finalPictureUrl = await saveProfileAsset(userFolder, req.body.picture, 'avatar', 'userdetails/profile');
    }
    // Case 3: Explicit null or empty string (deleting avatar)
    else if (req.body.picture === null || req.body.picture === '') {
      if (existingProfile.picture) {
        await deleteOldAsset(existingProfile.picture);
      }
      finalPictureUrl = null;
    }
    // Case 4: Preset URL, 'color_only', or explicit value
    else if (req.body.picture !== undefined) {
      if (existingProfile.picture && existingProfile.picture !== req.body.picture) {
        await deleteOldAsset(existingProfile.picture);
      }
      finalPictureUrl = req.body.picture;
    }

    existingProfile.picture = finalPictureUrl;
    if (targetColor !== undefined) {
      existingProfile.avatarBgColor = targetColor;
    }
    existingProfile.updatedAt = new Date();
    await existingProfile.save();

    // Sync to User collection
    try {
      await User.updateOne(
        { emailId },
        { $set: { picture: finalPictureUrl, avatarBgColor: targetColor } }
      );
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      picture: existingProfile.picture,
      avatarBgColor: existingProfile.avatarBgColor,
      profile: existingProfile
    });
  } catch (error) {
    console.error('[profileController] updateAvatar error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * POST /api/profile/banner
 * Upload or update user profile banner
 */
const updateBanner = async (req, res) => {
  try {
    const emailId = await resolveReqEmail(req);

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'emailId is required' });
    }

    const userFolder = await resolveUserFolder(emailId);
    let existingProfile = await Profile.findOne({ emailId });
    if (!existingProfile) {
      existingProfile = new Profile({ emailId });
    }

    let finalBannerBg = existingProfile.bannerBg || {
      type: 'gradient',
      value: 'linear-gradient(to bottom right, #c1e8d7, #85d8c3, #60bba3)'
    };

    // Case 1: Multer file uploaded
    if (req.file) {
      if (existingProfile?.bannerBg?.value) {
        await deleteOldAsset(existingProfile.bannerBg.value);
      }
      const savedUrl = await saveProfileAsset(userFolder, req.file, 'banner', 'userdetails/profile');
      finalBannerBg = {
        type: 'media',
        value: `url(${savedUrl})`
      };
    }
    // Case 2: bannerBg in body
    else if (req.body.bannerBg !== undefined) {
      let bBg = req.body.bannerBg;
      if (typeof bBg === 'string') {
        try { bBg = JSON.parse(bBg); } catch (e) {}
      }

      if (bBg && typeof bBg === 'object' && bBg.value && typeof bBg.value === 'string' && bBg.value.includes('data:')) {
        if (existingProfile?.bannerBg?.value && existingProfile.bannerBg.value !== bBg.value) {
          await deleteOldAsset(existingProfile.bannerBg.value);
        }
        const rawBase64 = bBg.value.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        const savedUrl = await saveProfileAsset(userFolder, rawBase64, 'banner', 'userdetails/profile');
        bBg.value = `url(${savedUrl})`;
        finalBannerBg = bBg;
      } else {
        if (existingProfile?.bannerBg?.value && bBg?.value && existingProfile.bannerBg.value !== bBg.value) {
          await deleteOldAsset(existingProfile.bannerBg.value);
        }
        finalBannerBg = bBg;
      }
    }

    existingProfile.bannerBg = finalBannerBg;
    existingProfile.updatedAt = new Date();
    await existingProfile.save();

    return res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      bannerBg: existingProfile.bannerBg,
      profile: existingProfile
    });
  } catch (error) {
    console.error('[profileController] updateBanner error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * POST /api/profile/follow
 */
const followCreator = async (req, res) => {
  try {
    const { userEmail, creatorEmail } = req.body;
    if (!userEmail || !creatorEmail) {
      return res.status(400).json({ success: false, message: 'Missing userEmail or creatorEmail' });
    }

    const uEmail = userEmail.trim().toLowerCase();
    const cEmail = creatorEmail.trim().toLowerCase();

    await Promise.all([
      Profile.updateOne({ emailId: uEmail }, { $addToSet: { following: cEmail } }),
      Profile.updateOne({ emailId: cEmail }, { $addToSet: { followers: uEmail } })
    ]);

    return res.json({ success: true, message: 'Followed creator successfully' });
  } catch (error) {
    console.error('[profileController] followCreator error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * POST /api/profile/unfollow
 */
const unfollowCreator = async (req, res) => {
  try {
    const { userEmail, creatorEmail } = req.body;
    if (!userEmail || !creatorEmail) {
      return res.status(400).json({ success: false, message: 'Missing userEmail or creatorEmail' });
    }

    const uEmail = userEmail.trim().toLowerCase();
    const cEmail = creatorEmail.trim().toLowerCase();

    await Promise.all([
      Profile.updateOne({ emailId: uEmail }, { $pull: { following: cEmail } }),
      Profile.updateOne({ emailId: cEmail }, { $pull: { followers: uEmail } })
    ]);

    return res.json({ success: true, message: 'Unfollowed creator successfully' });
  } catch (error) {
    console.error('[profileController] unfollowCreator error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getProfile,
  saveProfile,
  updateAvatar,
  updateBanner,
  followCreator,
  unfollowCreator
};
