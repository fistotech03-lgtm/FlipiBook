const Notification = require('../../../../shared/models/Notification');
const Profile = require('../../../../shared/models/Profile');
const { emitToUser } = require('../socket/socketManager');

const resolveUserEmail = (req) => {
  const raw =
    req.user?.emailId ||
    req.user?.email ||
    req.query?.email ||
    req.body?.email ||
    req.headers['x-user-email'] ||
    '';
  return String(raw).trim().toLowerCase();
};

/**
 * GET /api/notifications
 * Fetch notifications and unread count for the logged-in user.
 */
exports.getNotifications = async (req, res) => {
  try {
    const recipientEmail = resolveUserEmail(req);
    if (!recipientEmail) {
      return res.status(200).json({
        success: true,
        notifications: [],
        unreadCount: 0
      });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipientEmail })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientEmail, isRead: false })
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('[Notification Controller] getNotifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
exports.markAsRead = async (req, res) => {
  try {
    const recipientEmail = resolveUserEmail(req);
    const { id } = req.params;
    if (!recipientEmail || !id) {
      return res.status(400).json({ success: false, message: 'Missing notification id or user email' });
    }

    await Notification.updateOne(
      { _id: id, recipientEmail },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Notification Controller] markAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for the user as read.
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const recipientEmail = resolveUserEmail(req);
    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Missing user email' });
    }

    await Notification.updateMany(
      { recipientEmail, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Notification Controller] markAllAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
  }
};

/**
 * POST /api/notifications/internal/book-published
 * Triggered when a creator publishes a flipbook. Notifies all followers of that creator.
 */
exports.createBookPublishedNotifications = async (req, res) => {
  try {
    const { creatorEmail, creatorName, creatorPicture, bookId, bookTitle, bookUrl } = req.body || {};
    const normalizedCreator = String(creatorEmail || '').trim().toLowerCase();
    if (!normalizedCreator) {
      return res.status(400).json({ success: false, message: 'Missing creatorEmail' });
    }

    const creatorProfile = await Profile.findOne({ emailId: normalizedCreator })
      .select('followers name displayName picture')
      .lean();

    const followers = Array.isArray(creatorProfile?.followers)
      ? creatorProfile.followers
          .map((e) => String(e || '').trim().toLowerCase())
          .filter((e) => e && e !== normalizedCreator)
      : [];

    if (followers.length === 0) {
      return res.status(200).json({ success: true, count: 0 });
    }

    const uniqueFollowers = Array.from(new Set(followers));
    const displayName =
      creatorName ||
      creatorProfile?.displayName ||
      creatorProfile?.name ||
      normalizedCreator.split('@')[0];
    const avatar = creatorPicture || creatorProfile?.picture || null;
    const cleanTitle = String(bookTitle || 'a new flipbook').trim();

    const docs = uniqueFollowers.map((recipientEmail) => ({
      recipientEmail,
      actorEmail: normalizedCreator,
      actorName: displayName,
      actorPicture: avatar,
      type: 'book_published',
      title: `${displayName} published a new flipbook`,
      detail: `"${cleanTitle}"`,
      bookId: String(bookId || ''),
      bookTitle: cleanTitle,
      bookUrl: String(bookUrl || ''),
      isRead: false
    }));

    const inserted = await Notification.insertMany(docs, { ordered: false });
    for (const doc of inserted) {
      emitToUser(doc.recipientEmail, 'notification:new', doc);
    }

    return res.status(200).json({ success: true, count: inserted.length });
  } catch (error) {
    console.error('[Notification Controller] createBookPublishedNotifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create publish notifications' });
  }
};

/**
 * POST /api/notifications/internal/new-follower
 * Triggered when a user follows a creator. Notifies the target creator.
 */
exports.createNewFollowerNotification = async (req, res) => {
  try {
    const { followerEmail, followerName, followerPicture, targetEmail } = req.body || {};
    const normalizedFollower = String(followerEmail || '').trim().toLowerCase();
    const normalizedTarget = String(targetEmail || '').trim().toLowerCase();

    if (!normalizedFollower || !normalizedTarget) {
      return res.status(400).json({ success: false, message: 'Missing followerEmail or targetEmail' });
    }
    if (normalizedFollower === normalizedTarget) {
      return res.status(200).json({ success: true, skipped: true });
    }

    let displayName = followerName;
    let avatar = followerPicture || null;

    if (!displayName || !avatar) {
      const followerProfile = await Profile.findOne({ emailId: normalizedFollower })
        .select('name displayName picture')
        .lean();
      if (!displayName) {
        displayName =
          followerProfile?.displayName ||
          followerProfile?.name ||
          normalizedFollower.split('@')[0];
      }
      if (!avatar) {
        avatar = followerProfile?.picture || null;
      }
    }

    const created = await Notification.create({
      recipientEmail: normalizedTarget,
      actorEmail: normalizedFollower,
      actorName: displayName,
      actorPicture: avatar,
      type: 'new_follower',
      title: `${displayName} started following you`,
      detail: '',
      isRead: false
    });

    emitToUser(normalizedTarget, 'notification:new', created);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Notification Controller] createNewFollowerNotification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create follower notification' });
  }
};
