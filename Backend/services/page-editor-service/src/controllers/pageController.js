const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Flipbook = require('../../../../shared/models/Flipbook');
const FlipbookAsset = require('../../../../shared/models/FlipbookAsset');
const InteractionThreedModel = require('../../../../shared/models/InteractionThreedModel');
const { getAuthUser } = require('../utils/userHelper');
const {
  generateId,
  resolveFolder,
  resolveFlipbookPaths,
  initFlipbookStorage
} = require('../utils/storageHelper');
const { processAndSaveBase64Assets } = require('../utils/base64Helper');

/**
 * Generate a fallback blank SVG page with root Page frame and rectangle shap
 */
const createBlankSvg = (width = 595, height = 842, pageNumber = 1) => {
  const gId = `g_page_${pageNumber}_${Date.now().toString(36)}`;
  const rectId = `rect_${pageNumber}_${Date.now().toString(36)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="overflow: visible"><defs></defs><g id="${gId}" data-name="Page ${pageNumber}" data-type="frame"><rect id="${rectId}" x="0" y="0" width="${width}" height="${height}" fill="#ffffff" data-name="Overlay" data-type="background" data-locked="true" shape-rendering="crispEdges"/></g></svg>`;
};

/**
 * Clean up any stray Page *.html or *.html files sitting directly in the book root folder
 */
const cleanupRootHtmlFiles = (bookDir) => {
  try {
    if (fs.existsSync(bookDir)) {
      const files = fs.readdirSync(bookDir);
      files.forEach((f) => {
        if (/^Page\s*\d+\.html$/i.test(f) || (f.endsWith('.html') && !f.includes('index'))) {
          try { fs.unlinkSync(path.join(bookDir, f)); } catch (e) {}
        }
      });
    }
  } catch (err) {}
};

/**
 * Save a single page's SVG content for a flipbook inside the pages folder
 * @route POST /api/page-editor/save-page
 */
