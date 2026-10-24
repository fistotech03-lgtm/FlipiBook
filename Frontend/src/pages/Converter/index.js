import { convertAndCompressImage } from './imageConverter';
import { convertAndCompressVideo } from './videoConverter';
import { convertAndCompress3D } from './threeDConverter';

/**
 * Universal media pipeline runner entirely in the client-side browser
 */
export async function processMediaFile({
  file,
  mediaType,
  targetFormat,
  compressionPreset,
  onProgress
}) {
  if (mediaType === 'image') {
    return await convertAndCompressImage(file, targetFormat, compressionPreset, onProgress);
  }
  
  if (mediaType === 'video') {
    return await convertAndCompressVideo(file, targetFormat, compressionPreset, onProgress);
  }

  if (mediaType === 'threed') {
    return await convertAndCompress3D(file, targetFormat, compressionPreset, onProgress);
  }

  throw new Error(`Unsupported media type: ${mediaType}`);
}
