const express = require('express');
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

    // Extract distinct user emails and v_ids
    const userEmails = [...new Set(books.map((b) => b.userEmail).filter(Boolean))];
    const vIds = books.map((b) => b.v_id).filter(Boolean);

    const safeRegexList = userEmails.map((e) => new RegExp(`^${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'));

    // Fetch corresponding profiles, users, 3D models, and customized settings in parallel
    const [profiles, users, interaction3DModels, customizedSettingsList] = await Promise.all([
      safeRegexList.length > 0 ? Profile.find({ emailId: { $in: safeRegexList } }).lean() : [],
      safeRegexList.length > 0 ? User.find({ emailId: { $in: safeRegexList } }).lean() : [],
      InteractionThreedModel.find({}).lean().catch(() => []),
      CustomizedSettings.find({ v_id: { $in: vIds } }).lean().catch(() => [])
    ]);

    const threedFlipbookVIds = new Set(interaction3DModels.map((m) => m.flipbook_v_id).filter(Boolean));
    const threedFlipbookNames = new Set(
      interaction3DModels.map((m) => `${(m.userEmail || '').toLowerCase()}:::${(m.flipbookName || '').toLowerCase()}`)
    );

    const csMap = {};
    customizedSettingsList.forEach((cs) => {
      if (cs.v_id) csMap[cs.v_id] = cs;
    });

    const profileMap = {};
    profiles.forEach((p) => {
      if (p.emailId) profileMap[p.emailId.toLowerCase()] = p;
    });
    users.forEach((u) => {
      if (u.emailId) {
        const key = u.emailId.toLowerCase();
        if (!profileMap[key]) {
          profileMap[key] = u;
        } else if (!profileMap[key].name && u.name) {
          profileMap[key].name = u.name;
        }
      }
    });

    const enrichedBooks = books.map((book) => {
      const p = profileMap[book.userEmail?.toLowerCase()] || {};
      const authorName = p.name || (book.userEmail ? book.userEmail.split('@')[0] : 'Creator');
      const city = p.city || p.state || (p.country && p.country !== 'INDIA' ? p.country : '') || 'Coimbatore';
      const authorPicture = p.picture || null;
      const authorBgColor = p.avatarBgColor || '#E8D4C8';

      const cs = csMap[book.v_id] || book.Customized_Settings || {};

      const has3D = Boolean(
        (book.v_id && threedFlipbookVIds.has(book.v_id)) ||
        (book.userEmail && book.flipbookName && threedFlipbookNames.has(`${book.userEmail.toLowerCase()}:::${book.flipbookName.toLowerCase()}`)) ||
        book.has3D ||
        book.is3D ||
        book.has3DModels ||
        (cs.InteractionThreedModel && Object.keys(cs.InteractionThreedModel).length > 0)
      );

      return {
        ...book,
        Customized_Settings: cs,
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
      if (foundBook && foundBook.userEmail) {
        rawEmail = foundBook.userEmail;
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

    if (!profile) {
      const user = await User.findOne({ emailId: safeRegex }).lean();
      profile = {
        emailId: normalizedEmail,
        name: user?.name || normalizedEmail.split('@')[0],
        picture: user?.picture || null,
        avatarBgColor: '#E8D4C8',
        bannerBg: { type: 'gradient', value: 'linear-gradient(120deg, #9fe6cb 0%, #72ceaf 50%, #9fe6cb 100%)' },
        about: '“Bring your content to life with a real, interactive experience”',
        industryType: 'Product Designer',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'INDIA',
        followers: [],
        following: []
      };
    }

    const booksQuery = isOwner ? { userEmail: safeRegex, trash: { $ne: true } } : { userEmail: safeRegex, isPublished: true, trash: { $ne: true } };

    const books = await Flipbook.find(booksQuery).sort({ createdAt: -1 }).lean();

    const followersList = profile.followers || [];
    const isFollowing = currentEmailParam ? followersList.some((f) => f && f.toLowerCase() === currentEmailParam) : false;

    return res.status(200).json({
      success: true,
      creator: {
        ...profile,
        totalBooks: books.length,
        followersCount: followersList.length,
        followingCount: (profile.following || []).length,
        isFollowing
      },
      books
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

    if (normalizedCurrent === normalizedTarget) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow your own profile.'
      });
    }

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