const savePage = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, v_id, pageName, content, pageNumber, keepBase64: reqKeepBase64 } = req.body;
    const emailId = authEmail || reqEmail;

    if (!v_id || !pageName || content === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: v_id, pageName, and content are required'
      });
    }

    // Locate the flipbook document
    const doc = await Flipbook.findOne({ $or: [{ book_v_id: v_id }, { v_id }] });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    // Verify ownership
    if (emailId && doc.userEmail && doc.userEmail.toLowerCase() !== emailId.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this flipbook' });
    }

    const { sanitizedEmail, folderName, flipbookName, bookDir } = await resolveFlipbookPaths({
      v_id: doc.v_id,
      emailId: doc.userEmail || emailId,
      folderName: doc.folderName,
      flipbookName: doc.flipbookName
    });

    initFlipbookStorage(bookDir);

    const docPages = doc.pages || [];
    const parsedNum = parseInt(String(pageName).replace(/\D/g, ''), 10);
    const resolvedPageNumber = pageNumber !== undefined ? pageNumber : (!isNaN(parsedNum) && parsedNum > 0 ? parsedNum : docPages.length + 1);
    const cleanPageName = String(pageName || '').replace(/[\\/:*?"<>|]/g, '').trim();
    const svgFileName = cleanPageName ? (cleanPageName.endsWith('.svg') ? cleanPageName : `${cleanPageName}.svg`) : `${resolvedPageNumber}.svg`;
    const keepBase64 = reqKeepBase64 !== undefined ? Boolean(reqKeepBase64) : false;

    // Process and extract base64 assets
    const newFlipbookAssets = [];
    let processedContent = processAndSaveBase64Assets({
      htmlContent: content,
      pageVId: v_id,
      sanitizedEmail,
      physicalFolderName: folderName,
      flipbookName,
      flipbook_v_id: doc.v_id,
      newFlipbookAssets,
      skipBase64Extraction: keepBase64
    });

    if (!processedContent || processedContent.trim() === '') {
      const pageWidth = 595;
      const pageHeight = 842;
      processedContent = createBlankSvg(pageWidth, pageHeight, resolvedPageNumber);
    } else if (processedContent.includes('<svg') && !processedContent.includes('data-name="Page ') && !processedContent.includes(`data-name="Page ${resolvedPageNumber}"`)) {
      const gId = `g_page_${resolvedPageNumber}_${Date.now().toString(36)}`;
      processedContent = processedContent.replace(/(<svg\b[^>]*>)/i, `$1\n<g id="${gId}" data-name="Page ${resolvedPageNumber}" data-type="frame">`).replace(/<\/svg>/i, '</g>\n</svg>');
    }

    // Save page ONLY inside the pages/ folder in SVG format
    const pagesDir = path.join(bookDir, 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }
    const pageFilePath = path.join(pagesDir, svgFileName);
    const pageBuffer = Buffer.from(processedContent, 'utf8');
    fs.writeFileSync(pageFilePath, pageBuffer);

    // If an older file for this page existed with a different name, remove it
    const existingPageIdx = docPages.findIndex(
      (p) => p.name === pageName || p.pageNumber === resolvedPageNumber
    );
    if (existingPageIdx >= 0) {
      const oldFileName = docPages[existingPageIdx].fileName;
      if (oldFileName && oldFileName !== svgFileName) {
        try {
          const oldFilePath = path.join(pagesDir, oldFileName);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (e) {}
      }
    }

    // Clean up any stray HTML files in the book root directory
    cleanupRootHtmlFiles(bookDir);

    // Save extracted assets to database
    if (newFlipbookAssets.length > 0) {
      try {
        let assetDoc = await FlipbookAsset.findOne({
          $or: [{ book_v_id: doc.book_v_id || doc.v_id }, { flipbook_v_id: doc.v_id }]
        });
        if (!assetDoc) {
          assetDoc = new FlipbookAsset({
            userObjectID: doc.userObjectID || doc.userId,
            userID: doc.userID || 'default',
            book_v_id: doc.book_v_id || doc.v_id,
            flipbookName: doc.flipbookName,
            folder_id: doc.folder_id || ('fol_' + crypto.randomBytes(6).toString('hex')),
            assets: { images: [], video: [], gif: [] }
          });
        }
        for (const item of newFlipbookAssets) {
          let cat = 'images';
          const t = (item.assetType || '').toLowerCase();
          if (t.includes('video')) cat = 'video';
          else if (t.includes('gif')) cat = 'gif';

          if (!Array.isArray(assetDoc.assets[cat])) assetDoc.assets[cat] = [];
          const exists = assetDoc.assets[cat].some(a => a.convertedName === item.convertedName);
          if (!exists) {
            assetDoc.assets[cat].push({
              originalName: item.originalName || '',
              convertedName: item.convertedName || item.fileName,
              page_v_id: item.page_v_id || 'global',
              url: item.url,
              size: item.size || 0,
              timestamp: new Date()
            });
          }
        }
        assetDoc.markModified('assets');
        await assetDoc.save();
      } catch (assetErr) {
        console.error('[Page Controller] Error inserting page assets:', assetErr.message);
      }
    }

    // Update or insert this page in the DB pages array
    const pageSize = pageBuffer.length;
    doc.pages = docPages;

    if (existingPageIdx >= 0) {
      doc.pages[existingPageIdx].fileName = svgFileName;
      doc.pages[existingPageIdx].name = pageName || doc.pages[existingPageIdx].name || `Page ${resolvedPageNumber}`;
      doc.pages[existingPageIdx].pageNumber = resolvedPageNumber;
      doc.pages[existingPageIdx].size = pageSize;
      if (doc.pages[existingPageIdx].hide === undefined) {
        doc.pages[existingPageIdx].hide = 0;
      }
    } else {
      const newPageVId = `page_${generateId(9)}`;
      doc.pages.push({
        pageNumber: resolvedPageNumber,
        name: pageName || `Page ${resolvedPageNumber}`,
        fileName: svgFileName,
        page_v_id: newPageVId,
        size: pageSize,
        hide: 0
      });
    }

    doc.fileSize = doc.pages.reduce((sum, p) => sum + (p.size || 0), 0);
    doc.lastUpdated = new Date();
    doc.markModified('pages');
    await doc.save();

    return res.status(200).json({
      success: true,
      message: 'Page saved in SVG format inside pages folder',
      pageName,
      fileName: svgFileName,
      pageNumber: resolvedPageNumber,
      fileSize: doc.fileSize
    });
  } catch (error) {
    console.error('[Page Controller] Error saving page:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving page',
      error: error.message
    });
  }
};

