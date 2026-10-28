import { convertAndCompressImage } from './imageConverter';
import { convertAndCompressVideo } from './videoConverter';
import { convertAndCompress3D } from './threeDConverter';
import { removeImageBackground, preloadBackgroundRemovalModel } from './backgroundRemovalService';

export { removeImageBackground, preloadBackgroundRemovalModel };

/**
 * Universal media pipeline runner entirely in the client-side browser
 */
export async function processMediaFile({
  file,
  mediaType,
  targetFormat,
  compressionPreset,
  removeBg = false,
  onProgress
}) {
  if (mediaType === 'image') {
    let sourceFile = file;
    if (removeBg) {
      onProgress?.(10, 'Removing background with local AI...');
      sourceFile = await removeImageBackground(file, (p, s) => {
        onProgress?.(Math.round(p * 0.7), s);
      });
    }
    return await convertAndCompressImage(sourceFile, targetFormat, compressionPreset, (p, s) => {
      const offset = removeBg ? 70 : 0;
      const mult = removeBg ? 0.3 : 1.0;
      onProgress?.(Math.round(offset + (p * mult)), s);
    });
  }
  
  if (mediaType === 'video') {
    return await convertAndCompressVideo(file, targetFormat, compressionPreset, onProgress);
  }

  if (mediaType === 'threed') {
    return await convertAndCompress3D(file, targetFormat, compressionPreset, onProgress);
  }

  throw new Error(`Unsupported media type: ${mediaType}`);
}
