const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const { handleChunkUpload } = require('../services/resumableUploadService');
const queueManager = require('../services/queueService');
require('../services/documentExtractor'); // Register worker:start listener

const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../../../storage');

/**
 * Handles 5MB chunked upload from frontend
 * POST /api/customized-editor/upload-chunk
 */
exports.uploadChunk = async (req, res) => {
  try {
    const chunkFile = req.file;
    if (!chunkFile) {
      return res.status(400).json({ success: false, message: 'No chunk data provided' });
    }

    const {
      uploadId,
      chunkIndex,
      totalChunks,
      fileName,
      userId = 'FLIPI0001',
      bookId = nanoid(16),
      title
    } = req.body;

    const parsedIndex = parseInt(chunkIndex, 10) || 0;
    const parsedTotal = parseInt(totalChunks, 10) || 1;

    const result = await handleChunkUpload({
      uploadId: uploadId || `up_${nanoid(10)}`,
      chunkIndex: parsedIndex,
      totalChunks: parsedTotal,
      fileName: fileName || chunkFile.originalname || 'document.pdf',
      chunkBuffer: chunkFile.buffer
    });

    // If upload is finished, trigger the Redis extraction worker
    if (result.isComplete) {
      const jobId = `job_${nanoid(12)}`;
      await queueManager.createJob({
        jobId,
        userId,
        bookId,
        title: title || fileName || 'My Flipbook',
        filePath: result.filePath,
        fileName: result.fileName
      });

      return res.json({
        success: true,
        isComplete: true,
        uploadId: result.uploadId,
        jobId,
        bookId,
        progress: 100
      });
    }

    return res.json({
      success: true,
      isComplete: false,
      uploadId: result.uploadId,
      bookId,
      progress: result.progress
    });
  } catch (err) {
    console.error('[Upload Chunk Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Server-Sent Events (SSE) Real-Time Progress Stream
 * GET /api/customized-editor/extract-stream/:jobId
 */
exports.extractStream = async (req, res) => {
  const { jobId } = req.params;
  const job = await queueManager.getJob(jobId);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial state immediately
  res.write(`data: ${JSON.stringify(job)}\n\n`);

  if (job.status === 'completed' || job.status === 'failed') {
    return res.end();
  }

  const updateListener = (updatedJob) => {
    res.write(`data: ${JSON.stringify(updatedJob)}\n\n`);
    if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
      queueManager.off(`job:update:${jobId}`, updateListener);
      res.end();
    }
  };

  queueManager.on(`job:update:${jobId}`, updateListener);

  req.on('close', () => {
    queueManager.off(`job:update:${jobId}`, updateListener);
  });
};

/**
 * Polling fallback for job status
 * GET /api/customized-editor/job-status/:jobId
 */
exports.getJobStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = await queueManager.getJob(jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  return res.json({ success: true, job });
};

/**
 * Lightweight manifest descriptor for 10,000+ page books (< 25 KB JSON)
 * GET /api/customized-editor/manifest/:userId/:bookId
 */
exports.getBookManifest = async (req, res) => {
  const { userId, bookId } = req.params;
  const manifestPath = path.join(storageRoot, userId, 'books', bookId, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ success: false, message: 'Manifest not found' });
  }

  try {
    const raw = await fs.promises.readFile(manifestPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(raw);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

