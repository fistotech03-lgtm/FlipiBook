const fs = require('fs');
const path = require('path');
const Flipbook = require('../models/Flipbook');
const FlipbookAsset = require('../models/FlipbookAsset');
const { getAuthUser } = require('../utils/userHelper');
const { resolveFlipbookPaths } = require('../utils/storageHelper');

/**
 * Service status / health check endpoint
 * @route GET /api/page-editor/status
 */
const getServiceStatus = (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'page-editor-service',
    timestamp: new Date().toISOString()
  });
};

/**
 * Get page editor data for an authenticated user and specific flipbook
 * @route GET /api/page-editor/data
 */
const getPageData = async (req, res) => {
  try {
    const { emailId: authEmail, objectId, customUserId } = getAuthUser(req);
    const { v_id, emailId: reqEmail } = req.query;
    const emailId = authEmail || reqEmail;

    if (!v_id) {
      return res.status(400).json({
        success: false,
        message: 'v_id query parameter is required to load page editor data'
      });
    }

    const doc = await Flipbook.findOne({ v_id });
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Flipbook not found'
      });
    }

    // Verify ownership
    if (emailId && doc.userEmail && doc.userEmail.toLowerCase() !== emailId.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this flipbook'
      });
    }

    // Fetch assets count associated with this flipbook
    const assetCount = await FlipbookAsset.countDocuments({ flipbook_v_id: v_id });

    // 1. MUST load page data directly from local storage file on disk first
    let populatedPages = doc.pages || [];
    try {
      const { bookDir } = await resolveFlipbookPaths({
        v_id: doc.v_id,
        emailId: doc.userEmail || emailId,
        folderName: doc.folderName,
        flipbookName: doc.flipbookName
      });

      populatedPages = (doc.pages || []).map((p) => {
        const pageObj = p.toObject ? p.toObject() : { ...p };
        let pageContent = '';
        const targetFileName = pageObj.fileName || `${pageObj.pageNumber}.svg`;
        const possibleFilePaths = [
          path.join(bookDir, 'pages', targetFileName),
          pageObj.name ? path.join(bookDir, 'pages', `${pageObj.name}.svg`) : null,
          path.join(bookDir, 'pages', `${pageObj.pageNumber}.svg`),
          path.join(bookDir, 'pages', `Page ${pageObj.pageNumber}.svg`),
          path.join(bookDir, 'pages', `${pageObj.name}.html`),
          path.join(bookDir, targetFileName)
        ].filter(Boolean);

        for (const filePath of possibleFilePaths) {
          if (fs.existsSync(filePath)) {
            try {
              const str = fs.readFileSync(filePath, 'utf8');
              if (str && str.trim()) {
                pageContent = str;
                break;
              }
            } catch (e) {}
          }
        }

        if (!pageContent) {
          pageContent = pageObj.html || pageObj.content || '';
        }

        return {
          ...pageObj,
          html: pageContent,
          content: pageContent
        };
      });
    } catch (readErr) {
      console.warn('[Page Editor Controller] Disk read error in getPageData:', readErr.message);
    }

    return res.status(200).json({
      success: true,
      flipbook: {
        v_id: doc.v_id,
        flipbookName: doc.flipbookName,
        folderName: doc.folderName,
        userEmail: doc.userEmail,
        fileSize: doc.fileSize || 0,
        totalPages: doc.pages?.length || 0,
        pages: populatedPages,
        assetCount,
        lastUpdated: doc.lastUpdated || doc.updatedAt
      }
    });
  } catch (error) {
    console.error('[Page Editor Controller] Error fetching page data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving page editor data',
      error: error.message
    });
  }
};

module.exports = {
  getServiceStatus,
  getPageData
};
