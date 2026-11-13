const fs = require('fs');
const path = require('path');
const os = require('os');
const { nanoid } = require('nanoid');

const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../../../storage');

const TEMP_CHUNKS_DIR = path.join(storageRoot, 'temp_chunks');
const TEMP_UPLOADS_DIR = path.join(storageRoot, 'temp_uploads');

// Ensure directories exist
try {
  fs.mkdirSync(TEMP_CHUNKS_DIR, { recursive: true });
  fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
} catch (e) {}

/**
 * Handles incoming 5MB binary chunks from client
 * @param {Object} params
 * @param {string} params.uploadId - Unique upload session ID
 * @param {number} params.chunkIndex - Zero-indexed chunk number
 * @param {number} params.totalChunks - Total chunks expected
 * @param {string} params.fileName - Original file name
 * @param {Buffer} params.chunkBuffer - Raw binary chunk data
 * @returns {Promise<{ isComplete: boolean, filePath?: string, uploadId: string, progress: number }>}
 */
async function handleChunkUpload({ uploadId, chunkIndex, totalChunks, fileName, chunkBuffer }) {
  if (!uploadId) {
    uploadId = `up_${nanoid(12)}`;
  }

  const uploadDir = path.join(TEMP_CHUNKS_DIR, uploadId);
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const chunkPath = path.join(uploadDir, `chunk_${String(chunkIndex).padStart(6, '0')}`);
  await fs.promises.writeFile(chunkPath, chunkBuffer);

  const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);

  // If not the final chunk, return progress
  if (chunkIndex < totalChunks - 1) {
    return {
      isComplete: false,
      uploadId,
      chunkIndex,
      totalChunks,
      progress
    };
  }

  // All chunks received: Assemble into final file
  const ext = path.extname(fileName) || '.pdf';
  const finalFilePath = path.join(TEMP_UPLOADS_DIR, `${uploadId}_${Date.now()}${ext}`);
  const writeStream = fs.createWriteStream(finalFilePath);

  for (let i = 0; i < totalChunks; i++) {
    const partPath = path.join(uploadDir, `chunk_${String(i).padStart(6, '0')}`);
    if (!fs.existsSync(partPath)) {
      throw new Error(`Missing chunk index ${i} for upload ${uploadId}`);
    }
    const partBuffer = await fs.promises.readFile(partPath);
    await new Promise((resolve, reject) => {
      const ok = writeStream.write(partBuffer);
      if (ok) resolve();
      else writeStream.once('drain', resolve);
    });
  }

  await new Promise((resolve) => writeStream.end(resolve));

  // Clean up chunk files in background
  fs.promises.rm(uploadDir, { recursive: true, force: true }).catch(() => {});

  const stats = await fs.promises.stat(finalFilePath);

  return {
    isComplete: true,
    uploadId,
    filePath: finalFilePath,
    fileName,
    fileSize: stats.size,
    progress: 100
  };
}

module.exports = {
  handleChunkUpload,
  TEMP_UPLOADS_DIR
};

