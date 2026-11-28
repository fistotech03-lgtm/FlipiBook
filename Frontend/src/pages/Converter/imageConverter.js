/**
 * Client-Side Image Converter & Compressor
 * Supports: PNG (with 8-bit indexed palette quantization & Deflate compression via pako),
 *           JPG/JPEG, WEBP
 */

import pako from 'pako';

/**
 * Load an image file into an HTMLImageElement
 */
const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${err?.message || 'Unsupported format'}`));
    };
    img.src = url;
  });
};

/**
 * Get Quality float (0.1 - 1.0) and optional scale factor based on compression preset
 */
const getQualityAndScale = (compressionPreset) => {
  switch (compressionPreset) {
    case 'Original Quality (Format Only)':
      return { quality: 0.92, maxDimension: Infinity, pngColors: 0 };
    case 'High Quality (85%)':
      return { quality: 0.85, maxDimension: 2560, pngColors: 256 };
    case 'Balanced (70%)':
      return { quality: 0.70, maxDimension: 1920, pngColors: 128 };
    case 'Low Quality (50%)':
    case 'Maximum Compression (50%)':
      return { quality: 0.50, maxDimension: 1440, pngColors: 64 };
    default:
      if (compressionPreset?.includes('Original')) {
        return { quality: 1.0, maxDimension: Infinity, pngColors: 0 };
      }
      return { quality: 0.80, maxDimension: 1920, pngColors: 128 };
  }
};

/**
 * Pre-computed CRC32 table for PNG chunk checksums
 */
const crcTable = (() => {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

const crc32 = (buf, offset, length) => {
  let crc = 0 ^ (-1);
  for (let i = offset; i < offset + length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
};

/**
 * Encodes an 8-bit indexed image to a compliant PNG binary Uint8Array
 */
const encodeIndexedPNG = (width, height, indexedPixels, palette) => {
  const plteData = new Uint8Array(palette.length * 3);
  for (let i = 0; i < palette.length; i++) {
    plteData[i * 3] = palette[i][0];
    plteData[i * 3 + 1] = palette[i][1];
    plteData[i * 3 + 2] = palette[i][2];
  }

  let trnsData = null;
  const hasAlpha = palette.some((p) => p[3] < 255);
  if (hasAlpha) {
    let lastAlphaIdx = 0;
    for (let i = 0; i < palette.length; i++) {
      if (palette[i][3] < 255) lastAlphaIdx = i;
    }
    trnsData = new Uint8Array(lastAlphaIdx + 1);
    for (let i = 0; i <= lastAlphaIdx; i++) {
      trnsData[i] = palette[i][3];
    }
  }

  // Scanlines with filter byte 0 (None)
  const rawData = new Uint8Array((1 + width) * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width);
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      rawData[rowOffset + 1 + x] = indexedPixels[y * width + x];
    }
  }

  const idatData = pako.deflate(rawData, { level: 9 });

  const chunks = [];
  const addChunk = (typeStr, data) => {
    const length = data.length;
    const chunk = new Uint8Array(4 + 4 + length + 4);
    const view = new DataView(chunk.buffer);
    view.setUint32(0, length, false);
    for (let i = 0; i < 4; i++) {
      chunk[4 + i] = typeStr.charCodeAt(i);
    }
    chunk.set(data, 8);
    const crc = crc32(chunk, 4, 4 + length);
    view.setUint32(8 + length, crc, false);
    chunks.push(chunk);
  };

  // IHDR
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width, false);
  ihdrView.setUint32(4, height, false);
  ihdr[8] = 8; // 8 bits per pixel (indexed)
  ihdr[9] = 3; // Color type 3 (indexed color)
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  addChunk('IHDR', ihdr);

  addChunk('PLTE', plteData);
  if (trnsData) addChunk('tRNS', trnsData);
  addChunk('IDAT', idatData);
  addChunk('IEND', new Uint8Array(0));

  let totalLen = 8;
  chunks.forEach((c) => (totalLen += c.length));
  const out = new Uint8Array(totalLen);
  out.set([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 0);
  let pos = 8;
  chunks.forEach((c) => {
    out.set(c, pos);
    pos += c.length;
  });

  return out;
};

/**
 * Fast color quantization and dithering to compress PNG without quality loss
 */
const quantizeAndDitherPNG = (rgbaData, width, height, maxColors = 256) => {
  const pixelCount = width * height;
  const pixels = [];
  let hasTransparent = false;

  // 1. Sample pixels to build representative palette
  const sampleStep = Math.max(1, Math.floor(pixelCount / 40000));
  for (let i = 0; i < rgbaData.length; i += 4 * sampleStep) {
    const a = rgbaData[i + 3];
    if (a < 32) {
      hasTransparent = true;
      continue;
    }
    pixels.push([rgbaData[i], rgbaData[i + 1], rgbaData[i + 2], a]);
  }

  // 2. Median-cut box splitting
  const targetBoxes = Math.min(maxColors, hasTransparent ? maxColors - 1 : maxColors);
  let boxes = [{ pixels }];

  while (boxes.length < targetBoxes) {
    let bestIdx = -1;
    let maxRange = -1;
    let splitChannel = 0;

    for (let b = 0; b < boxes.length; b++) {
      const box = boxes[b];
      if (box.pixels.length <= 2) continue;

      let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
      for (let p = 0; p < box.pixels.length; p++) {
        const px = box.pixels[p];
        if (px[0] < minR) minR = px[0]; if (px[0] > maxR) maxR = px[0];
        if (px[1] < minG) minG = px[1]; if (px[1] > maxG) maxG = px[1];
        if (px[2] < minB) minB = px[2]; if (px[2] > maxB) maxB = px[2];
      }

      const rangeR = maxR - minR;
      const rangeG = maxG - minG;
      const rangeB = maxB - minB;
      const curMax = Math.max(rangeR, rangeG, rangeB);

      if (curMax > maxRange) {
        maxRange = curMax;
        bestIdx = b;
        splitChannel = (rangeR >= rangeG && rangeR >= rangeB) ? 0 : (rangeG >= rangeB ? 1 : 2);
      }
    }

    if (bestIdx === -1 || maxRange <= 2) break;

    const boxToSplit = boxes[bestIdx];
    boxToSplit.pixels.sort((p1, p2) => p1[splitChannel] - p2[splitChannel]);
    const mid = Math.floor(boxToSplit.pixels.length / 2);
    const boxA = { pixels: boxToSplit.pixels.slice(0, mid) };
    const boxB = { pixels: boxToSplit.pixels.slice(mid) };

    boxes.splice(bestIdx, 1, boxA, boxB);
  }

  // 3. Form palette
  const palette = [];
  if (hasTransparent) {
    palette.push([0, 0, 0, 0]); // Index 0 is transparent
  }
  for (let b = 0; b < boxes.length; b++) {
    const box = boxes[b];
    if (box.pixels.length === 0) continue;
    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
    for (let p = 0; p < box.pixels.length; p++) {
      sumR += box.pixels[p][0];
      sumG += box.pixels[p][1];
      sumB += box.pixels[p][2];
      sumA += box.pixels[p][3];
    }
    const count = box.pixels.length;
    palette.push([
      Math.round(sumR / count),
      Math.round(sumG / count),
      Math.round(sumB / count),
      Math.round(sumA / count)
    ]);
  }

  if (palette.length === 0) {
    palette.push([0, 0, 0, 255]);
  }

  // 4. Map RGBA pixels to closest palette index
  const indexed = new Uint8Array(pixelCount);
  const findClosest = (r, g, b, a) => {
    if (a < 32 && hasTransparent) return 0;
    let bestDist = Infinity;
    let bestIdx = 0;
    const startIdx = hasTransparent ? 1 : 0;
    for (let i = startIdx; i < palette.length; i++) {
      const p = palette[i];
      const dr = r - p[0];
      const dg = g - p[1];
      const db = b - p[2];
      const dist = (dr * dr * 0.3) + (dg * dg * 0.59) + (db * db * 0.11);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
        if (dist === 0) break;
      }
    }
    return bestIdx;
  };

  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    indexed[i] = findClosest(rgbaData[o], rgbaData[o + 1], rgbaData[o + 2], rgbaData[o + 3]);
  }

  return { indexed, palette };
};

/**
 * Converts and compresses an image in browser using Canvas API + Indexed PNG compression
 *
 * @param {File} file
 * @param {string} targetFormat - 'WEBP' | 'PNG' | 'JPG'
 * @param {string} compressionPreset
 * @param {Function} onProgress - (percent: number, msg: string) => void
 * @returns {Promise<Blob>}
 */
export async function convertAndCompressImage(file, targetFormat, compressionPreset, onProgress) {
  onProgress?.(15, `Reading image file: ${file?.name || 'image'}`);

  const fmt = (targetFormat || 'WEBP').toUpperCase();
  const isOriginalPreset = compressionPreset?.includes('Original');

  // If the file is already in the target format and the user asked for "Original Quality (Format Only)",
  // return the original untouched file directly to prevent re-encoding bloat.
  const currentExt = file?.name ? file.name.split('.').pop()?.toUpperCase() : '';
  const isSameFormat =
    (fmt === 'JPG' && (currentExt === 'JPG' || currentExt === 'JPEG')) ||
    (fmt === 'JPEG' && (currentExt === 'JPG' || currentExt === 'JPEG')) ||
    fmt === currentExt;

  if (isOriginalPreset && isSameFormat) {
    onProgress?.(100, 'Original format preserved!');
    return file;
  }

  onProgress?.(30, 'Rendering image frames to canvas...');
  const img = await loadImage(file);
  const { quality, maxDimension, pngColors } = getQualityAndScale(compressionPreset);

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Scale down if exceeds maxDimension to avoid excessive memory usage
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  onProgress?.(55, `Processing canvas (${width}x${height})...`);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context could not be initialized');
  }

  // Handle format background fill for formats without transparency (like JPEG)
  if (fmt === 'JPG' || fmt === 'JPEG') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  onProgress?.(75, `Encoding to ${fmt}...`);

  // Optimized PNG path: Apply indexed color quantization to compress PNG significantly
  if (fmt === 'PNG' && pngColors > 0) {
    try {
      onProgress?.(85, `Quantizing PNG colors (${pngColors} palette)...`);
      const imgData = ctx.getImageData(0, 0, width, height);
      const { indexed, palette } = quantizeAndDitherPNG(imgData.data, width, height, pngColors);
      const pngBytes = encodeIndexedPNG(width, height, indexed, palette);

      onProgress?.(100, 'Image conversion complete!');
      return new Blob([pngBytes], { type: 'image/png' });
    } catch (pngErr) {
      console.warn('Indexed PNG compression fallback to standard canvas:', pngErr);
    }
  }

  let mimeType = 'image/webp';
  if (fmt === 'PNG') mimeType = 'image/png';
  else if (fmt === 'JPG' || fmt === 'JPEG') mimeType = 'image/jpeg';
  else if (fmt === 'WEBP') mimeType = 'image/webp';

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => {
      if (b) {
        resolve(b);
      } else {
        canvas.toBlob((fallbackBlob) => {
          resolve(fallbackBlob || new Blob([], { type: mimeType }));
        }, 'image/jpeg', quality);
      }
    }, mimeType, quality);
  });

  onProgress?.(100, 'Image conversion complete!');
  return blob;
}