/**
 * Save multiple pages in batch inside pages/ folder in SVG format
 * @route POST /api/page-editor/save-pages-batch
 */
const savePagesBatch = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, v_id, pages, keepBase64 = true, fileSize } = req.body;
    const emailId = authEmail || reqEmail;

    if (!v_id || !Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields or pages array is empty'
      });
    }

    const doc = await Flipbook.findOne({ $or: [{ book_v_id: v_id }, { v_id }] });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    if (emailId && doc.userEmail && doc.userEmail.toLowerCase() !== emailId.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this flipbook' });
    }

    const { sanitizedEmail, folderName, flipbookName, bookDir } = await resolveFlipbookPaths({
      v_id: doc.v_id,
      emailId: doc.userEmail || emailId,
      folderName: doc.folderName,
      flipbookName: doc.flipbookName
    });

    initFlipbookStorage(bookDir);

    doc.pages = doc.pages || [];
    const newFlipbookAssets = [];
    const savedBase64Map = new Map();

    const pagesDir = path.join(bookDir, 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    const uploadResults = pages.map((page, idx) => {
      const { pageName, content, pageNumber, v_id: pageVId } = page;
      const parsedNum = parseInt(String(pageName || '').replace(/\D/g, ''), 10);
      const resolvedPageNumber = pageNumber !== undefined ? pageNumber : (!isNaN(parsedNum) && parsedNum > 0 ? parsedNum : idx + 1);
      const cleanPageName = String(pageName || '').replace(/[\\/:*?"<>|]/g, '').trim();
      const svgFileName = cleanPageName ? (cleanPageName.endsWith('.svg') ? cleanPageName : `${cleanPageName}.svg`) : `${resolvedPageNumber}.svg`;

      let processedContent = processAndSaveBase64Assets({
        htmlContent: content,
        pageVId: pageVId || `page_${generateId(9)}`,
        sanitizedEmail,
        physicalFolderName: folderName,
        flipbookName,
        flipbook_v_id: doc.v_id,
        newFlipbookAssets,
        savedBase64Map,
        skipBase64Extraction: keepBase64
      });

      if (!processedContent || processedContent.trim() === '') {
        const pageWidth = 595;
        const pageHeight = 842;
        processedContent = createBlankSvg(pageWidth, pageHeight, resolvedPageNumber);
      } else if (processedContent.includes('<svg') && !processedContent.includes('data-name="Page ') && !processedContent.includes(`data-name="Page ${resolvedPageNumber}"`)) {
        const gId = `g_page_${resolvedPageNumber}_${Date.now().toString(36)}`;
        processedContent = processedContent.replace(/(<svg\b[^>]*>)/i, `$1\n<g id="${gId}" data-name="Page ${resolvedPageNumber}" data-type="frame">`).replace(/<\/svg>/i, '</g>\n</svg>');
      }

      // Save page file strictly inside pages/ in SVG format
      const pageFilePath = path.join(pagesDir, svgFileName);
      const pageBuffer = Buffer.from(processedContent, 'utf8');
      fs.writeFileSync(pageFilePath, pageBuffer);

      // Check if old file with different name exists for this page and remove it
      const existingPage = doc.pages.find(
        (p) => p.name === pageName || p.pageNumber === resolvedPageNumber || (pageVId && p.v_id === pageVId)
      );
      if (existingPage && existingPage.fileName && existingPage.fileName !== svgFileName) {
        try {
          const oldFilePath = path.join(pagesDir, existingPage.fileName);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (e) {}
      }

      return {
        pageName: pageName || `Page ${resolvedPageNumber}`,
        fileName: svgFileName,
        pageNumber: resolvedPageNumber,
        pageVId,
        pageSize: pageBuffer.length,
        processedContent
      };
    });

    // Clean up any stray HTML files in the book root directory
    cleanupRootHtmlFiles(bookDir);

    for (const result of uploadResults) {
      const existingPageIdx = doc.pages.findIndex(
        (p) => p.name === result.pageName || p.pageNumber === result.pageNumber
      );
      if (existingPageIdx >= 0) {
        doc.pages[existingPageIdx].fileName = result.fileName;
        doc.pages[existingPageIdx].pageNumber = result.pageNumber;
        doc.pages[existingPageIdx].size = result.pageSize;
        if (doc.pages[existingPageIdx].hide === undefined) {
          doc.pages[existingPageIdx].hide = 0;
        }
      } else {
        doc.pages.push({
          pageNumber: result.pageNumber,
          name: result.pageName,
          fileName: result.fileName,
          page_v_id: result.pageVId || `page_${generateId(9)}`,
          size: result.pageSize,
          hide: 0
        });
      }
    }

    if (newFlipbookAssets.length > 0) {
      try {
        let assetDoc = await FlipbookAsset.findOne({
          $or: [{ book_v_id: doc.book_v_id || doc.v_id }, { flipbook_v_id: doc.v_id }]
        });
        if (!assetDoc) {
          assetDoc = new FlipbookAsset({
            userObjectID: doc.userObjectID || doc.userId,
            userID: doc.userID || 'default',
            book_v_id: doc.book_v_id || doc.v_id,
            flipbookName: doc.flipbookName,
            folder_id: doc.folder_id || ('fol_' + crypto.randomBytes(6).toString('hex')),
            assets: { images: [], video: [], gif: [] }
          });
        }
        for (const item of newFlipbookAssets) {
          let cat = 'images';
          const t = (item.assetType || '').toLowerCase();
          if (t.includes('video')) cat = 'video';
          else if (t.includes('gif')) cat = 'gif';

          if (!Array.isArray(assetDoc.assets[cat])) assetDoc.assets[cat] = [];
          const exists = assetDoc.assets[cat].some(a => a.convertedName === item.convertedName);
          if (!exists) {
            assetDoc.assets[cat].push({
              originalName: item.originalName || '',
              convertedName: item.convertedName || item.fileName,
              page_v_id: item.page_v_id || 'global',
              url: item.url,
              size: item.size || 0,
              timestamp: new Date()
            });
          }
        }
        assetDoc.markModified('assets');
        await assetDoc.save();
      } catch (assetErr) {
        console.error('[Page Controller] Error inserting batch assets:', assetErr.message);
      }
    }

    if (fileSize && fileSize > 0) {
      doc.fileSize = fileSize;
    } else {
      const calculatedPagesSize = doc.pages.reduce((sum, p) => sum + (p.size || 0), 0);
      if (calculatedPagesSize > 0) {
        doc.fileSize = calculatedPagesSize;
      }
    }

    // Reconcile and clean up physical SVG files for pages no longer present
    try {
      if (fs.existsSync(pagesDir)) {
        const activeFileNames = new Set(doc.pages.map(p => p.fileName).filter(Boolean));
        doc.pages.forEach(p => {
          if (p.pageNumber) activeFileNames.add(`${p.pageNumber}.svg`);
          if (p.name) {
            const clean = String(p.name).replace(/[\\/:*?"<>|]/g, '').trim();
            if (clean) activeFileNames.add(`${clean}.svg`);
          }
        });
        const diskFiles = fs.readdirSync(pagesDir);
        for (const df of diskFiles) {
          if ((df.endsWith('.svg') || df.endsWith('.html')) && !activeFileNames.has(df)) {
            try {
              fs.unlinkSync(path.join(pagesDir, df));
              console.log(`[Page Controller] Cleaned up deleted page file from disk: ${df}`);
            } catch (delErr) {}
          }
        }
      }
    } catch (cleanErr) {}

    // Reconcile and clean up unreferenced FlipbookAsset & InteractionThreedModel
    try {
      if (fs.existsSync(pagesDir)) {
        let allPageSvgs = '';
        const pageFiles = fs.readdirSync(pagesDir);
        for (const pf of pageFiles) {
          if (pf.endsWith('.svg') || pf.endsWith('.html')) {
            try {
              allPageSvgs += ' ' + fs.readFileSync(path.join(pagesDir, pf), 'utf8').toLowerCase();
            } catch (e) {}
          }
        }
        for (const resItem of uploadResults) {
          if (resItem.processedContent) {
            allPageSvgs += ' ' + String(resItem.processedContent).toLowerCase();
          }
        }

        // Clean up unreferenced InteractionThreedModel
        const query3DOr = [{ flipbook_v_id: doc.v_id }];
        if (flipbookName) {
          query3DOr.push({
            flipbookName: flipbookName,
            userEmail: new RegExp(`^${doc.userEmail || emailId}$`, 'i')
          });
        }
        const all3DModels = await InteractionThreedModel.find({ $or: query3DOr });
        for (const model of all3DModels) {
          const fNameLower = (model.fileName || '').toLowerCase();
          const vIdLower = (model.v_id || '').toLowerCase();
          const isReferenced =
            (fNameLower && allPageSvgs.includes(fNameLower)) ||
            (vIdLower && allPageSvgs.includes(vIdLower));

          if (!isReferenced) {
            const disk3DPath = path.join(bookDir, 'assets', '3D_Model', model.fileName);
            if (fs.existsSync(disk3DPath)) {
              try {
                fs.unlinkSync(disk3DPath);
              } catch (e) {}
            }
            await InteractionThreedModel.deleteOne({ _id: model._id });
            await FlipbookAsset.deleteMany({
              flipbook_v_id: doc.v_id,
              $or: [{ fileName: model.fileName }, { file_v_id: model.v_id }]
            }).catch(() => {});
            console.log(`[Page Controller] Cleaned up unreferenced InteractionThreedModel: ${model.fileName} (${model.v_id})`);
          }
        }

        // Clean up unreferenced FlipbookAssets
        const assetDoc = await FlipbookAsset.findOne({
          $or: [{ book_v_id: doc.book_v_id || doc.v_id }, { flipbook_v_id: doc.v_id }]
        });
        if (assetDoc && assetDoc.assets) {
          for (const cat of ['images', 'video', 'gif']) {
            if (!Array.isArray(assetDoc.assets[cat])) continue;
            const kept = [];
            for (const asset of assetDoc.assets[cat]) {
              const fNameLower = (asset.convertedName || asset.fileName || '').toLowerCase();
              const isReferenced = fNameLower && allPageSvgs.includes(fNameLower);
              if (isReferenced) {
                kept.push(asset);
              } else {
                const subFolder = cat === 'images' ? 'Image' : cat;
                const diskAssetPath = path.join(bookDir, 'assets', subFolder, asset.convertedName || asset.fileName);
                if (fs.existsSync(diskAssetPath)) {
                  try {
                    fs.unlinkSync(diskAssetPath);
                  } catch (e) {}
                }
                console.log(`[Page Controller] Cleaned up unreferenced asset: ${asset.convertedName || asset.fileName}`);
              }
            }
            assetDoc.assets[cat] = kept;
          }
          assetDoc.markModified('assets');
          await assetDoc.save();
        }
      }
    } catch (assetCleanErr) {
      console.warn('[Page Controller] Warning cleaning up unused assets:', assetCleanErr.message);
    }

    doc.lastUpdated = new Date();
    doc.markModified('pages');
    await doc.save();

    return res.status(200).json({
      success: true,
      message: 'Batch saved in SVG format inside pages folder',
      pagesSaved: pages.length,
      fileSize: doc.fileSize
    });
  } catch (error) {
    console.error('[Page Controller] Error saving pages batch:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving pages batch',
      error: error.message
    });
  }
};

/**
 * Fetch content for a single page on-demand
 * @route GET /api/page-editor/get-page
 */
const getPage = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, v_id, pageIndex, pageName, fileName, folderName, bookName } = req.query;
    const emailId = authEmail || reqEmail;

    let dbDoc = null;
    if (v_id) {
      dbDoc = await Flipbook.findOne({ v_id });
    }

    if (!dbDoc && (!emailId || !bookName)) {
      return res.status(400).json({ success: false, message: 'Missing fields: v_id or emailId & bookName required' });
    }

    if (!dbDoc && emailId && bookName) {
      dbDoc = await Flipbook.findOne({ userEmail: emailId, flipbookName: bookName });
    }

    if (!dbDoc) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    let targetPage = null;
    if (dbDoc.pages && dbDoc.pages.length > 0) {
      if (pageName) targetPage = dbDoc.pages.find((p) => p.name === pageName);
      if (!targetPage && fileName) targetPage = dbDoc.pages.find((p) => p.fileName === fileName);
      if (!targetPage && pageIndex !== undefined) {
        const idx = parseInt(pageIndex, 10);
        if (!isNaN(idx) && idx >= 0 && idx < dbDoc.pages.length) {
          targetPage = dbDoc.pages[idx];
        }
      }
    }

    if (!targetPage) {
      return res.status(404).json({ success: false, message: 'Page not found in flipbook' });
    }

    let content = '';

    // 1. MUST load page data directly from local storage file on disk first
    try {
      const { bookDir } = await resolveFlipbookPaths({
        v_id: dbDoc.v_id,
        emailId: dbDoc.userEmail,
        folderName: dbDoc.folderName,
        flipbookName: dbDoc.flipbookName
      });

      const targetFileName = targetPage.fileName || `${targetPage.pageNumber}.svg`;
      const possibleFilePaths = [
        path.join(bookDir, 'pages', targetFileName),
        targetPage.name ? path.join(bookDir, 'pages', `${targetPage.name}.svg`) : null,
        path.join(bookDir, 'pages', `${targetPage.pageNumber}.svg`),
        path.join(bookDir, 'pages', `Page ${targetPage.pageNumber}.svg`),
        path.join(bookDir, 'pages', `${targetPage.name}.html`),
        path.join(bookDir, targetFileName)
      ].filter(Boolean);

      for (const filePath of possibleFilePaths) {
        if (fs.existsSync(filePath)) {
          const str = fs.readFileSync(filePath, 'utf8');
          if (str && str.trim()) {
            content = str;
            break;
          }
        }
      }
    } catch (diskErr) {
      console.warn('[Page Controller] Could not read page from disk:', diskErr.message);
    }

    // 2. Fallback to MongoDB only if local storage file does not exist
    if (!content) {
      content = targetPage.html || targetPage.content || '';
    }

    return res.status(200).json({
      success: true,
      name: targetPage.name,
      fileName: targetPage.fileName || `${targetPage.pageNumber}.svg`,
      html: content,
      content,
      hide: targetPage.hide || 0,
      v_id: targetPage.v_id,
      pageNumber: targetPage.pageNumber
    });
  } catch (err) {
    console.error('[Page Controller] Error fetching single page:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching page',
      error: err.message
    });
  }
};

