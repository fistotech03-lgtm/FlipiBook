const Flipbook = require('../models/Flipbook');
const backupService = require('../../../../shared/backupService');
const { recordAdminLog } = require('../middlewares/adminAuthMiddleware');

/**
 * 1. List All Flipbooks across the platform
 * GET /api/admin/flipbooks
 */
const listFlipbooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      isFeatured,
      isFlagged,
      sort = 'newest'
    } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }

    if (isFlagged !== undefined) {
      filter.isFlagged = isFlagged === 'true';
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { flipbookName: { $regex: q, $options: 'i' } },
        { userEmail: { $regex: q, $options: 'i' } },
        { userID: { $regex: q, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    if (sort === 'views') {
      sortOptions.views = -1;
    } else if (sort === 'size') {
      sortOptions.fileSize = -1;
    } else if (sort === 'oldest') {
      sortOptions.createdAt = 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [books, total] = await Promise.all([
      Flipbook.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Flipbook.countDocuments(filter)
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      flipbooks: books
    });
  } catch (error) {
    console.error('[AdminBookController - listFlipbooks] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch flipbooks', error: error.message });
  }
};

/**
 * 2. Get Single Flipbook Details
 * GET /api/admin/flipbooks/:id
 */
const getFlipbookDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Flipbook.findById(id).lean();
    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    res.json({ success: true, flipbook: book });
  } catch (error) {
    console.error('[AdminBookController - getFlipbookDetails] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch flipbook details', error: error.message });
  }
};

/**
 * 3. Moderate Flipbook (Feature, Flag, Change Status)
 * PATCH /api/admin/flipbooks/:id/moderate
 */
const moderateFlipbook = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured, isFlagged, status } = req.body;

    const updateFields = {};
    if (typeof isFeatured === 'boolean') updateFields.isFeatured = isFeatured;
    if (typeof isFlagged === 'boolean') updateFields.isFlagged = isFlagged;
    if (status) updateFields.status = status;

    const book = await Flipbook.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    await recordAdminLog({
      adminEmail: req.admin?.emailId || 'admin@flipibook.com',
      adminName: req.admin?.name || 'Administrator',
      action: 'MODERATE_FLIPBOOK',
      targetType: 'flipbook',
      targetId: id,
      details: { updateFields, flipbookName: book.flipbookName, userEmail: book.userEmail }
    });

    res.json({
      success: true,
      message: 'Flipbook moderation status updated',
      flipbook: book
    });
  } catch (error) {
    console.error('[AdminBookController - moderateFlipbook] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to moderate flipbook', error: error.message });
  }
};

/**
 * 4. Delete Flipbook
 * DELETE /api/admin/flipbooks/:id
 */
const deleteFlipbook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Flipbook.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Flipbook not found or already deleted' });
    }

    // Record flipbook deletion in backup database
    backupService.recordFlipbookDeletion(book, {
      req,
      user: req.admin,
      reason: 'ADMIN_DELETE'
    });

    await recordAdminLog({
      adminEmail: req.admin?.emailId || 'admin@flipibook.com',
      adminName: req.admin?.name || 'Administrator',
      action: 'DELETE_FLIPBOOK',
      targetType: 'flipbook',
      targetId: id,
      details: { flipbookName: book.flipbookName, userEmail: book.userEmail }
    });

    res.json({
      success: true,
      message: `Flipbook "${book.flipbookName}" removed by administrator`,
      id
    });
  } catch (error) {
    console.error('[AdminBookController - deleteFlipbook] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete flipbook', error: error.message });
  }
};

module.exports = {
  listFlipbooks,
  getFlipbookDetails,
  moderateFlipbook,
  deleteFlipbook
};
