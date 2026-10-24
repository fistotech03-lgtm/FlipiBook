/**
 * Client-Side Image Converter & Compressor
 * Supports: PNG, JPG/JPEG, WEBP, AVIF
 */

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
    case 'High Quality (85%)':
      return { quality: 0.85, maxDimension: 3840 };
    case 'Balanced (70%)':
      return { quality: 0.70, maxDimension: 2560 };
    case 'Maximum Compression (50%)':
      return { quality: 0.50, maxDimension: 1920 };
    default:
      return { quality: 0.80, maxDimension: 2560 };
  }
};

/**
 * Converts and compresses an image in browser using Canvas API
 *
 * @param {File} file
 * @param {string} targetFormat - 'WEBP' | 'PNG' | 'JPG' | 'AVIF'
 * @param {string} compressionPreset
 * @param {Function} onProgress - (percent: number, msg: string) => void
 * @returns {Promise<Blob>}
 */
export async function convertAndCompressImage(file, targetFormat, compressionPreset, onProgress) {
  onProgress?.(15, `Reading image file: ${file.name}`);

  const fmt = (targetFormat || 'WEBP').toUpperCase();

  onProgress?.(30, 'Rendering image frames to canvas...');
  const img = await loadImage(file);
  const { quality, maxDimension } = getQualityAndScale(compressionPreset);

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

  onProgress?.(55, `Resizing canvas (${width}x${height})...`);
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

  onProgress?.(80, `Encoding to ${fmt}...`);

  let mimeType = 'image/webp';
  if (fmt === 'PNG') mimeType = 'image/png';
  else if (fmt === 'JPG' || fmt === 'JPEG') mimeType = 'image/jpeg';
  else if (fmt === 'WEBP') mimeType = 'image/webp';
  else if (fmt === 'AVIF') mimeType = 'image/avif';

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => {
      if (b) {
        resolve(b);
      } else {
        // Fallback to webp or jpeg if specific mime is unsupported
        canvas.toBlob((fallbackBlob) => {
          resolve(fallbackBlob || new Blob([], { type: mimeType }));
        }, 'image/jpeg', quality);
      }
    }, mimeType, quality);
  });

  onProgress?.(100, 'Image conversion complete!');
  return blob;
}
