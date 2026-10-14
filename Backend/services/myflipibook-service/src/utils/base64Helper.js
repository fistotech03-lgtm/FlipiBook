const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Extracts base64 assets from page SVG/HTML, saves them to flipbook assets folder on disk,
 * and tracks new FlipbookAsset model records to be saved in MongoDB.
 *
 * Replaces base64 data URIs in the SVG with relative paths: `./assets/${subfolder}/${assetFileName}`.
 * Protects PDF Background layers from extraction.
 */
const processAndSaveBase64Assets = ({
  htmlContent,
  pageVId,
  wsBookDir,
  flipbook_v_id,
  flipbookName,
  folderName,
  userEmail,
  userFolder,
  newFlipbookAssets = [],
  savedBase64Map = new Map(),
  skipBase64Extraction = false
}) => {
  if (!htmlContent || typeof htmlContent !== 'string') return '';
  if (skipBase64Extraction) return htmlContent;

  // Protect PDF Background elements from being extracted into separate asset files.
  // The PDF attributes (data-name="PDF Background", data-type="pdf-vector-layer", data-locked="true")
  // are set on a common enclosing <g> group rather than directly on <image> tags.
  // Any embedded image files existing within this group (e.g. photos, logos, graphics) must retain
  // their inline base64 content intact and NOT be converted to external files.
  const pdfBgPlaceholders = new Map();
  let contentToProcess = htmlContent;

  // 1. Protect entire <g data-name="PDF Background" ...> ... </g> groups (including nested <g> tags)
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
      const phKey = `__PDF_BG_GROUP_PH_${crypto.randomBytes(6).toString('hex')}__`;
      pdfBgPlaceholders.set(phKey, fullGroup);
      contentToProcess = contentToProcess.substring(0, startIdx) + phKey + contentToProcess.substring(endIdx);
      pdfBgGroupRegex.lastIndex = startIdx + phKey.length;
    } else {
      break;
    }
  }

  // 2. Also protect standalone <image ... data-name="PDF Background"> tags
  const pdfBgTagRegex = /<image\b[^>]*data-name=["'](?:PDF Background|pdf background)["'][^>]*\/?>/gi;
  contentToProcess = contentToProcess.replace(pdfBgTagRegex, (tagMatch) => {
    const phKey = `__PDF_BG_IMAGE_PH_${crypto.randomBytes(6).toString('hex')}__`;
    pdfBgPlaceholders.set(phKey, tagMatch);
    return phKey;
  });

  // Match all base64 data URIs: data:image/png;base64,... etc.
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
      else if (type === 'model' || ['glb', 'gltf', 'obj', 'stl'].includes(ext)) subfolder = '3D_Model';
      else subfolder = 'download';
    }

    if (!isDownload && ext === 'gif') subfolder = 'gif';
    if (normalizedExt.includes('+')) normalizedExt = normalizedExt.split('+')[0];

    const contentHash = crypto.createHash('md5').update(base64Data).digest('hex').slice(0, 16);
    const assetFileName = `asset_${contentHash}.${normalizedExt}`;
    const relativePath = `./assets/${subfolder}/${assetFileName}`;

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const targetDir = path.join(wsBookDir, 'assets', subfolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, assetFileName);
      fs.writeFileSync(filePath, buffer);

      const absoluteUrl = `/storage/${userFolder || 'default'}/My_Flipbooks/${folderName}/${flipbookName}/assets/${subfolder}/${assetFileName}`;

      newFlipbookAssets.push({
        flipbook_v_id: flipbook_v_id,
        file_v_id: crypto.randomBytes(8).toString('hex'),
        assetType: subfolder,
        fileName: assetFileName,
        originalName: assetFileName,
        page_v_id: pageVId || 'global',
        userEmail: userEmail || '',
        isGallery: false,
        flipbookName: flipbookName,
        folderName: folderName,
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

  // Restore protected PDF Background groups/tags with their original base64 content intact
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
