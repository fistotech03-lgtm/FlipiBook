const express = require('express');
const mongoose = require('mongoose');
const Flipbook = require('../../../../shared/models/Flipbook');
const Profile = require('../../../../shared/models/Profile');
const User = require('../../../../shared/models/User');
const InteractionThreedModel = require('../../../../shared/models/InteractionThreedModel');
const CustomizedSettings = require('../../../../shared/models/CustomizedSettings');
const { optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(optionalAuth);

/**
 * @route   GET /api/explore/published
 * @desc    Get all published flipbooks across all users with author details
 * @access  Public
 */
router.get('/published', async (req, res) => {
  try {
    // Fetch all flipbooks where isPublished is true and trash is false
    const books = await Flipbook.find({ isPublished: true, trash: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();

    if (!books || books.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        books: []
      });
    }

    // Extract distinct user emails, userObjectIDs, userIDs, and v_ids
    const rawUserEmails = books.map((b) => b.userEmail || b.emailId || b.email).filter(Boolean);
    const userEmails = [...new Set(rawUserEmails.map((e) => String(e).trim().toLowerCase()))];
    
    const userObjectIds = [];
    books.forEach((b) => {
      const rawId = b.userObjectID || b.userObjectId || (b.userId && mongoose.Types.ObjectId.isValid(b.userId) ? b.userId : null);
      if (rawId) {
        userObjectIds.push(rawId);
        if (mongoose.Types.ObjectId.isValid(rawId)) {
          try {
            userObjectIds.push(new mongoose.Types.ObjectId(String(rawId)));
          } catch (_) {}
        }
      }
    });

    const userIds = [...new Set(books.map((b) => b.userID || b.userId).filter(Boolean))];
    const vIds = books.map((b) => b.v_id).filter(Boolean);

    // Build user query conditions to match by email, ObjectId, or userID
    const userQueryConds = [];
    if (userEmails.length > 0) {
      const emailRegexList = userEmails.map((e) => new RegExp(`^${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'));
      userQueryConds.push({ emailId: { $in: emailRegexList } });
    }
    if (userObjectIds.length > 0) {
      userQueryConds.push({ _id: { $in: userObjectIds } });
    }
    if (userIds.length > 0) {
      userQueryConds.push({ userID: { $in: userIds } });
    }

    // Fetch corresponding users, 3D models, and customized settings in parallel
    const [users, interaction3DModels, customizedSettingsList] = await Promise.all([
      userQueryConds.length > 0 ? User.find({ $or: userQueryConds }).lean() : [],
      InteractionThreedModel.find({}).lean().catch(() => []),
      CustomizedSettings.find({ v_id: { $in: vIds } }).lean().catch(() => [])
    ]);

    // Collect all resolved emails (from flipbook userEmails AND matched users)
    const allEmails = [...new Set([
      ...userEmails,
      ...users.map((u) => u.emailId?.trim().toLowerCase()).filter(Boolean)
    ])];
    const allEmailRegexes = allEmails.map((e) => new RegExp(`^${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'));

    // Query profiles matching all resolved emails or userIDs
    const allUserIds = [...new Set([
      ...userIds,
      ...users.map((u) => u.userID).filter(Boolean)
    ])];

    const profileQueryConds = [];
    if (allEmailRegexes.length > 0) {
      profileQueryConds.push({ emailId: { $in: allEmailRegexes } });
    }
    if (allUserIds.length > 0) {
      profileQueryConds.push({ userID: { $in: allUserIds } });
    }
    const profiles = profileQueryConds.length > 0 ? await Profile.find({ $or: profileQueryConds }).lean() : [];

    const threedFlipbookVIds = new Set(interaction3DModels.map((m) => m.flipbook_v_id).filter(Boolean));
    const threedFlipbookNames = new Set(
      interaction3DModels.map((m) => `${(m.userEmail || '').toLowerCase()}:::${(m.flipbookName || '').toLowerCase()}`)
    );

    const csMap = {};
    customizedSettingsList.forEach((cs) => {
      if (cs.v_id) csMap[cs.v_id] = cs;
    });

    // Build fast lookup maps for profiles and users
    const userByEmail = {};
    const userByObjectId = {};
    const userByUserId = {};
    users.forEach((u) => {
      if (u.emailId) userByEmail[u.emailId.trim().toLowerCase()] = u;
      if (u._id) {
        userByObjectId[u._id.toString()] = u;
        userByObjectId[String(u._id)] = u;
      }
      if (u.userID) userByUserId[u.userID] = u;
    });

    const profileByEmail = {};
    const profileByUserId = {};
    profiles.forEach((p) => {
      if (p.emailId) profileByEmail[p.emailId.trim().toLowerCase()] = p;
      if (p.userID) profileByUserId[p.userID] = p;
    });

    const enrichedBooks = books.map((book) => {
      const bookEmail = (book.userEmail || book.emailId || book.email || '').trim().toLowerCase();
      const bookObjIdStr = (book.userObjectID || book.userObjectId || (book.userId && mongoose.Types.ObjectId.isValid(book.userId) ? book.userId : '') || '').toString();
      const bookUserId = book.userID || book.userId || '';

      const u = (bookEmail && userByEmail[bookEmail]) || (bookObjIdStr && userByObjectId[bookObjIdStr]) || (bookUserId && userByUserId[bookUserId]) || {};
      const resolvedEmail = bookEmail || (u.emailId ? u.emailId.trim().toLowerCase() : '');
      const p = (resolvedEmail && profileByEmail[resolvedEmail]) || (bookUserId && profileByUserId[bookUserId]) || (u.userID && profileByUserId[u.userID]) || {};

      const authorName = p.displayName || p.name || u.displayName || u.name || (resolvedEmail ? resolvedEmail.split('@')[0] : 'Creator');
      const city = p.city || p.state || u.city || u.state || (p.country && p.country !== 'INDIA' ? p.country : '') || 'Coimbatore';
      const rawPic = (p.picture && p.picture !== 'color_only' && p.picture !== 'null') ? p.picture : ((u.picture && u.picture !== 'color_only' && u.picture !== 'null') ? u.picture : null);
      const authorPicture = rawPic || null;
      const authorBgColor = p.avatarBgColor || u.avatarBgColor || '#E8D4C8';

      const cs = csMap[book.v_id] || book.Customized_Settings || {};

      let rawOrient = (cs?.FlipbookInfo?.orientation || book.orientation || '').toLowerCase();
      let isLandscape = false;
      if (rawOrient.includes('horizontal') || rawOrient.includes('landscape') || book.isLandscape) {
        rawOrient = 'landscape';
        isLandscape = true;
      } else if (rawOrient.includes('square')) {
        rawOrient = 'square';
      } else if (rawOrient.includes('vertical') || rawOrient.includes('portrait')) {
        rawOrient = 'portrait';
      } else {
        const w = cs?.FlipbookInfo?.width || book.width || book.pageWidth;
        const h = cs?.FlipbookInfo?.height || book.height || book.pageHeight;
        if (w && h && Number(w) > Number(h)) {
          rawOrient = 'landscape';
          isLandscape = true;
        } else {
          rawOrient = 'portrait';
        }
      }

      const has3D = Boolean(
        (book.v_id && threedFlipbookVIds.has(book.v_id)) ||
        (resolvedEmail && book.flipbookName && threedFlipbookNames.has(`${resolvedEmail}:::${book.flipbookName.toLowerCase()}`)) ||
        book.has3D ||
        book.is3D ||
        book.has3DModels ||
        (cs.InteractionThreedModel && Object.keys(cs.InteractionThreedModel).length > 0)
      );

      return {
        ...book,
        userEmail: resolvedEmail || book.userEmail || '',
        Customized_Settings: cs,
        orientation: rawOrient,
        isLandscape,
        has3D,
        is3D: has3D,
        authorName,
        city,
        authorPicture,
        authorBgColor
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedBooks.length,
      books: enrichedBooks
    });
  } catch (error) {
    console.error('[Explore API Error]: Failed to fetch published flipbooks', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching published flipbooks',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/explore/creator
 * @desc    Get a specific creator's profile info and all their published flipbooks
 * @access  Public
 */
router.get('/creator', async (req, res) => {
  try {
    let rawEmail = req.query.emailId || req.query.email || req.user?.emailId;
    const shareId = req.query.shareId;
    const v_id = req.query.v_id || req.query.vId;

    if (!rawEmail && (shareId || v_id)) {
      const query = [];
      if (shareId) {
        query.push({ 'Customized_Settings.Visibility.shareId': shareId });
        query.push({ 'Visibility.shareId': shareId });
        query.push({ 'share.shareId': shareId });
        query.push({ v_id: shareId });
      }
      if (v_id) {
        query.push({ v_id: v_id });
      }
      const foundBook = await Flipbook.findOne({ $or: query }).lean();
      if (foundBook) {
        rawEmail = foundBook.userEmail || foundBook.emailId || foundBook.email;
        if (!rawEmail && foundBook.userObjectID) {
          const u = await User.findById(foundBook.userObjectID).select('emailId').lean();
          if (u?.emailId) rawEmail = u.emailId;
        }
      }
    }

    if (!rawEmail) {
      return res.status(400).json({ success: false, message: 'emailId, shareId, or v_id query parameter is required' });
    }

    const normalizedEmail = rawEmail.trim().toLowerCase();
    const safeRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    const currentEmailParam = (req.query.currentEmail || req.query.followerEmail || req.query.userEmail || '').trim().toLowerCase();
    const isOwner = Boolean(currentEmailParam && currentEmailParam === normalizedEmail);

    let profile = await Profile.findOne({ emailId: safeRegex }).lean();
    const user = await User.findOne({ emailId: safeRegex }).lean();

    if (!profile) {
      profile = {
        emailId: normalizedEmail,
        name: user?.displayName || user?.name || normalizedEmail.split('@')[0],
        displayName: user?.displayName || user?.name || normalizedEmail.split('@')[0],
        picture: (user?.picture && user?.picture !== 'color_only' && user?.picture !== 'null') ? user.picture : null,
        avatarBgColor: user?.avatarBgColor || '#E8D4C8',
        bannerBg: { type: 'gradient', value: 'linear-gradient(120deg, #9fe6cb 0%, #72ceaf 50%, #9fe6cb 100%)' },
        about: user?.bio || '“Bring your content to life with a real, interactive experience”',
        industryType: user?.designation || 'Product Designer',
        city: user?.city || 'Coimbatore',
        state: user?.state || 'Tamil Nadu',
        country: user?.country || 'INDIA',
        followers: [],
        following: []
      };
    } else {
      if (!profile.name && user?.name) profile.name = user.name;
      if (!profile.displayName && (profile.name || user?.name)) profile.displayName = profile.name || user.name;
      if ((!profile.picture || profile.picture === 'null' || profile.picture === 'color_only') && user?.picture) profile.picture = user.picture;
      if (!profile.avatarBgColor && user?.avatarBgColor) profile.avatarBgColor = user.avatarBgColor;
    }

    if (user) {
      if (!profile.profileType && user.profileType) profile.profileType = user.profileType;
      if (!profile.mobile && user.mobile) profile.mobile = user.mobile;
      if (!profile.contact1 && (user.contact1 || user.mobile)) profile.contact1 = user.contact1 || user.mobile;
      if (!profile.contact1Label && user.contact1Label) profile.contact1Label = user.contact1Label;
      if (!profile.contact2 && user.contact2) profile.contact2 = user.contact2;
      if (!profile.contact2Label && user.contact2Label) profile.contact2Label = user.contact2Label;
      if (!profile.contact3 && user.contact3) profile.contact3 = user.contact3;
      if (!profile.contact3Label && user.contact3Label) profile.contact3Label = user.contact3Label;
      if (!profile.professionalTitle && (user.professionalTitle || user.title || user.designation)) profile.professionalTitle = user.professionalTitle || user.title || user.designation;
      if (!profile.industryType && (user.industryType || user.industry)) profile.industryType = user.industryType || user.industry;
      if (!profile.companyName && (user.companyName || user.businessName)) profile.companyName = user.companyName || user.businessName;
      if (!profile.companyEmail && (user.companyEmail || user.businessEmail)) profile.companyEmail = user.companyEmail || user.businessEmail;
      if (!profile.companySize && user.companySize) profile.companySize = user.companySize;
      if (!profile.teamSize && user.teamSize) profile.teamSize = user.teamSize;
      if (!profile.experience && user.experience) profile.experience = user.experience;
      if ((!profile.services || profile.services.length === 0) && user.services) profile.services = user.services;
      if ((!profile.skills || profile.skills.length === 0) && user.skills) profile.skills = user.skills;
      if (!profile.address1 && user.address1) profile.address1 = user.address1;
      if (!profile.address2 && user.address2) profile.address2 = user.address2;
      if (!profile.pincode && user.pincode) profile.pincode = user.pincode;
      if (!profile.about && user.bio) profile.about = user.bio;
    }

    const userConds = [{ userEmail: safeRegex }];
    if (user?._id) userConds.push({ userObjectID: user._id });
    if (user?.userID) userConds.push({ userID: user.userID });
    const userFilter = userConds.length > 1 ? { $or: userConds } : userConds[0];

    // Always return only published books in creator profile modal flipbook list
    const booksQuery = { ...userFilter, isPublished: true, trash: { $ne: true } };

    const books = await Flipbook.find(booksQuery).sort({ createdAt: -1 }).lean();

    const vIds = books.map((b) => b.v_id).filter(Boolean);
    const customizedSettingsList = vIds.length > 0 ? await CustomizedSettings.find({ v_id: { $in: vIds } }).lean().catch(() => []) : [];
    const csMap = {};
    customizedSettingsList.forEach((cs) => {
      if (cs.v_id) csMap[cs.v_id] = cs;
    });

    const enrichedBooks = books.map((book) => {
      const cs = csMap[book.v_id] || book.Customized_Settings || {};

      let rawOrient = (cs?.FlipbookInfo?.orientation || book.orientation || '').toLowerCase();
      let isLandscape = false;
      if (rawOrient.includes('horizontal') || rawOrient.includes('landscape') || book.isLandscape) {
        rawOrient = 'landscape';
        isLandscape = true;
      } else if (rawOrient.includes('square')) {
        rawOrient = 'square';
      } else if (rawOrient.includes('vertical') || rawOrient.includes('portrait')) {
        rawOrient = 'portrait';
      } else {
        const w = cs?.FlipbookInfo?.width || book.width || book.pageWidth;
        const h = cs?.FlipbookInfo?.height || book.height || book.pageHeight;
        if (w && h && Number(w) > Number(h)) {
          rawOrient = 'landscape';
          isLandscape = true;
        } else {
          rawOrient = 'portrait';
        }
      }

      return {
        ...book,
        userEmail: normalizedEmail,
        Customized_Settings: cs,
        orientation: rawOrient,
        isLandscape,
        authorName: profile.displayName || profile.name || user?.displayName || user?.name || normalizedEmail.split('@')[0],
        authorPicture: (profile.picture && profile.picture !== 'color_only' && profile.picture !== 'null') ? profile.picture : ((user?.picture && user?.picture !== 'color_only' && user?.picture !== 'null') ? user.picture : null),
        authorBgColor: profile.avatarBgColor || user?.avatarBgColor || '#E8D4C8',
        city: profile.city || profile.state || user?.city || 'Coimbatore'
      };
    });

    const followersList = profile.followers || [];
    const isFollowing = currentEmailParam ? followersList.some((f) => f && f.toLowerCase() === currentEmailParam) : false;

    const creatorData = {
      ...profile,
      emailId: normalizedEmail,
      email: normalizedEmail,
      followers: followersList,
      totalBooks: enrichedBooks.length,
      followersCount: followersList.length,
      followingCount: (profile.following || []).length,
      isFollowing
    };

    return res.status(200).json({
      success: true,
      creator: creatorData,
      profile: creatorData,
      books: enrichedBooks
    });
  } catch (error) {
    console.error('[Explore Creator API Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching creator profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/explore/top-creators
 * @desc    Get top creators ranked by published flipbooks & followers
 * @access  Public
 */
router.get('/top-creators', async (req, res) => {
  try {
    const currentEmail = (req.query.currentEmail || req.query.followerEmail || req.query.emailId || req.query.email || '').trim().toLowerCase();

    const counts = await Flipbook.aggregate([
      { $match: { isPublished: true, trash: { $ne: true } } },
      { $group: { _id: '$userEmail', totalBooks: { $sum: 1 } } },
      { $sort: { totalBooks: -1 } }
    ]);

    const countMap = {};
    counts.forEach((c) => {
      if (c._id) countMap[c._id.toLowerCase()] = c.totalBooks;
    });

    const [profiles, users] = await Promise.all([
      Profile.find({}).lean(),
      User.find({}).lean()
    ]);

    const creatorMap = {};

    profiles.forEach((p) => {
      if (!p.emailId) return;
      const emailKey = p.emailId.trim().toLowerCase();
      const followersArr = p.followers || [];
      creatorMap[emailKey] = {
        emailId: emailKey,
        email: emailKey,
        name: p.name || emailKey.split('@')[0],
        picture: p.picture || null,
        avatarBgColor: p.avatarBgColor || '#E8D4C8',
        bannerBg: p.bannerBg || { type: 'gradient', value: 'linear-gradient(120deg, #9fe6cb 0%, #72ceaf 50%, #9fe6cb 100%)' },
        about: p.about || '“Bring your content to life with a real, interactive experience”',
        industryType: p.industryType || p.companyName || 'Product Designer',
        companyName: p.companyName || '',
        city: p.city || '',
        state: p.state || '',
        country: p.country || 'INDIA',
        totalBooks: countMap[emailKey] || 0,
        followers: followersArr,
        followersCount: followersArr.length,
        following: p.following || [],
        isFollowing: currentEmail ? followersArr.some((f) => f && f.toLowerCase() === currentEmail) : false
      };
    });

    users.forEach((u) => {
      if (!u.emailId) return;
      const emailKey = u.emailId.trim().toLowerCase();
      if (!creatorMap[emailKey]) {
        creatorMap[emailKey] = {
          emailId: emailKey,
          email: emailKey,
          name: u.name || emailKey.split('@')[0],
          picture: u.picture || null,
          avatarBgColor: '#E8D4C8',
          bannerBg: { type: 'gradient', value: 'linear-gradient(120deg, #9fe6cb 0%, #72ceaf 50%, #9fe6cb 100%)' },
          about: '“Bring your content to life with a real, interactive experience”',
          industryType: 'Product Designer',
          companyName: '',
          city: '',
          state: '',
          country: 'INDIA',
          totalBooks: countMap[emailKey] || 0,
          followers: [],
          followersCount: 0,
          following: [],
          isFollowing: false
        };
      } else if (!creatorMap[emailKey].name && u.name) {
        creatorMap[emailKey].name = u.name;
      }
    });

    let creatorsList = Object.values(creatorMap);

    const excludeEmail = (req.query.excludeEmail || req.query.currentEmail || req.query.emailId || req.query.email || '').trim().toLowerCase();
    if (excludeEmail) {
      creatorsList = creatorsList.filter((c) => c.emailId.toLowerCase() !== excludeEmail);
    }

    creatorsList.sort((a, b) => {
      if (b.totalBooks !== a.totalBooks) return b.totalBooks - a.totalBooks;
      return b.followersCount - a.followersCount;
    });

    return res.status(200).json({
      success: true,
      count: creatorsList.length,
      creators: creatorsList
    });
  } catch (error) {
    console.error('[Top Creators API Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching top creators',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/explore/toggle-follow
 * @desc    Follow or Unfollow a creator
 * @access  Public
 */
router.post('/toggle-follow', async (req, res) => {
  try {
    const { currentEmail, targetEmail } = req.body;

    if (!currentEmail || !targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'Both currentEmail and targetEmail are required.'
      });
    }

    const normalizedCurrent = currentEmail.trim().toLowerCase();
    const normalizedTarget = targetEmail.trim().toLowerCase();

    const safeTargetRegex = new RegExp(`^${normalizedTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const safeCurrentRegex = new RegExp(`^${normalizedCurrent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    let targetProfile = await Profile.findOne({ emailId: safeTargetRegex });
    if (!targetProfile) {
      const user = await User.findOne({ emailId: safeTargetRegex });
      targetProfile = new Profile({
        emailId: normalizedTarget,
        name: user?.name || normalizedTarget.split('@')[0],
        picture: user?.picture || null,
        avatarBgColor: '#E8D4C8'
      });
    }

    let currentProfile = await Profile.findOne({ emailId: safeCurrentRegex });
    if (!currentProfile) {
      const user = await User.findOne({ emailId: safeCurrentRegex });
      currentProfile = new Profile({
        emailId: normalizedCurrent,
        name: user?.name || normalizedCurrent.split('@')[0],
        picture: user?.picture || null,
        avatarBgColor: '#E8D4C8'
      });
    }

    if (!Array.isArray(targetProfile.followers)) targetProfile.followers = [];
    if (!Array.isArray(currentProfile.following)) currentProfile.following = [];

    const isCurrentlyFollowing = targetProfile.followers.some(
      (email) => email && email.toLowerCase() === normalizedCurrent
    );

    let isFollowing = false;

    if (isCurrentlyFollowing) {
      targetProfile.followers = targetProfile.followers.filter(
        (email) => email && email.toLowerCase() !== normalizedCurrent
      );
      currentProfile.following = currentProfile.following.filter(
        (email) => email && email.toLowerCase() !== normalizedTarget
      );
      isFollowing = false;
    } else {
      targetProfile.followers.push(normalizedCurrent);
      currentProfile.following.push(normalizedTarget);
      isFollowing = true;
    }

    await Promise.all([targetProfile.save(), currentProfile.save()]);

    return res.status(200).json({
      success: true,
      isFollowing,
      followersCount: targetProfile.followers.length,
      followingCount: currentProfile.following.length,
      followers: targetProfile.followers,
      following: currentProfile.following,
      message: isFollowing ? 'Followed successfully' : 'Unfollowed successfully'
    });
  } catch (error) {
    console.error('[Toggle Follow API Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while toggling follow status',
      error: error.message
    });
  }
});

module.exports = router;
