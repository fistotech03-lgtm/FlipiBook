const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const Flipbook = require('../../../../shared/models/Flipbook');
const FlipbookAsset = require('../../../../shared/models/FlipbookAsset');
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
 * Helper to recursively follow HTTP/HTTPS redirects
 */
const followRedirects = (url, maxRedirects = 5) => {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) return resolve(url);
    try {
      const u = new URL(url);
      const client = u.protocol === 'https:' ? https : http;
      const options = {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      };

      const request = client.request(options, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          let nextUrl = response.headers.location;
          if (!nextUrl.startsWith('http')) {
            nextUrl = new URL(nextUrl, url).href;
          }
          return followRedirects(nextUrl, maxRedirects - 1).then(resolve);
        }
        resolve(url);
      });

      request.on('error', () => resolve(url));
      request.setTimeout(5000, () => {
        request.destroy();
        resolve(url);
      });
      request.end();
    } catch (e) {
      resolve(url);
    }
  });
};

/**
 * Resolve Google Maps URL (especially shortlinks like maps.app.goo.gl)
 * @route GET /api/page-editor/resolve-map-url or /api/flipbook/resolve-map-url
 */
const resolveMapUrl = async (req, res) => {
  try {
    const rawUrl = (req.query.url || '').trim();
    if (!rawUrl) {
      return res.status(400).json({ success: false, message: 'URL query parameter is required' });
    }

    const resolved = await followRedirects(rawUrl);

    let place = '';
    let coords = '';
    const placeMatch = resolved.match(/\/maps\/place\/([^/@?]+)/i);
    const searchMatch = resolved.match(/\/maps\/search\/([^/@?]+)/i);
    const coordsMatch = resolved.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);

    if (placeMatch && placeMatch[1]) {
      place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    } else if (searchMatch && searchMatch[1]) {
      place = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
    }

    if (coordsMatch) {
      coords = `${coordsMatch[1]}, ${coordsMatch[2]}`;
    }

    try {
      const u = new URL(resolved.startsWith('http') ? resolved : `https://${resolved}`);
      const q = u.searchParams.get('q') || u.searchParams.get('query');
      if (q && !place) {
        place = decodeURIComponent(q.replace(/\+/g, ' '));
      }
    } catch (e) { }

    let embedUrl = '';
    if (coords) {
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(coords)}&t=&z=16&ie=UTF8&iwloc=near&output=embed`;
    } else if (place) {
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=15&ie=UTF8&iwloc=near&output=embed`;
    } else {
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(rawUrl)}&t=&z=14&ie=UTF8&iwloc=near&output=embed`;
    }

    const nameParts = (place || '').split(',');
    const mainTitle = nameParts[0]?.trim() || place || 'Location';
    const secondaryAddress = nameParts.length > 1 ? nameParts.slice(1).join(',').trim() : (coords ? `Coordinates: ${coords}` : mainTitle);

    return res.status(200).json({
      success: true,
      resolvedUrl: resolved,
      embedUrl,
      place: mainTitle,
      details: {
        name: mainTitle,
        address: secondaryAddress,
        coords: coords || null
      }
    });
  } catch (error) {
    console.error('[Page Editor Controller] resolveMapUrl error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resolve map URL',
      error: error.message
    });
  }
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
            } catch (e) { }
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
  getPageData,
  resolveMapUrl
};