/**
 * Rename a page and rename its corresponding physical file on disk
 * @route POST /api/page-editor/rename-page
 */
const renamePage = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { v_id, pageId, pageNumber, oldPageName, newPageName, emailId: reqEmail } = req.body;
    const emailId = authEmail || reqEmail;

    if (!v_id || !newPageName || !newPageName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'v_id and newPageName are required'
      });
    }

    const trimmedNewName = newPageName.trim();

    const doc = await Flipbook.findOne({ v_id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    if (emailId && doc.userEmail && doc.userEmail.toLowerCase() !== emailId.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this flipbook' });
    }

    doc.pages = doc.pages || [];
    let pageIndex = -1;
    if (pageId) {
      pageIndex = doc.pages.findIndex((p) => p.v_id === pageId || p.id === pageId);
    }
    if (pageIndex === -1 && pageNumber !== undefined) {
      pageIndex = doc.pages.findIndex((p) => p.pageNumber === Number(pageNumber));
    }
    if (pageIndex === -1 && oldPageName) {
      pageIndex = doc.pages.findIndex((p) => p.name === oldPageName);
    }

    if (pageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Page not found in flipbook' });
    }

    const page = doc.pages[pageIndex];
    const prevName = page.name;
    const prevFileName = page.fileName;

    const { bookDir } = await resolveFlipbookPaths({
      v_id: doc.v_id,
      emailId: doc.userEmail || emailId,
      folderName: doc.folderName,
      flipbookName: doc.flipbookName
    });

    const pagesDir = path.join(bookDir, 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    // Clean up filename: remove invalid filename characters
    const cleanNewName = trimmedNewName.replace(/[\\/:*?"<>|]/g, '').trim();
    const newFileName = cleanNewName.endsWith('.svg') ? cleanNewName : `${cleanNewName}.svg`;
    const newFilePath = path.join(pagesDir, newFileName);

    // Identify candidate old files on disk to rename
    const oldCandidateNames = [
      prevFileName,
      `${prevName}.svg`,
      oldPageName ? `${oldPageName}.svg` : null,
      `${page.pageNumber}.svg`,
      `Page ${page.pageNumber}.svg`
    ].filter(Boolean);

    let foundOldFilePath = null;
    for (const oldName of oldCandidateNames) {
      const p = path.join(pagesDir, oldName);
      if (fs.existsSync(p)) {
        foundOldFilePath = p;
        break;
      }
    }

    let pageSvgContent = page.html || page.content || '';

    if (foundOldFilePath) {
      // Read current content from disk file to preserve local changes
      try {
        const diskContent = fs.readFileSync(foundOldFilePath, 'utf8');
        if (diskContent && diskContent.trim()) {
          pageSvgContent = diskContent;
        }
      } catch (readErr) {}

      // Rename physical file on disk if name changed
      if (path.resolve(foundOldFilePath) !== path.resolve(newFilePath)) {
        try {
          fs.renameSync(foundOldFilePath, newFilePath);
        } catch (renameErr) {
          try {
            fs.copyFileSync(foundOldFilePath, newFilePath);
            fs.unlinkSync(foundOldFilePath);
          } catch (copyErr) {
            console.error('[Page Controller] Fallback copy/unlink error:', copyErr.message);
          }
        }
      }
    } else {
      if (!pageSvgContent || !pageSvgContent.trim()) {
        const pageWidth = 595;
        const pageHeight = 842;
        pageSvgContent = createBlankSvg(pageWidth, pageHeight, page.pageNumber);
      }
      fs.writeFileSync(newFilePath, pageSvgContent, 'utf8');
    }

    // Synchronize root frame data-name in the physical SVG file
    if (fs.existsSync(newFilePath)) {
      try {
        let svgStr = fs.readFileSync(newFilePath, 'utf8');
        if (svgStr.includes('data-name="')) {
          svgStr = svgStr.replace(/(<g\b[^>]*\bdata-type="frame"[^>]*\bdata-name=")[^"]*(")/i, `$1${trimmedNewName}$2`);
          svgStr = svgStr.replace(/(<g\b[^>]*\bdata-name=")[^"]*("[^>]*\bdata-type="frame")/i, `$1${trimmedNewName}$2`);
          fs.writeFileSync(newFilePath, svgStr, 'utf8');
          pageSvgContent = svgStr;
        }
      } catch (xmlErr) {}
    }

    // Update MongoDB document
    doc.pages[pageIndex].name = trimmedNewName;
    doc.pages[pageIndex].fileName = newFileName;
    doc.lastUpdated = new Date();
    doc.markModified('pages');
    await doc.save();

    return res.status(200).json({
      success: true,
      message: 'Page renamed successfully and physical file updated',
      pageNumber: page.pageNumber,
      name: trimmedNewName,
      fileName: newFileName
    });
  } catch (error) {
    console.error('[Page Controller] Error renaming page:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error renaming page',
      error: error.message
    });
  }
};

/**
 * Delete a specific page from flipbook and remove its physical file from disk
 * @route POST /api/page-editor/delete-page
 */
const deletePage = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { v_id, pageId, pageNumber, fileName, oldPageName, emailId: reqEmail } = req.body;
    const emailId = authEmail || reqEmail;

    if (!v_id) {
      return res.status(400).json({
        success: false,
        message: 'v_id is required'
      });
    }

    const doc = await Flipbook.findOne({ v_id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    if (emailId && doc.userEmail && doc.userEmail.toLowerCase() !== emailId.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this flipbook' });
    }

    doc.pages = doc.pages || [];
    if (doc.pages.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'A flipbook must have at least one page. Cannot delete the only remaining page.'
      });
    }

    let pageIndex = -1;
    if (pageId) {
      pageIndex = doc.pages.findIndex((p) => p.v_id === pageId || p.id === pageId);
    }
    if (pageIndex === -1 && pageNumber !== undefined) {
      pageIndex = doc.pages.findIndex((p) => p.pageNumber === Number(pageNumber));
    }
    if (pageIndex === -1 && fileName) {
      pageIndex = doc.pages.findIndex((p) => p.fileName === fileName);
    }
    if (pageIndex === -1 && oldPageName) {
      pageIndex = doc.pages.findIndex((p) => p.name === oldPageName);
    }

    if (pageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Page not found in flipbook' });
    }

    const pageToDelete = doc.pages[pageIndex];

    const { bookDir } = await resolveFlipbookPaths({
      v_id: doc.v_id,
      emailId: doc.userEmail || emailId,
      folderName: doc.folderName,
      flipbookName: doc.flipbookName
    });

    const pagesDir = path.join(bookDir, 'pages');

    const otherPages = doc.pages.filter((_, idx) => idx !== pageIndex);
    const otherFileNames = new Set();
    otherPages.forEach(p => {
      if (p.fileName) otherFileNames.add(p.fileName.toLowerCase());
      if (p.name) otherFileNames.add(`${p.name.toLowerCase()}.svg`);
    });

    const candidateFilesToRemove = [
      pageToDelete.fileName,
      fileName,
      pageToDelete.name ? `${pageToDelete.name}.svg` : null,
      oldPageName ? `${oldPageName}.svg` : null,
      pageToDelete.name ? `${pageToDelete.name}.html` : null
    ].filter(Boolean);

    // Only delete candidate files that do NOT belong to any remaining active page!
    const filesToRemove = candidateFilesToRemove.filter(f => !otherFileNames.has(f.toLowerCase()));

    if (fs.existsSync(pagesDir)) {
      filesToRemove.forEach(f => {
        try {
          const filePath = path.join(pagesDir, f);
          if (fs.existsSync(filePath)) {
            console.log(`[Page Controller] Deleting page file from disk: ${filePath}`);
            fs.unlinkSync(filePath);
          }
        } catch (unlinkErr) {
          console.warn('[Page Controller] Could not delete page file:', f, unlinkErr.message);
        }
      });
    }

    // Remove page from MongoDB pages array
    doc.pages.splice(pageIndex, 1);

    // Renumber remaining pages
    doc.pages.forEach((p, idx) => {
      p.pageNumber = idx + 1;
    });

    doc.fileSize = doc.pages.reduce((sum, p) => sum + (p.size || 0), 0);
    doc.lastUpdated = new Date();
    doc.markModified('pages');
    await doc.save();

    return res.status(200).json({
      success: true,
      message: 'Page deleted and physical file removed from disk',
      totalPages: doc.pages.length,
      pages: doc.pages
    });
  } catch (error) {
    console.error('[Page Controller] Error deleting page:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting page',
      error: error.message
    });
  }
};

/**
 * Migration/optimization: inline external SVG references inside HTML/SVG pages
 * @route POST /api/page-editor/inline-svgs
 */
const inlineSvgs = async (req, res) => {
  try {
    const { emailId: authEmail } = getAuthUser(req);
    const { emailId: reqEmail, v_id, folderName, flipbookName } = req.body;
    const emailId = authEmail || reqEmail;

    const { doc, bookDir } = await resolveFlipbookPaths({
      v_id,
      emailId,
      folderName,
      flipbookName
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Flipbook not found' });
    }

    let modifiedCount = 0;
    const svgHrefRegex = /href=["'](\.\/assets\/[iI]mage\/([^"']+\.svg))["']/gi;

    if (Array.isArray(doc.pages)) {
      for (const page of doc.pages) {
        const pageContent = page.html || page.content;
        if (!pageContent) continue;
        let updatedContent = pageContent;
        let pageModified = false;

        updatedContent = updatedContent.replace(svgHrefRegex, (match, relPath, svgFileName) => {
          const svgPath = path.join(bookDir, 'assets', 'Image', svgFileName);
          if (fs.existsSync(svgPath)) {
            const svgText = fs.readFileSync(svgPath, 'utf8');
            const b64 = Buffer.from(svgText).toString('base64');
            pageModified = true;
            return `href="data:image/svg+xml;base64,${b64}"`;
          }
          return match;
        });

        if (pageModified) {
          modifiedCount++;
          // Write updated SVG file to disk inside pages/
          const targetFile = page.fileName || `${page.pageNumber}.svg`;
          const filePath = path.join(bookDir, 'pages', targetFile);
          try {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
          } catch (e) {}
        }
      }

      if (modifiedCount > 0) {
        doc.markModified('pages');
        doc.lastUpdated = new Date();
        await doc.save();
      }
    }

    // Clean up any stray root HTML files
    cleanupRootHtmlFiles(bookDir);

    return res.status(200).json({
      success: true,
      message: `Inlined SVGs in ${modifiedCount} page(s)`,
      modifiedCount
    });
  } catch (err) {
    console.error('[Page Controller] Error inlining SVGs:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error inlining SVGs',
      error: err.message
    });
  }
};

module.exports = {
  savePage,
  savePagesBatch,
  getPage,
  renamePage,
  deletePage,
  inlineSvgs
};
