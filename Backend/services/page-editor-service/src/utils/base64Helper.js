const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateId, getStorageRoot } = require('./storageHelper');

/**
 * Extracts base64 assets from page HTML, saves them to flipbook assets folder on disk,
 * and tracks new FlipbookAsset model records.
 */
const processAndSaveBase64Assets = ({
  htmlContent,
  pageVId,
  sanitizedEmail,
  physicalFolderName,
  flipbookName,
  flipbook_v_id,
  newFlipbookAssets = [],
  savedBase64Map = new Map(),
  skipBase64Extraction = false
}) => {
  if (!htmlContent) return '';
  if (skipBase64Extraction) return htmlContent;

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

  // 2. Also protect standalone <image ... data-name="PDF Background"> tags
  const pdfBgTagRegex = /<image\b[^>]*data-name=["'](?:PDF Background|pdf background)["'][^>]*\/?>/gi;
  contentToProcess = contentToProcess.replace(pdfBgTagRegex, (tagMatch) => {
    const phKey = `__PDF_BG_IMAGE_PH_${generateId(9)}__`;
    pdfBgPlaceholders.set(phKey, tagMatch);
    return phKey;
  });

  const storageRoot = getStorageRoot();
  const bookDir = path.join(
    storageRoot,
    sanitizedEmail,
    'My_Flipbooks',
    physicalFolderName,
    flipbookName
  );

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
    const relativePath = `./assets/${subfolder}/${assetFileName}`;

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const targetDir = path.join(bookDir, 'assets', subfolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, assetFileName);
      fs.writeFileSync(filePath, buffer);

      const absoluteUrl = `/uploads/${sanitizedEmail}/My_Flipbooks/${physicalFolderName}/${flipbookName}/assets/${subfolder}/${assetFileName}`;

      newFlipbookAssets.push({
        flipbook_v_id: flipbook_v_id,
        file_v_id: generateId(16),
        assetType: subfolder,
        fileName: assetFileName,
        page_v_id: pageVId,
        flipbookName: flipbookName,
        folderName: physicalFolderName,
        url: absoluteUrl,
        size: buffer.length
      });

      savedBase64Map.set(base64Data, relativePath);
      return relativePath;
    } catch (err) {
      console.error('[Base64 Helper] Error saving base64 asset:', err.message);
      return match;
    }
  });

  // Restore protected PDF Background groups/tags
  if (pdfBgPlaceholders.size > 0) {
    pdfBgPlaceholders.forEach((origTag, phKey) => {
      processedHtml = processedHtml.split(phKey).join(origTag);
    });
  }

  return processedHtml;
};

module.exports = {
  processAndSaveBase64Assets
};
