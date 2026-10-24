/**
 * Background Removal Service using @imgly/background-removal (local on-device AI)
 * Preloads the AI model assets in background when visiting /converter
 */

import { refineWhiteBackgroundMask } from './white-background-refine.js';

let preloadPromise = null;
let isPreloaded = false;

// Thread limit for browsers without Cross-Origin Isolation
function limitThreadsForCurrentContext() {
  if (globalThis.crossOriginIsolated && typeof SharedArrayBuffer !== 'undefined') return () => {};

  const hadOwnValue = Object.prototype.hasOwnProperty.call(navigator, 'hardwareConcurrency');
  const previousDescriptor = Object.getOwnPropertyDescriptor(navigator, 'hardwareConcurrency');
  try {
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 1 });
  } catch {
    return () => {};
  }

  return () => {
    try {
      if (hadOwnValue && previousDescriptor) {
        Object.defineProperty(navigator, 'hardwareConcurrency', previousDescriptor);
      } else {
        delete navigator.hardwareConcurrency;
      }
    } catch {
      // Best-effort
    }
  };
}

/**
 * Preloads the background-removal model in the background once user navigates to /converter.
 * Silently caches the chunks in browser memory/Cache API so when the user clicks 'Remove Background',
 * processing starts immediately.
 */
export function preloadBackgroundRemovalModel() {
  if (isPreloaded || preloadPromise) return preloadPromise;

  preloadPromise = (async () => {
    try {
      const publicPath = new URL(`${import.meta.env.BASE_URL}background-removal-data/`, window.location.href).toString();
      // Fetch resources.json and pre-cache model chunks
      const res = await fetch(`${publicPath}resources.json`);
      if (res.ok) {
        const map = await res.json();
        const chunks = Object.values(map).flatMap((item) => item.chunks || []);
        // Fetch chunks in background with low priority
        await Promise.all(
          chunks.slice(0, 10).map((c) =>
            fetch(`${publicPath}${c.name}`, { priority: 'low' }).catch(() => {})
          )
        );
      }

      // Pre-import the module
      await import('@imgly/background-removal');
      isPreloaded = true;
    } catch (e) {
      console.warn('Background AI model preload skipped or deferred:', e);
    }
  })();

  return preloadPromise;
}

/**
 * Helper to convert canvas to blob
 */
function canvasToBlob(canvas, mimeType = 'image/png') {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas could not create blob.'));
    }, mimeType);
  });
}

/**
 * Refines the RGBA output from the neural net and repairs white borders/fine details
 */
async function refineAndEncodeRgbaBlob(rgbaBlob) {
  const width = Number(/(?:^|;)width=(\d+)(?:;|$)/i.exec(rgbaBlob.type)?.[1]);
  const height = Number(/(?:^|;)height=(\d+)(?:;|$)/i.exec(rgbaBlob.type)?.[1]);
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) {
    throw new Error('AI returned image data without valid dimensions.');
  }

  const rgba = new Uint8ClampedArray(await rgbaBlob.arrayBuffer());
  if (rgba.length !== width * height * 4) {
    throw new Error('AI returned an incomplete RGBA image buffer.');
  }
  refineWhiteBackgroundMask(rgba, width, height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not initialize 2D context for cutout refinement.');
  context.putImageData(new ImageData(rgba, width, height), 0, 0);
  return canvasToBlob(canvas, 'image/png');
}

const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Resizes an image if it exceeds maxSide while preserving aspect ratio
 */
async function resizeForModel(file, maxSide = 1280) {
  let bitmap;
  let closeBitmap = () => {};

  if (typeof createImageBitmap === 'function') {
    bitmap = await createImageBitmap(file);
    closeBitmap = () => bitmap.close?.();
  } else {
    const localUrl = URL.createObjectURL(file);
    bitmap = new Image();
    bitmap.src = localUrl;
    try {
      await bitmap.decode();
    } catch (error) {
      URL.revokeObjectURL(localUrl);
      throw error;
    }
    closeBitmap = () => URL.revokeObjectURL(localUrl);
  }

  try {
    const longestSide = Math.max(bitmap.width, bitmap.height);
    if (longestSide <= maxSide) return file;

    const scale = maxSide / longestSide;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create canvas to resize image.');

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await canvasToBlob(canvas, 'image/png');
  } finally {
    closeBitmap();
  }
}

/**
 * Removes background using local on-device AI
 *
 * @param {File|Blob} file
 * @param {Function} onProgress (percent: number, status: string) => void
 * @param {Object} options
 * @returns {Promise<Blob>} PNG Blob with background removed
 */
export async function removeImageBackground(file, onProgress, options = {}) {
  const restoreThreadCount = limitThreadsForCurrentContext();

  try {
    onProgress?.(15, 'Preparing image for on-device AI...');
    await yieldToMain();

    const maxSide = options.maxSide || 1280;
    const modelInput = await resizeForModel(file, maxSide);
    await yieldToMain();

    onProgress?.(30, 'Starting on-device neural engine...');
    await yieldToMain();

    const { removeBackground } = await import('@imgly/background-removal');
    const publicPath = new URL(`${import.meta.env.BASE_URL}background-removal-data/`, window.location.href).toString();

    onProgress?.(45, 'Isolating subject and segmenting background...');
    await yieldToMain();

    const rgbaBlob = await removeBackground(modelInput, {
      publicPath,
      model: 'isnet_fp16',
      device: 'cpu',
      output: { format: 'image/x-rgba8' },
      progress: (key, current, total) => {
        const totalValue = Number(total);
        const currentValue = Number(current);
        const percent = totalValue > 0 && Number.isFinite(currentValue)
          ? Math.max(0, Math.min(100, Math.round((currentValue / totalValue) * 100)))
          : null;

        const text = String(key ?? '').toLowerCase();
        let label = 'Segmenting edges...';
        if (text.includes('fetch') || text.includes('download') || text.includes('model')) {
          label = 'Loading AI model weights...';
        } else if (text.includes('wasm') || text.includes('runtime')) {
          label = 'Starting WASM vision engine...';
        }

        const calculatedPercent = percent !== null ? Math.round(45 + (percent * 0.4)) : 65;
        onProgress?.(calculatedPercent, label);
      }
    });

    await yieldToMain();
    onProgress?.(90, 'Refining fine edges and protecting details...');
    const outputPngBlob = await refineAndEncodeRgbaBlob(rgbaBlob);
    await yieldToMain();

    onProgress?.(100, 'Background removed cleanly!');
    return outputPngBlob;
  } finally {
    restoreThreadCount();
  }
}
