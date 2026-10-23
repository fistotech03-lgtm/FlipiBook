const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateId, getStorageRoot } = require('./storageHelper');

/**
 * Detects any gallery asset URLs used in page SVG/HTML or interactions,
 * copies them to the flipbook's own assets folder on disk,
 * creates new FlipbookAsset records (isGallery: false),
 * and replaces the gallery URLs with relative paths (./assets/...) or flipbook asset URLs.
 */
const processAndCopyGalleryAssets = ({
  htmlContent,
  pageVId,
  bookDir,
  flipbook_v_id,
  flipbookName,
  folderName,
  userEmail,
  userFolder,
  newFlipbookAssets = [],
  savedGalleryMap = new Map()
}) => {
  if (!htmlContent || typeof htmlContent !== 'string') return '';

  const storageRoot = getStorageRoot();
  // Regex to match any gallery asset URL:
  // e.g. /storage/FLIPI0001/Images/xxx.png or http://localhost:8000/storage/FLIPI0001/Images/xxx.png
  const galleryRegex = /(?:https?:\/\/[^\/"'\s]+)?\/(?:storage|uploads)\/([a-zA-Z0-9_.-]+)\/(Images|Videos|gifs|audio|3D_Models|Gallery\/(?:Images|Videos|gifs|audio|3D_Models))\/([^"&'<>)\s,]+)/gi;

  let processed = htmlContent.replace(galleryRegex, (match, galleryUserFolder, gallerySub, fileName) => {
    if (savedGalleryMap.has(match)) {
      return savedGalleryMap.get(match);
    }
    if (savedGalleryMap.has(fileName)) {
      return savedGalleryMap.get(fileName);
    }

    let subfolder = 'Image';
    const subLower = gallerySub.toLowerCase();
    if (subLower.includes('video')) subfolder = 'video';
    else if (subLower.includes('gif')) subfolder = 'gif';
    else if (subLower.includes('audio')) subfolder = 'audio';
    else if (subLower.includes('3d')) subfolder = '3D_Model';

    const cleanSub = gallerySub.split('/').pop();
    const candidateDirs = Array.from(new Set([galleryUserFolder, userFolder, userEmail?.replace(/[@.]/g, '_')].filter(Boolean)));
    let srcFile = null;

    for (const uDir of candidateDirs) {
      const p1 = path.join(storageRoot, uDir, cleanSub, fileName);
      const p2 = path.join(storageRoot, uDir, 'Gallery', cleanSub, fileName);
      if (fs.existsSync(p1)) {
        srcFile = p1;
        break;
      }
      if (fs.existsSync(p2)) {
        srcFile = p2;
        break;
      }
    }

    if (!srcFile) {
      return match;
    }

    const targetDir = path.join(bookDir, 'assets', subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const assetFileName = fileName.startsWith('asset_') ? fileName : `asset_${fileName}`;
    const destPath = path.join(targetDir, assetFileName);

    try {
      fs.copyFileSync(srcFile, destPath);
      const fileSize = fs.statSync(destPath).size;

      const relativePath = `../assets/${subfolder}/${assetFileName}`;

      newFlipbookAssets.push({
        flipbook_v_id: flipbook_v_id,
        file_v_id: generateId(16),
        assetType: subfolder,
        fileName: assetFileName,
        originalName: fileName,
        page_v_id: pageVId || 'global',
        userEmail: userEmail || '',
        isGallery: false,
        flipbookName: flipbookName,
        folderName: folderName,
        url: relativePath,
        size: fileSize
      });

      savedGalleryMap.set(match, relativePath);
      savedGalleryMap.set(fileName, relativePath);
      return relativePath;
    } catch (err) {
      console.warn('[Asset Helper] Failed to copy gallery asset to flipbook assets folder:', err.message);
      return match;
    }
  });

  return processed;
};

/**
 * Normalizes all absolute and full storage flipbook asset URLs to relative paths (../assets/<subfolder>/<filename>)
 * Handles production domains (e.g. https://testing.flipibook.com/...), localhost, /storage/..., /uploads/...,
 * ./assets/..., and JSON-escaped URLs.
 */
const normalizeToRelativeAssetPaths = (html) => {
  if (!html || typeof html !== 'string') return html;

  // 1. Matches any absolute or root-relative URL pointing to a flipbook asset
  const assetRegex = /(?:https?:\/\/[^\/"'\s]+(?:\/(?:storage|uploads)(?:\/[^\/"'\s]+)*|\/assets)?|\/(?:storage|uploads)(?:\/[^\/"'\s]+)*)\/assets\/(Image|video|gif|audio|3D_Model|download)\/([^"&'<>)\s,]+)/gi;
  let res = html.replace(assetRegex, '../assets/$1/$2');

  // 2. Also handle JSON-escaped backslash versions (e.g. https:\/\/testing.flipibook.com\/...)
  const escapedAssetRegex = /(?:https?:\\\/\\\/[^\\/"'\s]+(?:\\?\/(?:storage|uploads)(?:\\?\/[^\\/"'\s]+)*|\\?\/assets)?|\\?\/(?:storage|uploads)(?:\\?\/[^\\/"'\s]+)*)\\?\/assets\\?\/(Image|video|gif|audio|3D_Model|download)\\?\/([^"&'<>)\s,\\]+)/gi;
  res = res.replace(escapedAssetRegex, '../assets/$1/$2');

  // 3. Ensure any /assets/... without leading dot becomes ../assets/...
  res = res.replace(/(["'\s(])\/assets\/(Image|video|gif|audio|3D_Model|download)\/([^"&'<>)\s,]+)/gi, '$1../assets/$2/$3');

  // 4. Ensure any bare assets/... becomes ../assets/...
  res = res.replace(/(["'\s(])assets\/(Image|video|gif|audio|3D_Model|download)\/([^"&'<>)\s,]+)/gi, '$1../assets/$2/$3');

  // 5. Convert legacy ./assets/ to ../assets/
  res = res.replace(/(["'\s(])\.\/assets\/(Image|video|gif|audio|3D_Model|download)\/([^"&'<>)\s,]+)/gi, '$1../assets/$2/$3');

  // 6. Clean up any accidental double-dot-slashes (../../assets/ or ././assets/ -> ../assets/)
  res = res.replace(/(?:\.\.\/|\.\/)+assets\//g, '../assets/');

  return res;
};

/**
 * Extracts base64 assets from page HTML, saves them to flipbook assets folder on disk,
 * and tracks new FlipbookAsset model records.
 * Also detects and copies any Gallery assets into the flipbook's own assets folder.
 */
const processAndSaveBase64Assets = ({
  htmlContent,
  pageVId,
  sanitizedEmail,
  physicalFolderName,
  flipbookName,
  flipbook_v_id,
  userEmail,
  userFolder,
  newFlipbookAssets = [],
  savedBase64Map = new Map(),
  savedGalleryMap = new Map(),
  skipBase64Extraction = false
}) => {
  if (!htmlContent) return '';
  if (skipBase64Extraction) return normalizeToRelativeAssetPaths(htmlContent);

  // Protect PDF Background elements from being extracted into separate asset files.
  const pdfBgPlaceholders = new Map();
  let contentToProcess = htmlContent;

  // 1. Protect entire <g data-name="PDF Background" ...> ... </g> groups
  const pdfBgGroupRegex = /<g\b[^>]*data-name=["'](?:PDF Background|pdf background)["'][^>]*>/gi;
  let gMatch;
  while ((gMatch = pdfBgGroupRegex.exec(contentToProcess)) !== null) {
    const startIdx = gMatch.index;
    let depth = 1;
    let currIdx = startIdx + gMatch[0].length;
    const tagRegex = /<\/?g\b[^>]*\/?>/gi;
    tagRegex.lastIndex = currIdx;
    let tagMatch;
    let endIdx = -1;
    while ((tagMatch = tagRegex.exec(contentToProcess)) !== null) {
      const tagStr = tagMatch[0];
      if (tagStr.startsWith('</')) {
        depth--;
        if (depth === 0) {
          endIdx = tagMatch.index + tagStr.length;
          break;
        }
      } else if (!tagStr.endsWith('/>')) {
        depth++;
      }
    }

    if (endIdx !== -1) {
      const fullGroup = contentToProcess.substring(startIdx, endIdx);
      const phKey = `__PDF_BG_GROUP_PH_${generateId(9)}__`;
      pdfBgPlaceholders.set(phKey, fullGroup);
      contentToProcess =
        contentToProcess.substring(0, startIdx) + phKey + contentToProcess.substring(endIdx);
      pdfBgGroupRegex.lastIndex = startIdx + phKey.length;
    } else {
      break;
    }
  }

  // 2. Protect standalone <image ... data-name="PDF Background"> tags
  const pdfBgTagRegex =
    /<image\b[^>]*data-name=["'](?:PDF Background|pdf background)["'][^>]*\/?>/gi;
  contentToProcess = contentToProcess.replace(pdfBgTagRegex, (tagMatch) => {
    const phKey = `__PDF_BG_IMAGE_PH_${generateId(9)}__`;
    pdfBgPlaceholders.set(phKey, tagMatch);
    return phKey;
  });

  const storageRoot = getStorageRoot();
  const resolvedUFolder = userFolder || sanitizedEmail;
  let bookDir = path.join(storageRoot, resolvedUFolder, 'books', physicalFolderName, flipbookName);
  if (!fs.existsSync(bookDir) && sanitizedEmail && sanitizedEmail !== resolvedUFolder) {
    const altDir = path.join(storageRoot, sanitizedEmail, 'books', physicalFolderName, flipbookName);
    if (fs.existsSync(altDir)) bookDir = altDir;
  }

  const base64Regex = /data:([^;]+);base64,([^"&'<>)\s]+)/g;
  let processedHtml = contentToProcess.replace(base64Regex, (match, mimeType, base64Data) => {
    if (savedBase64Map.has(base64Data)) {
      return savedBase64Map.get(base64Data);
    }

    let isDownload = false;
    let actualMimeType = mimeType;
    if (mimeType.startsWith('download-')) {
      isDownload = true;
      actualMimeType = mimeType.replace('download-', '');
    }

    const parts = actualMimeType ? actualMimeType.split('/') : ['unknown', 'bin'];
    const type = parts[0] || 'unknown';
    const ext = parts[1] || 'bin';
    let subfolder = type;
    let normalizedExt = ext;

    if (isDownload) {
      subfolder = 'download';
    } else {
      if (type === 'image') subfolder = 'Image';
      else if (type === 'audio') subfolder = 'audio';
      else if (type === 'video') subfolder = 'video';
      else subfolder = 'download';
    }

    if (!isDownload && ext === 'gif') subfolder = 'gif';
    if (normalizedExt.includes('+')) normalizedExt = normalizedExt.split('+')[0];

    const contentHash = crypto.createHash('md5').update(base64Data).digest('hex').slice(0, 16);
    const assetFileName = `asset_${contentHash}.${normalizedExt}`;
    const relativePath = `../assets/${subfolder}/${assetFileName}`;

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const targetDir = path.join(bookDir, 'assets', subfolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, assetFileName);
      fs.writeFileSync(filePath, buffer);

      const relativeAssetUrl = `../assets/${subfolder}/${assetFileName}`;

      newFlipbookAssets.push({
        flipbook_v_id: flipbook_v_id,
        file_v_id: generateId(16),
        assetType: subfolder,
        fileName: assetFileName,
        originalName: assetFileName,
        page_v_id: pageVId,
        userEmail: userEmail || '',
        isGallery: false,
        flipbookName: flipbookName,
        folderName: physicalFolderName,
        url: relativeAssetUrl,
        size: buffer.length
      });

      savedBase64Map.set(base64Data, relativePath);
      return relativePath;
    } catch (err) {
      console.error('[Base64 Helper] Error saving base64 asset:', err.message);
      return match;
    }
  });

  // 3. Process and copy any Gallery asset URLs into the flipbook's own assets folder
  processedHtml = processAndCopyGalleryAssets({
    htmlContent: processedHtml,
    pageVId,
    bookDir,
    flipbook_v_id,
    flipbookName,
    folderName: physicalFolderName,
    userEmail,
    userFolder: resolvedUFolder,
    newFlipbookAssets,
    savedGalleryMap
  });

  // 4. Normalize any absolute or full flipbook storage URLs to clean relative paths (./assets/<subfolder>/<filename>)
  processedHtml = normalizeToRelativeAssetPaths(processedHtml);

  // Restore protected PDF Background groups/tags
  if (pdfBgPlaceholders.size > 0) {
    pdfBgPlaceholders.forEach((origTag, phKey) => {
      processedHtml = processedHtml.split(phKey).join(origTag);
    });
  }

  return processedHtml;
};

module.exports = {
  processAndSaveBase64Assets,
  processAndCopyGalleryAssets,
  normalizeToRelativeAssetPaths
};
