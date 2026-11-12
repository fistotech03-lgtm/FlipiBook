const path = require('path');
const { EventEmitter } = require('events');
let initRedis = () => null;
try {
  const redisMod = require(path.resolve(__dirname, '../../../../shared/redisClient'));
  initRedis = redisMod.initRedis;
} catch (e) {
  try {
    const redisMod = require(path.resolve(__dirname, '../../../shared/redisClient'));
    initRedis = redisMod.initRedis;
  } catch (err) {}
}

class ExtractionQueueManager extends EventEmitter {
  constructor() {
    super();
    this.redis = initRedis();
    this.inMemoryJobs = new Map();
    this.activeWorkers = 0;
    this.maxConcurrentWorkers = 4; // Caps CPU/RAM at predictable ceiling
    this.pendingQueue = [];
  }

  /**
   * Register a new extraction job
   */
  async createJob(jobData) {
    const { jobId, userId, bookId, filePath, fileName, totalPages } = jobData;
    const initialJob = {
      jobId,
      userId,
      bookId,
      filePath,
      fileName,
      totalPages: totalPages || 0,
      availablePages: 0,
      initialPagesReady: false,
      progress: 0,
      stage: 'queued',
      status: 'queued',
      pages: [],
      error: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (this.redis) {
      try {
        await this.redis.set(`job:${jobId}`, JSON.stringify(initialJob), 'EX', 86400); // 24h TTL
      } catch (e) {
        this.inMemoryJobs.set(jobId, initialJob);
      }
    } else {
      this.inMemoryJobs.set(jobId, initialJob);
    }

    this.pendingQueue.push(jobId);
    this.emit('job:created', initialJob);
    this.processNext();
    return initialJob;
  }

  /**
   * Get job status
   */
  async getJob(jobId) {
    if (this.redis) {
      try {
        const raw = await this.redis.get(`job:${jobId}`);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
    }
    return this.inMemoryJobs.get(jobId) || null;
  }

  /**
   * Update job status & notify SSE listeners
   */
  async updateJob(jobId, updates) {
    const job = await this.getJob(jobId);
    if (!job) return null;

    const merged = { ...job, ...updates, updatedAt: Date.now() };

    if (this.redis) {
      try {
        await this.redis.set(`job:${jobId}`, JSON.stringify(merged), 'EX', 86400);
      } catch (e) {}
    }
    this.inMemoryJobs.set(jobId, merged);

    this.emit(`job:update:${jobId}`, merged);
    this.emit('job:updated', merged);
    return merged;
  }

  /**
   * Process next queued job while respecting max concurrency
   */
  async processNext() {
    if (this.activeWorkers >= this.maxConcurrentWorkers || this.pendingQueue.length === 0) {
      return;
    }

    const jobId = this.pendingQueue.shift();
    const job = await this.getJob(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return this.processNext();
    }

    this.activeWorkers++;
    this.emit('worker:start', job);
  }

  releaseWorker() {
    this.activeWorkers = Math.max(0, this.activeWorkers - 1);
    this.processNext();
  }
}

const queueManager = new ExtractionQueueManager();

module.exports = queueManager;
