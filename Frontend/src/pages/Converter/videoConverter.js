/**
 * Client-Side Video Transcoder & Compressor
 * Uses browser MediaRecorder and Canvas APIs to process and re-encode video entirely in frontend.
 * Supports MP4 and WebM conversions and resolution scaling presets (1080p, 720p, 480p).
 */

/**
 * Maps compression preset to target dimensions and bitrate
 */
const getPresetConfig = (compressionPreset) => {
  switch (compressionPreset) {
    case '1080p Web-Optimized':
      return { maxWidth: 1920, maxHeight: 1080, videoBitsPerSecond: 2500000, fps: 30 };
    case '720p HD Compact':
      return { maxWidth: 1280, maxHeight: 720, videoBitsPerSecond: 1200000, fps: 30 };
    case '480p Mobile Saver':
      return { maxWidth: 854, maxHeight: 480, videoBitsPerSecond: 600000, fps: 24 };
    default:
      return { maxWidth: 1280, maxHeight: 720, videoBitsPerSecond: 1500000, fps: 30 };
  }
};

/**
 * Determine best available browser MIME type for recording
 */
const getSupportedMimeType = (targetFormat) => {
  const fmt = (targetFormat || 'MP4').toUpperCase();

  const mp4Types = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=h264',
    'video/mp4'
  ];

  const webmTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];

  if (fmt === 'MP4') {
    for (const type of mp4Types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return { mime: type, ext: 'mp4' };
      }
    }
  }

  // Fallback or explicit WEBM
  for (const type of webmTypes) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return { mime: type, ext: fmt === 'MP4' ? 'mp4' : 'webm' };
    }
  }

  return { mime: 'video/webm', ext: 'webm' };
};

/**
 * Convert or compress video directly in the browser
 *
 * @param {File} file
 * @param {string} targetFormat - 'MP4' | 'WEBM'
 * @param {string} compressionPreset - '1080p Web-Optimized' | '720p HD Compact' | '480p Mobile Saver'
 * @param {Function} onProgress - (percent: number, msg: string) => void
 * @returns {Promise<Blob>}
 */
export async function convertAndCompressVideo(file, targetFormat, compressionPreset, onProgress) {
  onProgress?.(10, 'Initializing video decoding...');

  const videoUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = videoUrl;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';

  await new Promise((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = (_e) => reject(new Error('Unable to read video file format.'));
  });

  const duration = video.duration || 1;
  const config = getPresetConfig(compressionPreset);

  let { videoWidth: origW, videoHeight: origH } = video;
  if (!origW || !origH) {
    origW = 1280;
    origH = 720;
  }

  // Calculate target dimensions maintaining aspect ratio
  let targetW = origW;
  let targetH = origH;
  if (targetW > config.maxWidth || targetH > config.maxHeight) {
    const ratio = Math.min(config.maxWidth / targetW, config.maxHeight / targetH);
    targetW = Math.round(targetW * ratio);
    targetH = Math.round(targetH * ratio);
  }

  // Width and height should be even numbers for video encoders
  targetW = targetW % 2 === 0 ? targetW : targetW - 1;
  targetH = targetH % 2 === 0 ? targetH : targetH - 1;

  onProgress?.(25, `Configured resolution: ${targetW}x${targetH}...`);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { alpha: false });

  // Capture canvas stream
  const fps = config.fps || 30;
  const canvasStream = canvas.captureStream ? canvas.captureStream(fps) : null;

  if (!canvasStream || typeof MediaRecorder === 'undefined') {
    URL.revokeObjectURL(videoUrl);
    return file;
  }

  // Audio capture
  const combinedStream = canvasStream;
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sourceNode = audioContext.createMediaElementSource(video);
    const destinationNode = audioContext.createMediaStreamDestination();
    sourceNode.connect(destinationNode);
    destinationNode.stream.getAudioTracks().forEach((track) => {
      combinedStream.addTrack(track);
    });
  } catch (_err) {
    // Proceed without audio track if restricted
  }

  const { mime } = getSupportedMimeType(targetFormat);

  let recorder;
  try {
    recorder = new MediaRecorder(combinedStream, {
      mimeType: mime,
      videoBitsPerSecond: config.videoBitsPerSecond
    });
  } catch (_e) {
    recorder = new MediaRecorder(combinedStream);
  }

  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      URL.revokeObjectURL(videoUrl);
      const outputBlob = new Blob(chunks, { type: mime });
      onProgress?.(100, 'Video processing complete!');
      resolve(outputBlob);
    };

    recorder.onerror = (e) => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error(`Recording error: ${e?.error?.message || 'Encoder failed'}`));
    };

    recorder.start(250);

    let animId = null;

    // Draw frames synchronized with video playback
    const renderLoop = () => {
      if (video.ended || video.currentTime >= duration) {
        cancelAnimationFrame(animId);
        if (recorder.state === 'recording') {
          recorder.stop();
        }
        return;
      }

      ctx.drawImage(video, 0, 0, targetW, targetH);
      const progressPercent = Math.min(95, Math.round(25 + (video.currentTime / duration) * 70));
      onProgress?.(progressPercent, `Transcoding video frame ${video.currentTime.toFixed(1)}s / ${duration.toFixed(1)}s...`);

      animId = requestAnimationFrame(renderLoop);
    };

    video.onended = () => {
      cancelAnimationFrame(animId);
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    };

    video.playbackRate = 1.0;
    video.play()
      .then(() => {
        animId = requestAnimationFrame(renderLoop);
      })
      .catch((err) => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error(`Video playback error: ${err.message}`));
      });
  });
}
